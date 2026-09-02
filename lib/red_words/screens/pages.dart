import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../moment/models.dart';
import '../theme.dart';

class TitlePage extends StatelessWidget {
  const TitlePage({super.key, required this.onTurn});

  final VoidCallback onTurn;

  @override
  Widget build(BuildContext context) {
    final paper = PaperScope.of(context);
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(28, 36, 28, 28),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                paper.season.runningHead.toUpperCase(),
                textAlign: TextAlign.center,
                style: TextStyle(
                  letterSpacing: 2.2,
                  fontSize: 12,
                  color: paper.colors.inkMuted,
                ),
              ),
              const Spacer(),
              Text(
                'His words, for this moment.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontFamily: 'serif',
                  fontStyle: FontStyle.italic,
                  fontSize: 32,
                  height: 1.25,
                  color: paper.colors.crimson,
                ),
              ),
              const SizedBox(height: 20),
              Text(
                'A quiet page for the words Jesus spoke.\nThe Gospels only. Kept on this device.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontFamily: 'serif',
                  fontSize: 16,
                  height: 1.55,
                  color: paper.colors.ink,
                ),
              ),
              const Spacer(),
              Text(
                'This is not a person, and it is not therapy, medical care, or pastoral counseling.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, height: 1.45, color: paper.colors.inkMuted),
              ),
              const SizedBox(height: 18),
              Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(minWidth: 220, minHeight: 48),
                  child: OutlinedButton(
                    onPressed: onTurn,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: paper.colors.ink,
                      side: BorderSide(color: paper.colors.rule),
                      padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
                    ),
                    child: const Text('Turn the page'),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class EmptyPage extends StatelessWidget {
  const EmptyPage({super.key});

  @override
  Widget build(BuildContext context) {
    final paper = PaperScope.of(context);
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(28, 48, 28, 28),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'The page is blank.',
                textAlign: TextAlign.center,
                key: const Key('empty-state'),
                style: TextStyle(
                  fontFamily: 'serif',
                  fontStyle: FontStyle.italic,
                  fontSize: 28,
                  color: paper.colors.ink,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'His words will be here when the book is. Nothing has been invented to fill the silence.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontFamily: 'serif',
                  fontSize: 16,
                  height: 1.55,
                  color: paper.colors.inkMuted,
                ),
              ),
              const Spacer(),
              const CrisisNote(),
            ],
          ),
        ),
      ),
    );
  }
}

class TodayPage extends StatelessWidget {
  const TodayPage({
    super.key,
    required this.moment,
    required this.onSit,
    required this.onSeek,
    required this.onAbout,
  });

  final DailyMoment moment;
  final VoidCallback onSit;
  final VoidCallback onSeek;
  final VoidCallback onAbout;

