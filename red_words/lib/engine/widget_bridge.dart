import 'package:flutter/services.dart';

import 'widget_contract.dart';

/// Hands the widget payload to the native shells.
///
/// The prefs plugin writes `UserDefaults.standard` on iOS, which the App Group
/// widget cannot read, and neither OS refreshes a home widget on its own after
/// a write. The native handlers store the three keys where the widget reads and
/// ask the OS to redraw. Failure here must never break persistence.
abstract final class WidgetBridge {
  static const channelName = 'redwords/widget';
  static const updateMethod = 'update';
  static const channel = MethodChannel(channelName);

  static Future<void> push(WidgetPayload payload) async {
    final args = <String, String>{
      WidgetKeys.word: payload.word,
      WidgetKeys.citation: payload.citation,
      WidgetKeys.thread: payload.thread,
    };
    try {
      await channel.invokeMethod<void>(updateMethod, args);
    } on MissingPluginException {
      // Tests and desktop hosts have no widget.
    } on PlatformException {
      // A widget that fails to redraw is not a reason to lose the Saying.
    }
  }
}
