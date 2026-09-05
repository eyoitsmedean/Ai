import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../brand.dart';
import '../engine/crisis.dart';
import '../engine/moment.dart';
import 'crisis_button.dart';
import 'shell.dart';

class SettingsTab extends ConsumerWidget {
  const SettingsTab({super.key, required this.engine});

  final MomentEngine engine;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(24, 28, 24, 24),
      children: [
        const Text(Brand.name, style: TextStyle(fontFamily: 'serif', fontSize: 28)),
        const SizedBox(height: 8),
        const Text(Brand.stepPromise),
        const SizedBox(height: 24),
        SwitchListTile(
          key: const Key('dark-saying'),
          title: const Text('Dark saying'),
          value: engine.memory.darkSaying,
          onChanged: (value) => ref.read(engineProvider.notifier).setDark(value),
        ),
        const SizedBox(height: 12),
        const Text(Crisis.copy),
        const CrisisButton(key: Key('crisis-988')),
        const SizedBox(height: 24),
        const Text(
          'World English Bible. Public domain. Gospels only — words Jesus spoke. Reflections are not Scripture.',
          style: TextStyle(color: Brand.muted, height: 1.45),
        ),
      ],
    );
  }
}
