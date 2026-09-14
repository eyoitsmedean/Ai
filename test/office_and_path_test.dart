import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:red_words/red_words/app.dart';
import 'package:red_words/red_words/moment/catalog.dart';
import 'package:red_words/red_words/moment/models.dart';
import 'package:red_words/red_words/moment/office.dart';
import 'package:red_words/red_words/platform/session.dart';
import 'package:red_words/red_words/screens/pages.dart';
import 'package:red_words/red_words/theme.dart';

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
    expect(catchword('Lo, I am with you always'), 'always');
    expect(
      catchword(
        'These things I have spoken unto you, that in me ye might have peace.',
      ),
      'peace',
    );
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

  testWidgets('vespers prompt uses the injected clock, not the wall clock', (tester) async {
    await tester.pumpWidget(
      RedWordsApp(
        catalog: catalog(),
        now: DateTime(2026, 9, 2, 17),
        session: SessionStore(opened: true),
        syncWidget: false,
      ),
    );
    await tester.pumpAndSettle();
    expect(find.byKey(const Key('today-office')), findsOneWidget);
    expect(find.text('Vespers'), findsOneWidget);
    expect(find.text('Whom will you forgive before sleep?'), findsOneWidget);
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
    await tester.tap(find.text('Next'));
    await tester.pump();
    expect(find.byKey(const Key('sit-rest-word')), findsOneWidget);
    expect(find.byKey(const Key('sit-rest-ready')), findsNothing);
    expect(find.text('60'), findsNothing);
    expect(find.text('59'), findsNothing);
    await tester.pump(const Duration(seconds: 60));
    expect(find.byKey(const Key('sit-rest-ready')), findsOneWidget);
    expect(find.text('0'), findsNothing);
    await tester.tap(find.text('Next'));
    await tester.pumpAndSettle();
    expect(find.byKey(const Key('sit-reply')), findsOneWidget);
    await tester.enterText(find.byKey(const Key('sit-reply')), 'I will not carry Tuesday on Monday.');
    await tester.tap(find.text('Amen'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Sit'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Next'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Next'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Next'));
    await tester.pumpAndSettle();
    expect(find.text('I will not carry Tuesday on Monday.'), findsOneWidget);
  });

  test('blessing share is the Word, never the brand', () {
    final text = BlessingShare.body(
      word: 'Peace I leave with you',
      citation: 'John 14:27',
    );
    expect(text, 'Peace I leave with you\n\nJohn 14:27  ·  KJV');
    expect(text.toLowerCase().contains('red words'), isFalse);
    expect(text.toLowerCase().contains('streak'), isFalse);
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

  testWidgets('About carries the rights line and the privacy statement in-app', (tester) async {
    await tester.pumpWidget(
      RedWordsApp(
        catalog: catalog(),
        now: DateTime(2026, 9, 2, 8),
        session: SessionStore(opened: true),
        syncWidget: false,
      ),
    );
    await tester.pumpAndSettle();
    await tester.tap(find.text('About'));
    await tester.pumpAndSettle();
    expect(find.byKey(const Key('about-rights')), findsOneWidget);
    expect(find.textContaining('Cambridge University Press'), findsOneWidget);
    expect(find.byKey(const Key('about-privacy')), findsOneWidget);
    expect(find.textContaining('collects nothing'), findsOneWidget);
    expect(find.textContaining('no network'), findsNothing);
    expect(find.byKey(const Key('about-lectio')), findsOneWidget);
    await tester.scrollUntilVisible(find.textContaining('988'), 240);
    expect(find.textContaining('988'), findsOneWidget);
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

  test('evening paper is a lamp, never a black slab', () {
    const ordinary = ChurchSeason(id: 'ordinary', name: 'Ordinary Time', runningHead: 'Ordinary Time');
    const lent = ChurchSeason(id: 'lent', name: 'Lent', runningHead: 'Lent');
    final morning = RedWordsColors.forHour(ordinary, evening: false);
    final vespers = RedWordsColors.forHour(ordinary, evening: true);
    final lentLamp = RedWordsColors.forHour(lent, evening: true);
    expect(morning.paper, RedWordsColors.ordinary.paper);
    expect(vespers.paper, RedWordsColors.lampPaper);
    expect(vespers.paper, isNot(morning.paper));
    expect(vespers.paper.computeLuminance(), greaterThan(0.5));
    expect(vespers.crimson, morning.crimson);
    expect(lentLamp.crimson, RedWordsColors.lent.crimson);
    expect(lentLamp.paper, RedWordsColors.lampPaper);
    expect(const Color(0xFF000000).computeLuminance(), lessThan(0.01));
  });

  testWidgets('vespers leaf wears lamp paper, not a black slab', (tester) async {
    await tester.pumpWidget(
      RedWordsApp(
        catalog: catalog(),
        now: DateTime(2026, 9, 2, 21),
        session: SessionStore(opened: true),
        syncWidget: false,
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('Compline'), findsOneWidget);
    final scaffold = tester.widget<Scaffold>(find.byType(Scaffold).first);
    expect(scaffold.backgroundColor, RedWordsColors.lampPaper);
    expect(scaffold.backgroundColor!.computeLuminance(), greaterThan(0.5));
  });

  testWidgets('Seven ribbon bead opens that day', (tester) async {
    PathDay? opened;
    await tester.pumpWidget(
      PaperScope(
        colors: RedWordsColors.ordinary,
        season: const ChurchSeason(id: 'ordinary', name: 'Ordinary Time', runningHead: 'Ordinary Time'),
        child: MaterialApp(
          home: Scaffold(
            body: SevenRibbon(
              days: catalog().seven,
              onOpenDay: (day) => opened = day,
            ),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();
    expect(
      find.descendant(of: find.byKey(const Key('seven-bead-Come')), matching: find.text('C')),
      findsOneWidget,
    );
    expect(
      find.descendant(of: find.byKey(const Key('seven-bead-Peace')), matching: find.text('P')),
      findsOneWidget,
    );
    await tester.tap(find.byKey(const Key('seven-bead-Come')));
    await tester.pumpAndSettle();
    expect(opened?.title, 'Come');
    expect(opened?.word.citation, contains('Matthew 11:28'));
  });

  testWidgets('ribbon from Today returns to Today', (tester) async {
    await tester.pumpWidget(
      RedWordsApp(
        catalog: catalog(),
        now: DateTime(2026, 9, 2, 8),
        session: SessionStore(opened: true),
        syncWidget: false,
      ),
    );
    await tester.pumpAndSettle();
    expect(find.byKey(const Key('seven-bead-Come')), findsOneWidget);
    await tester.tap(find.byKey(const Key('seven-bead-Come')));
    await tester.pumpAndSettle();
    expect(find.byKey(const Key('path-day')), findsOneWidget);
    expect(find.textContaining('Matthew 11:28'), findsWidgets);
    await tester.tap(find.text('Back'));
    await tester.pumpAndSettle();
    expect(find.byKey(const Key('today-word')), findsOneWidget);
    expect(find.byKey(const Key('path-day')), findsNothing);
    expect(find.text('One room a morning. A missed day is never a failure.'), findsNothing);
  });

  testWidgets('Seven list Back stays in Seven', (tester) async {
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
    await tester.tap(find.text('Come'));
    await tester.pumpAndSettle();
    expect(find.byKey(const Key('path-day')), findsOneWidget);
    await tester.tap(find.text('Back'));
    await tester.pumpAndSettle();
    expect(find.text('One room a morning. A missed day is never a failure.'), findsOneWidget);
    expect(find.byKey(const Key('today-word')), findsNothing);
  });
}
