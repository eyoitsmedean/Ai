import 'models.dart';

/// Craft law: Widget = Word only.
/// No badge, streak, CTA, or in-card app name.
class WidgetPayload {
  const WidgetPayload({required this.word, required this.citation});

  final String word;
  final String citation;

  static const allowedKeys = {'word', 'citation'};

  static const forbiddenInCard = [
    'Red Words',
    'redwords',
    'streak',
    'badge',
    'Day 1',
    'Day 7',
    'Open app',
    'Tap to',
    'Subscribe',
    'Roumie',
    'Chosen',
    'Hallow',
  ];

  factory WidgetPayload.fromSaying(Saying saying) {
    final payload = WidgetPayload(word: saying.text, citation: saying.citation);
    payload.assertCraftLaw();
    return payload;
  }

  Map<String, String> toMap() => {'word': word, 'citation': citation};

  void assertCraftLaw() {
    final keys = toMap().keys.toSet();
    if (keys.difference(allowedKeys).isNotEmpty) {
      throw StateError('Widget payload has chrome keys: $keys');
    }
    if (word.trim().isEmpty) {
      throw StateError('Widget word is empty');
    }
    final hay = '$word\n$citation'.toLowerCase();
    for (final token in forbiddenInCard) {
      if (hay.contains(token.toLowerCase())) {
        throw StateError('Widget card contains forbidden chrome: $token');
      }
    }
  }
}

/// Deep link: `redwords://today` opens Today.
class RedWordsLink {
  static const scheme = 'redwords';
  static const todayHost = 'today';

  static Uri today = Uri(scheme: scheme, host: todayHost);

  static Uri? parse(String? raw) {
    if (raw == null) return null;
    final trimmed = raw.trim();
    if (trimmed.isEmpty) return null;
    final uri = Uri.tryParse(trimmed);
    if (uri == null || uri.scheme != scheme) return null;
    return uri;
  }

  static bool isToday(Uri? uri) {
    if (uri == null || uri.scheme != scheme) return false;
    if (uri.host == todayHost) return true;
    return uri.pathSegments.contains(todayHost);
  }
}
