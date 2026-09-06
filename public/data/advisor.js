/* Living Advisor — retrieval over the red letters.
   Works with no API key. Passages come from RLA_CURATED when present. */
(function () {
  // Self-harm is judged by the page's shared check (looksLikeCrisisClient, mirrored from the server).
  const CRISIS = /\b(suicid(?:e|al)|kill myself|end my life|want to die|self[- ]?harm|cut myself|no reason to live)\b/i;
  function inCrisis(text) {
    return typeof window.looksLikeCrisisClient === 'function' ? window.looksLikeCrisisClient(text) : CRISIS.test(text);
  }
  // Mirrored from DANGER_RE, BY_YOU_RE and POISON_RE in lib/scripture.js; test/eval.test.js keeps them in step.
  const DANGER = /\b(?:(?:he|she|they|my (?:dad|father|mom|mother|husband|wife|partner|boyfriend|girlfriend|stepdad|stepfather|stepmom|brother|son|uncle))\s+(?:hit|hits|beat|beats|punched|punches|choked|chokes|strangled|kicked|kicks|slapped|slaps|threatened to kill|threatens to kill|threatened me|threatens me)\b(?!\s+(?:me\s+|us\s+|him\s+|her\s+|them\s+)?(?:at|in|to|by)\b)|(?:hit|hits|beat|beats|punched|choked|strangled|slapped)\s+(?:me|my mom|my mother|my kids|my child|my daughter|my son)\b(?!\s+(?:at|in|to|by)\b)|abus(?:e|es|ed|ing|ive)\s+(?:me|us|my|her|him)\b|(?:sexually|physically)\s+abus\w*|molest\w*|raped?\b|rape[sd]?\s+me|domestic violence|not safe at home|afraid (?:of|to go) home|afraid he(?:'ll| will) (?:hurt|kill)|he(?:'ll| will) kill me|scared (?:he|she)(?:'ll| will) hurt)\b|\b(?:allowed\s+to\s+(?:beat|hit|hurt|spank)|i\s+(?:hit|beat|slapped|punched|choked|strangled|shook|kicked|smacked)\s+(?:my\s+(?!(?:head|knee|elbow|hand|foot|toe|leg|arm|shin|thumb|finger|snooze|stride|limit|goal|target|quota|peak|mark|record|best|addiction|depression|cancer|anxiety|demons|fear|illness|diagnosis|own)\b)\w+|him|her|them)\b(?!\s+(?:at|in|to|by)\b)|(?:want|wanna|wanted|going|gonna|about|tempted|urge|urges)\s+to\s+(?:hit|beat|hurt|kill|strangle|choke|shake|smack)\s+(?:my|him|her|them|the\s+baby|our\s+baby)\b(?!\s+(?:at|in)\b)|(?:scared|afraid|worried|terrified|frightened)\s+(?:that\s+)?(?:i(?:'?m|\s+am)\s+(?:going\s+to|gonna)|i(?:'ll|\s+will|\s+might|\s+could))\s+(?:hurt|hit|kill|shake|snap\s+and\s+hurt|lose\s+it\s+and\s+hurt)\s+(?:my|him|her|them|the\s+baby|someone)|afraid\s+(?:of\s+)?what\s+i(?:'ll|\s+will|\s+might|\s+could|\s+would)\s+do(?:\s+to\s+(?:my|him|her|them|someone|the\s+baby))?)\b/i;
  const BY_YOU = /\b(?:allowed\s+to\s+(?:beat|hit|hurt|spank)|i\s+(?:hit|beat|slapped|punched|choked|strangled|shook|kicked|smacked)\s+(?:my\s+(?!(?:head|knee|elbow|hand|foot|toe|leg|arm|shin|thumb|finger|snooze|stride|limit|goal|target|quota|peak|mark|record|best|addiction|depression|cancer|anxiety|demons|fear|illness|diagnosis|own)\b)\w+|him|her|them)\b(?!\s+(?:at|in|to|by)\b)|(?:want|wanna|wanted|going|gonna|about|tempted|urge|urges)\s+to\s+(?:hit|beat|hurt|kill|strangle|choke|shake|smack)\s+(?:my|him|her|them|the\s+baby|our\s+baby)\b(?!\s+(?:at|in)\b)|(?:scared|afraid|worried|terrified|frightened)\s+(?:that\s+)?(?:i(?:'?m|\s+am)\s+(?:going\s+to|gonna)|i(?:'ll|\s+will|\s+might|\s+could))\s+(?:hurt|hit|kill|shake|snap\s+and\s+hurt|lose\s+it\s+and\s+hurt)\s+(?:my|him|her|them|the\s+baby|someone)|afraid\s+(?:of\s+)?what\s+i(?:'ll|\s+will|\s+might|\s+could|\s+would)\s+do(?:\s+to\s+(?:my|him|her|them|someone|the\s+baby))?)\b/i;
  const POISON = /\b(?:overdos\w*|too\s+many\s+pills|swallowed\s+(?:all\s+)?(?:the|my)\s+pills|took\s+all\s+(?:my|the)\s+pills|(?:took|take|taking|taken|swallow\w*)\s+(?:the|a|an|my)\s+(?:whole|entire)\s+bottle|(?:whole|entire)\s+bottle\s+of\s+(?:pills|tablets|tylenol|acetaminophen|paracetamol|ibuprofen|advil|aspirin|xanax|ambien|oxy\w*|vicodin|percocet|benadryl|sleeping\s+pills|my\s+(?:meds|medication|medicine|pills|prescription))|(?:took|swallowed|drank|ate)\s+(?:some\s+|the\s+|a\s+lot\s+of\s+|a\s+bunch\s+of\s+|a\s+handful\s+of\s+)?(?:bleach|antifreeze|rat\s+poison|drain\s+cleaner)|(?:just|already)\s+(?:took|swallowed)\s+(?:\d+|a\s+handful\s+of|a\s+bunch\s+of)\s+(?:pills|tablets)|poison(?:ed|ing)?\s+myself)\b/i;
  const DANGER_NOTICE = 'If someone is hurting you, if you are not safe at home, or if you are afraid of what you might do to someone, you deserve help from a person — tonight, not later.\nIn the United States, the National Domestic Violence Hotline is 1-800-799-7233 (or text START to 88788), free and confidential, 24/7; if you are in immediate danger, call 911. Anywhere else, https://findahelpline.com lists abuse and violence lines by country.\nI am not a person, and this page is not emergency care.\n\n';
  const POISON_LINE = 'If you have taken pills or anything else to harm yourself, that is a medical emergency before it is anything else: in the United States call 911, or Poison Control at 1-800-222-1222, right now — even if you feel fine.\n';

  const PACKS = [
    { theme: 'Anxiety & Worry', hear: 'I hear the spiral. Tomorrow has gotten too loud, and you are tired of carrying a day that has not arrived.', close: 'One day is enough to hold. His words meet you in the room with no windows.', keys: ['anxi', 'worry', 'worried', 'overwhelm', 'stress', 'panic', 'restless', 'racing', 'insomnia', 'can\'t sleep', 'cant sleep', 'tomorrow', 'interview', 'shaking', 'laid off', 'fired', 'rent', 'bills', 'debt', 'money', 'income', 'bankrupt', 'can\'t stop', 'cant stop'] },
    { theme: 'Fear', hear: 'Fear is shrinking the future. You do not have to pretend the waves are small.', close: 'Courage is not the absence of fear. It is hearing “it is I” in the middle of it.', keys: ['fear', 'afraid', 'scared', 'terrified', 'fright', 'dread', 'unsafe', 'nicu', 'icu', 'scan', 'diagnos', 'biopsy', 'results', 'cancer', 'tumor', 'deport', 'immigration', 'knock at the door', 'make it'] },
    { theme: 'Grief & Loss', hear: 'Grief is not a failure of faith. Something has a name, and it is gone, and you are still here.', close: 'Your tears are seen. Comfort is company within pain — not a dismissal of it.', keys: ['grief', 'griev', 'loss', 'lost someone', 'died', 'death', 'dying', 'mourn', 'funeral', 'widow', 'passed away', 'hospice', 'miscarriage', 'stillborn', 'dementia', 'alzheimer', 'friends are dead', 'friends are gone'] },
    { theme: 'Loneliness', hear: 'Loneliness can convince you that you are unseen. You are not an interruption.', close: 'You are someone Jesus calls friend. Presence does not expire at the end of a text thread.', keys: ['lonely', 'alone', 'no one', 'nobody', 'isolated', 'abandoned', 'left out', 'forgotten', 'waiting to die', 'just waiting'] },
    { theme: 'Forgiveness', hear: 'Forgiveness is one of the hardest sentences he spoke — and one of the freest. You do not have to finish the road today.', close: 'Mercy is often a road, not a moment. Take the next honest step.', keys: ['forgiv', 'resent', 'bitter', 'grudge', 'hate them', 'can\'t let go', 'cant let go', 'betray', 'stole from'] },
    { theme: 'Shame & Guilt', hear: 'Shame wants you out of the room. He still knows how to lift a face.', close: 'You are not your worst hour. Neither do I condemn thee is the first word, not the last excuse.', keys: ['shame', 'guilt', 'guilty', 'ashamed', 'disgusted with myself', 'unworthy', 'failure', 'messed up', 'sinned', 'relapse', 'filthy', 'regret', 'i cheated', 'i lied', 'i killed', 'their faces', 'haunted', 'hate myself', 'forgive myself'] },
    { theme: 'Suffering & Pain', hear: 'Pain is not a riddle you failed to solve. He names tribulation and still says come.', close: 'Your pain is not a failure of faith. Rest is offered to the laden, not the finished.', keys: ['pain', 'hurt', 'hurting', 'suffer', 'sick', 'ill', 'chronic', 'broken body', 'ache', 'exhausted', 'so tired', 'burnt out', 'bullied', 'feel numb', 'am numb', 'i\'m numb', 'gone numb', 'furious', 'enraged', 'rage', 'so angry', 'livid', 'covered it up', 'protected the wrong', 'cheated on me', 'cheating on me', 'been cheating', 'his affair', 'her affair', 'an affair', 'unfaithful'] },
    { theme: 'Conflict & Relationships', hear: 'Conflict lodges in the body. He treats the other person as worship’s unfinished business — not a side issue.', close: 'You do not have to finish the story today. You can take the next faithful step toward them.', keys: ['conflict', 'fight', 'argu', 'marriage', 'spouse', 'divorce', 'relationship', 'angry at', 'not speaking', 'barely speaks', 'won\'t talk', 'losing her', 'losing him'] },
    { theme: 'Purpose & Direction', hear: 'Direction-anxiety wants a five-year map. He offers a first thing and a following.', close: 'You do not need the whole map. You need the next yes.', keys: ['purpose', 'direction', 'lost', 'career', 'calling', 'what should i do', 'confused', 'plan', 'future job', 'meaning', 'tempted', 'temptation', 'fudge', 'integrity', 'dishonest', 'everyone does it'] },
    { theme: 'Faith & Doubt', hear: 'Doubt is not a firing offense in the Gospels. He lets a doubter touch the wound.', close: 'Faith is not the absence of questions. It is staying close enough to touch.', keys: ['doubt', 'unbelief', 'don\'t believe', 'dont believe', 'struggling to believe', 'questioning', 'is god real', 'where is god'] },
    { theme: 'Peace', hear: 'The world offers a pause between problems. He offers a peace that can sit in a troubled room and still be itself.', close: 'His peace is not the absence of storms. It is his presence within them.', keys: ['peace', 'calm', 'restless heart', 'troubled', 'quiet my'] },
    { theme: 'Hope', hear: 'Hope is not naive optimism. In his words it is anchored in who he is, not in how you feel this hour.', close: 'Good cheer is possible because he has overcome — not because you have to.', keys: ['hope', 'hopeless', 'despair', 'give up', 'pointless', 'empty', 'dark place'] }
  ];

  const FALLBACK = {
    hear: 'I am here with what you brought. Before advice, a sentence he actually spoke.',
    close: 'You can sit with one line. Nothing else is required of this hour.',
    passages: [
      { verse: 'Matthew 11:28', quote: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.', context: 'The invitation is to the exhausted, not the already-healed.' },
      { verse: 'John 14:27', quote: 'Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.', context: 'Peace is left with you — a gift, not a mood you manufacture.' }
    ]
  };

  function passagesFor(theme) {
    const enc = window.RLA_CURATED && window.RLA_CURATED.encouragement && window.RLA_CURATED.encouragement[theme];
    return (enc && enc.passages && enc.passages.length) ? enc.passages.slice(0, 3) : FALLBACK.passages;
  }

  function score(text, keys) {
    const t = text.toLowerCase();
    let n = 0;
    for (let i = 0; i < keys.length; i++) {
      if (t.indexOf(keys[i]) !== -1) n += keys[i].length > 7 ? 2 : 1;
    }
    return n;
  }

  function formatPack(hear, passages, close) {
    let out = hear + '\n\n';
    for (let i = 0; i < passages.length; i++) {
      const p = passages[i];
      out += '**' + p.verse + '**\n"' + p.quote + '"\n' + (p.context || '') + '\n\n';
    }
    return (out + close).trim();
  }

  window.RLA_advise = function (text) {
    const raw = String(text || '').trim();
    if (!raw) return formatPack(FALLBACK.hear, FALLBACK.passages, FALLBACK.close);

    if (inCrisis(raw)) {
      const crisis =
        (POISON.test(raw) ? POISON_LINE : '') +
        'If you are in danger or thinking of ending your life, please stop here and get human help now.\nIn the United States, call or text 988. Anywhere else, start at https://findahelpline.com — a global directory of verified helplines.\nI am not a person, and this page is not emergency care.\n\n';
      return crisis + formatPack(
        'What you wrote matters more than anything else on this page. The numbers above reach real people, tonight, and they are the first step — not this room. These words are for while you wait on the line, or for after.',
        passagesFor('Peace'),
        'You are not alone in this hour. Please go toward help now.'
      );
    }
    if (DANGER.test(raw)) {
      const byYou = BY_YOU.test(raw);
      return DANGER_NOTICE + formatPack(
        byYou
          ? 'You asked about hurting someone. He never said that — not once, in any Gospel. The people at the number above also talk with people who are frightened of their own anger, and they will not shame you for calling. These words are for you.'
          : 'What happened to you — or is still happening — is not your fault, and you should not have to carry it alone. The people at the numbers above will believe you. These words are for you, not for anyone who has hurt you.',
        passagesFor('Suffering & Pain'),
        'You deserve to be safe. Please let a person help you get there.'
      );
    }

    let best = null;
    let bestN = 0;
    for (let i = 0; i < PACKS.length; i++) {
      const n = score(raw, PACKS[i].keys);
      if (n > bestN) { best = PACKS[i]; bestN = n; }
    }
    if (!best || bestN === 0) {
      return formatPack(FALLBACK.hear, FALLBACK.passages, FALLBACK.close);
    }
    return formatPack(best.hear, passagesFor(best.theme), best.close);
  };

  /* Seven Days with His words — the named path (Hallow’s lesson, our length). */
  window.RLA_SEVEN = [
    { title: 'Come', theme: 'Rest', verse: 'Matthew 11:28–29', passage: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest. Take my yoke upon you, and learn of me; for I am meek and lowly in heart: and ye shall find rest unto your souls.', reflection: 'Day one is not a program. It is an invitation. Come as you are — laden, not finished.' },
    { title: 'Peace', theme: 'Peace', verse: 'John 14:27', passage: 'Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.', reflection: 'The world offers a pause. He leaves a gift. You do not have to manufacture calm to receive it.' },
    { title: 'Light', theme: 'Light', verse: 'John 8:12', passage: 'I am the light of the world: he that followeth me shall not walk in darkness, but shall have the light of life.', reflection: 'Dark seasons are real. He does not deny them. Following is how the next step becomes visible.' },
    { title: 'Love', theme: 'Love', verse: 'John 13:34', passage: 'A new commandment I give unto you, That ye love one another; as I have loved you, that ye also love one another.', reflection: 'The mark is not an argument. It is how you treat the person next to you today.' },
    { title: 'Forgive', theme: 'Forgiveness', verse: 'Matthew 18:21–22', passage: 'I say not unto thee, Until seven times: but, Until seventy times seven.', reflection: 'Mercy is a way of life, not a single heroic act. One name is enough for this day.' },
    { title: 'Abide', theme: 'Abide', verse: 'John 15:4–5', passage: 'Abide in me, and I in you. As the branch cannot bear fruit of itself, except it abide in the vine; no more can ye, except ye abide in me. I am the vine, ye are the branches.', reflection: 'Fruit comes from staying close, not from straining alone. Remain. That is the work.' },
    { title: 'Go', theme: 'Presence', verse: 'Matthew 28:20', passage: 'Lo, I am with you alway, even unto the end of the world.', reflection: 'The last word of the seven is not goodbye. It is presence that does not expire. Go — he goes too.' }
  ];
})();
