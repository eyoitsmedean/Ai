import 'dart:math' as math;

import '../models/saying.dart';
import 'crisis.dart';
import 'pack.dart';

/// Offline Ask: empty → crisis intent → refusal → retrieve-or-stay.
///
/// Nothing here generates text. A query lands on one recorded saying or
/// an honest stay. Distress language keeps the saying and adds 988.
enum AskKind { retrieve, stay, refuse, crisis }

class AskResult {
  const AskResult({
    required this.kind,
    this.saying,
    this.message = '',
    this.chips = const [],
    this.distress = false,
  });

  final AskKind kind;
  final Saying? saying;
  final String message;
  final List<String> chips;

  /// Distress (hopeless, burden, trapped) without explicit intent.
  /// The saying is still shown; 988 rides along.
  final bool distress;

  bool get retrieved => kind == AskKind.retrieve && saying != null;

  bool get offer988 => kind == AskKind.crisis || distress;
}

class AskRetriever {
  AskRetriever(this.pack) : _index = _Index(pack.sayings);

  final ScripturePack pack;
  final _Index _index;

  static const stayShort =
      'Stay. When you have a real need, ask in a few words.';
  static const stayDecor = 'Stay. Ask with the need, not with decoration.';
  static const stayNone =
      'Nothing in the pack meets that. I will not invent a word of His.';
  static const crisisMessage =
      'This is not a pastor and not emergency care. In the US, call or text 988.';
  static const refuseInvent =
      'I will not invent a verse, a citation, or a role. Only His recorded words.';
  static const refuseUse =
      'I will not follow that. His words are not for that use.';

  AskResult ask(String raw) {
    final query = raw.trim();
    if (query.length < 3) {
      return const AskResult(kind: AskKind.stay, message: stayShort);
    }
    if (CrisisLexicon.intent.hasMatch(query)) {
      return const AskResult(kind: AskKind.crisis, message: crisisMessage);
    }
    if (Refusals.jailbreak.hasMatch(query)) {
      return const AskResult(kind: AskKind.refuse, message: refuseInvent);
    }
    if (Refusals.sexual.hasMatch(query)) {
      return const AskResult(kind: AskKind.refuse, message: refuseUse);
    }

    final distress = CrisisLexicon.distress.hasMatch(query);
    final tokens = Stemmer.tokensOf(query);
    if (tokens.isEmpty) {
      return AskResult(
        kind: AskKind.stay,
        message: distress ? '$stayDecor ${Crisis.copy}' : stayDecor,
        distress: distress,
      );
    }

    final hit = _index.best(tokens);
    if (hit == null) {
      return AskResult(
        kind: AskKind.stay,
        message: distress ? '$stayNone ${Crisis.copy}' : stayNone,
        distress: distress,
      );
    }
    return AskResult(
      kind: AskKind.retrieve,
      saying: hit,
      chips: hit.chips,
      message: distress ? Crisis.copy : '',
      distress: distress,
    );
  }
}

/// Two tiers, first-person and word-bounded.
///
/// Phrasings follow SAMHSA warning-sign "talk" (updated 2024-11-01) and AFSP:
/// suicide or plans, no reason to live, burden, trapped, unbearable pain,
/// hopelessness. Bare "die"/"kill" are excluded (idiom / lyrics over-fire).
abstract final class CrisisLexicon {
  static final intent = RegExp(
    r'\b('
    r'suicid(e|al|ally)?'
    r'|kill(ing)? myself'
    r'|end(ing)? (my|it) (life|all)'
    r'|take my (own )?life'
    r'|(want|wanted|wanna|going|plan|planning) to (die|kill myself|end it)'
    r"|(don'?t|do not|dont) want to (be alive|be here|live|wake up)( anymore)?"
    r'|wish i (was|were) dead'
    r'|better off dead'
    r'|no reason to (live|go on|keep going)'
    r'|hurt(ing)? myself'
    r'|cut(ting)? myself'
    r'|self[- ]?harm'
    r'|overdos(e|ing)'
    r')\b',
    caseSensitive: false,
  );

