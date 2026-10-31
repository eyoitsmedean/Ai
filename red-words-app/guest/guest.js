(function () {
  const pack = window.RED_WORDS_PACK;
  const sayings = pack && pack.sayings ? pack.sayings : [];
  const first = sayings[0];
  const KEY = "red-words-guest";

  const stayShort = "Stay. When you have a real need, ask in a few words.";
  const stayNone = "Nothing in the pack meets that. I will not invent a word of His.";
  const crisisMessage =
    "This is not a pastor and not emergency care. In the US, call or text 988.";
  const refuseInvent =
    "I will not invent a verse, a citation, or a role. Only His recorded words.";
  const refuseUse = "I will not follow that. His words are not for that use.";
  const crisisCopy =
    "If you are in crisis in the US, call or text 988. This app is not a person, and it is not emergency care.";

  const intent = /\b(suicid(e|al|ally)?|kill(ing)? myself|end(ing)? (my|it) (life|all)|take my (own )?life|(want|wanted|wanna|going|plan|planning) to (die|kill myself|end it)|(don'?t|do not|dont) want to (be alive|be here|live|wake up)( anymore)?|wish i (was|were) dead|better off dead|no reason to (live|go on|keep going)|hurt(ing)? myself|cut(ting)? myself|self[- ]?harm|overdos(e|ing))\b/i;
  const distress = /\b(hopeless(ness)?|(a )?burden to (everyone|others|my family|them|you)|(feel|feeling|am|i'?m) trapped|unbearable( pain)?|can'?t (go on|take (it|this) anymore|do this anymore)|(nothing|no one|nobody) (matters|cares|would care))\b/i;
  const jailbreak = /(ignore (all |the |previous |prior )?(instructions|rules)|you are (chatgpt|an? ai|a pastor|a priest|god|jesus)|system prompt|pretend (you are|to be)|act as (a|an|if)|jailbreak|\bnew verse\b|make up (a )?(verse|scripture|saying)|invent (a )?(verse|scripture|saying)|write (a )?(verse|scripture|new saying)|what would jesus say about|speak as jesus)/i;
  const sexual = /\b(sex with|sexy|erotic|erotica|porn(ography)?|nude|nudes|hookup|sexual (act|fantasy|favor)|sleep with me|turn me on|dirty talk)\b/i;

  const aliases = {
    anxious: "anxiety",
    worried: "anxiety",
    worry: "worry",
    stress: "anxiety",
    stressed: "anxiety",
    scared: "afraid",
    lonely: "with you",
    alone: "with you",
    tired: "weary",
    exhausted: "weary",
    forgiveness: "forgive",
    sad: "mourn",
    grief: "grief",
  };
  const stop = new Set("a an the and or but for i me my we you your is am are was be to of in on at by with from about just very really some any all more most please need want feel feeling help".split(" "));

  function tokensOf(text) {
    const out = new Set();
    const cleaned = String(text).toLowerCase().replace(/'/g, "").replace(/[^a-z0-9 ]/g, " ");
    for (const raw of cleaned.split(/\s+/)) {
      if (!raw || stop.has(raw)) continue;
      if (aliases[raw]) out.add(aliases[raw]);
      if (raw.length >= 3) out.add(raw.replace(/s$/, ""));
    }
    return out;
  }

  function ask(raw) {
    const query = String(raw).trim();
    if (query.length < 3) return { kind: "stay", message: stayShort };
    if (intent.test(query)) return { kind: "crisis", message: crisisMessage, offer988: true };
    if (jailbreak.test(query)) return { kind: "refuse", message: refuseInvent };
    if (sexual.test(query)) return { kind: "refuse", message: refuseUse };
    const isDistress = distress.test(query);
    const tokens = tokensOf(query);
    if (tokens.size === 0) {
      return { kind: "stay", message: stayShort, distress: isDistress, offer988: isDistress };
    }
    let best = null;
    let bestScore = 0;
    for (const s of sayings) {
      const bag = new Set();
      for (const c of s.chips || []) tokensOf(c).forEach((t) => bag.add(t));
      for (const t of s.tags || []) tokensOf(t).forEach((x) => bag.add(x));
      tokensOf(s.word).forEach((t) => bag.add(t));
      let score = 0;
      tokens.forEach((t) => {
        if (bag.has(t)) score += (s.chips || []).some((c) => c.toLowerCase().includes(t)) ? 5 : 1;
      });
      if (score > bestScore) {
        bestScore = score;
        best = s;
      }
    }
    if (!best || bestScore < 1) {
      return {
        kind: "stay",
        message: isDistress ? stayNone + " " + crisisCopy : stayNone,
        distress: isDistress,
        offer988: isDistress,
      };
    }
    return { kind: "retrieve", saying: best, chips: best.chips || [], offer988: isDistress };
  }

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "{}");
    } catch (_) {
      return {};
    }
  }
  function save(mem) {
    localStorage.setItem(KEY, JSON.stringify(mem));
  }

  const mem = Object.assign(
    { seen: false, lastId: null, step: null, saved: [], dark: false },
    load(),
  );

  function byId(id) {
    return sayings.find((s) => s.id === id) || first;
  }
  function today() {
    if (!mem.seen) return first;
    return byId(mem.lastId || first.id);
  }

  const $ = (id) => document.getElementById(id);
  const pages = {
    today: $("page-today"),
    step: $("page-step"),
    amen: $("page-amen"),
    ask: $("page-ask"),
    saved: $("page-saved"),
    settings: $("page-settings"),
  };

  function renderSaying(s) {
    $("saying-word").textContent = s.word;
    $("saying-citation").textContent = s.citation.toUpperCase();
    $("saying-reflection").textContent = s.reflection;
    $("step-body").textContent = s.step;
    const ribbon = $("continuity");
    if (mem.step) {
      ribbon.hidden = false;
      ribbon.textContent = "You said you'd " + mem.step;
    } else {
      ribbon.hidden = true;
    }
  }

  function show(name, hideDock) {
    Object.values(pages).forEach((el) => {
      el.hidden = true;
    });
    pages[name].hidden = false;
    $("dock").hidden = !!hideDock;
    document.querySelectorAll("#dock button").forEach((b) => {
      b.classList.toggle("on", b.dataset.tab === name);
    });
  }

  function paintSaved() {
    const empty = $("saved-empty");
    const list = $("saved-list");
    list.innerHTML = "";
    if (!mem.saved.length) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    mem.saved.forEach((id) => {
      const s = byId(id);
      const div = document.createElement("div");
      div.className = "saved-item";
      div.innerHTML =
        '<p class="citation"></p><p class="word"></p>';
      div.querySelector(".citation").textContent = s.citation.toUpperCase();
      div.querySelector(".word").textContent = s.word;
      list.appendChild(div);
    });
  }

  function applyDark() {
    document.body.classList.toggle("dark", !!mem.dark);
    $("dark-saying").checked = !!mem.dark;
  }

  function boot() {
    if (!first) return;
    renderSaying(today());
    applyDark();
    paintSaved();
    window.setTimeout(() => {
      $("splash").hidden = true;
      $("app").hidden = false;
      $("dock").hidden = false;
      mem.seen = true;
      mem.lastId = today().id;
      save(mem);
      show("today");
    }, 900);
  }

  $("open-step").onclick = () => show("step", true);
  $("ill-do-this").onclick = () => {
    const words = $("step-field").value.trim();
    mem.step = words || today().step;
    mem.lastId = today().id;
    mem.seen = true;
    save(mem);
    show("amen", true);
  };
  $("amen").onclick = $("amen-skip").onclick = () => {
    renderSaying(today());
    show("today");
  };
  $("keep").onclick = () => {
    const id = today().id;
    if (!mem.saved.includes(id)) mem.saved.push(id);
    save(mem);
    paintSaved();
  };
  $("ask-submit").onclick = () => {
    const result = ask($("ask-field").value);
    const out = $("ask-out");
    out.innerHTML = "";
    if (result.kind === "retrieve" && result.saying) {
      out.innerHTML =
        '<p class="word"></p><p class="citation"></p><svg class="knot" viewBox="0 0 28 18"><path d="M0 10 C7 0 11 18 15 8 C20 0 23 18 28 9" /></svg><p class="reflection"></p>';
      out.querySelector(".word").textContent = result.saying.word;
      out.querySelector(".citation").textContent = result.saying.citation.toUpperCase();
      out.querySelector(".reflection").textContent = result.saying.reflection;
    } else {
      const p = document.createElement("p");
      p.className = result.kind;
      p.id = "ask-" + result.kind;
      p.textContent = result.message;
      out.appendChild(p);
    }
    if (result.offer988) {
      const a = document.createElement("p");
      a.innerHTML = '<a href="tel:988">988</a>';
      out.appendChild(a);
    }
  };
  $("dark-saying").onchange = () => {
    mem.dark = $("dark-saying").checked;
    save(mem);
    applyDark();
  };
  document.querySelectorAll("#dock button").forEach((b) => {
    b.onclick = () => {
      if (b.dataset.tab === "saved") paintSaved();
      show(b.dataset.tab);
    };
  });

  window.RedWordsGuest = { ask, today, first };
  boot();
})();
