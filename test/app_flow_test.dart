import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:red_words/red_words/app.dart';
import 'package:red_words/red_words/moment/catalog.dart';
import 'package:red_words/red_words/platform/session.dart';

MomentCatalog catalog() =>
    MomentCatalog.parse(File('assets/moments/catalog.json').readAsStringSync());

void main() {
  testWidgets('first-open shows the title leaf, not a verse', (tester) async {
    await tester.pumpWidget(
      RedWordsApp(
        catalog: catalog(),
        now: DateTime(2026, 9, 2),
        session: SessionStore(opened: false),
        syncWidget: false,
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('His words, for this moment.'), findsOneWidget);
    expect(find.text('Turn the page'), findsOneWidget);
    expect(find.byKey(const Key('today-word')), findsNothing);
  });

  testWidgets('turning the page opens Today with a locked Word', (tester) async {
    await tester.pumpWidget(
      RedWordsApp(
        catalog: catalog(),
        now: DateTime(2026, 9, 2),
        session: SessionStore(opened: false),
        syncWidget: false,
      ),
    );
    await tester.pumpAndSettle();
    await tester.tap(find.text('Turn the page'));
    await tester.pumpAndSettle();
    expect(find.byKey(const Key('today-word')), findsOneWidget);
    expect(find.byKey(const Key('today-citation')), findsOneWidget);
    expect(find.textContaining('streak'), findsNothing);
    expect(find.textContaining('Roumie'), findsNothing);
  });

  testWidgets('redwords://today skips the title leaf', (tester) async {
    await tester.pumpWidget(
      RedWordsApp(
        catalog: catalog(),
        now: DateTime(2026, 9, 2),
        session: SessionStore(opened: false),
        initialLink: 'redwords://today',
        syncWidget: false,
      ),
    );
    await tester.pumpAndSettle();
    expect(find.byKey(const Key('today-word')), findsOneWidget);
    expect(find.text('Turn the page'), findsNothing);
  });

  testWidgets('empty catalog is an honest blank page', (tester) async {
    await tester.pumpWidget(
      RedWordsApp(
        catalog: MomentCatalog(daily: const [], themes: const {}, verses: const {}),
        session: SessionStore(opened: true),
        syncWidget: false,
      ),
    );
    await tester.pumpAndSettle();
    expect(find.byKey(const Key('empty-state')), findsOneWidget);
    expect(find.textContaining('Nothing has been invented'), findsOneWidget);
    expect(find.byKey(const Key('today-word')), findsNothing);
  });

  testWidgets('Sit and Seek stay on corpus rooms', (tester) async {
    await tester.pumpWidget(
      RedWordsApp(
        catalog: catalog(),
        now: DateTime(2026, 9, 2),
        session: SessionStore(opened: true),
        syncWidget: false,
      ),
    );
    await tester.pumpAndSettle();
    await tester.tap(find.text('Sit'));
    await tester.pumpAndSettle();
    expect(find.byKey(const Key('sit-word')), findsOneWidget);
    await tester.tap(find.text('Back'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Seek'));
    await tester.pumpAndSettle();
    expect(find.text('Anxiety & Worry'), findsOneWidget);
    await tester.tap(find.text('Anxiety & Worry'));
    await tester.pumpAndSettle();
    expect(find.textContaining('Matthew 6:34'), findsWidgets);
  });

  testWidgets('offline path does not require a network', (tester) async {
    await tester.pumpWidget(
      RedWordsApp(
        catalog: catalog(),
        now: DateTime(2026, 9, 2),
        session: SessionStore(opened: true),
        syncWidget: false,
      ),
    );
    await tester.pumpAndSettle();
    expect(find.byKey(const Key('today-word')), findsOneWidget);
  });
}
