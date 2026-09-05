import 'package:flutter/material.dart';

import '../theme.dart';

/// Printer’s device: a crimson italic R in a hairline circle.
class PrinterMark extends StatelessWidget {
  const PrinterMark({super.key, this.size = 42});

  final double size;

  @override
  Widget build(BuildContext context) {
    final paper = PaperScope.of(context);
    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: paper.colors.ink.withValues(alpha: 0.22), width: 0.8),
      ),
      child: Text(
        'R',
        style: TextStyle(
          fontFamily: 'serif',
          fontStyle: FontStyle.italic,
          fontSize: size * 0.48,
          height: 1,
          color: paper.colors.crimson,
        ),
      ),
    );
  }
}

class SilkRibbon extends StatelessWidget {
  const SilkRibbon({super.key});

  @override
  Widget build(BuildContext context) {
    final paper = PaperScope.of(context);
    return Positioned(
      left: 0,
      top: 0,
      bottom: 0,
      child: Container(width: 4, color: paper.colors.crimson.withValues(alpha: 0.72)),
    );
  }
}

class FolioScaffold extends StatelessWidget {
  const FolioScaffold({
    super.key,
    required this.child,
    this.footer,
    this.showRibbon = true,
  });

  final Widget child;
  final Widget? footer;
  final bool showRibbon;

  @override
  Widget build(BuildContext context) {
    final paper = PaperScope.of(context);
    return Scaffold(
      backgroundColor: paper.colors.paper,
      body: Stack(
        children: [
          if (showRibbon) const SilkRibbon(),
          SafeArea(
            child: Padding(
              padding: EdgeInsets.fromLTRB(showRibbon ? 22 : 18, 18, 22, 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Expanded(child: child),
                  ?footer,
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class RunningHead extends StatelessWidget {
  const RunningHead({super.key, required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    final paper = PaperScope.of(context);
    return Text(
      text.toUpperCase(),
      textAlign: TextAlign.center,
      style: TextStyle(
        letterSpacing: 2.2,
        fontSize: 11,
        color: paper.colors.inkMuted,
      ),
    );
  }
}

class TextAction extends StatelessWidget {
  const TextAction({super.key, required this.label, required this.onPressed});

  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return TextButton(
      onPressed: onPressed,
      style: TextButton.styleFrom(
        minimumSize: const Size(48, 44),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      ),
      child: Text(label),
    );
  }
}

class WordBlock extends StatelessWidget {
  const WordBlock({
    super.key,
    required this.text,
    required this.citation,
    this.textKey,
    this.citationKey,
    this.size = 22,
  });

  final String text;
  final String citation;
  final Key? textKey;
  final Key? citationKey;
  final double size;

  @override
  Widget build(BuildContext context) {
    final paper = PaperScope.of(context);
    return Column(
      children: [
        Text(
          text,
          key: textKey,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontFamily: 'serif',
            fontStyle: FontStyle.italic,
            fontSize: size,
            height: 1.45,
            color: paper.colors.crimson,
          ),
        ),
        const SizedBox(height: 14),
        Text(
          '$citation  ·  KJV',
          key: citationKey,
          textAlign: TextAlign.center,
          style: TextStyle(
            letterSpacing: 1.3,
            fontSize: 11,
            color: paper.colors.crimson,
          ),
        ),
      ],
    );
  }
}
