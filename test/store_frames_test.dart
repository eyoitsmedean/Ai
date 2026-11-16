import 'dart:io';
import 'dart:ui' as ui;

// Flutter 3.50 deprecates this library toward package:material_ui, which is not in the SDK.
// ignore: deprecated_member_use
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:red_words/red_words/app.dart';
import 'package:red_words/red_words/moment/catalog.dart';
import 'package:red_words/red_words/moment/engine.dart';
import 'package:red_words/red_words/moment/models.dart';
import 'package:red_words/red_words/platform/session.dart';
import 'package:red_words/red_words/screens/chrome.dart';
import 'package:red_words/red_words/theme.dart';

/// Set with `flutter test --dart-define=STORE_SHOTS=true`.
const saveShots = bool.fromEnvironment('STORE_SHOTS');

MomentCatalog loadCatalog() =>
    MomentCatalog.parse(File('assets/moments/catalog.json').readAsStringSync());

final shotWhen = DateTime(2026, 11, 16, 8);

void main() {
  final frames = <_Frame>[
    _Frame('01-title', opened: false),
    _Frame('02-today', opened: true),
    _Frame('03-sit-rest', opened: true, sitRest: true),
    _Frame('04-seven', opened: true, open: 'Seven'),
    _Frame('05-seek', opened: true, open: 'Seek'),
    _Frame('06-bless', opened: true, open: 'Bless'),
  ];
  final sizes = <_Size>[
    _Size('ios-6.9', const Size(1290, 2796), 3),
    _Size('play-phone', const Size(1080, 1920), 3),
  ];

  for (final size in sizes) {
    for (final frame in frames) {
      testWidgets('${size.dir} ${frame.name}', (tester) async {
        await _shoot(tester, size, frame);
      });
    }
  }

  testWidgets('play feature graphic', (tester) async {
    const size = _Size('play-feature', Size(1024, 500), 1);
    tester.view.physicalSize = size.physical;
    tester.view.devicePixelRatio = size.dpr;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    final moment = MomentEngine(loadCatalog()).forDate(shotWhen)!;
    final colors = RedWordsColors.ordinary;
    await tester.pumpWidget(
      SizedBox.expand(
        child: RepaintBoundary(
          key: const Key('store-frame'),
          child: PaperScope(
            colors: colors,
            season: const ChurchSeason(
              id: 'ordinary',
              name: 'Ordinary Time',
              runningHead: 'Ordinary',
            ),
            child: Directionality(
              textDirection: TextDirection.ltr,
              child: ColoredBox(
                color: colors.paper,
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 48,
                    vertical: 28,
                  ),
                  child: Row(
                    children: [
                      const PrinterMark(size: 72),
                      const SizedBox(width: 36),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              'Red Words',
                              style: TextStyle(
                                fontFamily: 'RedWordsSerif',
                                fontSize: 28,
                                color: colors.ink,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'His words, for this moment.',
                              style: TextStyle(
                                fontFamily: 'RedWordsSerif',
                                fontStyle: FontStyle.italic,
                                fontSize: 16,
                                color: colors.crimson,
                              ),
                            ),
                            const SizedBox(height: 14),
                            Text(
                              moment.word.text,
                              maxLines: 3,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontFamily: 'RedWordsSerif',
                                fontStyle: FontStyle.italic,
                                fontSize: 18,
                                height: 1.35,
                                color: colors.crimson,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              '${moment.word.citation}  ·  KJV',
                              style: TextStyle(
                                letterSpacing: 1.1,
                                fontSize: 12,
                                color: colors.crimson,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
    await _write(tester, 'play-feature.png');
    expect(tester.takeException(), isNull);
  });
}

class _Frame {
  _Frame(this.name, {required this.opened, this.open, this.sitRest = false});
  final String name;
  final bool opened;
  final String? open;
  final bool sitRest;
}

class _Size {
  const _Size(this.dir, this.physical, this.dpr);
  final String dir;
  final Size physical;
  final double dpr;
}

Future<void> _shoot(WidgetTester tester, _Size size, _Frame frame) async {
  tester.view.physicalSize = size.physical;
  tester.view.devicePixelRatio = size.dpr;
  addTearDown(tester.view.resetPhysicalSize);
  addTearDown(tester.view.resetDevicePixelRatio);

  await tester.pumpWidget(
    SizedBox.expand(
      child: RepaintBoundary(
        key: const Key('store-frame'),
        child: RedWordsApp(
          catalog: loadCatalog(),
          now: shotWhen,
          session: SessionStore(opened: frame.opened),
          syncWidget: false,
        ),
      ),
    ),
  );
  await tester.pumpAndSettle();
  if (frame.sitRest) {
    await tester.tap(find.text('Sit'));
    await tester.pumpAndSettle();
    await tester.tap(find.widgetWithText(TextButton, 'Next'));
    await tester.pumpAndSettle();
    await tester.tap(find.widgetWithText(TextButton, 'Next'));
    await tester.pumpAndSettle();
    expect(find.byKey(const Key('sit-rest-word')), findsOneWidget);
  } else if (frame.open != null) {
    await tester.tap(find.text(frame.open!));
    await tester.pumpAndSettle();
  }
  expect(find.textContaining('988'), findsOneWidget);
  expect(tester.takeException(), isNull);
  await _write(tester, '${size.dir}/${frame.name}.png');
}

Future<void> _write(WidgetTester tester, String relative) async {
  final boundary = tester.renderObject<RenderRepaintBoundary>(
    find.byKey(const Key('store-frame')),
  );
  final image = await tester.runAsync(
    () => boundary.toImage(pixelRatio: tester.view.devicePixelRatio),
  );
  final logical = tester.view.physicalSize / tester.view.devicePixelRatio;
  expect(image!.width, (logical.width * tester.view.devicePixelRatio).round());
  expect(image.height, (logical.height * tester.view.devicePixelRatio).round());
  if (saveShots) {
    final bytes = await tester.runAsync(
      () => image.toByteData(format: ui.ImageByteFormat.png),
    );
    final file = File('docs/store/$relative');
    file.parent.createSync(recursive: true);
    file.writeAsBytesSync(bytes!.buffer.asUint8List());
  }
  image.dispose();
}
