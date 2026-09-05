import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:red_words/brand.dart';
import 'package:red_words/engine/crisis.dart';
import 'package:red_words/ui/shell.dart';

void main() {
  test('988 launcher intent is tel:988', () {
    expect(Crisis.telUri, 'tel:988');
    expect(Uri.parse(Crisis.telUri).scheme, 'tel');
    expect(Uri.parse(Crisis.telUri).path, '988');
  });

  testWidgets('load-fail offers 988 and invents no verse', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: LoadFailPage()));
    expect(find.byKey(const Key('load-fail')), findsOneWidget);
    expect(find.byKey(const Key('crisis-988')), findsOneWidget);
    expect(find.textContaining('Matthew'), findsNothing);
    expect(find.textContaining('John'), findsNothing);
  });

  testWidgets('splash is the brand promise, not a chatbot', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: SplashPage()));
    expect(find.text(Brand.promise), findsOneWidget);
    expect(find.textContaining('Journeys'), findsNothing);
    expect(find.textContaining('streak'), findsNothing);
    expect(find.textContaining('chat'), findsNothing);
  });

  test('locked identifiers', () {
    expect(Brand.iosBundle, 'com.redwords.redWords');
    expect(Brand.iosWidgetBundle, 'com.redwords.redWords.RedWordsWidget');
    expect(Brand.appGroup, 'group.com.redwords.redWords');
    expect(Brand.urlSchemeToday, 'redwords://today');
    expect(Brand.androidApplicationId, 'com.redwords.redwords');
  });

  test('product forbids streaks chat journeys', () {
    const forbidden = ['Journeys', 'streak', 'RW', 'chat bubble'];
    expect(Brand.name, isNot(contains('Journeys')));
    for (final word in forbidden) {
      expect(Brand.promise.toLowerCase(), isNot(contains(word.toLowerCase())));
    }
  });
}
