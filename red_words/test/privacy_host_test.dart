import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:red_words/engine/privacy.dart';

/// The store URL, the repo Pages copy, and Settings must stay one text.
void main() {
  late String docs;
  late String pages;

  setUpAll(() {
    docs = File('docs/privacy.html').readAsStringSync();
    pages = File('../public/privacy.html').readAsStringSync();
  });

  test('GitHub Pages copy is identical to docs/privacy.html', () {
    expect(pages, docs);
  });

  test('hosted HTML carries every in-app PrivacyNotice fact', () {
    // HTML splits the 988 sentence into its own <p>; facts must still match.
    expect(PrivacyNotice.body, contains('does not connect to the internet'));
    expect(PrivacyNotice.body, contains('Tapping 988'));
    expect(docs, contains('stores your last saying, saved sayings, your one honest step'));
    expect(docs, contains('does not connect to the internet'));
    expect(docs, contains('Tapping 988'));
    expect(docs, contains('does not place calls, read call history, or access contacts'));
    expect(docs, contains(PrivacyNotice.thirdParties));
    expect(docs, contains(PrivacyNotice.deletion));
    expect(docs, contains(PrivacyNotice.scripture));
    expect(docs, contains('Dean Ray'));
    expect(docs, contains('11 September 2026'));
  });
}
