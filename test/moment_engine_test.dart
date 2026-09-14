import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:red_words/red_words/moment/catalog.dart';
import 'package:red_words/red_words/moment/church_year.dart';
import 'package:red_words/red_words/moment/engine.dart';
import 'package:red_words/red_words/moment/widget_contract.dart';

MomentCatalog loadCatalog() {
  return MomentCatalog.parse(File('assets/moments/catalog.json').readAsStringSync());
}

void main() {
  final catalog = loadCatalog();
  final engine = MomentEngine(catalog);
  final goldens = jsonDecode(File('test/goldens/moments.json').readAsStringSync())
      as Map<String, dynamic>;

  test('catalog is non-empty and every verse is locked', () {
    expect(catalog.daily, isNotEmpty);
    expect(catalog.verses, isNotEmpty);
    for (final slot in catalog.daily) {
      expect(catalog.lookup(slot.word.citation)?.text, slot.word.text);
      expect(slot.word.text.contains('Jesus said'), isFalse);
    }
  });

  test('daily index matches the Node room for 400 days', () {
    final days = goldens['daily'] as List<dynamic>;
    expect(days.length, greaterThan(300));
    for (final row in days) {
      final map = row as Map<String, dynamic>;
      final parts = (map['date'] as String).split('-');
      final date = DateTime(
        int.parse(parts[0]),
        int.parse(parts[1]),
        int.parse(parts[2]),
      );
      final moment = engine.forDate(date);
      expect(moment, isNotNull, reason: map['date'] as String);
      final word = map['word'] as Map<String, dynamic>;
      expect(moment!.word.citation, word['verse']);
      expect(moment.word.text, word['passage']);
      expect(engine.seasonOn(date).id, map['season']);
    }
  });

  test('church year fixtures match lib/year.js', () {
    expect(ymd(easterSunday(2025)), 20250420);
    expect(ymd(easterSunday(2026)), 20260405);
    expect(ymd(easterSunday(2027)), 20270328);
    expect(ymd(adventSunday(2025)), 20251130);
    expect(ymd(adventSunday(2026)), 20261129);
    expect(ymd(adventSunday(2027)), 20271128);
    expect(ymd(ashWednesday(2026)), 20260218);
    expect(ymd(pentecost(2026)), 20260524);
    expect(churchYear(DateTime(2026, 11, 29)).id, 'advent');
    expect(churchYear(DateTime(2026, 12, 24)).id, 'advent');
    expect(churchYear(DateTime(2026, 12, 25)).id, 'christmas');
    expect(churchYear(DateTime(2026, 1, 3)).id, 'christmas');
    expect(churchYear(DateTime(2026, 1, 10)).id, 'ordinary');
    expect(churchYear(DateTime(2026, 2, 18)).id, 'lent');
    expect(churchYear(DateTime(2026, 4, 4)).id, 'lent');
    expect(churchYear(DateTime(2026, 4, 5)).id, 'easter');
    expect(churchYear(DateTime(2026, 5, 24)).id, 'easter');
    expect(churchYear(DateTime(2026, 6, 1)).id, 'ordinary');
    expect(churchYear(DateTime(2026, 12, 1)).runningHead, 'Advent');
    expect(churchYear(DateTime(2026, 7, 15)).name, 'Ordinary Time');
  });

  test('widget payload is Word only', () {
    final payload = engine.widgetFor(DateTime(2026, 9, 2));
    expect(payload, isNotNull);
    expect(payload!.toMap().keys, WidgetPayload.allowedKeys);
    payload.assertCraftLaw();
    expect(payload.word, isNotEmpty);
    expect(payload.citation, contains(':'));
  });

  test('empty catalog fails closed', () {
    final empty = MomentEngine(
      MomentCatalog(daily: const [], themes: const {}, verses: const {}),
    );
    expect(empty.today, isNull);
    expect(empty.widgetFor(DateTime(2026, 9, 2)), isNull);
  });

  test('unknown citation is not invented', () {
    expect(catalog.lookup('Romans 8:28'), isNull);
    expect(catalog.lookup('Psalm 23:1'), isNull);
  });

  test('deep link today is the only store scheme', () {
    expect(RedWordsLink.parse('https://example.com'), isNull);
    expect(RedWordsLink.isToday(RedWordsLink.parse('redwords://today')), isTrue);
    expect(RedWordsLink.isToday(RedWordsLink.parse('redwords://today/')), isTrue);
    expect(RedWordsLink.parse('redwords://else')?.scheme, 'redwords');
    expect(RedWordsLink.isToday(RedWordsLink.parse('redwords://else')), isFalse);
  });
}
