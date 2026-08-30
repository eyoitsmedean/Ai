/* Named paths — Seven is the first week; Forty is the longer story (Lent, or after Day 7).
   Words are public-domain KJV speech of Jesus. */
(function () {
  const EXTRA = [
    { title: 'Resurrection', theme: 'Life', verse: 'John 11:25–26', passage: 'I am the resurrection, and the life: he that believeth in me, though he were dead, yet shall he live: And whosoever liveth and believeth in me shall never die.', reflection: 'He does not offer a theory of death. He offers himself in the middle of it.' },
    { title: 'Bread', theme: 'Hunger', verse: 'John 6:35', passage: 'I am the bread of life: he that cometh to me shall never hunger; and he that believeth on me shall never thirst.', reflection: 'Hunger is honest. He does not scold it. He names himself as enough.' },
    { title: 'Shepherd', theme: 'Care', verse: 'John 10:11', passage: 'I am the good shepherd: the good shepherd giveth his life for the sheep.', reflection: 'Care that costs nothing is a hireling. He stays when it is expensive.' },
    { title: 'Troubled', theme: 'Peace', verse: 'John 14:1', passage: 'Let not your heart be troubled: ye believe in God, believe also in me.', reflection: 'He speaks to a room about to break. Belief here is company, not a quiz.' },
    { title: 'Overcome', theme: 'Courage', verse: 'John 16:33', passage: 'In the world ye shall have tribulation: but be of good cheer; I have overcome the world.', reflection: 'He tells the truth about the world first. Cheer is not denial.' },
    { title: 'Always', theme: 'Presence', verse: 'Matthew 28:20', passage: 'Lo, I am with you always, even unto the end of the world.', reflection: 'The last word is not a map. It is presence that does not expire.' },
    { title: 'Paradise', theme: 'Mercy', verse: 'Luke 23:43', passage: 'Verily I say unto thee, To day shalt thou be with me in paradise.', reflection: 'A dying thief is given today, not a waitlist. Mercy does not arrive late.' },
    { title: 'Peacemakers', theme: 'Peace', verse: 'Matthew 5:9', passage: 'Blessed are the peacemakers: for they shall be called the children of God.', reflection: 'Peace is made, not merely felt. One reconciling step is enough for this day.' },
    { title: 'Anointed', theme: 'Purpose', verse: 'Luke 4:18', passage: 'The Spirit of the Lord is upon me, because he hath anointed me to preach the gospel to the poor; he hath sent me to heal the brokenhearted, to preach deliverance to the captives.', reflection: 'His purpose statement is toward the poor, the broken, the locked. That is the work.' },
    { title: 'Sent', theme: 'Go', verse: 'John 20:21', passage: 'Peace be unto you: as my Father hath sent me, even so send I you.', reflection: 'Peace first. Then a sending. You do not go unaccompanied.' },
    { title: 'Willing', theme: 'Surrender', verse: 'Matthew 26:39', passage: 'O my Father, if it be possible, let this cup pass from me: nevertheless not as I will, but as thou wilt.', reflection: 'He does not pretend the cup is sweet. Honesty and obedience can sit in one sentence.' },
    { title: 'Ninety-nine', theme: 'Seeking', verse: 'Luke 15:4–5', passage: 'What man of you, having an hundred sheep, if he lose one of them, doth not leave the ninety and nine in the wilderness, and go after that which is lost, until he find it? And when he hath found it, he layeth it on his shoulders, rejoicing.', reflection: 'You are not an acceptable loss. He goes after the one, and he is glad when he finds you.' }
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

  window.RLA_FORTY = fromDaily().concat(EXTRA).slice(0, 40);

  window.RLA_pathList = function (kind) {
    if (kind === 'forty' && window.RLA_FORTY && window.RLA_FORTY.length) return window.RLA_FORTY;
    return window.RLA_SEVEN || [];
  };
})();
