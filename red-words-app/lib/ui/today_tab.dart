import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../brand.dart';
import '../engine/moment.dart';
import 'saying_view.dart';
import 'shell.dart';

class TodayTab extends ConsumerStatefulWidget {
  const TodayTab({
    super.key,
    required this.engine,
    required this.showStep,
    this.showAmen = false,
  });

  final MomentEngine engine;
  final bool showStep;
  final bool showAmen;

  @override
  ConsumerState<TodayTab> createState() => _TodayTabState();
}

class _TodayTabState extends ConsumerState<TodayTab> {
  late final TextEditingController _step;

  @override
  void initState() {
    super.initState();
    _step = TextEditingController();
  }

  @override
  void dispose() {
    _step.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.showAmen) {
      return Padding(
        padding: const EdgeInsets.fromLTRB(28, 48, 28, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Optional.',
              style: TextStyle(
                fontSize: 13,
                letterSpacing: 1.2,
                color: Brand.muted,
              ),
            ),
            const SizedBox(height: 18),
            const Text(
              'Amen, if you want it.',
              key: Key('amen-copy'),
              style: TextStyle(
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
                key: const Key('amen'),
                onPressed: () => ref.read(engineProvider.notifier).amen(),
                style: FilledButton.styleFrom(backgroundColor: Brand.crimson),
                child: const Text('Amen'),
              ),
            ),
            TextButton(
              key: const Key('amen-skip'),
              onPressed: () => ref.read(engineProvider.notifier).amen(),
              child: const Text('Not now'),
            ),
          ],
        ),
      );
    }

    if (widget.showStep) {
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
              widget.engine.today.step,
              key: const Key('step-body'),
              style: const TextStyle(
                fontFamily: 'serif',
                fontSize: 20,
                height: 1.4,
                color: Brand.muted,
              ),
            ),
            const SizedBox(height: 18),
            TextField(
              key: const Key('step-field'),
              controller: _step,
              minLines: 2,
              maxLines: 4,
              textCapitalization: TextCapitalization.sentences,
              decoration: const InputDecoration(
                hintText: 'In your own words.',
                border: OutlineInputBorder(),
              ),
            ),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                key: const Key('ill-do-this'),
                onPressed: () =>
                    ref.read(engineProvider.notifier).commitStep(_step.text),
                style: FilledButton.styleFrom(backgroundColor: Brand.crimson),
                child: const Text("I'll do this"),
              ),
            ),
          ],
        ),
      );
    }

    final continuity = widget.engine.continuityLine;

    return GestureDetector(
      onHorizontalDragEnd: (details) {
        if ((details.primaryVelocity ?? 0) < -200) {
          ref.read(engineProvider.notifier).openStep();
        }
      },
      child: Column(
        children: [
          if (continuity != null)
            Padding(
              padding: const EdgeInsets.fromLTRB(28, 16, 28, 0),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  continuity,
                  key: const Key('continuity'),
                  style: const TextStyle(
                    fontFamily: 'serif',
                    fontSize: 16,
                    height: 1.4,
                    color: Brand.ink,
                  ),
                ),
              ),
            ),
          Expanded(
            child: SayingView(
              saying: widget.engine.today,
              dark: widget.engine.memory.darkSaying,
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
