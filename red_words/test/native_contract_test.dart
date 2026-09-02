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

  test('988 intent construction does not require a device call', () {
    final uri = Uri.parse('tel:988');
    expect(uri.scheme, 'tel');
    expect(uri.path, '988');
  });
}