  static final distress = RegExp(
    r'\b('
    r'hopeless(ness)?'
    r'|(a )?burden to (everyone|others|my family|them|you)'
    r"|(feel|feeling|am|i'?m) trapped"
    r'|unbearable( pain)?'
    r"|can'?t (go on|take (it|this) anymore|do this anymore)"
    r"|(nothing|no one|nobody) (matters|cares|would care)"
    r')\b',
    caseSensitive: false,
  );
}

abstract final class Refusals {
  static final jailbreak = RegExp(
    r'(ignore (all |the |previous |prior )?(instructions|rules)'
    r'|you are (chatgpt|an? ai|a pastor|a priest|god|jesus)'
    r'|system prompt'
    r'|pretend (you are|to be)'
    r'|act as (a|an|if)'
    r'|jailbreak'
    r'|\bnew verse\b'
    r'|make up (a )?(verse|scripture|saying)'
    r'|invent (a )?(verse|scripture|saying)'
    r'|write (a )?(verse|scripture|new saying)'
    r'|what would jesus say about'
    r'|speak as jesus)',
    caseSensitive: false,
  );

  static final sexual = RegExp(
    r'\b(sex with|sexy|erotic|erotica|porn(ography)?|nude|nudes|hookup|'
    r'sexual (act|fantasy|favor)|sleep with me|turn me on|dirty talk)\b',
    caseSensitive: false,
  );
}

/// Chip 5, tag 3, recorded word 1, reflection 0.5.
/// A chip or tag hit is enough to retrieve. Coverage >= 0.5 also retrieves
/// so a two-word need still lands when neither word is a chip.
class _Index {
  _Index(this.sayings) {
    final df = <String, int>{};
    for (final s in sayings) {
      final weights = <String, double>{};
      final anchors = <String>{};

      void put(String key, double w, {required bool anchor}) {
        if (key.isEmpty) return;
        weights[key] = math.max(weights[key] ?? 0, w);
        if (anchor) anchors.add(key);
      }

      void addField(String text, double w, {required bool anchor}) {
        put(text.toLowerCase(), w, anchor: anchor);
        for (final t in Stemmer.tokensOf(text)) {
          put(t, w, anchor: anchor);
        }
      }

      for (final chip in s.chips) {
        addField(chip, 5, anchor: true);
      }
      for (final tag in s.tags) {
        addField(tag, 3, anchor: true);
      }
      for (final t in Stemmer.tokensOf(s.word)) {
        put(t, 1, anchor: false);
      }
      for (final t in Stemmer.tokensOf(s.reflection)) {
        put(t, 0.5, anchor: false);
      }

      _weights[s.id] = weights;
      _anchors[s.id] = anchors;
      _size[s.id] = weights.length;
      for (final k in weights.keys) {
        df[k] = (df[k] ?? 0) + 1;
      }
    }
    final n = sayings.length.toDouble();
    df.forEach((k, count) => _idf[k] = math.log(1 + n / count));
  }

  final List<Saying> sayings;
  final _weights = <String, Map<String, double>>{};
  final _anchors = <String, Set<String>>{};
  final _size = <String, int>{};
  final _idf = <String, double>{};

  Saying? best(Set<String> query) {
    Saying? bestSaying;
    var bestScore = 0.0;
    var bestAnchors = -1;
    var bestSize = 1 << 30;

    for (final s in sayings) {
      final w = _weights[s.id]!;
      final matched = query.where(w.containsKey).toSet();
      if (matched.isEmpty) continue;
      final anchors = _anchors[s.id]!;
      final anchorHits = matched.where(anchors.contains).length;
      final strongHits =
          matched.where((t) => anchors.contains(t) && Stemmer.isStrong(t)).length;
      final coverage = matched.length / query.length;
      // A lone weak chip ("tomorrow", "night") must not retrieve a weather
      // query. A strong chip (forgive, grief, with you) may, even with extra
      // context words.
      if (coverage < 0.5 && strongHits == 0) continue;

      var score = 0.0;
      for (final t in matched) {
        score += w[t]! * (_idf[t] ?? 1);
      }
      final size = _size[s.id]!;
      final better = score > bestScore + 1e-9 ||
          ((score - bestScore).abs() <= 1e-9 && anchorHits > bestAnchors) ||
          ((score - bestScore).abs() <= 1e-9 &&
              anchorHits == bestAnchors &&
              size < bestSize);
      if (better) {
        bestScore = score;
        bestAnchors = anchorHits;
        bestSize = size;
        bestSaying = s;
      }
    }
    return bestSaying;
  }
}

