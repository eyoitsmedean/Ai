import 'package:flutter/material.dart';

import '../brand.dart';
import '../models/saying.dart';

class SayingView extends StatelessWidget {
  const SayingView({
    super.key,
    required this.saying,
    required this.dark,
    this.chips = const [],
    this.showStepCue = true,
    this.stepCue = 'One honest step',
  });

  final Saying saying;
  final bool dark;
  final List<String> chips;
  final bool showStepCue;
  final String stepCue;

  @override
  Widget build(BuildContext context) {
    final media = MediaQuery.of(context);
    final scale = media.textScaler.clamp(minScaleFactor: 1, maxScaleFactor: 2.2);
    final paper = dark ? Brand.charcoal : Brand.paper;
    final ink = dark ? Brand.paper : Brand.ink;
    return MediaQuery(
      data: media.copyWith(textScaler: scale),
      child: ColoredBox(
        color: paper,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(28, 36, 28, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                saying.word,
                key: const Key('saying-word'),
                style: TextStyle(
                  fontFamily: 'serif',
                  fontSize: 26,
                  height: 1.35,
                  color: Brand.crimson,
                  fontWeight: FontWeight.w400,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                saying.citationCaps,
                key: const Key('saying-citation'),
                style: TextStyle(
                  fontFamily: 'sans-serif',
                  fontSize: 12,
                  letterSpacing: 1.6,
                  fontWeight: FontWeight.w600,
                  color: Brand.crimson.withValues(alpha: 0.85),
                ),
              ),
              const SizedBox(height: 18),
              const CrimsonKnot(key: Key('saying-knot')),
              const SizedBox(height: 18),
              Text(
                saying.reflection,
                key: const Key('saying-reflection'),
                style: TextStyle(
                  fontFamily: 'sans-serif',
                  fontSize: 16,
                  height: 1.5,
                  color: ink,
                ),
              ),
              if (chips.isNotEmpty) ...[
                const SizedBox(height: 16),
                Wrap(
                  key: const Key('saying-chips'),
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    for (final chip in chips)
                      Text(
                        chip,
                        style: const TextStyle(
                          fontSize: 12,
                          letterSpacing: 0.6,
                          color: Brand.muted,
                        ),
                      ),
                  ],
                ),
              ],
              if (showStepCue) ...[
                const SizedBox(height: 28),
                Text(
                  stepCue,
                  key: const Key('saying-step-cue'),
                  style: const TextStyle(
                    fontFamily: 'sans-serif',
                    fontSize: 13,
                    letterSpacing: 0.8,
                    color: Brand.muted,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class CrimsonKnot extends StatelessWidget {
  const CrimsonKnot({super.key});

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: const Size(28, 18),
      painter: _KnotPainter(),
    );
  }
}

class _KnotPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Brand.crimson
      ..strokeWidth = 1.4
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;
    final path = Path()
      ..moveTo(0, size.height * 0.55)
      ..cubicTo(
        size.width * 0.25,
        0,
        size.width * 0.4,
        size.height,
        size.width * 0.55,
        size.height * 0.45,
      )
      ..cubicTo(
        size.width * 0.7,
        0,
        size.width * 0.82,
        size.height,
        size.width,
        size.height * 0.5,
      );
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
