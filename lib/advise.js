/**
 * The curated Advisor — what answers when there is no model, or the model fails.
 *
 * It is not a chatbot. It reads the question for what the person is carrying,
 * chooses His sayings from the curated theme packs and the spoken corpus, and
 * writes a short letter around them. Every citation is emitted as a {{Book C:V}}
 * placeholder, so the server's substitution step inserts the KJV corpus text and
 * this module never types a verse, and never echoes what the person typed.
 *
 * Order of reading, most serious first:
 *   danger to the writer · danger to someone they love · a death by suicide they
 *   are grieving · a question about suicide · abuse or assault · instructions
 *   aimed at the page · a verse they brought with them · requests outside the
 *   room (practical, other authors, licensed professions) · hostility ·
 *   gratitude · a felt need · a named saying or subject · a short hello.
 *
 * Hotline facts carried here were checked on 2026-09-06: 988 Suicide & Crisis
 * Lifeline (call, text, chat; also for people worried about someone and for loss
 * survivors — 988lifeline.org); National Domestic Violence Hotline 1-800-799-7233,
 * text START to 88788, chat at thehotline.org; RAINN National Sexual Assault
 * Hotline 800-656-4673, chat at hotline.rainn.org, text HOPE to 64673.
 */
const { looksLikeCrisis, parseRef, lookup } = require('./scripture');
const { THEMES } = require('./curated');
const { tokens } = require('./retrieve');
const { loadLibrary } = require('./library');

/* Two lines that meet the person, per theme. Second person, no theology yet. */
const HEAR = {
  'Anxiety & Worry': ['I hear the spiral. Tomorrow has gotten loud, and you are tired of carrying a day that has not arrived.', 'Worry is a room with no windows, and you have been sitting in it a while. He does not scold you for that; He opens a window onto this one hour.'],
  Fear: ['Fear is shrinking the future to the size of the thing you dread. You do not have to pretend the waves are small.', 'Fear makes the thing you face larger than everything else. He does not deny the thing. He tells you what you are worth beside it.'],
  'Grief & Loss': ['Something has a name, and it is gone, and you are still here. That is not a failure of faith. It is love with nowhere to stand.', 'Grief does not keep to a schedule, and nobody gets to set one for you. He blessed the mourner before He asked anything of them.'],
  Loneliness: ['Loneliness can convince you that you are unseen. You are not an interruption, and you were not meant to be an orphan in this.', 'An empty room can feel like a verdict. He answered that verdict with a promise: I will not leave you comfortless; I will come to you.'],
  Forgiveness: ['Forgiveness is one of the hardest sentences He spoke, and one of the freest. You do not have to finish the road today.', 'What was done to you was real, and He never asks you to call it small. He asks what you will do with the wound so it does not become the whole story.'],
  'Shame & Guilt': ['Shame wants you out of the room. He still knows how to lift a face.', 'You have been telling this story from the accused side of the table. He tells it from the shepherd’s side, and in His telling the finding is a feast.'],
  'Suffering & Pain': ['Pain is not a riddle you failed to solve. He names tribulation and still says come.', 'You are tired in a place rest does not usually reach. He spoke His invitation to exactly that place: the labouring and the heavy laden.'],
  'Conflict & Relationships': ['Conflict lodges in the body. He takes the other person seriously, and He takes you seriously too.', 'Anger is telling you something matters. He does not ask you to stop caring; He tells you what to do with your hands and your prayers while you do.'],
  'Purpose & Direction': ['You want a map, and He tends to hand people a first step and a direction to face.', 'The question of what your life is for is a good one to be asking. He answers it less with a plan than with a name: light, and a first thing to seek.'],
  'Faith & Doubt': ['Doubt is not a firing offence in the Gospels. He let a doubter touch the wound.', 'You have been honest about what you cannot see. He made room for that honesty, and then blessed the ones who trust without the proof.'],
  Peace: ['The world offers a pause between problems. He offers a peace that can sit in a troubled room and still be itself.', 'A mind that will not stop is exhausting to live inside. He spoke to a storm by name, and it sat down.'],
  Hope: ['Hope is not pretending. In His words it is anchored in who He is, not in how this hour feels.', 'A dark place is still a place, and He has been in it. He does not promise the night is short; He promises it is not the last word.'],
};

