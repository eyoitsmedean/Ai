const { lookup } = require('./scripture');

function passage(citation, context) {
  const hit = lookup(citation);
  if (!hit) throw new Error(`Missing curated verse: ${citation}`);
  return { verse: hit.citation, quote: hit.text, context };
}

const THEMES = {
  'Anxiety & Worry': {
    theme: 'Anxiety & Worry',
    headline: 'Tomorrow is not asking for you yet',
    opening: 'Worry is a room with no windows. Jesus does not scold you for sitting in it — He names the air, the birds, the length of a day, and invites you back into this one hour.',
    passages: [
      passage('Matthew 6:34', 'He limits the assignment to today, so your mind does not have to carry a week it has not been given.'),
      passage('Matthew 6:26', 'You are not less tended than the birds. Provision is already in motion before you finish the sentence.'),
      passage('John 14:27', 'His peace is not a mood the world can revoke. It is something left with you.'),
    ],
    practice: 'Sit still for two minutes. Name one thing that belongs only to this day. Leave the rest on the table.',
    closing: 'You do not have to finish the future tonight.',
  },
  'Grief & Loss': {
    theme: 'Grief & Loss',
    headline: 'Mourning is not a failure of faith',
    opening: 'Grief is love with nowhere to stand. Jesus does not hurry the mourner. He blesses the ache, then stands close enough to be the life on the other side of it.',
    passages: [
      passage('Matthew 5:4', 'Comfort is promised to those who actually mourn — not to those who pretend the loss was small.'),
      passage('John 11:25', 'He meets death with His own name. The last word over what you have lost is not absence.'),
      passage('John 16:22', 'Sorrow is real, and so is the joy no one can confiscate when He is near again.'),
    ],
    practice: 'Say the name of what you miss. Then read John 11:25 aloud, slowly, as if it were spoken into this room.',
    closing: 'You are allowed to mourn. You are not alone in it.',
  },
  Forgiveness: {
    theme: 'Forgiveness',
    headline: 'Mercy is how the Father looks',
    opening: 'Forgiveness is not pretending the wound was gentle. It is refusing to let the wound become the only story you will ever tell.',
    passages: [
      passage('Matthew 6:14-15', 'The same mercy you release is the mercy that keeps finding you.'),
      passage('Luke 6:36', 'Mercy is not a personality trait. It is family resemblance.'),
      passage('Luke 6:27-28', 'Love of enemies is not sentiment. It is a practice that begins while the hurt is still warm.'),
    ],
    practice: 'Write one sentence you wish you could say. Then write one blessing you can actually offer — even if it is only “I will not rehearse this harm today.”',
    closing: 'You can take the next honest step. You do not have to finish the whole road before evening.',
  },
  Loneliness: {
    theme: 'Loneliness',
    headline: 'You were never meant to be an orphan in this',
    opening: 'Loneliness can feel like a verdict. Jesus answers it as a presence: I will not leave you. I come to you. Stay in my love.',
    passages: [
      passage('John 14:18', 'He refuses the orphan story. Company is the promise, not a technique.'),
      passage('John 15:9', 'You are already inside a love that began before you asked for it.'),
      passage('Matthew 28:20', 'The last word of His earthly charge is accompaniment — always, to the end.'),
    ],
    practice: 'Place a chair across from you. Read John 14:18 as if it were spoken from that chair. Sit with it for one minute.',
    closing: 'The room is less empty than it feels.',
  },
  'Conflict & Relationships': {
    theme: 'Conflict & Relationships',
    headline: 'Love that costs something is still love',
    opening: 'Conflict asks who you will become while you are angry. Jesus does not deny the enemy. He tells you what to do with your hands and your prayers.',
    passages: [
      passage('Matthew 5:44', 'Blessing is an action, not a feeling you wait to arrive.'),
      passage('Luke 6:28', 'Prayer for the one who used you is how the heart unclenches without lying.'),
      passage('John 15:13', 'The measure of love is not convenience. It is what you are willing to lay down.'),
    ],
    practice: 'Before you reply, pray one honest sentence for the other person. Then speak only what still needs saying.',
    closing: 'You can be clear and still be kind.',
  },
  Fear: {
    theme: 'Fear',
    headline: 'Little flock — you are not prey',
    opening: 'Fear makes the world larger than God. Jesus shrinks it back: numbered hairs, a little flock, a Father who is pleased to give you the kingdom.',
    passages: [
      passage('Luke 12:32', 'He names you small on purpose — and then names the gift as a kingdom.'),
      passage('Luke 12:7', 'You are counted. Fear has to argue with that arithmetic.'),
      passage('Mark 5:36', 'Belief here is not bravado. It is refusing to let the report in the hallway be the last word.'),
    ],
    practice: 'When fear spikes, say aloud: “Fear not, little flock.” Then name one next faithful step the size of this hour.',
    closing: 'You are held more tightly than the thing that scares you.',
  },
  'Purpose & Direction': {
    theme: 'Purpose & Direction',
    headline: 'Light is something you already are',
    opening: 'Purpose is not a hidden career code. Jesus speaks it as identity and order: you are light; seek the kingdom first; follow, and you will not walk in the dark.',
    passages: [
      passage('Matthew 5:14', 'You do not have to become visible. You already are. The work is not to hide.'),
      passage('Matthew 6:33', 'First things first. The rest is promised as addition, not as the hunt.'),
      passage('John 8:12', 'Following is how darkness loses its claim on your steps.'),
    ],
    practice: 'Write one way you can shine without performing — a kindness, a truth, a piece of work done well.',
    closing: 'You do not need the whole map. You need the next honest step in the light.',
  },
  'Faith & Doubt': {
    theme: 'Faith & Doubt',
    headline: 'Blessed are those who have not seen',
    opening: 'Doubt is not the opposite of faith. It is faith asking for a place to put its feet. Jesus makes room for Thomas and then blesses the ones who believe without the wound to touch.',
    passages: [
      passage('John 20:29', 'Unseen trust is not second-class. He calls it blessed.'),
      passage('John 14:1', 'A troubled heart is invited to believe — not to pretend it is calm first.'),
      passage('Matthew 11:28', 'Doubt does not disqualify the weary. The invitation still stands.'),
    ],
    practice: 'Tell Jesus the part you cannot see. Then read John 20:29 and let the blessing rest on that exact place.',
    closing: 'You can bring the question. You do not have to bring the proof.',
  },
  'Suffering & Pain': {
    theme: 'Suffering & Pain',
    headline: 'Tribulation is not the last sentence',
    opening: 'Jesus does not sell a painless world. He tells the truth about tribulation, then places His own victory in the same breath.',
    passages: [
      passage('John 16:33', 'Peace is in Him, not in the world’s weather. Cheer is commanded because He has already overcome.'),
      passage('Matthew 11:28', 'The invitation is to the exhausted. Rest is a gift, not a prize for the strong.'),
      passage('Matthew 5:3', 'Emptiness of spirit is not disqualification. It is the doorway He names first.'),
    ],
    practice: 'Lie down or sit. Place a hand on the place that hurts. Pray Matthew 11:28 as if it were spoken to that place alone.',
    closing: 'Your pain is seen. It is not the end of the story.',
  },
  'Shame & Guilt': {
    theme: 'Shame & Guilt',
    headline: 'Heaven still knows how to rejoice',
    opening: 'Shame says you are the lost sheep who should have known better. Jesus tells the story from the shepherd’s side — leaving the ninety-nine, carrying the one, throwing a feast in heaven.',
    passages: [
      passage('Luke 15:4', 'He does not wait for you to find the road back. He comes after what is lost.'),
      passage('Luke 15:7', 'Repentance is not a courtroom. It is a reason for joy.'),
      passage('John 6:35', 'Hunger does not make you unworthy of bread. It makes you the one the bread was for.'),
    ],
    practice: 'Name the shame in one sentence. Then read Luke 15:7 and imagine the joy is about you, specifically.',
    closing: 'You are not too far for the shepherd to walk.',
  },
  Peace: {
    theme: 'Peace',
    headline: 'Not as the world giveth',
    opening: 'The world’s peace is a ceasefire. His peace is a presence that stays after the wind has been told to sit down.',
    passages: [
      passage('John 14:27', 'He leaves peace the way someone leaves a key. It is already in the house.'),
      passage('Mark 4:39', 'The storm is addressed by name. Calm is not negotiated; it is spoken.'),
      passage('John 16:33', 'Peace and tribulation can occupy the same day. He has overcome the louder one.'),
    ],
    practice: 'Breathe out slowly four times. On each breath, say: “Peace, be still.” Let the words be for your body first.',
    closing: 'The sea in you can hear Him too.',
  },
  Hope: {
    theme: 'Hope',
    headline: 'Your joy no one can take',
    opening: 'Hope is not optimism. It is Jesus saying the sorrow has a horizon, the light is Himself, and the joy that comes cannot be confiscated.',
    passages: [
      passage('John 16:22', 'Sorrow is admitted. The joy that follows is guarded by His return, not by your grip.'),
      passage('John 8:12', 'Darkness is a place you walk through, not a name you have to keep.'),
      passage('John 15:11', 'He speaks so that joy would remain — full, not rationed.'),
    ],
    practice: 'Write one true hard thing. Under it, write John 16:22. Keep both sentences. That is hope with its feet on the ground.',
    closing: 'The last word over your life is not the night you are in.',
  },
};

