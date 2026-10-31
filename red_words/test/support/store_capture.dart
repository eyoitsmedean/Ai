import 'dart:io';
import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
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
  // iPhone Dynamic Island, large. Apple accepts 1290×2796.
  StoreViewport(
    id: 'ios67',
    size: Size(430, 932),
    pixelRatio: 3,
    phoneChrome: true,
  ),
  // iPhone Dynamic Island, medium. Required set: 1179×2556.
  StoreViewport(
    id: 'ios61',
    size: Size(393, 852),
    pixelRatio: 3,
    phoneChrome: true,
  ),
  // iPad 13" slot accepts 2048×2732. App target family is iPhone and iPad.
  StoreViewport(
    id: 'ipad',
    size: Size(1024, 1366),
    pixelRatio: 2,
    phoneChrome: false,
  ),
  // Play phone, 9:16. 1080×1920 is the recommended portrait size.
  StoreViewport(
    id: 'play',
    size: Size(360, 640),
    pixelRatio: 3,
    phoneChrome: true,
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

Future<void> loadStoreFonts() async {
  Future<void> loadFamily(String family, String filename) async {
    final loader = FontLoader(family);
    final bytes = File('store/fonts/$filename').readAsBytesSync();
    loader.addFont(Future.value(ByteData.sublistView(bytes)));
    await loader.load();
  }

  await loadFamily('serif', 'LiberationSerif-Regular.ttf');
  await loadFamily('sans-serif', 'LiberationSans-Regular.ttf');
  await loadFamily('Roboto', 'LiberationSans-Regular.ttf');

  var dir = File(Platform.resolvedExecutable).parent;
  File? icons;
  for (var i = 0; i < 8; i++) {
    final candidate = File(
      '${dir.path}/artifacts/material_fonts/MaterialIcons-Regular.otf',
    );
    if (candidate.existsSync()) {
      icons = candidate;
      break;
    }
    final parent = dir.parent;
    if (parent.path == dir.path) break;
    dir = parent;
  }
  if (icons == null) {
    throw StateError(
      'MaterialIcons font not found above ${Platform.resolvedExecutable}',
    );
  }
  final iconLoader = FontLoader('MaterialIcons');
  iconLoader.addFont(Future.value(ByteData.sublistView(icons.readAsBytesSync())));
  await iconLoader.load();
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

Future<void> pumpAskPoster(
  WidgetTester tester, {
  required StoreViewport viewport,
  required String query,
  required Widget body,
}) async {
  await tester.binding.setSurfaceSize(viewport.size);
  addTearDown(() => tester.binding.setSurfaceSize(null));
  tester.view.physicalSize = viewport.size * viewport.pixelRatio;
  tester.view.devicePixelRatio = viewport.pixelRatio;
  addTearDown(tester.view.resetPhysicalSize);
  addTearDown(tester.view.resetDevicePixelRatio);

  await tester.pumpWidget(
    RepaintBoundary(
      key: const Key('store-capture'),
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        theme: storeTheme(),
        home: StoreFrame(
          phoneChrome: viewport.phoneChrome,
          child: Scaffold(
            backgroundColor: Brand.paper,
            body: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Padding(
                  padding: EdgeInsets.fromLTRB(24, 28, 24, 0),
                  child: Text(
                    'Ask',
                    style: TextStyle(
                      fontSize: 13,
                      letterSpacing: 1.4,
                      color: Brand.muted,
                    ),
                  ),
                ),
                const Padding(
                  padding: EdgeInsets.fromLTRB(24, 8, 24, 0),
                  child: Text(
                    'On this device. A saying if one fits. Nothing invented.',
                    style: TextStyle(height: 1.4),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(24, 16, 24, 8),
                  child: Text(
                    query,
                    style: const TextStyle(fontFamily: 'serif', fontSize: 16),
                  ),
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(24, 12, 24, 16),
                    child: Align(alignment: Alignment.topLeft, child: body),
                  ),
                ),
              ],
            ),
            bottomNavigationBar: NavigationBar(
              selectedIndex: 1,
              destinations: const [
                NavigationDestination(
                  icon: Icon(Icons.wb_twilight_outlined),
                  label: 'Today',
                ),
                NavigationDestination(icon: Icon(Icons.search), label: 'Ask'),
                NavigationDestination(
                  icon: Icon(Icons.bookmark_border),
                  label: 'Saved',
                ),
                NavigationDestination(
                  icon: Icon(Icons.settings_outlined),
                  label: 'Settings',
                ),
              ],
            ),
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
  required int width,
  required int height,
  String? path,
}) async {
  final file = File(path ?? 'store/screenshots/${viewportId}_$sceneId.png');
  file.parent.createSync(recursive: true);
  await tester.runAsync(() async {
    final boundary = tester.renderObject<RenderRepaintBoundary>(
      find.byKey(const Key('store-capture')),
    );
    final image = await boundary.toImage(pixelRatio: pixelRatio);
    if (image.width != width || image.height != height) {
      throw StateError(
        '${file.path} rendered ${image.width}x${image.height}, expected ${width}x$height',
      );
    }
    final raw = await image.toByteData(format: ui.ImageByteFormat.rawRgba);
    image.dispose();
    if (raw == null) {
      throw StateError('raw encode failed for ${file.path}');
    }
    final png = encodeRgbPng(raw.buffer.asUint8List(), width, height);
    file.writeAsBytesSync(png);
  });
  final ihdr = pngIhdr(file.readAsBytesSync());
  if (ihdr.width != width || ihdr.height != height || ihdr.colorType != 2) {
    throw StateError(
      '${file.path} IHDR ${ihdr.width}×${ihdr.height} color ${ihdr.colorType}',
    );
  }
  return file;
}

class PngIhdr {
  const PngIhdr(this.width, this.height, this.colorType);
  final int width;
  final int height;
  final int colorType;
}

PngIhdr pngIhdr(Uint8List bytes) {
  if (bytes.length < 26 || bytes[0] != 0x89) {
    throw StateError('not a PNG');
  }
  final width = (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19];
  final height = (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23];
  return PngIhdr(width, height, bytes[25]);
}

/// 24-bit RGB PNG. Play rejects screenshots that carry an alpha channel.
Uint8List encodeRgbPng(Uint8List rgba, int width, int height) {
  final rows = BytesBuilder(copy: false);
  for (var y = 0; y < height; y++) {
    rows.addByte(0);
    final start = y * width * 4;
    for (var x = 0; x < width; x++) {
      final i = start + x * 4;
      rows.add([rgba[i], rgba[i + 1], rgba[i + 2]]);
    }
  }
  final idat = ZLibEncoder().convert(rows.takeBytes());
  final out = BytesBuilder(copy: false);
  out.add(const [137, 80, 78, 71, 13, 10, 26, 10]);
  _chunk(out, 'IHDR', [
    ..._u32(width),
    ..._u32(height),
    8,
    2,
    0,
    0,
    0,
  ]);
  _chunk(out, 'IDAT', idat);
  _chunk(out, 'IEND', const []);
  return out.toBytes();
}

List<int> _u32(int value) => [
      (value >> 24) & 255,
      (value >> 16) & 255,
      (value >> 8) & 255,
      value & 255,
    ];

void _chunk(BytesBuilder out, String type, List<int> data) {
  out.add(_u32(data.length));
  final typeBytes = type.codeUnits;
  out.add(typeBytes);
  out.add(data);
  out.add(_u32(_crc32([...typeBytes, ...data])));
}

int _crc32(List<int> data) {
  var c = 0xffffffff;
  for (final b in data) {
    c ^= b;
    for (var i = 0; i < 8; i++) {
      c = (c & 1) != 0 ? (0xedb88320 ^ (c >> 1)) : (c >> 1);
    }
  }
  return c ^ 0xffffffff;
}