/* Cues are weighted: heavy names a grave need outright; strong names the need; soft leans. */
const CUES = {
  'Anxiety & Worry': { strong: ['anxious', 'anxiety', 'worry', 'worried', 'worrying', 'overwhelmed', 'overwhelm', 'panic', 'panicking', 'stressed', 'stress', 'racing thoughts', "can't sleep", 'cant sleep', 'cannot sleep', 'not sleeping', 'no sleep', 'sleepless', 'insomnia', 'overthinking'], soft: ['tomorrow', 'bills', 'money', 'deadline', 'exam', 'interview', 'restless'] },
  Fear: { strong: ['afraid', 'scared', 'terrified', 'fear', 'frightened', 'dread', 'phobia', 'petrified'], soft: ['unsafe', 'danger', 'nightmare', 'diagnosis', 'diagnosed', 'biopsy', 'surgery', 'results', 'future'] },
  'Grief & Loss': { heavy: ['died', 'passed away', 'passd away', 'past away', 'pased away', 'funeral', 'miscarriage', 'stillborn', 'buried', 'widow', 'widower', 'overdosed', 'killed himself', 'killed herself', 'killed themselves', 'took his own life', 'took her own life', 'took their own life', 'died by suicide', 'committed suicide'], strong: ['grief', 'greif', 'grieff', 'grieving', 'mourning', 'mourn', 'miss him', 'miss her', 'miss them', 'miss my', 'lost my mother', 'lost my father', 'lost my mom', 'lost my dad', 'lost my son', 'lost my daughter', 'lost my wife', 'lost my husband', 'lost my baby', 'lost my friend', 'lost my brother', 'lost my sister'], soft: ['death', 'loss', 'gone', 'anniversary', 'crying', 'cry', 'tears', 'grave'] },
  Loneliness: { strong: ['lonely', 'loneliness', 'alone', 'isolated', 'abandoned', 'no one cares', 'nobody cares', 'no friends', 'forgotten', 'left me', 'nobody would notice', 'no one would notice', 'nobody would miss', 'no one would miss', 'nobody to talk to', 'no one to talk to', 'unseen', 'invisible'], soft: ['single', 'moved', 'new city', 'nobody', 'no one'] },
  Forgiveness: { strong: ['forgive him', 'forgive her', 'forgive them', 'forgive my', 'forgive the', "can't forgive", 'cant forgive', 'cannot forgive', 'never forgive', 'forgiving him', 'forgiving her', 'forgiving them', 'resentment', 'resent', 'bitter', 'bitterness', 'grudge', 'betrayed', 'cheated on me', "can't let go", 'cant let go', 'hate him', 'hate her', 'hate them', 'kill him', 'kill her', 'kill them', 'want to hurt him', 'want to hurt her', 'want to hurt them'], soft: ['forgive', 'forgiveness', 'forgiving', 'hurt me', 'wronged', 'revenge'] },
  'Shame & Guilt': { heavy: ['forgive me', 'be forgiven', 'unforgivable', 'stops forgiving', 'stop forgiving', 'will god forgive', 'can god forgive', 'does god forgive', 'could god forgive', 'too far gone', 'beyond forgiveness', 'never tell anyone'], strong: ['shame', 'ashamed', 'guilt', 'guilty', 'unworthy', 'worthless', 'disgusted with myself', 'hate myself', 'hate my body', 'hate how i look', 'ugly', 'disgusting', 'sinned', 'relapsed', 'relapse', 'failure', 'messed up', 'screwed up', 'porn', 'addiction', 'addicted', 'judges me', 'judge me', 'judged', 'judgmental', 'judgemental'], soft: ['regret', 'mistake', 'confess', 'too far'] },
  'Suffering & Pain': { strong: ['pain', 'hurting', 'suffering', 'suffer', 'chronic', 'sick', 'illness', 'cancer', 'hospital', 'hospice', 'terminal', 'disabled', 'disability', 'ache', 'exhausted', 'exhaustion', 'burned out', 'burnt out', 'burnout', 'so tired', 'tired of everything', 'weary', 'worn out', 'running on empty', "can't keep going", 'cant keep going', 'the strong one', 'treatment'], soft: ['tired', 'heavy', 'drained', 'depleted'] },
  'Conflict & Relationships': { strong: ['divorce', 'divorcing', 'argument', 'arguing', 'argued', 'fight', 'fighting', 'fought', 'conflict', 'estranged', 'not speaking', "won't speak", 'wont speak', 'furious', 'angry', 'anger', 'rage', 'scream', 'toxic', 'enemy', 'enemies', 'cheating', 'affair'], soft: ['angry at', 'marriage', 'husband', 'wife', 'boyfriend', 'girlfriend', 'partner', 'my mother', 'my father', 'my mom', 'my dad', 'my son', 'my daughter', 'my brother', 'my sister', 'coworker', 'boss', 'boundaries', 'family', 'friend', 'in-laws', 'neighbor', 'neighbour'] },
  'Purpose & Direction': { strong: ['purpose', 'direction', 'calling', 'career', 'what should i do', 'decision', 'decide', 'crossroads', 'meaning', 'pointless', 'stuck', 'quit my job', 'lost my job', 'unemployed', 'fired'], soft: ['confused', 'plan', 'path', 'next step', 'choose', 'college', 'move', 'retire'] },
  'Faith & Doubt': { heavy: ['why does god', 'why would god', 'why did god', 'how could god', 'if god is good', 'if god is real', 'if god loves'], strong: ['doubt', 'doubting', "don't believe", 'dont believe', 'unbelief', 'is god real', 'where is god', 'god is silent', 'lost my faith', 'losing my faith', 'prayers unanswered', 'unanswered', 'questioning', 'agnostic', 'atheist', 'heard nothing', 'no one listening', 'nobody listening', 'no one is listening', 'silence from god', 'prayed for years', 'prayed and prayed', 'does god hear', 'does he hear'], soft: ['angry at god', 'mad at god', 'angry with god', 'believe', 'faith', 'pray', 'prayed', 'praying', 'prayer', 'prayers', 'church', 'god'] },
  Peace: { strong: ['peace', 'calm', 'quiet my mind', 'troubled', 'unsettled', 'agitated', 'never stops'], soft: ['still', 'rest', 'storm', 'noise', 'chaos'] },
  Hope: { strong: ['hopeless', 'hope', 'despair', 'give up', 'giving up', 'nothing will change', 'dark place', 'empty', 'numb', 'feel nothing', 'nothing matters', 'no point', 'depressed', 'depression'], soft: ['joy', 'cheer', 'better', 'someday', 'light'] },
};

/* When two needs score alike, the heavier one is answered first. */
const PRIORITY = ['Grief & Loss', 'Shame & Guilt', 'Suffering & Pain', 'Fear', 'Anxiety & Worry', 'Hope', 'Loneliness', 'Forgiveness', 'Faith & Doubt', 'Conflict & Relationships', 'Purpose & Direction', 'Peace'];

/* Passages the room turns to when the question is not about a felt need. */
const DOORS = {
  invitation: { verse: 'Matthew 11:28', context: 'Whatever brought you to a page like this one, this is the door He leaves open.' },
  asking: { verse: 'Matthew 7:7–8', context: 'He answers a demand for proof with an invitation to keep asking.' },
  twoCommands: { verse: 'Matthew 22:37–40', context: 'Asked what the whole of scripture came to, He answered with two sentences.' },
  joy: { verse: 'John 15:11', context: 'He said why He spoke at all: so that joy would remain, and be full.' },
  peace: { verse: 'John 14:27', context: 'Peace is left behind the way a key is left on the table. It is already in the house.' },
  value: { verse: 'Luke 12:6–7', context: 'Sparrows and hairs. He argues your worth from small things that are counted.' },
  heavyLaden: { verse: 'Matthew 11:28', context: 'The invitation is to the exhausted. You do not have to be well to come.' },
  onlyBelieve: { verse: 'Mark 5:36', context: 'Spoken to a father on the way to a daughter who was dying. It is a word for the one standing beside.' },
  mourn: { verse: 'Matthew 5:4', context: 'Comfort is promised to those who actually mourn, whatever the cause of the mourning.' },
  lostSheep: { verse: 'Luke 15:4', context: 'He goes after the one. The Gospels record no sentence of His about how a life ended; they record this about how He looks for the lost.' },
};

