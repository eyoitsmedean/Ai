class Saying {
  const Saying({
    required this.id,
    required this.book,
    required this.chapter,
    required this.start,
    required this.end,
    required this.citation,
    required this.translation,
    required this.word,
    required this.reflection,
    required this.step,
    required this.tags,
    required this.chips,
  });

  final String id;
  final String book;
  final int chapter;
  final int start;
  final int end;
  final String citation;
  final String translation;
  final String word;
  final String reflection;
  final String step;
  final List<String> tags;
  final List<String> chips;

  String get citationCaps => citation.toUpperCase();

  factory Saying.fromJson(Map<String, dynamic> json) {
    return Saying(
      id: json['id'] as String,
      book: json['book'] as String,
      chapter: json['chapter'] as int,
      start: json['start'] as int,
      end: json['end'] as int,
      citation: json['citation'] as String,
      translation: json['translation'] as String? ?? 'WEB',
      word: json['word'] as String,
      reflection: json['reflection'] as String,
      step: json['step'] as String,
      tags: List<String>.from(json['tags'] as List? ?? const []),
      chips: List<String>.from(json['chips'] as List? ?? const []),
    );
  }
}
