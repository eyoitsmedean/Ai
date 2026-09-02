import 'package:shared_preferences/shared_preferences.dart';

import '../engine/moment.dart';
import '../engine/widget_contract.dart';

class LocalStore {
  static const _first = 'seenFirstLaunch';
  static const _last = 'lastSayingId';
  static const _step = 'committedStep';
  static const _saved = 'savedIds';
  static const _dark = 'darkSaying';

  Future<LocalMemory> read() async {
    final prefs = await SharedPreferences.getInstance();
    return LocalMemory(
      seenFirstLaunch: prefs.getBool(_first) ?? false,
      lastSayingId: prefs.getString(_last),
      committedStep: prefs.getString(_step),
      savedIds: prefs.getStringList(_saved) ?? const [],
      darkSaying: prefs.getBool(_dark) ?? false,
    );
  }

  Future<void> write(LocalMemory memory, WidgetPayload widget) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_first, memory.seenFirstLaunch);
    if (memory.lastSayingId != null) {
      await prefs.setString(_last, memory.lastSayingId!);
    }
    if (memory.committedStep != null) {
      await prefs.setString(_step, memory.committedStep!);
    }
    await prefs.setStringList(_saved, memory.savedIds);
    await prefs.setBool(_dark, memory.darkSaying);
    await prefs.setString(WidgetKeys.word, widget.word);
    await prefs.setString(WidgetKeys.citation, widget.citation);
    await prefs.setString(WidgetKeys.thread, widget.thread);
  }
}