/// Tokenise → drop stopwords → alias (atomic) → stem.
/// Applied identically to the query and the index.
abstract final class Stemmer {
  static const stopwords = {
    'a', 'an', 'the', 'and', 'or', 'but', 'for', 'nor', 'so', 'yet',
    'i', 'me', 'my', 'mine', 'im', 'ive', 'id', 'we', 'us', 'our',
    'you', 'your', 'yours', 'he', 'him', 'his', 'she', 'her', 'they', 'them',
    'their', 'it', 'its', 'this', 'that', 'these', 'those', 'who', 'whom',
    'what', 'which', 'when', 'where', 'why', 'how',
    'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',
    'does', 'did', 'have', 'has', 'had', 'having',
    'will', 'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must',
    'not', 'no', 'dont', 'cant', 'wont', 'isnt', 'arent',
    'to', 'of', 'in', 'on', 'at', 'by', 'with', 'from', 'about', 'into',
    'over', 'under', 'up', 'down', 'out', 'off', 'than', 'then', 'there',
    'here', 'as', 'if', 'because', 'while', 'after', 'before',
    'just', 'very', 'really', 'some', 'any', 'all', 'more', 'most', 'much',
    'please', 'need', 'want', 'feel', 'feeling', 'feels', 'help', 'tell',
    'something', 'anything', 'everything', 'nothing', 'someone', 'everyone',
    'get', 'got', 'like', 'know', 'think', 'say', 'said', 'thing', 'things',
  };

  /// Everyday words → the pack's own tag/chip vocabulary. The right-hand
  /// side is added as an atomic key so multi-word chips ("with you") survive.
  static const aliases = <String, String>{
    'anxious': 'anxiety',
    'worried': 'anxiety',
    'worrying': 'worry',
    'stress': 'anxiety',
    'stressed': 'anxiety',
    'panic': 'anxiety',
    'scared': 'afraid',
    'fearful': 'afraid',
    'frightened': 'afraid',
    'terrified': 'afraid',
    'grieving': 'grief',
    'grieve': 'grief',
    'mourning': 'mourn',
    'sad': 'mourn',
    'sadness': 'mourn',
    'lonely': 'with you',
    'alone': 'with you',
    'exhausted': 'weary',
    'tired': 'weary',
    'burnt': 'weary',
    'burned': 'weary',
    'forgiveness': 'forgive',
    'forgiving': 'forgive',
    'praying': 'pray',
    'prayers': 'prayer',
    'money': 'treasure',
    'wealth': 'rich',
    'greedy': 'rich',
    'enemy': 'enemies',
    'hate': 'enemies',
    'hatred': 'enemies',
    'calm': 'peace',
    'quiet': 'still',
    'direction': 'way',
    'purpose': 'way',
    'guidance': 'way',
    'doubt': 'believe',
    'doubting': 'believe',
    'faithless': 'believe',
    'kids': 'children',
    'child': 'children',
    'son': 'children',
    'daughter': 'children',
    'judging': 'judge',
    'judgmental': 'judge',
    'critical': 'judge',
    'proud': 'humble',
    'pride': 'humble',
    'arrogant': 'humble',
    'temptation': 'watch',
    'tempted': 'watch',
    'divorce': 'together',
    'marriage': 'together',
    'shame': 'mercy',
    'guilt': 'mercy',
    'guilty': 'mercy',
    'sin': 'repent',
    'sinned': 'repent',
    'failed': 'lost',
    'failure': 'lost',
  };

  static final _split = RegExp(r"[^a-z0-9' ]");
  static final _spaces = RegExp(r'\s+');

  static final strongKeys = {
    ...aliases.values,
    for (final value in aliases.values)
      if (!value.contains(' ')) stem(value),
    'grief',
    'mourn',
    'anxiety',
    'worry',
  };

  static bool isStrong(String token) => strongKeys.contains(token);