const DAILY_ROTATION = [
  {
    affirmation: {
      text: 'You are of more value than many sparrows — counted, known, and not forgotten in the ordinary hour.',
      verse: 'Luke 12:7',
    },
    word: {
      theme: 'Worth',
      title: 'Even the Hairs',
      verse: 'Luke 12:7',
      reflection: 'Today does not require you to prove you matter. The numbering has already been done. Walk as someone who is known.',
    },
  },
  {
    affirmation: {
      text: 'You may come weary. Rest is offered to the heavy-laden, not the already-rested.',
      verse: 'Matthew 11:28',
    },
    word: {
      theme: 'Rest',
      title: 'The Easy Yoke',
      verse: 'Matthew 11:29',
      reflection: 'You do not have to finish becoming strong before you are allowed to stop. Learn the lowliness. Let the soul rest.',
    },
  },
  {
    affirmation: {
      text: 'Peace has been left with you — not as the world gives, and not as the world can take.',
      verse: 'John 14:27',
    },
    word: {
      theme: 'Peace',
      title: 'A Different Giving',
      verse: 'John 16:33',
      reflection: 'If your heart is troubled, that is not evidence that peace has failed. It is the exact condition He speaks into. Trouble may stay; so may cheer — because He has already overcome the louder thing.',
    },
  },
  {
    affirmation: {
      text: 'You are the light of the world. A city on a hill does not need permission to be seen.',
      verse: 'Matthew 5:14',
    },
    word: {
      theme: 'Light',
      title: 'Cannot Be Hid',
      verse: 'Matthew 5:16',
      reflection: 'Shine by doing the next good work quietly. The Father is the one who receives the glory — you only have to stop hiding.',
    },
  },
  {
    affirmation: {
      text: 'You are loved with the same love the Father has for the Son. Remain there.',
      verse: 'John 15:9',
    },
    word: {
      theme: 'Belonging',
      title: 'Continue Ye in My Love',
      verse: 'John 15:11',
      reflection: 'Joy is not a mood you manufacture. It is what remains when you stay where you have already been placed.',
    },
  },
  {
    affirmation: {
      text: 'Take no thought for tomorrow. This day is enough, and you are accompanied inside it.',
      verse: 'Matthew 6:34',
    },
    word: {
      theme: 'Today',
      title: 'Sufficient unto the Day',
      verse: 'Matthew 6:33',
      reflection: 'Seek first what cannot rust. The extras you are gripping may be added — they do not have to be hunted.',
    },
  },
  {
    affirmation: {
      text: 'In the world you will have trouble. In Him you may still be of good cheer — He has overcome it.',
      verse: 'John 16:33',
    },
    word: {
      theme: 'Courage',
      title: 'Be of Good Cheer',
      verse: 'John 14:1',
      reflection: 'Courage here is not denial. It is locating yourself in the One who has already walked through the thing you fear.',
    },
  },
];

