import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:red_words/brand.dart';
import 'package:red_words/engine/pack.dart';

void main() {
  late ScripturePack pack;

  setUpAll(() {
    final raw = File('assets/sayings.json').readAsStringSync();
    pack = ScripturePack.parse(raw);
  });

  test('seed pack has 100 WEB sayings', () {
    expect(pack.sayings, hasLength(100));
  });

  test('first saying is anxiety-mt-6-34 Matthew 6:34', () {
    expect(pack.first.id, Brand.firstSayingId);
    expect(pack.first.citation, 'Matthew 6:34');
    expect(pack.first.word, contains('don’t be anxious for tomorrow'));
    expect(pack.first.translation, 'WEB');
  });

  test('only Gospel books are present', () {
    for (final saying in pack.sayings) {
      expect(Brand.gospelBooks, contains(saying.book));
    }
  });

  test('no saying invents an empty word or citation', () {
    for (final saying in pack.sayings) {
      expect(saying.word.trim(), isNotEmpty);
      expect(saying.citation, contains(saying.book));
      expect(saying.citation, contains('${saying.chapter}:'));
    }
  });

  test('ids are unique', () {
    final ids = pack.sayings.map((s) => s.id).toSet();
    expect(ids, hasLength(100));
  });

  test('known WEB lines stay themselves', () {
    expect(pack.byId('peace-leave').word, contains('Peace I leave with you'));
    expect(pack.byId('i-am-way').word, contains('I am the way, the truth, and the life'));
    expect(pack.byId('god-so-loved').word, contains('For God so loved the world'));
  });

  test('reflections are not labeled as Scripture', () {
    for (final saying in pack.sayings) {
      expect(saying.reflection.toLowerCase(), isNot(contains('thus saith')));
      expect(saying.word, isNot(saying.reflection));
    }
  });

  test('missing pack is a hard fail', () {
    expect(
      () => ScripturePack.parse('{"sayings":[]}'),
      throwsA(isA<PackLoadException>()),
    );
    expect(
      () => ScripturePack.parse('[]'),
      throwsA(isA<PackLoadException>()),
    );
  });

  test('non-Gospel book is rejected', () {
    expect(
      () => ScripturePack.parse(
        '{"sayings":[{"id":"x","book":"Romans","chapter":8,"start":28,"end":28,"citation":"Romans 8:28","word":"x","reflection":"y","step":"z","tags":[],"chips":[]}]}',
      ),
      throwsA(isA<PackLoadException>()),
    );
  });
}
