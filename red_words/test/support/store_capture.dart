import 'dart:io';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:red_words/brand.dart';
import 'package:red_words/engine/moment.dart';
import 'package:red_words/engine/pack.dart';
import 'package:red_words/engine/widget_bridge.dart';
import 'package:red_words/store/local_store.dart';
import 'package:red_words/ui/shell.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'store_frame.dart';

class SeededStore extends LocalStore {
  SeededStore(this.seed);
  final LocalMemory seed;

  @override
  Future<LocalMemory> read() async => seed;

  @override
  Future<void> write(LocalMemory memory, widget) async {}
}

class StoreViewport {
  const StoreViewport({
    required this.id,
    required this.size,
    required this.pixelRatio,
    required this.phoneChrome,
  });

  final String id;
  final Size size;
  final double pixelRatio;
  final bool phoneChrome;
}

const storeViewports = [
  StoreViewport(
    id: 'ios67',
    size: Size(430, 932),
    pixelRatio: 3,
    phoneChrome: true,
  ),
  StoreViewport(
    id: 'android',
    size: Size(360, 800),
    pixelRatio: 3,
    phoneChrome: true,
  ),
  StoreViewport(
    id: 'tablet',
    size: Size(800, 1280),
    pixelRatio: 2,
    phoneChrome: false,
  ),
];

final defaultMemory = LocalMemory(
  seenFirstLaunch: true,
  lastSayingId: Brand.firstSayingId,
);

ThemeData storeTheme() {
  return ThemeData(
    useMaterial3: true,
    scaffoldBackgroundColor: Brand.paper,
    colorScheme: ColorScheme.fromSeed(
      seedColor: Brand.crimson,
      surface: Brand.paper,
      brightness: Brightness.light,
    ),
    navigationBarTheme: const NavigationBarThemeData(
      backgroundColor: Brand.paper,
      indicatorColor: Color(0x22000000),
    ),
  );
}

void mockWidgetChannel() {
  TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
      .setMockMethodCallHandler(WidgetBridge.channel, (call) async => null);
}

Future<void> pumpStoreApp(
  WidgetTester tester, {
  required StoreViewport viewport,
  required ScripturePack pack,
  LocalMemory? memory,
  Widget? home,
}) async {
  SharedPreferences.setMockInitialValues({});
  await tester.binding.setSurfaceSize(viewport.size);
  addTearDown(() => tester.binding.setSurfaceSize(null));
  tester.view.physicalSize = viewport.size * viewport.pixelRatio;
  tester.view.devicePixelRatio = viewport.pixelRatio;
  addTearDown(tester.view.resetPhysicalSize);
  addTearDown(tester.view.resetDevicePixelRatio);

  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        packProvider.overrideWith((ref) async => pack),
        storeProvider.overrideWithValue(SeededStore(memory ?? defaultMemory)),
      ],
      child: RepaintBoundary(
        key: const Key('store-capture'),
        child: MaterialApp(
          title: Brand.name,
          debugShowCheckedModeBanner: false,
          theme: storeTheme(),
          home: StoreFrame(
            phoneChrome: viewport.phoneChrome,
            child: home ?? const AppShell(),
          ),
        ),
      ),
    ),
  );
  await tester.pumpAndSettle();
}

Future<File> captureStorePng(
  WidgetTester tester, {
  required String viewportId,
  required String sceneId,
  required double pixelRatio,
}) async {
  final dir = Directory('store/screenshots');
  dir.createSync(recursive: true);
  final file = File('${dir.path}/${viewportId}_$sceneId.png');
  await tester.runAsync(() async {
    final boundary = tester.renderObject<RenderRepaintBoundary>(
      find.byKey(const Key('store-capture')),
    );
    final image = await boundary.toImage(pixelRatio: pixelRatio);
    final bytes = await image.toByteData(format: ui.ImageByteFormat.png);
    if (bytes == null) {
      throw StateError('PNG encode failed for $sceneId');
    }
    file.writeAsBytesSync(bytes.buffer.asUint8List());
    image.dispose();
  });
  return file;
}
