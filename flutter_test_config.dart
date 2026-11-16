import 'dart:async';

import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

/// Widget tests otherwise draw the book face as the engine fallback.
Future<void> testExecutable(FutureOr<void> Function() testMain) async {
  TestWidgetsFlutterBinding.ensureInitialized();
  final loader = FontLoader('RedWordsSerif')
    ..addFont(rootBundle.load('assets/fonts/EBGaramond-Regular.ttf'))
    ..addFont(rootBundle.load('assets/fonts/EBGaramond-Italic.ttf'));
  await loader.load();
  await testMain();
}
