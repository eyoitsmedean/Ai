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

  WidgetPayload widgetPayload() => WidgetPayload.fromSaying(today);

  void markFirstLaunchSeen() {
    memory = memory.copyWith(
      seenFirstLaunch: true,
      lastSayingId: today.id,
    );
  }

  void commitStep() {
    memory = memory.copyWith(
      committedStep: today.step,
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
