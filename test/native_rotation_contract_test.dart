import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

/// The native widgets must compute the day with the same clock as Dart and
/// Node, and the URL capture must live where UIKit actually delivers it.
void main() {
  final swift = File('ios/RedWordsWidget/RedWordsWidget.swift').readAsStringSync();
  final appDelegate = File('ios/Runner/AppDelegate.swift').readAsStringSync();
  final sceneDelegate = File('ios/Runner/SceneDelegate.swift').readAsStringSync();
  final kotlin = File('android/app/src/main/kotlin/com/redwords/red_words/RedWordsWidget.kt')
      .readAsStringSync();
  final activity = File('android/app/src/main/kotlin/com/redwords/red_words/MainActivity.kt')
      .readAsStringSync();
  final manifest = File('android/app/src/main/AndroidManifest.xml').readAsStringSync();
  final layout = File('android/app/src/main/res/layout/red_words_widget.xml').readAsStringSync();

  test('iOS timeline rotates itself at local midnight from the stored seven', () {
    expect(swift.contains('forKey: "rotation"'), isTrue);
    expect(swift.contains('startOfDay(for:'), isTrue);
    expect(swift.contains('86_400_000'), isTrue);
    expect(swift.contains('for dayOffset in 1...6'), isTrue);
    expect(swift.contains('.after(nextMidnight)'), isTrue);
    expect(swift.contains('legacy()'), isTrue, reason: 'falls back to word/citation');
  });

  test('iOS small family shows an opening clause or the address, never an ellipsis rewrite', () {
    expect(swift.contains('func openingClause'), isTrue);
    expect(swift.contains('family == .systemSmall'), isTrue);
    expect(swift.contains('minimumScaleFactor(0.6)'), isFalse);
  });

  test('iOS URL capture lives in SceneDelegate only and is consumed once', () {
    expect(appDelegate.contains('open url'), isFalse);
    expect(appDelegate.contains('launchOptions?[.url]'), isFalse);
    expect(sceneDelegate.contains('openURLContexts'), isTrue);
    expect(sceneDelegate.contains('connectionOptions.urlContexts'), isTrue);
    expect(appDelegate.contains('AppDelegate.pendingLink = nil'), isTrue);
  });

  test('Android provider computes the slot from the clock and wakes at midnight', () {
    expect(kotlin.contains('86400000L'), isTrue);
    expect(kotlin.contains('set(Calendar.HOUR_OF_DAY, 0)'), isTrue);
    expect(kotlin.contains('Math.floorDiv'), isTrue);
    expect(kotlin.contains('setAndAllowWhileIdle'), isTrue);
    expect(kotlin.contains('setExactAndAllowWhileIdle'), isFalse, reason: 'no exact-alarm permission');
    expect(kotlin.contains('getString("rotation"'), isTrue);
    expect(manifest.contains('com.redwords.red_words.MIDNIGHT'), isTrue);
  });

  test('Android link is consumed once and text auto-sizes above 11sp', () {
    expect(activity.contains('initialLink = null'), isTrue);
    expect(activity.contains('putString("rotation", rotation)'), isTrue);
    expect(layout.contains('autoSizeMinTextSize="12sp"'), isTrue);
  });

  test('the store contract is word, citation, rotation — nothing else crosses', () {
    for (final key in ['streak', 'badge', 'cta', 'title', 'brand']) {
      expect(swift.contains('forKey: "$key"'), isFalse, reason: key);
      expect(kotlin.contains('getString("$key"'), isFalse, reason: key);
    }
  });
}
