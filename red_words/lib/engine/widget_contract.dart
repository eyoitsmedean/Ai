import '../models/saying.dart';

/// Home widget may show Word + citation + thread. Never badge, streak, or CTA.
class WidgetPayload {
  const WidgetPayload({
    required this.word,
    required this.citation,
    required this.thread,
  });

  final String word;
  final String citation;
  final String thread;

  Map<String, String> toMap() => {
        'word': word,
        'citation': citation,
        'thread': thread,
      };

  factory WidgetPayload.fromSaying(Saying saying) {
    return WidgetPayload(
      word: saying.word,
      citation: saying.citationCaps,
      thread: 'crimson-knot',
    );
  }
}

abstract final class WidgetKeys {
  static const word = 'widget.word';
  static const citation = 'widget.citation';
  static const thread = 'widget.thread';
  static const forbidden = {
    'streak',
    'badge',
    'cta',
    'journeys',
    'chat',
  };
}
