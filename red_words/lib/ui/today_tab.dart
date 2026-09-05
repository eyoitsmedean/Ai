import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../brand.dart';
import '../engine/moment.dart';
import 'saying_view.dart';
import 'shell.dart';

class TodayTab extends ConsumerWidget {
  const TodayTab({super.key, required this.engine, required this.showStep});

  final MomentEngine engine;
  final bool showStep;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final saying = engine.today;
    if (showStep) {
      return Padding(
        padding: const EdgeInsets.fromLTRB(28, 48, 28, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'One honest step',
              key: Key('step-title'),
              style: TextStyle(
                fontSize: 13,
                letterSpacing: 1.2,
                color: Brand.muted,
              ),
            ),
            const SizedBox(height: 18),
            Text(
              saying.step,
              key: const Key('step-body'),
              style: const TextStyle(
                fontFamily: 'serif',
                fontSize: 24,
                height: 1.4,
                color: Brand.ink,
              ),
            ),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                key: const Key('ill-do-this'),
                onPressed: () => ref.read(engineProvider.notifier).commitStep(),
                style: FilledButton.styleFrom(backgroundColor: Brand.crimson),
                child: const Text("I'll do this"),
              ),
            ),
          ],
        ),
      );
    }

    return GestureDetector(
      onHorizontalDragEnd: (details) {
        if ((details.primaryVelocity ?? 0) < -200) {
          ref.read(engineProvider.notifier).openStep();
        }
      },
      child: Column(
        children: [
          Expanded(
            child: SayingView(
              saying: saying,
              dark: engine.memory.darkSaying,
            ),
          ),
          TextButton(
            key: const Key('save-today'),
            onPressed: () => ref.read(engineProvider.notifier).saveToday(),
            child: const Text('Keep'),
          ),
          TextButton(
            key: const Key('open-step'),
            onPressed: () => ref.read(engineProvider.notifier).openStep(),
            child: const Text('One honest step'),
          ),
        ],
      ),
    );
  }
}
