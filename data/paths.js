/* Named paths — Seven is the first week; Forty is the longer story (Lent, or after Day 7).
   Words are public-domain KJV speech of Jesus. */
(function () {
  const EXTRA = [
    { title: 'Resurrection', theme: 'Life', verse: 'John 11:25–26', passage: 'I am the resurrection, and the life: he that believeth in me, though he were dead, yet shall he live: And whosoever liveth and believeth in me shall never die.', reflection: 'He does not offer a theory of death. He offers himself in the middle of it.' },
    { title: 'Bread', theme: 'Hunger', verse: 'John 6:35', passage: 'I am the bread of life: he that cometh to me shall never hunger; and he that believeth on me shall never thirst.', reflection: 'Hunger is honest. He does not scold it. He names himself as enough.' },
    { title: 'Shepherd', theme: 'Care', verse: 'John 10:11', passage: 'I am the good shepherd: the good shepherd giveth his life for the sheep.', reflection: 'Care that costs nothing is a hireling. He stays when it is expensive.' },
    { title: 'Troubled', theme: 'Peace', verse: 'John 14:1', passage: 'Let not your heart be troubled: ye believe in God, believe also in me.', reflection: 'He speaks to a room about to break. Belief here is company, not a quiz.' },
    { title: 'Overcome', theme: 'Courage', verse: 'John 16:33', passage: 'In the world ye shall have tribulation: but be of good cheer; I have overcome the world.', reflection: 'He tells the truth about the world first. Cheer is not denial.' },
    { title: 'Always', theme: 'Presence', verse: 'Matthew 28:20', passage: 'Lo, I am with you alway, even unto the end of the world.', reflection: 'The last word is not a map. It is presence that does not expire.' },
    { title: 'Paradise', theme: 'Mercy', verse: 'Luke 23:43', passage: 'Verily I say unto thee, To day shalt thou be with me in paradise.', reflection: 'A dying thief is given today, not a waitlist. Mercy does not arrive late.' },
    { title: 'Peacemakers', theme: 'Peace', verse: 'Matthew 5:9', passage: 'Blessed are the peacemakers: for they shall be called the children of God.', reflection: 'Peace is made, not merely felt. One reconciling step is enough for this day.' },
    { title: 'Anointed', theme: 'Purpose', verse: 'Luke 4:18', passage: 'The Spirit of the Lord is upon me, because he hath anointed me to preach the gospel to the poor; he hath sent me to heal the brokenhearted, to preach deliverance to the captives.', reflection: 'His purpose statement is toward the poor, the broken, the locked. That is the work.' },
    { title: 'Sent', theme: 'Go', verse: 'John 20:21', passage: 'Peace be unto you: as my Father hath sent me, even so send I you.', reflection: 'Peace first. Then a sending. You do not go unaccompanied.' },
    { title: 'Willing', theme: 'Surrender', verse: 'Matthew 26:39', passage: 'O my Father, if it be possible, let this cup pass from me: nevertheless not as I will, but as thou wilt.', reflection: 'He does not pretend the cup is sweet. Honesty and obedience can sit in one sentence.' },
    { title: 'Ninety-nine', theme: 'Seeking', verse: 'Luke 15:4–5', passage: 'What man of you, having an hundred sheep, if he lose one of them, doth not leave the ninety and nine in the wilderness, and go after that which is lost, until he find it? And when he hath found it, he layeth it on his shoulders, rejoicing.', reflection: 'You are not an acceptable loss. He goes after the one, and he is glad when he finds you.' },
    { title: 'Bread alone', theme: 'Wilderness', verse: 'Matthew 4:4', passage: 'It is written, Man shall not live by bread alone, but by every word that proceedeth out of the mouth of God.', reflection: 'Forty days hungry, and he answers the tempter with a sentence he did not write. The wilderness is where the words are tested, and hold.' }
  ];

  /* The order of the forty rooms keeps the church year. Sundays are not numbered, so
     Ash Wednesday is Room 1, the Lenten Fridays are 3, 9, 15, 21, 27, 33, 39, and Holy
     Week is 35–40: Monday to Holy Saturday.
       1  Ash Wednesday — the day's Gospel is Matthew 6: pray in secret, store treasure in heaven
       5  Monday of Lent I — the wilderness, after the Sunday of the Temptation
      33  Friday before Palm Sunday — Gethsemane's prayer
      34  Saturday before Palm Sunday — "be of good cheer; I have overcome the world"
      35  Holy Monday — the ransom          36  Holy Tuesday — the shepherd gives his life
      37  Holy Wednesday — love your enemies 38  Maundy Thursday — the new commandment
      39  Good Friday — paradise, today      40  Holy Saturday — the resurrection and the life */
  const FORTY_ORDER = [
    'Matthew 6:6', 'Matthew 6:19–21', 'Matthew 6:34', 'Luke 12:6–7',
    'Matthew 4:4', 'Matthew 11:28–30', 'John 8:12', 'Matthew 7:7–8', 'Matthew 22:37–40', 'Matthew 18:21–22',
    'Luke 6:36', 'Matthew 5:14–16', 'Matthew 7:1–2', 'Matthew 7:12', 'Matthew 7:13–14', 'Mark 4:39–40',
    'Matthew 14:27', 'Matthew 19:14', 'Luke 15:4–5', 'John 15:4–5', 'John 15:13–15', 'John 14:27',
    'John 14:6', 'Matthew 28:20', 'Matthew 5:3–6', 'John 10:27–28', 'John 10:10', 'John 6:35',
    'John 14:1', 'Luke 4:18', 'John 20:21', 'Matthew 5:9', 'Matthew 26:39', 'John 16:33',
    'Mark 10:43–45', 'John 10:11', 'Matthew 5:44', 'John 13:34–35', 'Luke 23:43', 'John 11:25–26'
  ];

  function fromDaily() {
    const list = (window.RLA_CURATED && window.RLA_CURATED.daily) || [];
    return list.map(function (d) {
      const w = d.word || {};
      return {
        title: w.title || w.theme || 'Word',
        theme: w.theme || '',
        verse: w.verse || '',
        passage: w.passage || '',
        reflection: w.reflection || ''
      };
    });
  }

  function orderForty() {
    const pool = fromDaily().concat(EXTRA);
    const byRef = {};
    pool.forEach(function (room) { if (room.verse && !byRef[room.verse]) byRef[room.verse] = room; });
    const rooms = [];
    const used = {};
    FORTY_ORDER.forEach(function (ref) {
      if (byRef[ref] && !used[ref]) { rooms.push(byRef[ref]); used[ref] = true; }
    });
    // If a curated word is ever renamed, keep forty doors rather than fewer.
    pool.forEach(function (room) {
      if (rooms.length < 40 && room.verse && !used[room.verse]) { rooms.push(room); used[room.verse] = true; }
    });
    return rooms.slice(0, 40);
  }

  window.RLA_FORTY = orderForty();

  window.RLA_pathList = function (kind) {
    if (kind === 'forty' && window.RLA_FORTY && window.RLA_FORTY.length) return window.RLA_FORTY;
    return window.RLA_SEVEN || [];
  };
})();