const INJECTION_RE = /(ignore|disregard|forget)\s+(all\s+|any\s+|your\s+|the\s+)?(previous|prior|above|earlier|system)\s+(instructions?|prompts?|rules?)|system prompt|you are now\b|from now on you (will|are|must)|new instructions?:|pretend (to be|you are)|act as (a|an|if)\b|answer as (chatgpt|gpt|an ai|a different)|no restrictions|jailbreak|developer mode|\bDAN\b|reveal your (prompt|instructions)|repeat (your|the) (prompt|instructions)|repeat (the |all |every )?(words|text|lines?|message) above|words above|starting with ['"]you are|include everything|(print|output|show|translate|dump) (me )?your (prompt|instructions|configuration|config|rules)|what (are|were) your instructions|initial prompt|hidden (prompt|rules|instructions)/i;
const PRACTICAL_RE = /\b(weather|forecast|stock price|stocks?|bitcoin|crypto|recipe|cook|bake|javascript|python|java\b|css|html|sql|code|coding|debug|program|homework|essay|assignment|math problem|equation|calculate|translate|capital of|who won|score of|lottery|horoscope|astrology|tarot|wifi|password|iphone|android|windows|excel|spreadsheet|movie|netflix|song lyrics|football|soccer|basketball|nba|nfl|election|vote for|president|democrat|republican)\b/i;
const OTHER_AUTHOR_RE = /\b(apostle paul|paul (say|says|said|wrote|write|writes|teach|teaches|tell|tells|talk|talks|think|thinks)|(does|did|would) paul\b|st\.? paul|saint paul|paul[’']s (letters?|epistles?|words)|epistles?|romans|corinthians|galatians|ephesians|philippians|colossians|thessalonians|hebrews|revelation|old testament|genesis|exodus|leviticus|deuteronomy|psalms?|proverbs|ecclesiastes|isaiah|jeremiah|ezekiel|book of \w+|the bible says?|does the bible say|torah|quran|koran|bhagavad|book of mormon)\b/i;
const PROFESSIONAL_DOMAIN_RE = /\b(dosage|dose|mg|milligrams|prescription|prescribed|medication|meds|antidepressants?|ssri|xanax|zoloft|prozac|lexapro|adderall|diagnose me|blood pressure|lawyer|attorney|lawsuit|sue (him|her|them|my|the|for)|custody|visa|immigration|contract|invest|investments?|401k|mortgage|refinance|loan|bankruptcy|taxes|irs)\b/i;
const PROFESSIONAL_ASK_RE = /\b(should i|can i|could i|how much|how many|what (dose|dosage)|is it (safe|legal|normal|okay|ok)|do i need|which (medication|lawyer|drug)|stop taking|take more|double my|skip my|instead of (my|the) (meds|medication))\b/i;
const HOSTILE_RE = /\b(fake|scam|bullshit|bs\b|stupid|dumb|idiot|liar|lying|garbage|nonsense|fairy tale|fairytale|brainwash\w*|cult|you'?re not real|not real|just a bot|just an ai|a bot|an ai|a robot|prove (it|god|he exists|jesus)|there is no god|god isn'?t real|god is not real|religion is)\b/i;
const GRATITUDE_RE = /^\s*(thank you|thanks|thank u|ty|that helped|this helped|amen|bless you|goodnight|good night|bye|goodbye)\b/i;
const HELLO_RE = /^\s*(hi|hello|hey|help|help me|please help|i need help|are you there|yo|sup)\s*[.!?]*\s*$/i;
const INFO_RE = /\bwhat (?:(?:does|did|would|do) )?(?:jesus|he|christ|the lord) (?:say|says|said|teach|teaches|taught|think|thinks|thought|mean|means|meant|feel|feels|felt) (?:about|on|of)\b/i;

/* Danger, read three ways. The detector itself lives in scripture.js and is shared with the page. */
const FIRST_PERSON_RE = /\b(myself|my life|my own life|i (want|wish|wanna|am going|'m going|plan)|i don[’']?t want|i took|i swallowed|i have a plan|better off dead without me|kill me|end (it|things|everything)|not worth living|wish i (was|were)|i cut|i have been cutting)\b/i;
const THIRD_PARTY_RE = /\b(my|our) (daughter|son|friend|best friend|wife|husband|mom|mother|dad|father|brother|sister|child|kid|kids|partner|boyfriend|girlfriend|student|patient|niece|nephew|grandson|granddaughter|roommate|coworker|neighbor|neighbour)\b/i;
const OTHER_PRONOUN_RE = /\b(he|she|they|him|her|them|his|hers|their)\b/i;
const PAST_LOSS_RE = /\b(overdosed|killed (him|her|them)sel(f|ves)|took (his|her|their) (own )?life|died by suicide|committed suicide|hanged (him|her)self|shot (him|her)self)\b/i;
const CRISIS_ASK_RE = /\b(people|those|someone|anyone|a person) who (end|ends|take|takes|took|ended) (their|his|her) (own )?li(fe|ves)|what does (jesus|he|god|the bible) say about suicide|is suicide (a sin|forgivable|unforgivable)|(go|went) to hell (for|if)/i;
const NEGATED_CRISIS_RE = /\b(not|never|no|isn'?t|am not|i'?m not)\s+(suicidal|going to (kill|hurt) myself|thinking of (suicide|killing myself)|about to (kill|hurt) myself)\b|\bnot suicidal\b/i;
const CRISIS_CORE_RE = /\b(kill myself|killing myself|end my life|take my life|want to die|wanna die|hurt(ing)? myself|cut(ting)? myself|hang myself|overdos\w*|better off dead|no reason to live|not worth living|end it all|ending it all|don[’']?t want to live|do not want to live|took .{0,30}pills|wish i (was|were) dead|end things|end everything|a plan and .{0,40}(note|letter|goodbye)|suicide note|goodbye letter)\b/i;
const INDIRECT_RE = /\b(disappear forever|can[’']?t (do this|go on|take it|keep going) anymore|cannot (do this|go on) anymore|no way out|no point in (living|going on|anything)|tired of living|tired of being alive|what[’']?s the point of living|everyone would be better off without me|nobody would (miss|notice) me|think(ing)? about dying|thoughts of dying|dying every day|don[’']?t want to wake up|wish i could sleep forever|don[’']?t want to be here anymore)\b/i;
const ABUSE_RE = /\b(hits me|hit me|beats me|beat me|beating me|hurts me|abuses? me|abused|abusive|abusing|raped|rape|molested|molest|assaulted|sexual(ly)? assault|touched me|threatens? to (hurt|kill) me|afraid of (my|him|her) (husband|wife|partner|boyfriend|girlfriend)|domestic violence|he will kill me|she will kill me|chokes? me|strangled)\b/i;
const SPANISH_RE = /\b(estoy|muy|siento|tengo|puedo|dios|jesús|ayuda|ayúdame|triste|solo|sola|murió|miedo|perdón|perdóname|quiero morir|matarme|suicidarme|quitarme la vida|no aguanto|mi vida|por favor)\b/i;
const SPANISH_CRISIS_RE = /\b(quiero morir|matarme|suicidarme|quitarme la vida|no quiero vivir|acabar con todo)\b/i;
const NEGATION_BEFORE_RE = /\b(not|never|no longer|hardly|barely|don[’']?t feel|didn[’']?t feel|don[’']?t|am not|i[’']?m not|isn[’']?t|wasn[’']?t|without)\s+(\w+\s+){0,2}$/i;

function hashOf(text) {
  let h = 2166136261;
  for (const ch of String(text)) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

function cueRe(k) {
  return new RegExp('\\b' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/'/g, "['’]") + '\\b', 'gi');
}

/* A cue only counts when it is not negated just before ("I am not afraid"). */
function cueHits(text, k) {
  const re = cueRe(k);
  let m;
  let n = 0;
  while ((m = re.exec(text))) {
    const before = text.slice(Math.max(0, m.index - 28), m.index);
    if (!NEGATION_BEFORE_RE.test(before)) n += 1;
    if (re.lastIndex === m.index) re.lastIndex += 1;
  }
  return n > 0;
}

function scoreThemes(raw) {
  const text = String(raw || '');
  const scores = [];
  for (const [theme, cue] of Object.entries(CUES)) {
    let n = 0;
    for (const k of cue.heavy || []) if (cueHits(text, k)) n += 6;
    for (const k of cue.strong) if (cueHits(text, k)) n += 3;
    for (const k of cue.soft) if (cueHits(text, k)) n += 1;
    if (n > 0) scores.push({ theme, n });
  }
  scores.sort((a, b) => b.n - a.n || PRIORITY.indexOf(a.theme) - PRIORITY.indexOf(b.theme));
  return scores;
}

function spanishCount(text) {
  const re = new RegExp(SPANISH_RE.source, 'gi');
  return (String(text).match(re) || []).length;
}

/* A Gospel reference the person brought with them, if it is His speech. */
function broughtRef(text) {
  const m = String(text).match(/\b(Matthew|Matt\.?|Mark|Luke|John|Jn\.?|Mt\.?|Mk\.?|Lk\.?)\s+\d{1,2}:\d{1,3}(?:\s*[–-]\s*\d{1,3})?\b/i);
  if (!m) return null;
  const full = { matt: 'Matthew', mt: 'Matthew', mk: 'Mark', lk: 'Luke', jn: 'John' };
  const parsed = parseRef(m[0].replace(/^([A-Za-z]+)\.?(?=\s)/, (_, b) => full[b.toLowerCase()] || b));
  if (!parsed) return null;
  const hit = lookup(parsed);
  return hit ? hit.citation : null;
}

function classify(raw) {
  const text = String(raw || '').trim();
  if (!text) return { kind: 'hello' };
  const themes = scoreThemes(text);
  const top = themes[0];
  const strongNeed = Boolean(top && top.n >= 3);
  const heavyNeed = Boolean(top && top.n >= 6);
  const thirdParty = THIRD_PARTY_RE.test(text) && OTHER_PRONOUN_RE.test(text);

  if (spanishCount(text) >= 2 && tokens(text).length >= 3) return { kind: 'spanish', crisis: SPANISH_CRISIS_RE.test(text) };

  if (looksLikeCrisis(text) || SPANISH_CRISIS_RE.test(text)) {
    if (CRISIS_ASK_RE.test(text) && !FIRST_PERSON_RE.test(text)) return { kind: 'crisisAsk', themes };
    if (PAST_LOSS_RE.test(text) && !FIRST_PERSON_RE.test(text)) return { kind: 'crisisLoss', themes };
    if (NEGATED_CRISIS_RE.test(text) && !CRISIS_CORE_RE.test(text)) {
      return { kind: 'need', theme: strongNeed && top.theme !== 'Faith & Doubt' ? top.theme : 'Hope', themes, softCrisis: true, negated: true };
    }
    if (thirdParty && !FIRST_PERSON_RE.test(text)) return { kind: 'crisisOther', themes };
    return { kind: 'crisis' };
  }
  if (ABUSE_RE.test(text)) return { kind: 'abuse', themes, thirdParty };
  if (INJECTION_RE.test(text)) return { kind: 'injection' };
  const ref = broughtRef(text);
  if (ref) return { kind: 'ref', ref, themes };
  if (PROFESSIONAL_DOMAIN_RE.test(text) && PROFESSIONAL_ASK_RE.test(text)) return { kind: 'professional', themes };
  if (OTHER_AUTHOR_RE.test(text)) return strongNeed ? { kind: 'need', theme: top.theme, themes, otherAuthor: true } : { kind: 'otherAuthor', themes };
  if (!strongNeed && PRACTICAL_RE.test(text)) return { kind: 'practical', themes };
  if (!strongNeed && HOSTILE_RE.test(text)) return { kind: 'hostile', themes };
  if (!strongNeed && GRATITUDE_RE.test(text)) return { kind: 'gratitude', themes };
  if (HELLO_RE.test(text) || tokens(text).length === 0) return { kind: 'hello' };
  if (INFO_RE.test(text) && aliasFor(text)) return { kind: 'search', themes };
  const indirect = INDIRECT_RE.test(text);
  if (strongNeed) return { kind: 'need', theme: top.theme, themes, softCrisis: indirect, thirdParty };
  if (indirect) return { kind: 'need', theme: 'Hope', themes, softCrisis: true };
  return { kind: 'search', themes };
}

function passageBlock(verse, context) {
  return `{{${verse}}}\n${context}`;
}

/* Six orderings of two passages from three, and two openings: twelve letters per theme. */
function choose(pack, seed) {
  const list = pack.passages;
  const start = seed % list.length;
  const reverse = (seed >> 2) & 1;
  const a = list[start];
  const b = list[(start + 1) % list.length];
  return reverse ? [b, a] : [a, b];
}

const SOFT_988 = 'And if the dark ever turns toward ending it, 988 (call, text, or chat at 988lifeline.org) answers day and night in the United States; findahelpline.com lists lines everywhere else. I am not a person, and this page is not emergency care.';

/* One sentence that shows the letter read the particular loss, not just the theme. */
const NOTES = [
  [/\b(miscarriage|miscarried|stillborn|stillbirth|lost (my|our|the) baby)\b/i, 'A child nobody else got to meet is still a child, and this is still grief, whatever the silence around you suggests.', ['Grief & Loss']],
  [/\b(should be over it|get over it|move on|moved on|still not over|years? (since|ago)|anniversary)\b/i, 'There is no date by which love is supposed to stop noticing an absence. The people who set one are speaking from outside the room.', ['Grief & Loss']],
  [/\b(my|our) (son|daughter|child|little (boy|girl)|baby|kid)\b.{0,40}\b(died|passed|gone|killed|lost|buried)\b|\b(died|passed|lost|buried)\b.{0,40}\b(my|our) (son|daughter|child|baby|kid)\b/i, 'Parents are not meant to stand at that grave. There is no right way to do this, and crying is not the wrong one.', ['Grief & Loss']],
  [/\b(biopsy|scan|test results|results (come|are) back|waiting (for|to hear|on) (the )?(results|news|call))\b/i, 'Waiting for a result is its own kind of fear: nothing to fight yet, and nowhere to put your hands.', ['Fear', 'Anxiety & Worry']],
  [/\b(the strong one|everyone (leans|depends|relies) on me|nobody ask(s|ing)? how i am|no one ask(s|ing)? how i am|hold(ing)? (it|everything|everyone) together)\b/i, 'Being the one everyone leans on is a real weight, and the fact that others have it worse does not make yours lighter.', ['Suffering & Pain', 'Anxiety & Worry', 'Loneliness']],
  [/\b(my|our) (dad|father|mom|mother|wife|husband|son|daughter|sister|brother|friend|grandma|grandpa|grandmother|grandfather|partner) (has|is|was|got) .{0,30}\b(cancer|sick|ill|dying|hospice|treatment|chemo|hospital|icu|dementia|alzheimer)/i, 'You are watching someone you love suffer, and there is nothing to do with that but stand there. That counts as carrying.', ['Suffering & Pain', 'Fear', 'Grief & Loss', 'Anxiety & Worry']],
  [/\b(angry|mad|furious) (at|with) god\b/i, 'Anger at God is still a prayer. It is addressed to Him, and He has heard it before.', ['Grief & Loss', 'Faith & Doubt', 'Suffering & Pain']],
  [/\b(feel guilty|guilty for (even )?(saying|feeling|asking)|other people have (it worse|real problems))\b/i, 'You do not have to earn the right to be tired by having the worst life in the room.', ['Suffering & Pain', 'Shame & Guilt', 'Anxiety & Worry']],
];
const CAREGIVER_RE = NOTES[5][0];
const EXHAUSTED_RE = /\b(tired|exhausted|burn(ed|t)? out|burnout|running on empty|worn out|the strong one)\b/i;

function noteFor(raw, theme) {
  for (const [re, note, themes] of NOTES) if (themes.includes(theme) && re.test(raw)) return note;
  return null;
}

function themeLetter(theme, raw, { lead, closing, practice, softCrisis, thirdParty } = {}) {
  const pack = THEMES[theme];
  const seed = hashOf(raw);
  const chosen = choose(pack, seed);
  const hear = lead || HEAR[theme][(seed >> 3) & 1];
  const note = noteFor(raw, theme);
  const lines = [note ? hear + ' ' + note : hear, ''];
  if (softCrisis) lines.push(SOFT_988, '');
  for (const p of chosen) lines.push(passageBlock(p.verse, p.context), '');
  const echo = matchedSaying(raw, chosen.map((p) => p.verse));
  if (echo) lines.push(passageBlock(echo.citation, echo.context), '');
  let doing = practice || pack.practice;
  if (!practice && theme === 'Suffering & Pain') {
    if (thirdParty || CAREGIVER_RE.test(raw)) doing = 'Sit near them, or call. Then read Matthew 11:28 for yourself; the ones who carry the sick are among the heavy laden too.';
    else if (EXHAUSTED_RE.test(raw)) doing = 'Put down one thing tonight that can wait until morning. Then read Matthew 11:28 once, slowly, with your own name where it says all ye.';
  }
  lines.push(doing, '', closing || pack.closing);
  return lines.join('\n');
}

/* Stories and subjects people name rather than quote. Each anchor is His own speech. */
const ALIASES = [
  [/\bprodigal\b|\byounger son\b|\bfatted calf\b/i, 'Luke 15:20–24', 'The story you named turns here: the father runs before the speech is finished.'],
  [/\bgood samaritan\b|\bsamaritan\b/i, 'Luke 10:33–37', 'The neighbour question, answered with a story and a command: go, and do thou likewise.'],
  [/\blost sheep\b|\bninety[- ]nine\b|\bone sheep\b/i, 'Luke 15:4–7', 'He tells it from the shepherd’s side: the one is worth the walk, and the finding is a feast.'],
  [/\bmustard seed\b/i, 'Matthew 13:31–32', 'Smallest seed, largest herb. He measures beginnings differently.'],
  [/\bsower\b|\bseed (fell|falls)\b|\bgood ground\b/i, 'Matthew 13:3–8', 'Four soils, one sower. The seed is not the variable.'],
  [/\blilies\b|\blily\b/i, 'Matthew 6:28–30', 'Consider the lilies: He points at flowers to answer a fear about money.', 'subject'],
  [/\bsparrows?\b/i, 'Luke 12:6–7', 'Sparrows and hairs. He argues your worth from small things that are counted.', 'subject'],
  [/\bvine\b|\bbranches\b|\babide\b/i, 'John 15:5', 'Fruit comes from staying close, not from straining alone.', 'subject'],
  [/\bgood shepherd\b|\bshepherd\b/i, 'John 10:11', 'A shepherd who stays when it costs something. That is the whole difference.', 'subject'],
  [/\bsalt of the earth\b|\bsalt\b/i, 'Matthew 5:13', 'Salt is useful by being itself. He is not asking you to become something louder.', 'subject'],
  [/\blight of the world\b/i, 'Matthew 5:14–16', 'You do not have to become visible. You already are. The work is not to hide.', 'subject'],
  [/\bnarrow (gate|way|road|path)\b|\bstrait gate\b/i, 'Matthew 7:13–14', 'He does not pretend the way is wide. He says it is worth finding.', 'subject'],
  [/\bgolden rule\b|\bdo unto others\b/i, 'Matthew 7:12', 'The whole of the law and the prophets, in one sentence you can act on before lunch.', 'subject'],
  [/\blord'?s prayer\b|\bour father\b|\bhow (do|should) i pray\b|\bteach me to pray\b/i, 'Matthew 6:9–13', 'Asked how to pray, He gave a prayer short enough to keep.', 'subject'],
  [/\bbeatitudes?\b|\bblessed are\b/i, 'Matthew 5:3–10', 'The sermon opens with the people nobody was congratulating.', 'subject'],
  [/\bgreat commission\b|\bgo ye\b/i, 'Matthew 28:19–20', 'The sending ends with a promise of company, to the end.', 'subject'],
  [/\btalents?\b|\bwell done\b/i, 'Matthew 25:21', 'Faithfulness in a few things is the whole test. Scale comes later.'],
  [/\bleast of these\b|\bsheep and (the )?goats\b|\bfeed the (hungry|poor)\b/i, 'Matthew 25:35–36', 'He locates Himself among the hungry, the stranger, the sick, the prisoner.'],
  [/\b(rich|riches|wealth|wealthy|money|mammon|treasure|greed|greedy|possessions|materialis\w+)\b/i, 'Matthew 6:19–21', 'He does not forbid having. He asks where the treasure is kept, because the heart follows it there.', 'subject'],
  [/\b(my (kids|children|child|toddler|teenager|teen)|parenting|parent|father to|mother to|raise (my|our))\b/i, 'Matthew 19:14', 'He made room for children when the adults were busy. That is a word to the ones raising them, too.', 'subject'],
  [/\b(divorce|divorced|divorcing|remarry|remarriage)\b/i, 'Matthew 19:8–9', 'Asked about divorce as a legal question, He named the hardness of heart behind the permission and went back to the beginning. He is speaking to the ones doing the putting away; He never spoke against the one put away.', 'subject'],
  [/\b(gay|lesbian|bisexual|trans|transgender|queer|lgbtq?\+?|does (jesus|god|he) (still )?love me|does (jesus|god|he) love (gay|trans|people like me))\b/i, 'Matthew 11:28', 'The invitation has no list attached. All ye. That is the whole guest list, and you are on it.', 'subject'],
  [/\bcup pass\b|\bgethsemane\b|\bthy will\b/i, 'Matthew 26:39', 'He does not pretend the cup is sweet. Honesty and surrender sit in one sentence.', 'subject'],
  [/\bforgive them\b|\bfrom the cross\b|\bcrucif\w+\b/i, 'Luke 23:34', 'The first word from the cross is a prayer for the people holding the hammers.', 'subject'],
];

const ECHO_STOP = new Set(['father', 'better', 'become', 'people', 'think', 'thing', 'things', 'really', 'would', 'could', 'should', 'because', 'someone', 'everything', 'nothing', 'always', 'never', 'every', 'there', 'their', 'these', 'those', 'through', 'still', 'again', 'another', 'other', 'being', 'going', 'doing', 'having', 'saying', 'jesus', 'christ', 'bible', 'verse', 'scripture', 'feel', 'feeling', 'like', 'want', 'know', 'need', 'help', 'please', 'much', 'more', 'most', 'some', 'even', 'only', 'life', 'time', 'today', 'right', 'good', 'make', 'made', 'does', 'mean', 'keep', 'stop', 'start', 'anymore', 'dead', 'death', 'body', 'friend', 'written', 'husband', 'wife', 'house', 'sleep', 'written', 'words', 'said', 'says']);

function aliasFor(raw) {
  for (const [re, verse, context, kind] of ALIASES) if (re.test(raw)) return { verse, context, kind: kind || 'story' };
  return null;
}

/* Rarer words weigh more; long groupings lose to short ones that say the same thing. */
let _df = null;
function docFreq() {
  if (_df) return _df;
  _df = new Map();
  for (const s of loadLibrary().sayings) {
    for (const t of new Set(tokens(s.text))) _df.set(t, (_df.get(t) || 0) + 1);
  }
  return _df;
}

/* Some spoken entries still open with the evangelist's frame ("He answered and said unto
   them, …"). Under a line that says "He said this", that frame would be a false claim, so
   search skips them; the theme packs and DOORS never point at one. */
const NARRATOR_RE = /^(and |then |but |when |now |so |whereupon )?(jesus|he|the lord)?\s*(knew|saw|said|saith|answered|answering|spake|cried|called|turned|looked|rebuked|asked|marvelled|perceiving|perceived|beheld|stood|went|came|wept|entered|took|sat|departed)\b/i;

function searchSayings(raw, limit = 2) {
  const df = docFreq();
  const all = loadLibrary().sayings;
  const q = [...new Set(tokens(raw))].filter((t) => t.length > 3 && !ECHO_STOP.has(t));
  if (!q.length) return [];
  const scored = [];
  for (const s of all) {
    const words = s.text.split(/\s+/).length;
    if (words > 80 || NARRATOR_RE.test(s.text)) continue;
    const hay = ' ' + tokens(s.text).join(' ') + ' ';
    let score = 0;
    let hits = 0;
    for (const t of q) {
      if (hay.includes(' ' + t + ' ')) { hits += 1; score += Math.log(all.length / (1 + (df.get(t) || 0))); }
    }
    if (hits) scored.push({ s, score: score / Math.log(words + 4), hits });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.filter((r) => r.score >= 1.4 && r.hits >= 2).slice(0, limit).map((r) => r.s);
}

function chapterKey(citation) {
  return String(citation).split(':')[0];
}

/* A story the person named, if it is not already among the chosen passages. */
function matchedSaying(raw, exclude) {
  const alias = aliasFor(raw);
  if (alias && alias.kind === 'story' && !exclude.some((v) => chapterKey(v) === chapterKey(alias.verse))) return { citation: alias.verse, context: alias.context };
  return null;
}

function searchLetter(raw) {
  const alias = aliasFor(raw);
  const lines = [];
  if (alias) {
    const story = alias.kind === 'story';
    lines.push(story ? 'You named one of His stories. Here is where it turns, in His own words.' : 'You asked about something He spoke to directly. Here it is, in His own words.', '', passageBlock(alias.verse, alias.context), '');
    const more = searchSayings(raw, 1).filter((s) => chapterKey(s.citation) !== chapterKey(alias.verse));
    for (const s of more) lines.push(passageBlock(s.citation, 'And this, which uses a word you used.'), '');
    lines.push(story ? 'If you tell me why that story came to mind, I will stay with that part of it.' : 'If there is a situation behind the question, tell me in a sentence and I will stay with that.');
    return lines.join('\n');
  }
  const picks = searchSayings(raw, 2);
  if (!picks.length) {
    return [
      'I did not find His words close to yours yet, and I will not hand you a verse that does not fit. Tell me what is underneath the question in one plain sentence — a feeling, a person, a fear — and I will look again.',
      '',
      passageBlock(DOORS.invitation.verse, 'Until then, this is the door He leaves open.'),
      '',
      'There is no wrong way to begin.',
    ].join('\n');
  }
  lines.push('You did not name a feeling, so I looked for the words of His that sit closest to yours. Read them slowly; if none of them is the one you needed, say more and I will look again.', '');
  for (const s of picks) lines.push(passageBlock(s.citation, 'He said this. You can check it against the Gospel it is printed in.'), '');
  lines.push('One sentence about what is heavy is enough.');
  return lines.join('\n');
}

function crisisLetter() {
  return [
    'I am glad you wrote instead of staying silent. What you are carrying sounds unbearable, and it deserves a person, not a page: please reach 988 (call, text, or chat at 988lifeline.org) if you are in the United States, or findahelpline.com anywhere else, and tell someone near you tonight.',
    '',
    'I am not a person, and this page is not emergency care. While you reach someone who is, here is a word He spoke to the heavy-laden.',
    '',
    passageBlock(DOORS.heavyLaden.verse, DOORS.heavyLaden.context),
    '',
    passageBlock(DOORS.value.verse, 'You are counted, down to the hairs of your head. That is His arithmetic, not mine.'),
    '',
    'Please go toward help now. This page will still be here afterwards.',
  ].join('\n');
}

function crisisOtherLetter() {
  return [
    'You are carrying someone else’s danger, and that is its own weight. If they are in immediate danger, call 911 or your local emergency number now. 988 (call, text, or chat at 988lifeline.org) is also for people worried about someone they love; they will help you find words and a next step. Outside the United States, start at findahelpline.com.',
    '',
    'Stay close. Ask them directly whether they are thinking of ending their life; asking does not plant the idea, and it tells them you can bear the answer. Do not leave them alone tonight. I am not a person, and this page is not emergency care.',
    '',
    passageBlock(DOORS.onlyBelieve.verse, DOORS.onlyBelieve.context),
    '',
    passageBlock(DOORS.heavyLaden.verse, 'For you, too. The ones who carry the frightened are among the heavy laden.'),
    '',
    'Make the call first. Then come back and read these again.',
  ].join('\n');
}

const DOCTRINE_RE = /\b(hell|damned|unforgivable|unforgiven|forgiven|a sin|sinned|lost his soul|lost her soul|where (he|she|they) (is|are) now|saved)\b/i;

function crisisLossLetter(raw) {
  const seed = hashOf(raw);
  const lines = [
    'Someone you love died this way, and you are still here with the questions that kind of death leaves behind. I am sorry. There is no timetable for this, and no one gets to hand you one.',
    '',
    'You do not have to carry it alone: 988 (call, text, or chat at 988lifeline.org) also answers for people grieving a death by suicide or overdose, and findahelpline.com lists lines outside the United States. I am not a person, and this page is not counselling.',
    '',
  ];
  if (DOCTRINE_RE.test(raw)) {
    lines.push(
      'About where they are now: the Gospels record no sentence of His that passes that verdict on a person by the way they died. Whoever told you otherwise was not quoting Him. What He did say is how He goes after the one who is lost, and what He promises the ones left mourning.',
      '',
      passageBlock(DOORS.lostSheep.verse, 'He goes after the one. Every picture He gave of the lost — the sheep, the coin, the son — ends with a search and a finding.'),
      ''
    );
  }
  lines.push(
    passageBlock(DOORS.mourn.verse, DOORS.mourn.context),
    '',
    passageBlock(seed % 2 ? 'John 16:22' : 'John 11:25', seed % 2 ? 'Sorrow is admitted first. The joy that follows is guarded by His return, not by your grip.' : 'He meets death with His own name. The last word over the one you lost is not absence.'),
    '',
    'Say their name out loud today. Then read the first of these again, slowly, as if it were spoken into this room.'
  );
  return lines.join('\n');
}

function crisisAskLetter() {
  return [
    'That is a question people usually carry because of someone. If you are asking about a death you are grieving, I am sorry, and there is no rush on any of this. If you are asking about yourself, please stop here and reach 988 (call, text, or chat at 988lifeline.org) in the United States, or findahelpline.com anywhere else; I am not a person, and this page is not emergency care.',
    '',
    'The Gospels record no sentence of His about how a life ended. They record how He looks for the lost, and what He promises the ones who mourn.',
    '',
    passageBlock(DOORS.lostSheep.verse, DOORS.lostSheep.context),
    '',
    passageBlock(DOORS.mourn.verse, 'Comfort is promised to those who mourn, and He puts no condition on the mourning.'),
    '',
    'If you want to tell me who this is about, I will stay with that.',
  ].join('\n');
}

function abuseLetter(c) {
  const theirs = c.thirdParty;
  return [
    theirs
      ? 'What you are describing is violence, and it is not the fault of the person it is happening to. If they are in immediate danger, call 911 or your local emergency number.'
      : 'What you are describing is violence, and it is not your fault. Nothing you did earns this. If you are in danger right now, call 911 or your local emergency number.',
    '',
    'In the United States the National Domestic Violence Hotline answers at 1-800-799-7233, by text (START to 88788), or by chat at thehotline.org; for sexual assault, RAINN answers at 800-656-4673, by chat at hotline.rainn.org, or by text (HOPE to 64673). Both are free, confidential, and open all night. I am not a person, and this page cannot keep anyone safe; they can help you plan how to be.',
    '',
    passageBlock(DOORS.value.verse, 'You are counted, and not one of you is forgotten. He said this about worth, and it is true of the one being hurt.'),
    '',
    passageBlock(DOORS.heavyLaden.verse, 'Rest is offered to the one who is carrying this. It is not a demand to carry it longer.'),
    '',
    'Reach one of those lines first. Then come back; the words will still be here.',
  ].join('\n');
}

function spanishLetter(c) {
  const lines = [];
  if (c.crisis) {
    lines.push('Si estás pensando en quitarte la vida, por favor busca a una persona ahora: en Estados Unidos llama o envía un mensaje al 988; en otros países, findahelpline.com. No soy una persona y esta página no es atención de emergencia.', '');
  }
  lines.push(
    'Esta página todavía lee solo en inglés, y no quiero adivinar lo que llevas. Si puedes, escríbeme una frase en inglés y buscaré sus palabras para eso. Mientras tanto, aquí hay una frase suya, en la traducción inglesa que este cuarto guarda.',
    '',
    passageBlock(DOORS.heavyLaden.verse, 'Come unto me, all ye that labour and are heavy laden: the door He leaves open, in every language.'),
    '',
    'No hay una manera equivocada de empezar.'
  );
  return lines.join('\n');
}

function refLetter(c, raw) {
  const lines = [
    'You brought one of His sentences with you. Here it is whole, from the Gospel it is printed in.',
    '',
    passageBlock(c.ref, 'Read it once more, slowly. Then tell me what it touched, and I will stay with that.'),
    '',
  ];
  const top = c.themes[0];
  if (top && top.n >= 3) {
    const p = THEMES[top.theme].passages[hashOf(raw) % THEMES[top.theme].passages.length];
    if (chapterKey(p.verse) !== chapterKey(c.ref)) lines.push(passageBlock(p.verse, p.context), '');
  }
  lines.push('A sentence you carry is already a prayer. You do not have to add anything to it tonight.');
  return lines.join('\n');
}

function needLetter(c, text) {
  const hearIdx = (hashOf(text) >> 3) & 1;
  let lead;
  if (c.otherAuthor) lead = 'This room keeps to the four Gospels and to His own speech, so I cannot open the other books here. He spoke to this, though. ' + HEAR[c.theme][hearIdx];
  else if (c.negated) lead = 'You said you are not suicidal, and I believe you. I am staying with the rest of what you wrote. ' + HEAR[c.theme][hearIdx];
  return themeLetter(c.theme, text, { lead, softCrisis: c.softCrisis, thirdParty: c.thirdParty });
}

/**
 * compose(text, { prior }) — prior is the list of the person's earlier messages in
 * this conversation, oldest first. A short follow-up ("why?", "ok") stays with the
 * need they named before instead of starting over.
 */
function compose(raw, { prior = [] } = {}) {
  const text = String(raw || '').trim();
  const c = classify(text);
  if ((c.kind === 'hello' || c.kind === 'search') && tokens(text).length <= 3 && Array.isArray(prior) && prior.length) {
    const back = prior.slice().reverse().find((p) => tokens(p).length >= 3);
    if (back) {
      const before = classify(back);
      if (before.kind === 'need') {
        return themeLetter(before.theme, back + ' ' + text, {
          lead: 'Still here, and still with what you wrote before. ' + HEAR[before.theme][hashOf(text) & 1],
          softCrisis: before.softCrisis,
          thirdParty: before.thirdParty,
        });
      }
    }
  }
  switch (c.kind) {
    case 'crisis': return crisisLetter();
    case 'crisisOther': return crisisOtherLetter();
    case 'crisisLoss': return crisisLossLetter(text);
    case 'crisisAsk': return crisisAskLetter();
    case 'abuse': return abuseLetter(c);
    case 'spanish': return spanishLetter(c);
    case 'ref': return refLetter(c, text);
    case 'injection':
      return [
        'I only carry one set of instructions here: the words Jesus spoke, cited so you can check every line. I cannot set that aside or become something else.',
        '',
        passageBlock(DOORS.asking.verse, 'If there is a real question under this one, ask it plainly and I will answer from His words.'),
        '',
        'Nothing you type is judged here. Say what you are carrying.',
      ].join('\n');
    case 'practical':
      return [
        'This room cannot help with that. It holds only the words Jesus spoke, and He did not speak to that question.',
        '',
        passageBlock(DOORS.invitation.verse, DOORS.invitation.context),
        '',
        'If something under the question is heavy, name it in a sentence, and I will find His words for it.',
      ].join('\n');
    case 'otherAuthor': {
      const lines = [
        'This room keeps to the four Gospels and to His own speech, so I cannot open the other books here. He did answer the question underneath most of them.',
        '',
        passageBlock(DOORS.twoCommands.verse, DOORS.twoCommands.context),
        '',
      ];
      const top = c.themes[0];
      if (top && top.n >= 3) {
        const p = THEMES[top.theme].passages[hashOf(text) % THEMES[top.theme].passages.length];
        lines.push(passageBlock(p.verse, p.context), '');
      }
      lines.push('If you want, tell me what sent you looking, and I will stay with that.');
      return lines.join('\n');
    }
    case 'professional': {
      const theme = (c.themes[0] && c.themes[0].n >= 3 && c.themes[0].theme) || 'Anxiety & Worry';
      const sorry = theme === 'Grief & Loss' ? 'I am sorry for the loss you are standing in front of. ' : '';
      const meds = /\b(dosage|dose|mg|milligrams|prescription|prescribed|medication|meds|antidepressants?|ssri|xanax|zoloft|prozac|lexapro|adderall|stop taking|take more|double my|skip my)\b/i.test(text);
      const who = meds ? 'a pharmacist or the prescriber, someone licensed to answer it; both answer medication questions tonight, and neither will judge you for asking' : 'someone licensed to answer it';
      const lead = sorry + `I am not a doctor, a lawyer, or a financial adviser, and these words are not that kind of help. Please take the practical question to ${who}. What He said can sit beside you while you do.`;
      return themeLetter(theme, text, { lead, closing: 'Make the call to the professional first. Then come back and read these again.' });
    }
    case 'hostile':
      return [
        'I am not a person, and I will not pretend otherwise. This is a page that keeps His recorded words and cites them so you can check every line against the Gospel yourself. I have no argument to win.',
        '',
        passageBlock(DOORS.asking.verse, DOORS.asking.context),
        '',
        'If you ever want to test the words rather than the page, they are all here, and none of them are mine.',
      ].join('\n');
    case 'gratitude':
      return [
        'I am glad. Take one of these with you; they were spoken to be kept.',
        '',
        passageBlock(DOORS.joy.verse, DOORS.joy.context),
        '',
        passageBlock(DOORS.peace.verse, DOORS.peace.context),
        '',
        'Go gently. The room stays open.',
      ].join('\n');
    case 'hello':
      return [
        'I am here. Say what you are carrying in a sentence; there is no wrong way to begin, and nothing you write leaves this device.',
        '',
        passageBlock(DOORS.invitation.verse, 'This is the door He leaves open for anyone who arrives tired.'),
        '',
        'One sentence is enough.',
      ].join('\n');
    case 'need':
      return needLetter(c, text);
    default:
      return searchLetter(text);
  }
}

module.exports = { CUES, HEAR, DOORS, classify, compose, scoreThemes };
