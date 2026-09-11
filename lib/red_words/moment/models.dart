/// A corpus-verified saying. Never invent text — only catalog lookups.
class Saying {
  const Saying({
    required this.citation,
    required this.text,
  });

  final String citation;
  final String text;

  factory Saying.fromJson(Map<String, dynamic> json) {
    final citation = (json['citation'] ?? json['verse'] ?? '').toString().trim();
    final text = (json['text'] ?? json['quote'] ?? json['passage'] ?? '')
        .toString()
        .trim();
    if (citation.isEmpty || text.isEmpty) {
      throw const FormatException('Saying missing citation or text');
    }
    return Saying(citation: citation, text: text);
  }
}

class DailyMoment {
  const DailyMoment({
    required this.theme,
    required this.title,
    required this.word,
    required this.reflection,
    this.affirmation,
  });

  final String theme;
  final String title;
  final Saying word;
  final String reflection;
  final Saying? affirmation;

  factory DailyMoment.fromSlot(Map<String, dynamic> slot) {
    final word = slot['word'] as Map<String, dynamic>?;
    if (word == null) {
      throw const FormatException('Daily slot missing word');
    }
    Saying? affirmation;
    final aff = slot['affirmation'];
    if (aff is Map<String, dynamic> && aff['quote'] != null) {
      affirmation = Saying.fromJson(aff);
    }
    return DailyMoment(
      theme: (word['theme'] ?? '').toString(),
      title: (word['title'] ?? '').toString(),
      word: Saying(
        citation: (word['verse'] ?? '').toString(),
        text: (word['passage'] ?? '').toString(),
      ),
      reflection: (word['reflection'] ?? '').toString(),
      affirmation: affirmation,
    );
  }
}

class ThemePassage {
  const ThemePassage({
    required this.saying,
    required this.context,
  });

  final Saying saying;
  final String context;
}

class ThemeRoom {
  const ThemeRoom({
    required this.theme,
    required this.headline,
    required this.opening,
    required this.passages,
    required this.practice,
    required this.closing,
  });

  final String theme;
  final String headline;
  final String opening;
  final List<ThemePassage> passages;
  final String practice;
  final String closing;
}

class PathDay {
  const PathDay({
    required this.title,
    required this.theme,
    required this.word,
    required this.reflection,
  });

  final String title;
  final String theme;
  final Saying word;
  final String reflection;

  factory PathDay.fromJson(Map<String, dynamic> json) {
    return PathDay(
      theme: (json['theme'] ?? '').toString(),
      title: (json['title'] ?? '').toString(),
      word: Saying(
        citation: (json['verse'] ?? '').toString(),
        text: (json['passage'] ?? '').toString(),
      ),
      reflection: (json['reflection'] ?? '').toString(),
    );
  }
}

class ChurchSeason {
  const ChurchSeason({
    required this.id,
    required this.name,
    required this.runningHead,
  });

  final String id;
  final String name;
  final String runningHead;
}
