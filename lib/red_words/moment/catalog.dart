import 'dart:convert';

import 'models.dart';

/// Offline catalog: curated daily rotation + Seek rooms + verse lock.
class MomentCatalog {
  MomentCatalog({
    required this.daily,
    required this.themes,
    required this.verses,
    this.seven = const [],
  });

  final List<DailyMoment> daily;
  final List<PathDay> seven;
  final Map<String, ThemeRoom> themes;
  final Map<String, Saying> verses;

  static const brandPromise = 'His words, for this moment.';

  bool get isEmpty => daily.isEmpty || verses.isEmpty;

  factory MomentCatalog.parse(String source) {
    final root = jsonDecode(source);
    if (root is! Map<String, dynamic>) {
      throw const FormatException('Catalog must be an object');
    }
    final dailyRaw = root['daily'];
    if (dailyRaw is! List) {
      throw const FormatException('Catalog missing daily rotation');
    }
    final daily = <DailyMoment>[];
    for (final slot in dailyRaw) {
      if (slot is Map<String, dynamic>) {
        daily.add(DailyMoment.fromSlot(slot));
      }
    }
    final themes = <String, ThemeRoom>{};
    final themesRaw = root['themes'];
    if (themesRaw is Map<String, dynamic>) {
      themesRaw.forEach((name, value) {
        if (value is! Map<String, dynamic>) return;
        final passages = <ThemePassage>[];
        final list = value['passages'];
        if (list is List) {
          for (final item in list) {
            if (item is Map<String, dynamic>) {
              passages.add(
                ThemePassage(
                  saying: Saying.fromJson(item),
                  context: (item['context'] ?? '').toString(),
                ),
              );
            }
          }
        }
        themes[name] = ThemeRoom(
          theme: (value['theme'] ?? name).toString(),
          headline: (value['headline'] ?? '').toString(),
          opening: (value['opening'] ?? '').toString(),
          passages: passages,
          practice: (value['practice'] ?? '').toString(),
          closing: (value['closing'] ?? '').toString(),
        );
      });
    }
    final verses = <String, Saying>{};
    final versesRaw = root['verses'];
    if (versesRaw is Map<String, dynamic>) {
      versesRaw.forEach((key, value) {
        if (value is Map<String, dynamic>) {
          verses[key] = Saying.fromJson(value);
        }
      });
    }
    final seven = <PathDay>[];
    final sevenRaw = root['seven'];
    if (sevenRaw is List) {
      for (final item in sevenRaw) {
        if (item is Map<String, dynamic>) {
          seven.add(PathDay.fromJson(item));
        }
      }
    }
    return MomentCatalog(daily: daily, seven: seven, themes: themes, verses: verses);
  }

  PathDay? lockPath(PathDay day) {
    final canonical = lookup(day.word.citation);
    if (canonical == null || canonical.text.isEmpty) return null;
    return PathDay(
      title: day.title,
      theme: day.theme,
      word: canonical,
      reflection: day.reflection,
    );
  }

  Saying? lookup(String citation) {
    final direct = verses[citation];
    if (direct != null) return direct;
    for (final saying in verses.values) {
      if (saying.citation == citation) return saying;
    }
    return null;
  }

  /// Fail closed: the Word on the page must be the catalog text.
  DailyMoment? lock(DailyMoment moment) {
    final canonical = lookup(moment.word.citation);
    if (canonical == null || canonical.text.isEmpty) return null;
    if (canonical.text != moment.word.text) {
      return DailyMoment(
        theme: moment.theme,
        title: moment.title,
        word: canonical,
        reflection: moment.reflection,
        affirmation: moment.affirmation,
      );
    }
    return moment;
  }
}
