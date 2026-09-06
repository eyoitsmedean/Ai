/* Living Advisor — retrieval over the red letters.
   Works with no API key. Passages come from RLA_CURATED when present. */
(function () {
  // Every signal — self-harm, poisoning, violence, bereavement — comes from signals.js,
  // the same file the server reads. There is no second copy to drift.
  const S = window.RLA_SIGNALS;
  const inCrisis = (t) => S.looksLikeCrisis(t);
  const DANGER_NOTICE = S.DANGER_NOTICE;
  const POISON_LINE = S.POISON_LINE + '\n';

  // Keys match at the start of a word ("rent" no longer hides in "parents", "pain" in
  // "Spain"); short keys must end the word too, give or take a suffix. `strong` keys
  // name the room outright: the widow with bills is in Grief, not Anxiety.
  const PACKS = [
    { theme: 'Anxiety & Worry', hear: 'I hear the spiral. Tomorrow has gotten too loud, and you are tired of carrying a day that has not arrived.', close: 'One day is enough to hold. His words meet you in the room with no windows.', keys: ['anxi', 'worry', 'worried', 'overwhelm', 'stress', 'panic', 'restless', 'racing', 'insomnia', 'can\'t sleep', 'cant sleep', 'tomorrow', 'interview', 'shaking', 'laid off', 'fired', 'rent', 'bills', 'debt', 'money', 'income', 'bankrupt', 'can\'t stop', 'cant stop', 'lost my job', 'lost the job', 'no savings', 'unemployed', 'out of work'], strong: [] },
    { theme: 'Fear', hear: 'Fear is shrinking the future. You do not have to pretend the waves are small.', close: 'Courage is not the absence of fear. It is hearing “it is I” in the middle of it.', keys: ['fear', 'afraid', 'scared', 'terrified', 'fright', 'dread', 'unsafe', 'nicu', 'icu', 'scan', 'diagnos', 'biopsy', 'results', 'cancer', 'tumor', 'deport', 'immigration', 'knock at the door', 'won\'t make it', 'might not make it', 'not going to make it'], strong: [] },
    { theme: 'Grief & Loss', hear: 'Grief is not a failure of faith. Something has a name, and it is gone, and you are still here.', close: 'Your tears are seen. Comfort is company within pain — not a dismissal of it.', keys: ['grief', 'griev', 'loss', 'lost someone', 'died', 'death', 'is dying', 'dying of', 'mourn', 'funeral', 'widow', 'passed away', 'hospice', 'miscarriage', 'stillborn', 'dementia', 'alzheimer', 'friends are dead', 'friends are gone', 'buried'], strong: ['died', 'passed away', 'funeral', 'widow', 'miscarriage', 'stillborn', 'hospice', 'lost my', 'lost our', 'lost a patient', 'a child died', 'taking my baby', 'took my baby', 'my baby died', 'buried'] },
    { theme: 'Loneliness', hear: 'Loneliness can convince you that you are unseen. You are not an interruption.', close: 'You are someone Jesus calls friend. Presence does not expire at the end of a text thread.', keys: ['lonely', 'alone', 'no one', 'nobody', 'isolated', 'abandoned', 'left out', 'forgotten', 'waiting to die', 'just waiting', 'coming out', 'come out to'], strong: [] },
    { theme: 'Forgiveness', hear: 'Forgiveness is one of the hardest sentences he spoke — and one of the freest. You do not have to finish the road today.', close: 'Mercy is often a road, not a moment. Take the next honest step.', keys: ['forgiv', 'resent', 'bitter', 'grudge', 'hate them', 'can\'t let go', 'cant let go', 'betray', 'stole from'], strong: [] },
    { theme: 'Shame & Guilt', hear: 'Shame wants you out of the room. He still knows how to lift a face.', close: 'You are not your worst hour. Neither do I condemn thee is the first word, not the last excuse.', keys: ['shame', 'guilt', 'guilty', 'ashamed', 'disgusted with myself', 'unworthy', 'failure', 'messed up', 'sinned', 'relapse', 'filthy', 'regret', 'i cheated', 'i lied', 'i killed', 'their faces', 'haunted', 'hate myself', 'forgive myself'], strong: ['i killed', 'people i killed', 'their faces', 'i cheated', 'relapse', 'hate myself', 'forgive myself'] },
    { theme: 'Suffering & Pain', hear: 'Pain is not a riddle you failed to solve. He names tribulation and still says come.', close: 'Your pain is not a failure of faith. Rest is offered to the laden, not the finished.', keys: ['pain', 'hurt', 'hurting', 'suffer', 'sick', 'ill', 'illness', 'chronic', 'broken body', 'ache', 'exhausted', 'so tired', 'burnt out', 'bullied', 'bully me', 'bullies me', 'feel numb', 'am numb', 'i\'m numb', 'gone numb', 'furious', 'enraged', 'rage', 'so angry', 'livid', 'covered it up', 'protected the wrong', 'cheated on me', 'cheating on me', 'been cheating', 'his affair', 'her affair', 'an affair', 'unfaithful', 'lost my house', 'lost our house', 'lost my home', 'lost everything', 'in the fire', 'flooded'], strong: ['cheated on me', 'an affair', 'unfaithful', 'been cheating', 'bullied', 'bully me', 'bullies me', 'terminal', 'weeks to live', 'months to live', 'not getting better', 'multiple sclerosis', 'chronic', 'lost my house', 'lost our house', 'lost everything'] },
    { theme: 'Conflict & Relationships', hear: 'Conflict lodges in the body. He treats the other person as worship’s unfinished business — not a side issue.', close: 'You do not have to finish the story today. You can take the next faithful step toward them.', keys: ['conflict', 'fight', 'argu', 'my marriage', 'marriage is', 'save my marriage', 'save our marriage', 'spouse', 'divorce', 'relationship', 'angry at my', 'angry with my', 'angry at him', 'angry at her', 'not speaking', 'barely speaks', 'won\'t talk', 'losing her', 'losing him'], strong: [] },
    { theme: 'Purpose & Direction', hear: 'Direction-anxiety wants a five-year map. He offers a first thing and a following.', close: 'You do not need the whole map. You need the next yes.', keys: ['purpose', 'direction', 'feel lost', 'feeling lost', 'i\'m lost', 'im lost', 'so lost', 'lost my way', 'career', 'calling', 'what should i do', 'confused', 'plan', 'future job', 'meaning', 'tempted', 'temptation', 'fudge', 'integrity', 'dishonest', 'everyone does it'], strong: [] },
    { theme: 'Faith & Doubt', hear: 'Doubt is not a firing offense in the Gospels. He lets a doubter touch the wound.', close: 'Faith is not the absence of questions. It is staying close enough to touch.', keys: ['doubt', 'unbelief', 'don\'t believe', 'dont believe', 'struggling to believe', 'questioning', 'is god real', 'where is god', 'angry at god', 'mad at god', 'furious with god', 'blame god'], strong: [] },
    { theme: 'Peace', hear: 'The world offers a pause between problems. He offers a peace that can sit in a troubled room and still be itself.', close: 'His peace is not the absence of storms. It is his presence within them.', keys: ['peace', 'calm', 'restless heart', 'troubled', 'quiet my'], strong: [] },
    { theme: 'Hope', hear: 'Hope is not naive optimism. In his words it is anchored in who he is, not in how you feel this hour.', close: 'Good cheer is possible because he has overcome — not because you have to.', keys: ['hope', 'hopeless', 'despair', 'give up', 'pointless', 'empty', 'dark place'], strong: [] }
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

  const PREFIX_KEYS = { anxi: 1, worr: 1, argu: 1, griev: 1, forgiv: 1, diagnos: 1, fright: 1 };
  function hasKey(t, key) {
    const k = key.toLowerCase();
    const esc = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const tail = (k.length <= 5 && !PREFIX_KEYS[k]) ? '(?:s|es|ed|ing|ful|less|ness)?(?=$|[^a-z])' : '';
    return new RegExp('(?:^|[^a-z])' + esc + tail, 'i').test(t);
  }
  function score(text, pack) {
    const t = text.toLowerCase();
    let n = 0;
    for (let i = 0; i < pack.keys.length; i++) {
      if (hasKey(t, pack.keys[i])) n += pack.keys[i].length > 7 ? 2 : 1;
    }
    for (let j = 0; j < (pack.strong || []).length; j++) {
      if (hasKey(t, pack.strong[j])) n += 4;
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
      const crisis = (S.looksLikePoisoning(raw) ? POISON_LINE : '') + S.CRISIS_NOTICE;
      if (S.looksLikeBereaved(raw)) {
        return crisis + formatPack(
          'Someone you love is gone, and the way they went has left you carrying more than grief. The number above is for you too: the people there sit with those left behind, tonight, and will not hurry you. These words are for you.',
          passagesFor('Grief & Loss'),
          'You do not have to be finished grieving to be held. Please let a person sit with you in this.'
        );
      }
      return crisis + formatPack(
        'What you wrote matters more than anything else on this page. The numbers above reach real people, tonight, and they are the first step — not this room. These words are for while you wait on the line, or for after.',
        passagesFor('Peace'),
        'You are not alone in this hour. Please go toward help now.'
      );
    }
    if (S.looksLikeDanger(raw)) {
      const byYou = S.looksLikeByYou(raw);
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
      const n = score(raw, PACKS[i]);
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
