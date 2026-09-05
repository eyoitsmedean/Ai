import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:red_words/red_words/app.dart';
import 'package:red_words/red_words/moment/catalog.dart';
import 'package:red_words/red_words/moment/office.dart';
import 'package:red_words/red_words/platform/session.dart';

MomentCatalog catalog() =>
    MomentCatalog.parse(File('assets/moments/catalog.json').readAsStringSync());

void main() {
  test('office clock matches the Quiet Page', () {
    expect(DailyOffice.at(DateTime(2026, 9, 2, 8)).name, 'Morning');
    expect(DailyOffice.at(DateTime(2026, 9, 2, 14)).name, 'Afternoon');
    expect(DailyOffice.at(DateTime(2026, 9, 2, 17)).name, 'Vespers');
    expect(DailyOffice.at(DateTime(2026, 9, 2, 21)).name, 'Compline');
    expect(DailyOffice.at(DateTime(2026, 9, 2, 5)).name, 'Compline');
    expect(DailyOffice.at(DateTime(2026, 9, 2, 17)).isEvening, isTrue);
    expect(DailyOffice.at(DateTime(2026, 9, 2, 8)).isEvening, isFalse);
  });

  test('catchword is a real word from the sentence', () {
    expect(catchword('Peace I leave with you'), 'Peace');
    expect(catchword('Lo, I am with you always'), 'with');
  });

  test('Seven Days are seven locked Gospel rooms', () {
    final seven = catalog().seven;
    expect(seven.map((d) => d.title).toList(),
        ['Come', 'Peace', 'Light', 'Love', 'Forgive', 'Abide', 'Go']);
    for (final day in seven) {
      final locked = catalog().lockPath(day);
      expect(locked, isNotNull);
      expect(locked!.word.text, day.word.text);
      expect(catalog().lookup(day.word.citation), isNotNull);
    }
  });

  testWidgets('lectio starts on Read with the Word', (tester) async {
    await tester.pumpWidget(
      RedWordsApp(
        catalog: catalog(),
        now: DateTime(2026, 9, 2, 8),
        session: SessionStore(opened: true),
        syncWidget: false,
      ),
    );
    await tester.pumpAndSettle();
    expect(find.byKey(const Key('today-office')), findsOneWidget);
    expect(find.text('Morning'), findsOneWidget);
    await tester.tap(find.text('Sit'));
    await tester.pumpAndSettle();
    expect(find.byKey(const Key('sit-word')), findsOneWidget);
    expect(find.text('Read'), findsWidgets);
    await tester.tap(find.text('Next'));
    await tester.pumpAndSettle();
    expect(find.text('Reflect'), findsWidgets);
  });

  testWidgets('blessing card is the Word, not the brand', (tester) async {
    await tester.pumpWidget(
      RedWordsApp(
        catalog: catalog(),
        now: DateTime(2026, 9, 2, 8),
        session: SessionStore(opened: true),
        syncWidget: false,
      ),
    );
    await tester.pumpAndSettle();
    await tester.tap(find.text('Bless'));
    await tester.pumpAndSettle();
    expect(find.byKey(const Key('blessing-card')), findsOneWidget);
    final card = tester.widget<Container>(find.byKey(const Key('blessing-card')));
    expect(card.child, isNotNull);
    expect(find.descendant(of: find.byKey(const Key('blessing-card')), matching: find.textContaining('Red Words')),
        findsNothing);
  });

  testWidgets('Seven Days opens Come without shame chrome', (tester) async {
    await tester.pumpWidget(
      RedWordsApp(
        catalog: catalog(),
        now: DateTime(2026, 9, 2, 8),
        session: SessionStore(opened: true),
        syncWidget: false,
      ),
    );
    await tester.pumpAndSettle();
    await tester.tap(find.text('Seven'));
    await tester.pumpAndSettle();
    expect(find.text('Come'), findsWidgets);
    expect(find.textContaining('streak'), findsNothing);
    await tester.tap(find.text('Come'));
    await tester.pumpAndSettle();
    expect(find.textContaining('Matthew 11:28'), findsWidgets);
  });
}
