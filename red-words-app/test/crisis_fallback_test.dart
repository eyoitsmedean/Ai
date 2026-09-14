import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:red_words/engine/crisis.dart';
import 'package:red_words/ui/crisis_button.dart';

void main() {
  Widget host(CrisisLauncher launcher) {
    return MaterialApp(
      home: Scaffold(
        body: CrisisButton(key: const Key('crisis-988'), launcher: launcher),
      ),
    );
  }

  testWidgets('a phone with a dialer gets tel:988 and no fallback',
      (tester) async {
    Uri? launched;
    await tester.pumpWidget(host((uri) async {
      launched = uri;
      return true;
    }));
    await tester.tap(find.byKey(const Key('crisis-988')));
    await tester.pumpAndSettle();

    expect(launched, Uri.parse(Crisis.telUri));
    expect(launched!.scheme, 'tel');
    expect(launched!.path, '988');
    expect(find.byKey(const Key('crisis-fallback')), findsNothing);
  });

  testWidgets('no dialer: fallback names 988 and invents no verse',
      (tester) async {
    await tester.pumpWidget(host((_) async => false));
    await tester.tap(find.byKey(const Key('crisis-988')));
    await tester.pump();

    expect(find.byKey(const Key('crisis-fallback')), findsOneWidget);
    expect(find.text(Crisis.fallback), findsOneWidget);
    expect(Crisis.fallback, contains('988'));
    expect(find.textContaining('Matthew'), findsNothing);
    expect(find.textContaining('Jesus'), findsNothing);
  });

  testWidgets('a platform exception is shown, not swallowed', (tester) async {
    await tester.pumpWidget(host((_) async {
      throw PlatformException(code: 'ACTIVITY_NOT_FOUND');
    }));
    await tester.tap(find.byKey(const Key('crisis-988')));
    await tester.pump();

    expect(find.byKey(const Key('crisis-fallback')), findsOneWidget);
  });

  test('crisis copy claims only what 988 does: call or text, US', () {
    expect(Crisis.copy, contains('call or text 988'));
    expect(Crisis.copy, contains('US'));
    expect(Crisis.copy.toLowerCase(), isNot(contains('pray')));
    expect(Crisis.copy.toLowerCase(), isNot(contains('verse')));
  });
}
