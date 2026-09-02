import '../models/saying.dart';
import 'pack.dart';

enum AskKind { retrieve, stay, refuse, crisis }

class AskResult {
  const AskResult({
    required this.kind,
    this.saying,
    this.message = '',
    this.chips = const [],
  });

  final AskKind kind;
  final Saying? saying;
  final String message;
  final List<String> chips;

  bool get retrieved => kind == AskKind.retrieve && saying != null;
}

class AskRetriever {
  AskRetriever(this.pack);

  final ScripturePack pack;

  static final _stop = {
    'the',
    'and',
    'for',
    'you',
    'your',
    'that',
    'this',
    'with',
    'from',
    'have',
    'not',
    'but',
    'are',
    'was',
    'were',
    'what',
    'when',
    'how',
    'why',
    'can',
    'will',
    'just',
    'about',
  };

  static final _crisis = RegExp(
    r'\b(suicid|kill myself|end my life|want to die|self[- ]?harm)\b',
    caseSensitive: false,
  );

  static final _jailbreak = RegExp(
    r'(ignore (all |previous )?instructions|you are (chatgpt|an? ai|a pastor)|system prompt|pretend you are|jailbreak|new verse|make up a verse|invent (a )?verse|write scripture)',
    caseSensitive: false,
  );

  static final _sexual = RegExp(
    r'\b(sex with|erotic|porn|nude|hookup|sexual (act|fantasy)|sleep with me)\b',
    caseSensitive: false,
  );

  AskResult ask(String raw) {
    final query = raw.trim();
    if (query.isEmpty || query.length < 3) {
      return const AskResult(
        kind: AskKind.stay,
        message: 'Stay. When you have a real need, ask in a few words.',
      );
    }
    if (_crisis.hasMatch(query)) {
      return const AskResult(
        kind: AskKind.crisis,
        message:
            'This is not a pastor and not emergency care. In the US, call or text 988.',
      );
    }
    if (_jailbreak.hasMatch(query)) {
      return const AskResult(
        kind: AskKind.refuse,
        message:
            'I will not invent a verse, a citation, or a role. Only His recorded words.',
      );
    }
    if (_sexual.hasMatch(query)) {
      return const AskResult(
        kind: AskKind.refuse,
        message: 'I will not follow that. His words are not for that use.',
      );
    }

    final tokens = query
        .toLowerCase()
        .replaceAll(RegExp(r'[^a-z0-9\s]'), ' ')
        .split(RegExp(r'\s+'))
        .where((w) => w.length > 2 && !_stop.contains(w))
        .toList();
    if (tokens.isEmpty) {
      return const AskResult(
        kind: AskKind.stay,
        message: 'Stay. Ask with the need, not with decoration.',
      );
    }

    Saying? best;
    var bestScore = 0;
    for (final saying in pack.sayings) {
      final hay =
          '${saying.word} ${saying.citation} ${saying.tags.join(' ')} ${saying.reflection}'
              .toLowerCase();
      var score = 0;
      for (final token in tokens) {
        if (hay.contains(token)) {
          score += token.length > 5 ? 3 : 2;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        best = saying;
      }
    }

    if (best == null || bestScore < 2) {
      return const AskResult(
        kind: AskKind.stay,
        message:
            'Nothing in the pack meets that. I will not invent a word of His.',
      );
    }

    return AskResult(
      kind: AskKind.retrieve,
      saying: best,
      chips: best.chips,
    );
  }
}
