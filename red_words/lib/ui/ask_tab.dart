import 'package:flutter/material.dart';

import '../brand.dart';
import '../engine/pack.dart';
import '../engine/retrieve.dart';
import 'saying_view.dart';
import 'crisis_button.dart';

class AskTab extends StatefulWidget {
  const AskTab({super.key, required this.pack, required this.dark});

  final ScripturePack pack;
  final bool dark;

  @override
  State<AskTab> createState() => _AskTabState();
}

class _AskTabState extends State<AskTab> {
  final _controller = TextEditingController();
  late final AskRetriever _retriever = AskRetriever(widget.pack);
  AskResult? _result;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _submit() {
    setState(() => _result = _retriever.ask(_controller.text));
  }

  @override
  Widget build(BuildContext context) {
    final result = _result;
    return ListView(
      padding: const EdgeInsets.fromLTRB(24, 28, 24, 24),
      children: [
        const Text(
          'Ask',
          style: TextStyle(fontSize: 13, letterSpacing: 1.4, color: Brand.muted),
        ),
        const SizedBox(height: 8),
        const Text(
          'On this device. A saying if one fits. Nothing invented.',
          style: TextStyle(height: 1.4),
        ),
        const SizedBox(height: 16),
        TextField(
          key: const Key('ask-field'),
          controller: _controller,
          minLines: 2,
          maxLines: 4,
          textInputAction: TextInputAction.send,
          onSubmitted: (_) => _submit(),
          decoration: const InputDecoration(
            hintText: 'A few honest words.',
            border: OutlineInputBorder(),
          ),
        ),
        const SizedBox(height: 12),
        Align(
          alignment: Alignment.centerLeft,
          child: TextButton(
            key: const Key('ask-submit'),
            onPressed: _submit,
            child: const Text('Look'),
          ),
        ),
        if (result != null) ...[
          const SizedBox(height: 16),
          if (result.retrieved)
            SayingView(
              saying: result.saying!,
              dark: widget.dark,
              chips: result.chips,
              showStepCue: true,
            )
          else
            Text(
              result.message,
              key: Key('ask-${result.kind.name}'),
              style: const TextStyle(height: 1.45, color: Brand.ink),
            ),
          if (result.kind == AskKind.crisis)
            const CrisisButton(key: Key('crisis-988')),
        ],
      ],
    );
  }
}