function hydrateDaily(slot) {
  const aff = lookup(slot.affirmation.verse);
  const word = lookup(slot.word.verse);
  return {
    affirmation: {
      text: slot.affirmation.text,
      verse: aff.citation,
      quote: aff.text,
    },
    word: {
      theme: slot.word.theme,
      title: slot.word.title,
      passage: word.text,
      verse: word.citation,
      reflection: slot.word.reflection,
    },
    translation: 'KJV',
    verified: true,
    source: 'curated',
  };
}

function coerceDate(date = new Date()) {
  if (date instanceof Date && !Number.isNaN(date.getTime())) return date;
  if (typeof date === 'string') {
    const m = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  return new Date();
}

function dailyForDate(date = new Date()) {
  const src = coerceDate(date);
  const local = new Date(src.getFullYear(), src.getMonth(), src.getDate());
  const idx = Math.floor(local.getTime() / 86400000) % DAILY_ROTATION.length;
  return hydrateDaily(DAILY_ROTATION[idx]);
}

function encouragementFor(theme) {
  const pack = THEMES[theme];
  if (!pack) return null;
  return { ...pack, translation: 'KJV', verified: true, source: 'curated' };
}

function themeNames() {
  return Object.keys(THEMES);
}

module.exports = {
  THEMES,
  dailyForDate,
  encouragementFor,
  themeNames,
};