  static Set<String> tokensOf(String text) {
    final out = <String>{};
    final cleaned = text
        .toLowerCase()
        .replaceAll("'", '')
        .replaceAll(_split, ' ');
    for (final raw in cleaned.split(_spaces)) {
      if (raw.isEmpty || stopwords.contains(raw)) continue;
      final aliased = aliases[raw];
      if (aliased != null) {
        out.add(aliased);
        if (!aliased.contains(' ')) {
          out.add(stem(aliased));
        }
        continue;
      }
      if (raw.length < 3) continue;
      out.add(stem(raw));
    }
    return out;
  }

  /// Porter (1980) steps 1a, 1b, 1c plus NESS / FUL / LY, with measure `m`.
  /// Not the full algorithm — steps 2 and 4 add conflation on a 100-saying pack.
  static String stem(String word) {
    var w = word;
    if (w.length < 3) return w;

    if (w.endsWith('sses')) {
      w = w.substring(0, w.length - 2);
    } else if (w.endsWith('ies')) {
      w = '${w.substring(0, w.length - 3)}i';
    } else if (w.endsWith('ss')) {
      // keep
    } else if (w.endsWith('s') && w.length > 3) {
      w = w.substring(0, w.length - 1);
    }

    if (w.endsWith('eed')) {
      final stemPart = w.substring(0, w.length - 3);
      if (_measure(stemPart) > 0) w = '${stemPart}ee';
    } else {
      String? cut;
      if (w.endsWith('ed') && _hasVowel(w.substring(0, w.length - 2))) {
        cut = w.substring(0, w.length - 2);
      } else if (w.endsWith('ing') && _hasVowel(w.substring(0, w.length - 3))) {
        cut = w.substring(0, w.length - 3);
      }
      if (cut != null) {
        if (cut.endsWith('at') || cut.endsWith('bl') || cut.endsWith('iz')) {
          cut = '${cut}e';
        } else if (_doubleConsonant(cut) &&
            !(cut.endsWith('l') || cut.endsWith('s') || cut.endsWith('z'))) {
          cut = cut.substring(0, cut.length - 1);
        } else if (_measure(cut) == 1 && _cvc(cut)) {
          cut = '${cut}e';
        }
        w = cut;
      }
    }

    if (w.endsWith('y') && _hasVowel(w.substring(0, w.length - 1))) {
      w = '${w.substring(0, w.length - 1)}i';
    }

    for (final suffix in const ['fulness', 'ness', 'ful', 'li']) {
      if (!w.endsWith(suffix)) continue;
      final stemPart = w.substring(0, w.length - suffix.length);
      if (_measure(stemPart) > 0) {
        w = suffix == 'fulness' ? '${stemPart}ful' : stemPart;
        if (w.endsWith('ful') && _measure(w.substring(0, w.length - 3)) > 0) {
          w = w.substring(0, w.length - 3);
        }
      }
      break;
    }
    return w;
  }

  static bool _isConsonant(String w, int i) {
    final c = w[i];
    if ('aeiou'.contains(c)) return false;
    if (c == 'y') return i == 0 || !_isConsonant(w, i - 1);
    return true;
  }

  static bool _hasVowel(String w) {
    for (var i = 0; i < w.length; i++) {
      if (!_isConsonant(w, i)) return true;
    }
    return false;
  }

  static int _measure(String w) {
    var m = 0;
    var i = 0;
    while (i < w.length && _isConsonant(w, i)) {
      i++;
    }
    while (i < w.length) {
      while (i < w.length && !_isConsonant(w, i)) {
        i++;
      }
      if (i >= w.length) break;
      while (i < w.length && _isConsonant(w, i)) {
        i++;
      }
      m++;
    }
    return m;
  }

  static bool _doubleConsonant(String w) {
    if (w.length < 2) return false;
    final n = w.length;
    return w[n - 1] == w[n - 2] && _isConsonant(w, n - 1);
  }

  static bool _cvc(String w) {
    final n = w.length;
    if (n < 3) return false;
    final last = w[n - 1];
    return _isConsonant(w, n - 3) &&
        !_isConsonant(w, n - 2) &&
        _isConsonant(w, n - 1) &&
        !'wxy'.contains(last);
  }
}
