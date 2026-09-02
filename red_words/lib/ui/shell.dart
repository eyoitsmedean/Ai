import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../brand.dart';
import '../engine/crisis.dart';
import '../engine/moment.dart';
import '../engine/pack.dart';
import '../store/local_store.dart';
import 'ask_tab.dart';
import 'saved_tab.dart';
import 'settings_tab.dart';
import 'today_tab.dart';

final packProvider = FutureProvider<ScripturePack>((ref) {
  return ScripturePack.loadAsset();
});

final storeProvider = Provider<LocalStore>((ref) => LocalStore());

final engineProvider = StateNotifierProvider<EngineController, EngineState>((ref) {
  return EngineController(ref);
});

class EngineState {
  const EngineState({
    this.engine,
    this.loadFailed = false,
    this.showStep = false,
    this.booting = true,
  });

  final MomentEngine? engine;
  final bool loadFailed;
  final bool showStep;
  final bool booting;

  EngineState copyWith({
    MomentEngine? engine,
    bool? loadFailed,
    bool? showStep,
    bool? booting,
  }) {
    return EngineState(
      engine: engine ?? this.engine,
      loadFailed: loadFailed ?? this.loadFailed,
      showStep: showStep ?? this.showStep,
      booting: booting ?? this.booting,
    );
  }
}

class EngineController extends StateNotifier<EngineState> {
  EngineController(this._ref) : super(const EngineState()) {
    _boot();
  }

  final Ref _ref;

  Future<void> _boot() async {
    try {
      final pack = await _ref.read(packProvider.future);
      final memory = await _ref.read(storeProvider).read();
      final engine = MomentEngine(pack, memory);
      state = EngineState(engine: engine, booting: false);
      await persist();
    } catch (_) {
      state = const EngineState(loadFailed: true, booting: false);
    }
  }

  Future<void> persist() async {
    final engine = state.engine;
    if (engine == null) return;
    await _ref.read(storeProvider).write(engine.memory, engine.widgetPayload());
  }

  Future<void> finishSplash() async {
    final engine = state.engine;
    if (engine == null) return;
    engine.markFirstLaunchSeen();
    state = state.copyWith(engine: engine);
    await persist();
  }

  void openStep() {
    state = state.copyWith(showStep: true);
  }

  Future<void> commitStep() async {
    final engine = state.engine;
    if (engine == null) return;
    engine.commitStep();
    state = state.copyWith(engine: engine, showStep: false);
    await persist();
  }

  Future<void> saveToday() async {
    final engine = state.engine;
    if (engine == null) return;
    engine.saveToday();
    state = state.copyWith(engine: engine);
    await persist();
  }

  Future<void> removeSaved(String id) async {
    final engine = state.engine;
    if (engine == null) return;
    engine.removeSaved(id);
    state = state.copyWith(engine: engine);
    await persist();
  }

  Future<void> setDark(bool value) async {
    final engine = state.engine;
    if (engine == null) return;
    engine.setDarkSaying(value);
    state = state.copyWith(engine: engine);
    await persist();
  }
}

Future<bool> openCrisisLine() {
  return launchUrl(
    Uri.parse(Crisis.telUri),
    mode: LaunchMode.externalApplication,
  );
}

class AppShell extends ConsumerStatefulWidget {
  const AppShell({super.key});

  @override
  ConsumerState<AppShell> createState() => _AppShellState();
}

class _AppShellState extends ConsumerState<AppShell> {
  int _tab = 0;

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(engineProvider);
    if (state.booting) {
      return const SplashPage();
    }
    if (state.loadFailed || state.engine == null) {
      return const LoadFailPage();
    }
    final pages = [
      TodayTab(engine: state.engine!, showStep: state.showStep),
      AskTab(pack: state.engine!.pack, dark: state.engine!.memory.darkSaying),
      SavedTab(engine: state.engine!),
      SettingsTab(engine: state.engine!),
    ];
    return Scaffold(
      backgroundColor: state.engine!.memory.darkSaying ? Brand.charcoal : Brand.paper,
      body: SafeArea(child: pages[_tab]),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (index) => setState(() => _tab = index),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.wb_twilight_outlined), label: 'Today'),
          NavigationDestination(icon: Icon(Icons.search), label: 'Ask'),
          NavigationDestination(icon: Icon(Icons.bookmark_border), label: 'Saved'),
          NavigationDestination(icon: Icon(Icons.settings_outlined), label: 'Settings'),
        ],
      ),
    );
  }
}

class SplashPage extends StatelessWidget {
  const SplashPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      backgroundColor: Brand.paper,
      body: Center(
        child: Text(
          Brand.promise,
          key: Key('splash-promise'),
          style: TextStyle(
            fontFamily: 'serif',
            fontSize: 20,
            color: Brand.crimson,
          ),
        ),
      ),
    );
  }
}

class LoadFailPage extends StatelessWidget {
  const LoadFailPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Brand.paper,
      body: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'His words could not be opened on this device.',
              key: Key('load-fail'),
              style: TextStyle(fontSize: 18, height: 1.4),
            ),
            const SizedBox(height: 16),
            const Text(Crisis.copy),
            const SizedBox(height: 24),
            TextButton(
              key: const Key('crisis-988'),
              onPressed: openCrisisLine,
              child: const Text('988'),
            ),
          ],
        ),
      ),
    );
  }
}
