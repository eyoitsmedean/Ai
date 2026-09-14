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
          style: TextStyle(color: Brand.muted),
        ),
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(24, 28, 24, 24),
      itemCount: saved.length,
      separatorBuilder: (_, _) => const Divider(),
      itemBuilder: (context, index) {
        final saying = saved[index];
        return ListTile(
          title: Text(saying.citationCaps, style: const TextStyle(letterSpacing: 1.1)),
          subtitle: Text(
            saying.word,
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontFamily: 'serif', color: Brand.crimson),
          ),
          trailing: IconButton(
            onPressed: () => ref.read(engineProvider.notifier).removeSaved(saying.id),
            icon: const Icon(Icons.close),
          ),
        );
      },
    );
  }
}
