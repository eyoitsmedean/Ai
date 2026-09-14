import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:red_words/engine/pack.dart';
import 'package:red_words/ui/saying_view.dart';

void main() {
  late Widget sayingApp;
  final pack = ScripturePack.parse(File('assets/sayings.json').readAsStringSync());

  setUp(() {
    sayingApp = MaterialApp(
      home: SayingView(
        saying: pack.first,
        dark: false,
        chips: pack.first.chips,
      ),
    );
  });

  Offset centerOf(WidgetTester tester, Key key) {
    return tester.getCenter(find.byKey(key));
  }

  testWidgets('Saying hierarchy Y-order includes the knot', (tester) async {
    await tester.pumpWidget(sayingApp);
    final word = centerOf(tester, const Key('saying-word'));
    final citation = centerOf(tester, const Key('saying-citation'));
    final knot = centerOf(tester, const Key('saying-knot'));
    final reflection = centerOf(tester, const Key('saying-reflection'));
    final chips = centerOf(tester, const Key('saying-chips'));
    final cue = centerOf(tester, const Key('saying-step-cue'));
    expect(word.dy, lessThan(citation.dy));
    expect(citation.dy, lessThan(knot.dy));
    expect(knot.dy, lessThan(reflection.dy));
    expect(reflection.dy, lessThan(chips.dy));
    expect(chips.dy, lessThan(cue.dy));
  });

  testWidgets('dark saying keeps the same Y-order', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: SayingView(saying: pack.first, dark: true),
      ),
    );
    final word = centerOf(tester, const Key('saying-word'));
    final citation = centerOf(tester, const Key('saying-citation'));
    final knot = centerOf(tester, const Key('saying-knot'));
    final reflection = centerOf(tester, const Key('saying-reflection'));
    expect(word.dy, lessThan(citation.dy));
    expect(citation.dy, lessThan(knot.dy));
    expect(knot.dy, lessThan(reflection.dy));
  });

  testWidgets('XL Dynamic Type keeps order and has no EXTRA LARGE stamp', (tester) async {
    await tester.pumpWidget(
      MediaQuery(
        data: const MediaQueryData(textScaler: TextScaler.linear(2.0)),
        child: sayingApp,
      ),
    );
    final word = centerOf(tester, const Key('saying-word'));
    final citation = centerOf(tester, const Key('saying-citation'));
    final knot = centerOf(tester, const Key('saying-knot'));
    expect(word.dy, lessThan(citation.dy));
    expect(citation.dy, lessThan(knot.dy));
    expect(find.textContaining('EXTRA LARGE'), findsNothing);
    expect(find.text('Reflection:'), findsNothing);
  });

  testWidgets('reflection has no Reflection label', (tester) async {
    await tester.pumpWidget(sayingApp);
    expect(find.text('Reflection:'), findsNothing);
    expect(find.text(pack.first.reflection), findsOneWidget);
  });
}
