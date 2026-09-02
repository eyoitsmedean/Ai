import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:red_words/brand.dart';
import 'package:red_words/engine/moment.dart';
import 'package:red_words/engine/pack.dart';
import 'package:red_words/engine/widget_contract.dart';

void main() {
  late ScripturePack pack;

  setUpAll(() {
    pack = ScripturePack.parse(File('assets/sayings.json').readAsStringSync());
  });

  test('first launch is Matthew 6:34', () {
    final engine = MomentEngine(pack, const LocalMemory());
    expect(engine.today.id, Brand.firstSayingId);
    expect(engine.today.citation, 'Matthew 6:34');
  });

  test('return visit keeps last saying', () {
    final engine = MomentEngine(
      pack,
      const LocalMemory(seenFirstLaunch: true, lastSayingId: 'peace-leave'),
    );
    expect(engine.today.id, 'peace-leave');
  });

  test("I'll do this writes tomorrow continuity", () {
    final engine = MomentEngine(pack, const LocalMemory());
    engine.commitStep();
    expect(engine.memory.committedStep, engine.today.step);
    expect(engine.memory.seenFirstLaunch, isTrue);
    expect(engine.memory.lastSayingId, Brand.firstSayingId);
  });

  test('widget payload is word + citation + thread only', () {
    final engine = MomentEngine(pack, const LocalMemory());
    final payload = engine.widgetPayload();
    expect(payload.word, engine.today.word);
    expect(payload.citation, 'MATTHEW 6:34');
    expect(payload.thread, 'crimson-knot');
    final map = payload.toMap();
    expect(map.keys, unorderedEquals(['word', 'citation', 'thread']));
    for (final bad in WidgetKeys.forbidden) {
      expect(map.keys, isNot(contains(bad)));
      expect(map.values.join(), isNot(contains(bad)));
    }
  });

  test('saved starts empty and can keep a saying', () {
    final engine = MomentEngine(pack, const LocalMemory());
    expect(engine.saved, isEmpty);
    engine.saveToday();
    expect(engine.saved.single.id, Brand.firstSayingId);
    engine.removeSaved(Brand.firstSayingId);
    expect(engine.saved, isEmpty);
  });
}
