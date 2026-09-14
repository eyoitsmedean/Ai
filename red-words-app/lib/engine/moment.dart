import '../brand.dart';
import '../models/saying.dart';
import 'pack.dart';
import 'widget_contract.dart';

class LocalMemory {
  const LocalMemory({
    this.seenFirstLaunch = false,
    this.lastSayingId,
    this.committedStep,
    this.savedIds = const [],
    this.darkSaying = false,
  });

  final bool seenFirstLaunch;
  final String? lastSayingId;
  final String? committedStep;
  final List<String> savedIds;
  final bool darkSaying;

  LocalMemory copyWith({
    bool? seenFirstLaunch,
    String? lastSayingId,
    String? committedStep,
    List<String>? savedIds,
    bool? darkSaying,
  }) {
    return LocalMemory(
      seenFirstLaunch: seenFirstLaunch ?? this.seenFirstLaunch,
      lastSayingId: lastSayingId ?? this.lastSayingId,
      committedStep: committedStep ?? this.committedStep,
      savedIds: savedIds ?? this.savedIds,
      darkSaying: darkSaying ?? this.darkSaying,
    );
  }
}

class MomentEngine {
  MomentEngine(this.pack, this.memory);

  final ScripturePack pack;
  LocalMemory memory;

  Saying get today {
    if (!memory.seenFirstLaunch) {
      return pack.byId(Brand.firstSayingId);
    }
    if (memory.lastSayingId != null) {
      return pack.byId(memory.lastSayingId!);
    }
    return pack.first;
  }

  /// Next-open ribbon. Null until the person writes a step.
  String? get continuityLine {
    final step = memory.committedStep;
    if (step == null || step.trim().isEmpty) return null;
    return "You said you'd $step";
  }

  WidgetPayload widgetPayload() => WidgetPayload.fromSaying(today);

  void markFirstLaunchSeen() {
    memory = memory.copyWith(
      seenFirstLaunch: true,
      lastSayingId: today.id,
    );
  }

  /// One Honest Step is the person's own words. An empty commit keeps the
  /// catalog prompt so older callers and unit tests still have a string.
  void commitStep([String? words]) {
    final text = (words ?? '').trim();
    memory = memory.copyWith(
      committedStep: text.isEmpty ? today.step : text,
      lastSayingId: today.id,
      seenFirstLaunch: true,
    );
  }

  void saveToday() {
    if (memory.savedIds.contains(today.id)) return;
    memory = memory.copyWith(savedIds: [...memory.savedIds, today.id]);
  }

  void removeSaved(String id) {
    memory = memory.copyWith(
      savedIds: memory.savedIds.where((item) => item != id).toList(),
    );
  }

  List<Saying> get saved =>
      memory.savedIds.map(pack.byId).toList(growable: false);

  void setDarkSaying(bool value) {
    memory = memory.copyWith(darkSaying: value);
  }
}
