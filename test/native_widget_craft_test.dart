import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:red_words/red_words/moment/widget_contract.dart';

void main() {
  const forbidden = [
    'Red Words',
    'streak',
    'badge',
    'Day 1',
    'Day 7',
    'Open app',
    'Tap to',
    'Subscribe',
    'Roumie',
    'The Chosen',
    'Hallow',
  ];

  test('iOS widget card source is Word only', () {
    final swift = File('ios/RedWordsWidget/RedWordsWidget.swift').readAsStringSync();
    expect(swift.contains('word'), isTrue);
    expect(swift.contains('citation'), isTrue);
    expect(swift.contains('redwords://today'), isTrue);
    expect(swift.contains('group.com.redwords.redWords'), isTrue);
    expect(swift.contains('"RedWordsWidget"'), isTrue);
    for (final token in forbidden) {
      expect(swift.toLowerCase().contains(token.toLowerCase()), isFalse, reason: token);
    }
  });

  test('Android widget card source is Word only', () {
    final kotlin = File('android/app/src/main/kotlin/com/redwords/red_words/RedWordsWidget.kt')
        .readAsStringSync();
    final layout = File('android/app/src/main/res/layout/red_words_widget.xml').readAsStringSync();
    expect(kotlin.contains('redwords://today'), isTrue);
    expect(layout.contains('@id/word') || layout.contains('android:id="@+id/word"'), isTrue);
    expect(layout.contains('android:id="@+id/citation"'), isTrue);
    for (final token in forbidden) {
      expect(layout.toLowerCase().contains(token.toLowerCase()), isFalse, reason: token);
      expect(kotlin.toLowerCase().contains(token.toLowerCase()), isFalse, reason: token);
    }
  });

  test('locked iOS identifiers are present', () {
    final pbx = File('ios/Runner.xcodeproj/project.pbxproj').readAsStringSync();
    expect(pbx.contains('PRODUCT_BUNDLE_IDENTIFIER = com.redwords.redWords;'), isTrue);
    expect(
      pbx.contains('PRODUCT_BUNDLE_IDENTIFIER = com.redwords.redWords.RedWordsWidget;'),
      isTrue,
    );
    expect(pbx.contains('IPHONEOS_DEPLOYMENT_TARGET = 15.0;'), isTrue);
    expect(pbx.contains('RedWordsWidget'), isTrue);
    final info = File('ios/Runner/Info.plist').readAsStringSync();
    expect(info.contains('Red Words'), isTrue);
    expect(info.contains('redwords'), isTrue);
    final entitlements = File('ios/Runner/Runner.entitlements').readAsStringSync();
    expect(entitlements.contains('group.com.redwords.redWords'), isTrue);
  });
}