  @override
  Widget build(BuildContext context) {
    final paper = PaperScope.of(context);
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 20, 24, 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                paper.season.runningHead.toUpperCase(),
                textAlign: TextAlign.center,
                style: TextStyle(
                  letterSpacing: 2.0,
                  fontSize: 12,
                  color: paper.colors.inkMuted,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                moment.theme,
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: paper.colors.gold),
              ),
              const SizedBox(height: 24),
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    children: [
                      Text(
                        moment.word.text,
                        key: const Key('today-word'),
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontFamily: 'serif',
                          fontStyle: FontStyle.italic,
                          fontSize: 22,
                          height: 1.45,
                          color: paper.colors.crimson,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        '${moment.word.citation}  ·  KJV',
                        key: const Key('today-citation'),
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          letterSpacing: 1.2,
                          fontSize: 12,
                          color: paper.colors.crimson,
                        ),
                      ),
                      const SizedBox(height: 28),
                      Text(
                        moment.reflection,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontFamily: 'serif',
                          fontSize: 16,
                          height: 1.6,
                          color: paper.colors.ink,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Wrap(
                alignment: WrapAlignment.center,
                spacing: 12,
                runSpacing: 8,
                children: [
                  _TextAction(label: 'Sit', onPressed: onSit),
                  _TextAction(label: 'Seek', onPressed: onSeek),
                  _TextAction(label: 'About', onPressed: onAbout),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class SitPage extends StatelessWidget {
  const SitPage({super.key, required this.moment, required this.onBack});

  final DailyMoment moment;
  final VoidCallback onBack;

  @override
  Widget build(BuildContext context) {
    final paper = PaperScope.of(context);
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Align(
                alignment: Alignment.centerLeft,
                child: _TextAction(label: 'Back', onPressed: onBack),
              ),
              const SizedBox(height: 24),
              Expanded(
                child: Center(
                  child: Text(
                    moment.word.text,
                    key: const Key('sit-word'),
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontFamily: 'serif',
                      fontStyle: FontStyle.italic,
                      fontSize: 24,
                      height: 1.5,
                      color: paper.colors.crimson,
                    ),
                  ),
                ),
              ),
              Text(
                moment.word.citation,
                textAlign: TextAlign.center,
                style: TextStyle(letterSpacing: 1.2, color: paper.colors.inkMuted),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class SeekPage extends StatelessWidget {
  const SeekPage({
    super.key,
    required this.rooms,
    required this.onBack,
    required this.onOpen,
  });

  final List<ThemeRoom> rooms;
  final VoidCallback onBack;
  final ValueChanged<ThemeRoom> onOpen;

  @override
  Widget build(BuildContext context) {
    final paper = PaperScope.of(context);
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
          children: [
            Align(
              alignment: Alignment.centerLeft,
              child: _TextAction(label: 'Back', onPressed: onBack),
            ),
            const SizedBox(height: 12),
            Text(
              'Seek',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: 'serif',
                fontSize: 28,
                color: paper.colors.ink,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Twelve rooms. His words only.',
              textAlign: TextAlign.center,
              style: TextStyle(color: paper.colors.inkMuted),
            ),
            const SizedBox(height: 20),
            for (final room in rooms)
              ListTile(
                contentPadding: const EdgeInsets.symmetric(vertical: 6),
                title: Text(room.theme, style: const TextStyle(fontFamily: 'serif', fontSize: 18)),
                subtitle: Text(room.headline),
                minVerticalPadding: 12,
                onTap: () => onOpen(room),
              ),
          ],
        ),
      ),
    );
  }
}

class RoomPage extends StatelessWidget {
  const RoomPage({super.key, required this.room, required this.onBack});

  final ThemeRoom room;
  final VoidCallback onBack;

  @override
  Widget build(BuildContext context) {
    final paper = PaperScope.of(context);
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
          children: [
            Align(
              alignment: Alignment.centerLeft,
              child: _TextAction(label: 'Back', onPressed: onBack),
            ),
            const SizedBox(height: 12),
            Text(room.theme, style: TextStyle(color: paper.colors.gold, letterSpacing: 1.1)),
            const SizedBox(height: 8),
            Text(
              room.headline,
              style: TextStyle(fontFamily: 'serif', fontSize: 26, color: paper.colors.ink),
            ),
            const SizedBox(height: 16),
            Text(room.opening, style: const TextStyle(fontFamily: 'serif', height: 1.55, fontSize: 16)),
            const SizedBox(height: 24),
            for (final passage in room.passages) ...[
              Text(
                passage.saying.text,
                style: TextStyle(
                  fontFamily: 'serif',
                  fontStyle: FontStyle.italic,
                  fontSize: 18,
                  height: 1.45,
                  color: paper.colors.crimson,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                '${passage.saying.citation}  ·  KJV',
                style: TextStyle(letterSpacing: 1.1, fontSize: 12, color: paper.colors.crimson),
              ),
              const SizedBox(height: 8),
              Text(passage.context, style: TextStyle(height: 1.5, color: paper.colors.inkMuted)),
              const SizedBox(height: 22),
            ],
            Text(room.practice, style: const TextStyle(fontFamily: 'serif', height: 1.55)),
            const SizedBox(height: 16),
            Text(room.closing, style: TextStyle(fontStyle: FontStyle.italic, color: paper.colors.inkMuted)),
          ],
        ),
      ),
    );
  }
}

class AboutPage extends StatelessWidget {
  const AboutPage({super.key, required this.onBack});

  final VoidCallback onBack;

  @override
  Widget build(BuildContext context) {
    final paper = PaperScope.of(context);
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
          children: [
            Align(
              alignment: Alignment.centerLeft,
              child: _TextAction(label: 'Back', onPressed: onBack),
            ),
            const SizedBox(height: 16),
            Text(
              'His words, for this moment.',
              style: TextStyle(
                fontFamily: 'serif',
                fontStyle: FontStyle.italic,
                fontSize: 26,
                color: paper.colors.crimson,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Red Words keeps the spoken sentences of Jesus from Matthew, Mark, Luke, and John on this device. The home-screen widget is the Word only — no badge, no streak, no name on the card.',
              style: TextStyle(fontFamily: 'serif', height: 1.55, color: paper.colors.ink),
            ),
            const SizedBox(height: 16),
            Text(
              'Quoted verses are the public-domain King James Version (1769). Nothing is invented to fill a blank page.',
              style: TextStyle(height: 1.5, color: paper.colors.inkMuted),
            ),
            const SizedBox(height: 28),
            const CrisisNote(),
          ],
        ),
      ),
    );
  }
}

class CrisisNote extends StatelessWidget {
  const CrisisNote({super.key});

  @override
  Widget build(BuildContext context) {
    final paper = PaperScope.of(context);
    return Column(
      children: [
        Text(
          'If you are in crisis, this page is not the right room.',
          textAlign: TextAlign.center,
          style: TextStyle(height: 1.45, color: paper.colors.inkMuted),
        ),
        const SizedBox(height: 8),
        TextButton(
          onPressed: () => launchDialer('988'),
          child: const Text('988  ·  US call or text'),
        ),
      ],
    );
  }
}

class _TextAction extends StatelessWidget {
  const _TextAction({required this.label, required this.onPressed});

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

Future<void> launchDialer(String number) async {
  try {
    await const MethodChannel('redwords/links').invokeMethod<void>('tel', number);
  } on MissingPluginException {
    // Tests and hosts without a dialer.
  }
}
