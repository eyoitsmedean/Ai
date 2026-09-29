/**
 * Crisis language, in one place. The server requires this file and the page
 * loads it as a script, so the two can never drift apart again.
 *
 * Misses are the costly error here: a false alarm shows a helpline, a miss
 * answers someone in danger with a devotional. Stems carry \w* so every
 * ending matches ("suicid" -> suicidal, suicidio). Text is lowercased, curly
 * apostrophes straightened and accents removed before matching.
 */
(function (root) {
  const SELF_EN = [
    /\bsuicid\w*/,
    /\bun-?aliv\w*\s+(?:my ?self|me)\b/,
    /\bkms\b/,
    /\b(?:kill|killing|hang|hanging|hurt|hurting|harm|harming|cut|cutting|starve|starving|shoot|shooting|drown|drowning)\s+my ?self\b/,
    /\bself[-\s]?harm\w*/,
    /\boverdos\w*/,
    /\b(?:end|ending|take|taking)\s+my\s+(?:own\s+)?life\b/,
    /\bend (?:it all|everything)\b/,
    /\b(?:want|wanting|wanted)\s+to\s+die\b/,
    /\bwanna die\b/,
    /\bready to die\b/,
    /\bwish (?:i (?:was|were) dead|i could die|i (?:was|were|had) never (?:been )?born)\b/,
    /\b(?:don'?t|do not|dont|no longer) want to (?:live|be alive|exist|wake up|be here)\b/,
    /\bcan'?t (?:go on|keep going|keep living)\b/,
    /\bno (?:point (?:in )?|reason to )liv(?:e|ing)\b/,
    /\bnothing to live for\b/,
    /\bbetter off (?:dead|without me)\b/,
    /\bjump (?:off|from) (?:a|the|this) (?:bridge|building|roof|cliff)\b/,
    /\bpills? to (?:die|end it)\b/,
  ];

  const SELF_ES = [
    /\bsuicid(?:io|arme|arse|a|as)\b/,
    /\bmatarme\b/,
    /\bme quiero matar\b/,
    /\bquitarme la vida\b/,
    /\bacabar con (?:mi vida|todo)\b/,
    /\b(?:quiero|quisiera|deseo) morir(?:me)?\b/,
    /\bno quiero (?:seguir )?viv(?:ir|iendo)\b/,
    /\bya no quiero (?:estar aqui|existir|despertar)\b/,
    /\b(?:hacerme dano|lastimarme|cortarme|autolesion\w*)\b/,
    /\bmejor (?:muerto|muerta)\b/,
    /\bno tengo (?:razon|razones|motivo|motivos) para vivir\b/,
  ];

  // Someone else is the danger: 988 is not the right first door.
  const DANGER_EN = [
    /\b(?:he|she|they|my (?:husband|wife|boyfriend|girlfriend|partner|dad|father|mom|mother|stepdad))\s+(?:hits|hit|beats|beat|chokes|choked|strangled|hurts|threatens|threatened)\s+me\b/,
    /\b(?:going|gonna|threatened|threatening) to kill me\b/,
    /\bafraid (?:for my life|he will kill me|she will kill me)\b/,
    /\bnot safe (?:at home|with (?:him|her|them))\b/,
  ];

  const DANGER_ES = [
    /\bme (?:pega|golpea|amenaza)\b/,
    /\bme va a matar\b/,
    /\bno estoy (?:a salvo|segur[oa]) en (?:mi )?casa\b/,
  ];

  function normalize(text) {
    return String(text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[‘’ʼ`´]/g, "'")
      .replace(/\s+/g, ' ');
  }

  // null, or { kind: 'self' | 'danger', lang: 'en' | 'es' }
  function assessCrisis(text) {
    const t = normalize(text);
    if (!t.trim()) return null;
    const hit = (list) => list.some((re) => re.test(t));
    // Self-harm comes first when both are present; the language is the
    // language of the words that matched.
    if (hit(SELF_ES)) return { kind: 'self', lang: 'es' };
    if (hit(SELF_EN)) return { kind: 'self', lang: 'en' };
    if (hit(DANGER_ES)) return { kind: 'danger', lang: 'es' };
    if (hit(DANGER_EN)) return { kind: 'danger', lang: 'en' };
    return null;
  }

  function looksLikeCrisis(text) {
    return assessCrisis(text) !== null;
  }

  const api = { assessCrisis, looksLikeCrisis };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RLA_CRISIS = api;
})(typeof self !== 'undefined' ? self : this);
