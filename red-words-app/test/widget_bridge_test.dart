import 'dart:io';

import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:red_words/brand.dart';
import 'package:red_words/engine/moment.dart';
import 'package:red_words/engine/widget_bridge.dart';
import 'package:red_words/engine/widget_contract.dart';
import 'package:red_words/store/local_store.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  const payload = WidgetPayload(
    word: 'Therefore don’t be anxious for tomorrow.',
    citation: 'MATTHEW 6:34',
    thread: 'crimson-knot',
  );

  tearDown(() {
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(WidgetBridge.channel, null);
  });

  test('push sends update with exactly word, citation, thread', () async {
    MethodCall? seen;
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(WidgetBridge.channel, (call) async {
      seen = call;
      return null;
    });

    await WidgetBridge.push(payload);

    expect(seen, isNotNull);
    expect(seen!.method, WidgetBridge.updateMethod);
    final args = Map<String, Object?>.from(seen!.arguments as Map);
    expect(args.keys.toSet(),
        {WidgetKeys.word, WidgetKeys.citation, WidgetKeys.thread});
    expect(args[WidgetKeys.word], payload.word);
    expect(args[WidgetKeys.citation], payload.citation);
    expect(args[WidgetKeys.thread], payload.thread);
    for (final bad in WidgetKeys.forbidden) {
      expect(args.keys.any((k) => k.contains(bad)), isFalse);
    }
  });

  test('push survives a host with no widget handler', () async {
    await expectLater(WidgetBridge.push(payload), completes);
  });

  test('push survives a native failure', () async {
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(WidgetBridge.channel, (call) async {
      throw PlatformException(code: 'boom');
    });
    await expectLater(WidgetBridge.push(payload), completes);
  });

  test('LocalStore.write persists memory and pushes the widget', () async {
    SharedPreferences.setMockInitialValues({});
    var pushes = 0;
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(WidgetBridge.channel, (call) async {
      pushes++;
      return null;
    });

    const memory = LocalMemory(
      seenFirstLaunch: true,
      lastSayingId: 'anxiety-mt-6-34',
      committedStep: null,
      savedIds: ['anxiety-mt-6-34'],
      darkSaying: false,
    );
    await LocalStore().write(memory, payload);

    final prefs = await SharedPreferences.getInstance();
    expect(prefs.getString('lastSayingId'), 'anxiety-mt-6-34');
    expect(prefs.getStringList('savedIds'), ['anxiety-mt-6-34']);
    expect(pushes, 1);
  });

  group('native shells honour the same contract', () {
    final swift = File('ios/Runner/AppDelegate.swift').readAsStringSync();
    final widget =
        File('ios/RedWordsWidget/RedWordsWidget.swift').readAsStringSync();
    final activity = File(
      'android/app/src/main/kotlin/com/redwords/red_words/MainActivity.kt',
    ).readAsStringSync();
    final provider = File(
      'android/app/src/main/kotlin/com/redwords/red_words/SayingWidgetProvider.kt',
    ).readAsStringSync();

    test('channel name and method match on iOS and Android', () {
      expect(swift, contains('"${WidgetBridge.channelName}"'));
      expect(swift, contains('case "${WidgetBridge.updateMethod}"'));
      expect(provider, contains('CHANNEL = "${WidgetBridge.channelName}"'));
      expect(activity, contains('"${WidgetBridge.updateMethod}" ->'));
    });

    test('iOS writes the App Group suite the widget reads', () {
      expect(swift, contains('"${Brand.appGroup}"'));
      expect(widget, contains('suiteName: "${Brand.appGroup}"'));
      for (final key in [
        WidgetKeys.word,
        WidgetKeys.citation,
        WidgetKeys.thread
      ]) {
        expect(swift, contains('"$key"'));
        expect(widget, contains('forKey: "$key"'));
      }
      expect(swift, contains('WidgetCenter.shared.reloadAllTimelines()'));
      expect(swift, isNot(contains('UserDefaults.standard')));
    });

    test('Android writes the prefs file the provider reads and refreshes', () {
      final file = RegExp(r'PREFS = "([a-z_]+)"').firstMatch(provider)!.group(1);
      expect(activity, contains('SayingWidgetProvider.PREFS'));
      expect(provider, contains('getSharedPreferences(PREFS'));
      expect(file, 'red_words_widget');
      expect(provider, contains('KEY_WORD = "${WidgetKeys.word}"'));
      expect(provider, contains('KEY_CITATION = "${WidgetKeys.citation}"'));
      expect(provider, contains('KEY_THREAD = "${WidgetKeys.thread}"'));
      expect(activity, contains('ACTION_APPWIDGET_UPDATE'));
      expect(activity, contains('EXTRA_APPWIDGET_IDS'));
      expect(provider, isNot(contains('FlutterSharedPreferences')));
    });

    test('widget shows only word, citation, thread', () {
      for (final bad in WidgetKeys.forbidden) {
        expect(widget.toLowerCase(), isNot(contains(bad)));
        expect(provider.toLowerCase(), isNot(contains(bad)));
      }
    });
  });
}
