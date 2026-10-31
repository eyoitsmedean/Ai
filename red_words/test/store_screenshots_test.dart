import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:red_words/brand.dart';
import 'package:red_words/engine/moment.dart';
import 'package:red_words/engine/pack.dart';
import 'package:red_words/engine/privacy.dart';
import 'package:red_words/engine/retrieve.dart';
import 'package:red_words/ui/saying_view.dart';

import 'support/store_capture.dart';
import 'support/store_frame.dart';

/// Gate E store shots, generated from the running UI. Not a second product.
void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  final pack = ScripturePack.parse(File('assets/sayings.json').readAsStringSync());
  final written = <String>[];

  setUpAll(loadStoreFonts);
  setUp(mockWidgetChannel);

  Future<void> shot(
    WidgetTester tester,
    StoreViewport view,
    String sceneId,
  ) async {
    final file = await captureStorePng(
      tester,
      viewportId: view.id,
      sceneId: sceneId,
      pixelRatio: view.pixelRatio,
    );
    expect(file.existsSync(), isTrue, reason: file.path);
    expect(file.lengthSync(), greaterThan(8000), reason: '${file.path} too small');
    written.add(file.path);
  }

  for (final view in storeViewports) {
    testWidgets('${view.id} 01 today Matthew 6:34', (tester) async {
      await pumpStoreApp(tester, viewport: view, pack: pack);
      expect(find.textContaining('don’t be anxious for tomorrow'), findsOneWidget);
      expect(find.textContaining('MATTHEW 6:34'), findsOneWidget);
      expect(find.byKey(const Key('saying-knot')), findsOneWidget);
      expect(find.text('Journeys'), findsNothing);
      expect(find.text('Sit'), findsNothing);
      expect(find.text('Seek'), findsNothing);
      await shot(tester, view, '01_today');
    });

    testWidgets('${view.id} 02 one honest step', (tester) async {
      await pumpStoreApp(tester, viewport: view, pack: pack);
      await tester.tap(find.byKey(const Key('open-step')));
      await tester.pumpAndSettle();
      expect(find.byKey(const Key('step-title')), findsOneWidget);
      expect(find.byKey(const Key('ill-do-this')), findsOneWidget);
      expect(find.textContaining('Name one thing'), findsOneWidget);
      await shot(tester, view, '02_one_honest_step');
    });

    testWidgets('${view.id} 03 ask retrieve peace', (tester) async {
      final result = AskRetriever(pack).ask('I need peace');
      expect(result.retrieved, isTrue);
      await pumpAskPoster(
        tester,
        viewport: view,
        query: 'I need peace',
        body: SayingView(
          saying: result.saying!,
          dark: false,
          chips: result.chips,
        ),
      );
      expect(find.textContaining(result.saying!.word.substring(0, 12)), findsOneWidget);
      await shot(tester, view, '03_ask_retrieve');
    });

    testWidgets('${view.id} 04 ask stay recipe', (tester) async {
      const query = 'how do I caramelize onions for pasta night';
      final result = AskRetriever(pack).ask(query);
      expect(result.kind, AskKind.stay);
      await pumpAskPoster(
        tester,
        viewport: view,
        query: query,
        body: Text(
          result.message,
          key: const Key('ask-stay'),
          style: const TextStyle(height: 1.45, color: Brand.ink),
        ),
      );
      expect(find.text(result.message), findsOneWidget);
      await shot(tester, view, '04_ask_stay');
    });

    testWidgets('${view.id} 05 saved empty', (tester) async {
      await pumpStoreApp(tester, viewport: view, pack: pack);
      await tester.tap(find.text('Saved'));
      await tester.pumpAndSettle();
      expect(find.byKey(const Key('saved-empty')), findsOneWidget);
      expect(find.text('Nothing kept yet.'), findsOneWidget);
      await shot(tester, view, '05_saved_empty');
    });

    testWidgets('${view.id} 06 saved one', (tester) async {
      await pumpStoreApp(
        tester,
        viewport: view,
        pack: pack,
        memory: LocalMemory(
          seenFirstLaunch: true,
          lastSayingId: Brand.firstSayingId,
          savedIds: const [Brand.firstSayingId],
        ),
      );
      await tester.tap(find.text('Saved'));
      await tester.pumpAndSettle();
      expect(find.text('Nothing kept yet.'), findsNothing);
      expect(find.textContaining('MATTHEW 6:34'), findsOneWidget);
      await shot(tester, view, '06_saved_one');
    });

    testWidgets('${view.id} 07 settings privacy 988', (tester) async {
      await pumpStoreApp(
        tester,
        viewport: view,
        pack: pack,
        memory: const LocalMemory(
          seenFirstLaunch: true,
          lastSayingId: Brand.firstSayingId,
          darkSaying: true,
        ),
      );
      await tester.tap(find.text('Settings'));
      await tester.pumpAndSettle();
      expect(find.byKey(const Key('privacy-title')), findsOneWidget);
      expect(find.text(PrivacyNotice.body), findsOneWidget);
      expect(find.byKey(const Key('crisis-988')), findsOneWidget);
      expect(find.byKey(const Key('dark-saying')), findsOneWidget);
      await shot(tester, view, '07_settings');
    });

    testWidgets('${view.id} 08 home widget', (tester) async {
      final saying = pack.first;
      await pumpStoreApp(
        tester,
        viewport: view,
        pack: pack,
        home: HomeWidgetPoster(
          word: saying.word,
          citation: saying.citationCaps,
        ),
      );
      expect(find.textContaining('don’t be anxious for tomorrow'), findsOneWidget);
      expect(find.textContaining('MATTHEW 6:34'), findsOneWidget);
      expect(find.byKey(const Key('widget-thread')), findsOneWidget);
      expect(find.textContaining('streak'), findsNothing);
      expect(find.textContaining('Keep'), findsNothing);
      await shot(tester, view, '08_home_widget');
    });
  }

  tearDownAll(() {
    if (written.isEmpty) return;
    _writeGallery(written);
    expect(File('store/index.html').existsSync(), isTrue);
  });
}

void _writeGallery(List<String> paths) {
  final cards = paths.map((path) {
    final name = path.split('/').last;
    return '''
    <figure>
      <img src="screenshots/$name" alt="$name" />
      <figcaption>$name</figcaption>
    </figure>''';
  }).join('\n');
  File('store/index.html').writeAsStringSync('''
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Red Words — store shots</title>
  <style>
    body { font-family: Georgia, serif; background: #F6F0E6; color: #2A2420; margin: 0; padding: 2rem 1.25rem 4rem; }
    h1 { font-weight: 400; color: #8C1C24; }
    .muted { color: #7A6E5E; max-width: 40rem; line-height: 1.5; }
    section { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.25rem; margin-top: 2rem; }
    figure { margin: 0; background: #fff; padding: 0.6rem; border-radius: 8px; }
    img { width: 100%; height: auto; display: block; }
    figcaption { font-family: sans-serif; font-size: 0.75rem; margin-top: 0.4rem; color: #7A6E5E; word-break: break-all; }
  </style>
</head>
<body>
  <h1>Red Words — store shots</h1>
  <p class="muted">Generated from the running Flutter UI on 2026-10-31. Open this file locally. These are listing previews, not a substitute for device photography Apple or Play may still want.</p>
  <section>
$cards
  </section>
</body>
</html>
''');
}
