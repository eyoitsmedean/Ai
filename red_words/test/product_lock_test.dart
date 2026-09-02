import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:red_words/brand.dart';
import 'package:red_words/engine/pack.dart';

/// Locked product. Fail if this branch absorbs PR 12's KJV / Sit / Seek home.
void main() {
  test('home tabs are Today Ask Saved Settings, not Sit Seek', () {
    final shell = File('lib/ui/shell.dart').readAsStringSync();
    expect(shell, contains("label: 'Today'"));
    expect(shell, contains("label: 'Ask'"));
    expect(shell, contains("label: 'Saved'"));
    expect(shell, contains("label: 'Settings'"));
    expect(shell, isNot(contains("label: 'Sit'")));
    expect(shell, isNot(contains("label: 'Seek'")));
    expect(File('lib/ui/today_tab.dart').existsSync(), isTrue);
    expect(File('lib/ui/ask_tab.dart').existsSync(), isTrue);
    final ui = Directory('lib/ui')
        .listSync()
        .map((f) => f.uri.pathSegments.last)
        .toSet();
    expect(ui.contains('sit_tab.dart'), isFalse);
    expect(ui.contains('seek_tab.dart'), isFalse);
  });

  test('seed pack is WEB 100, not a 33-saying KJV catalog', () {
    final raw = File('assets/sayings.json').readAsStringSync();
    final pack = ScripturePack.parse(raw);
    expect(pack.sayings, hasLength(100));
    expect(pack.first.id, Brand.firstSayingId);
    expect(pack.first.translation, 'WEB');
    expect(pack.first.citation, 'Matthew 6:34');
    expect(raw, contains('World English Bible'));
    expect(raw.toLowerCase(), isNot(contains('king james')));
    expect(File('assets/moments/catalog.json').existsSync(), isFalse);
  });

  test('One Honest Step is the second beat, not a Sit room', () {
    final today = File('lib/ui/today_tab.dart').readAsStringSync();
    expect(today, contains('One honest step'));
    expect(today, contains("I'll do this"));
    expect(today, isNot(contains('Turn the page')));
  });
}
