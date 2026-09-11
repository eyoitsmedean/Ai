import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:red_words/red_words/app.dart';
import 'package:red_words/red_words/moment/catalog.dart';
import 'package:red_words/red_words/moment/engine.dart';
import 'package:red_words/red_words/moment/models.dart';
import 'package:red_words/red_words/moment/widget_contract.dart';
import 'package:red_words/red_words/platform/session.dart';

MomentCatalog catalog() =>
    MomentCatalog.parse(File('assets/moments/catalog.json').readAsStringSync());

void main() {
  group('widget store carries the whole locked rotation', () {
    test('rotation has one Word-only card per daily slot, in slot order', () {
      final engine = MomentEngine(catalog());
      final store = engine.widgetStoreFor(DateTime(2026, 9, 2, 8))!;
      expect(store.rotation.length, catalog().daily.length);
      final decoded = jsonDecode(store.rotationJson()) as List;
      for (var i = 0; i < decoded.length; i++) {
        final entry = decoded[i] as Map<String, dynamic>;
        expect(entry.keys.toSet(), {'word', 'citation'});
        expect(entry['word'], catalog().daily[i].word.text);
        expect(entry['citation'], catalog().daily[i].word.citation);
      }
      expect(store.toMap().keys.toSet(), WidgetStore.allowedKeys);
    });

    test('slot formula agrees with the engine for Kid\'s Day and the folio day', () {
      final engine = MomentEngine(catalog());
      for (final date in [DateTime(2026, 9, 2), DateTime(2026, 9, 5), DateTime(2026, 12, 25)]) {
        final idx = WidgetStore.slotFor(date, catalog().daily.length);
        expect(idx, dailyIndexFor(date, catalog().daily.length));
        final store = engine.widgetStoreFor(date)!;
        expect(store.rotation[idx].citation, store.today.citation);
        expect(store.rotation[idx].word, engine.forDate(date)!.word.text);
      }
    });

    test('every midnight for a fortnight lands on a locked Word', () {
      final engine = MomentEngine(catalog());
      final store = engine.widgetStoreFor(DateTime(2026, 9, 5))!;
      for (var d = 0; d < 14; d++) {
        final day = DateTime(2026, 9, 5 + d);
        final slot = store.rotation[WidgetStore.slotFor(day, store.rotation.length)];
        expect(catalog().lookup(slot.citation)!.text, slot.word);
        expect(slot.word, engine.forDate(day)!.word.text);
      }
    });

    test('empty catalog yields no store, never a fabricated card', () {
      final engine = MomentEngine(
        MomentCatalog(daily: const [], themes: const {}, verses: const {}),
      );
      expect(engine.widgetStoreFor(DateTime(2026, 9, 5)), isNull);
    });

    test('a slot whose citation is not in the verse lock is refused', () {
      final base = catalog();
      final forged = MomentCatalog(
        daily: [
          ...base.daily,
          DailyMoment(
            theme: 'Forged',
            title: 'Forged',
            word: const Saying(citation: 'Romans 8:28', text: 'Not His words.'),
            reflection: '',
          ),
        ],
        themes: base.themes,
        verses: base.verses,
      );
      expect(MomentEngine(forged).widgetStoreFor(DateTime(2026, 9, 5)), isNull);
    });

    test('rotation cards obey the craft law', () {
      final store = MomentEngine(catalog()).widgetStoreFor(DateTime(2026, 9, 5))!;
      expect(store.rotationJson().toLowerCase().contains('red words'), isFalse);
      expect(store.rotationJson().contains('streak'), isFalse);
      expect(() => store.assertCraftLaw(), returnsNormally);
    });
  });

  group('a widget tap while the book is open turns to Today', () {
    testWidgets('resume with redwords://today pending routes from Seek', (tester) async {
      String? pending;
      await tester.pumpWidget(
        RedWordsApp(
          catalog: catalog(),
          now: DateTime(2026, 9, 2, 8),
          session: SessionStore(opened: true),
          pendingLink: () async {
            final link = pending;
            pending = null;
            return link;
          },
          syncWidget: false,
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Seek'));
      await tester.pumpAndSettle();
      expect(find.text('Anxiety & Worry'), findsOneWidget);

      pending = 'redwords://today';
      tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.resumed);
      await tester.pumpAndSettle();

      expect(find.byKey(const Key('today-word')), findsOneWidget);
      expect(find.text('Anxiety & Worry'), findsNothing);
      expect(pending, isNull, reason: 'the link is consumed once');
    });

    testWidgets('resume with nothing pending leaves the reader where they were', (tester) async {
      await tester.pumpWidget(
        RedWordsApp(
          catalog: catalog(),
          now: DateTime(2026, 9, 2, 8),
          session: SessionStore(opened: true),
          pendingLink: () async => null,
          syncWidget: false,
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Sit'));
      await tester.pumpAndSettle();
      tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.resumed);
      await tester.pumpAndSettle();
      expect(find.byKey(const Key('sit-word')), findsOneWidget);
    });

    testWidgets('a foreign scheme is ignored', (tester) async {
      await tester.pumpWidget(
        RedWordsApp(
          catalog: catalog(),
          now: DateTime(2026, 9, 2, 8),
          session: SessionStore(opened: true),
          pendingLink: () async => 'https://example.com/today',
          syncWidget: false,
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('About'));
      await tester.pumpAndSettle();
      tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.resumed);
      await tester.pumpAndSettle();
      expect(find.text('Back'), findsOneWidget);
      expect(find.byKey(const Key('today-word')), findsNothing);
    });
  });
}
