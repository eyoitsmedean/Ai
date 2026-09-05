/* Living Advisor — retrieval over the red letters.
   Works with no API key. Passages come from RLA_CURATED when present. */
(function () {
  const CRISIS = /\b(suicid(?:e|al)|kill myself|end my life|want to die|self[- ]?harm|cut myself|no reason to live)\b/i;

  const PACKS = [
    { theme: 'Anxiety & Worry', hear: 'I hear the spiral. Tomorrow has gotten too loud, and you are tired of carrying a day that has not arrived.', close: 'One day is enough to hold. His words meet you in the room with no windows.', keys: ['anxi', 'worry', 'worried', 'overwhelm', 'stress', 'panic', 'restless', 'racing', 'insomnia', 'can\'t sleep', 'cant sleep'] },
    { theme: 'Fear', hear: 'Fear is shrinking the future. You do not have to pretend the waves are small.', close: 'Courage is not the absence of fear. It is hearing “it is I” in the middle of it.', keys: ['fear', 'afraid', 'scared', 'terrified', 'fright', 'dread', 'unsafe'] },
    { theme: 'Grief & Loss', hear: 'Grief is not a failure of faith. Something has a name, and it is gone, and you are still here.', close: 'Your tears are seen. Comfort is company within pain — not a dismissal of it.', keys: ['grief', 'griev', 'loss', 'lost someone', 'died', 'death', 'mourn', 'funeral', 'widow', 'passed away'] },
    { theme: 'Loneliness', hear: 'Loneliness can convince you that you are unseen. You are not an interruption.', close: 'You are someone Jesus calls friend. Presence does not expire at the end of a text thread.', keys: ['lonely', 'alone', 'no one', 'isolated', 'abandoned', 'left out', 'forgotten'] },
    { theme: 'Forgiveness', hear: 'Forgiveness is one of the hardest sentences he spoke — and one of the freest. You do not have to finish the road today.', close: 'Mercy is often a road, not a moment. Take the next honest step.', keys: ['forgiv', 'resent', 'bitter', 'grudge', 'hate them', 'can\'t let go', 'cant let go'] },
    { theme: 'Shame & Guilt', hear: 'Shame wants you out of the room. He still knows how to lift a face.', close: 'You are not your worst hour. Neither do I condemn thee is the first word, not the last excuse.', keys: ['shame', 'guilt', 'guilty', 'ashamed', 'disgusted with myself', 'unworthy', 'failure', 'messed up', 'sinned'] },
    { theme: 'Suffering & Pain', hear: 'Pain is not a riddle you failed to solve. He names tribulation and still says come.', close: 'Your pain is not a failure of faith. Rest is offered to the laden, not the finished.', keys: ['pain', 'hurt', 'hurting', 'suffer', 'sick', 'ill', 'chronic', 'broken body', 'ache'] },
    { theme: 'Conflict & Relationships', hear: 'Conflict lodges in the body. He treats the other person as worship’s unfinished business — not a side issue.', close: 'You do not have to finish the story today. You can take the next faithful step toward them.', keys: ['conflict', 'fight', 'argu', 'marriage', 'spouse', 'divorce', 'relationship', 'angry at', 'my husband', 'my wife', 'my friend'] },
    { theme: 'Purpose & Direction', hear: 'Direction-anxiety wants a five-year map. He offers a first thing and a following.', close: 'You do not need the whole map. You need the next yes.', keys: ['purpose', 'direction', 'lost', 'career', 'calling', 'what should i do', 'confused', 'plan', 'future job', 'meaning'] },
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

    const needs = (window.RLA_CONCORDANCE && window.RLA_CONCORDANCE.needs) || [];
    if (needs.length) {
      const q = raw.toLowerCase();
      let bestNeed = null;
      let bestScore = 0;
      for (let i = 0; i < needs.length; i++) {
        const row = needs[i];
        let n = 0;
        const words = row.carry.toLowerCase().split(/\s+/);
        for (let w = 0; w < words.length; w++) {
          if (words[w].length > 3 && q.indexOf(words[w]) !== -1) n += 1;
        }
        if (q.indexOf(row.carry.toLowerCase()) !== -1) n += 8;
        if (n > bestScore) { bestNeed = row; bestScore = n; }
      }
      if (bestNeed && bestScore >= 2) {
        return formatPack(
          'I hear what you are carrying. Before advice, a sentence He actually spoke.',
          [{ verse: bestNeed.verse, quote: bestNeed.quote, context: bestNeed.carry }],
          'Sit with this. The page can close.'
        );
      }
    }

    if (CRISIS.test(raw)) {
      const crisis =
        'I am glad you reached out — what you are carrying sounds unbearably heavy. I am not a crisis counselor. Please contact emergency services or call or text 988 (Suicide & Crisis Lifeline in the US) right away, and tell someone you trust.\n\n';
      return crisis + formatPack(
        'While you reach a human who can help, here is a word he spoke to the heavy-laden.',
        passagesFor('Suffering & Pain'),
        'You are not alone in this hour. Please go toward help now.'
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
    { title: 'Go', theme: 'Presence', verse: 'Matthew 28:20', passage: 'Lo, I am with you always, even unto the end of the world.', reflection: 'The last word of the seven is not goodbye. It is presence that does not expire. Go — he goes too.' }
  ];
})();
