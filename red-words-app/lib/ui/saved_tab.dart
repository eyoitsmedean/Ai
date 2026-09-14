import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../brand.dart';
import '../engine/moment.dart';
import 'shell.dart';

class SavedTab extends ConsumerWidget {
  const SavedTab({super.key, required this.engine});

  final MomentEngine engine;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final saved = engine.saved;
    if (saved.isEmpty) {
      return const Center(
        child: Text(
          'Nothing kept yet.',
          key: Key('saved-empty'),
          style: TextStyle(
            fontFamily: Brand.serif,
            fontStyle: FontStyle.italic,
            color: Brand.muted,
          ),
        ),
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(28, 28, 20, 24),
      itemCount: saved.length,
      separatorBuilder: (_, _) => const Divider(height: 28, color: Color(0x1A2A2420)),
      itemBuilder: (context, index) {
        final saying = saved[index];
        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    saying.citationCaps,
                    style: const TextStyle(
                      letterSpacing: 1.4,
                      fontSize: 11,
                      color: Brand.crimson,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    saying.word,
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontFamily: Brand.serif,
                      fontStyle: FontStyle.italic,
                      fontSize: 17,
                      height: 1.35,
                      color: Brand.crimson,
                    ),
                  ),
                ],
              ),
            ),
            IconButton(
              onPressed: () => ref.read(engineProvider.notifier).removeSaved(saying.id),
              icon: const Icon(Icons.close, size: 18, color: Brand.muted),
            ),
          ],
        );
      },
    );
  }
}
