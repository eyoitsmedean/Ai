import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

void main() {
  test('Android applicationId is documented Play-safe lowercase', () {
    final gradle = File('android/app/build.gradle.kts').readAsStringSync();
    expect(gradle, contains('applicationId = "com.redwords.redwords"'));
    expect(gradle, isNot(contains('signingConfigs.getByName("debug")')));
    expect(gradle, contains('isMinifyEnabled = true'));
    expect(gradle, contains('proguard-rules.pro'));
  });

  test('Android label is Red Words and tel queries exist', () {
    final manifest =
        File('android/app/src/main/AndroidManifest.xml').readAsStringSync();
    expect(manifest, contains('android:label="Red Words"'));
    expect(manifest, isNot(contains('android:label="red_words"')));
    expect(manifest, contains('android:scheme="tel"'));
    expect(manifest, contains('SayingWidgetProvider'));
  });

  test('iOS widget target is in the pbxproj', () {
    final pbx =
        File('ios/Runner.xcodeproj/project.pbxproj').readAsStringSync();
    expect(pbx, contains('RedWordsWidget'));
    expect(pbx, contains('com.redwords.redWords.RedWordsWidget'));
    expect(pbx, contains('com.apple.product-type.app-extension'));
    expect(pbx, contains('IPHONEOS_DEPLOYMENT_TARGET = 15.0'));
    expect(pbx, contains('RedWordsWidget/RedWordsWidget.entitlements'));
    expect(
      File('ios/RedWordsWidget/RedWordsWidget.entitlements').readAsStringSync(),
      contains('group.com.redwords.redWords'),
    );
  });

  test('iOS Info.plist has display name and URL scheme', () {
    final plist = File('ios/Runner/Info.plist').readAsStringSync();
    expect(plist, contains('<string>Red Words</string>'));
    expect(plist, contains('<string>redwords</string>'));
  });

  test('iOS widget compiles on the 15.0 target: no unguarded iOS 17 API', () {
    final swift =
        File('ios/RedWordsWidget/RedWordsWidget.swift').readAsStringSync();
    final pbx =
        File('ios/Runner.xcodeproj/project.pbxproj').readAsStringSync();
    expect(pbx, contains('IPHONEOS_DEPLOYMENT_TARGET = 15.0'));

    final lines = swift.split('\n');
    final guardLines = <int>[];
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].contains('#available(iOSApplicationExtension 17.0')) {
        guardLines.add(i);
      }
    }
    expect(guardLines, isNotEmpty);
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].trimLeft().startsWith('//')) continue;
      if (lines[i].contains('containerBackground(')) {
        final guarded = guardLines.any((g) => i > g && i - g <= 2);
        expect(guarded, isTrue,
            reason: 'containerBackground at line ${i + 1} is not guarded');
      }
    }
    expect(swift, contains('background(color)'));
  });

  test('iOS widget target has the settings Xcode needs to archive', () {
    final pbx =
        File('ios/Runner.xcodeproj/project.pbxproj').readAsStringSync();
    final widgetSection = pbx.substring(
      pbx.indexOf('PRODUCT_BUNDLE_IDENTIFIER = com.redwords.redWords.RedWordsWidget') -
          1200,
    );
    expect(widgetSection, contains('INFOPLIST_FILE = RedWordsWidget/Info.plist'));
    expect(widgetSection, contains('SKIP_INSTALL = YES'));
    expect(widgetSection, contains('SWIFT_VERSION = 5.0'));
    expect(pbx, contains('WidgetKit.framework'));
    expect(pbx, contains('SwiftUI.framework'));
    expect(pbx, contains('Embed App Extensions'));
    final plist = File('ios/RedWordsWidget/Info.plist').readAsStringSync();
    expect(plist, contains('com.apple.widgetkit-extension'));
  });

  test('988 intent construction does not require a device call', () {
    final uri = Uri.parse('tel:988');
    expect(uri.scheme, 'tel');
    expect(uri.path, '988');
  });
}
