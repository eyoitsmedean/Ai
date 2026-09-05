import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../moment/models.dart';
import '../moment/office.dart';
import '../theme.dart';
import 'chrome.dart';

class TitlePage extends StatelessWidget {
  const TitlePage({super.key, required this.onTurn});

  final VoidCallback onTurn;

  @override
  Widget build(BuildContext context) {
    final paper = PaperScope.of(context);
    return FolioScaffold(
      footer: Column(
        children: [
          Text(
            'This is not a person, and it is not therapy, medical care, or pastoral counseling.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 13, height: 1.45, color: paper.colors.inkMuted),
          ),
          const SizedBox(height: 16),
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
      child: Column(
        children: [
          RunningHead(text: paper.season.runningHead),
          const Spacer(),
          const PrinterMark(size: 52),
          const SizedBox(height: 28),
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
        ],
      ),
    );
  }
}

class EmptyPage extends StatelessWidget {
  const EmptyPage({super.key});

  @override
  Widget build(BuildContext context) {
    final paper = PaperScope.of(context);
    return FolioScaffold(
      footer: const CrisisNote(),
      child: Column(
        children: [
          const RunningHead(text: 'Colophon'),
          const Spacer(),
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
        ],
      ),
    );
  }
}

class TodayPage extends StatelessWidget {
  const TodayPage({
    super.key,
    required this.moment,
    required this.office,
    required this.seven,
    required this.onSit,
    required this.onSeek,
    required this.onAbout,
    this.onSeven,
    this.onBless,
  });

  final DailyMoment moment;
  final DailyOffice office;
  final List<PathDay> seven;
  final VoidCallback onSit;
  final VoidCallback onSeek;
  final VoidCallback onAbout;
  final VoidCallback? onSeven;
  final VoidCallback? onBless;

  @override
  Widget build(BuildContext context) {
    final paper = PaperScope.of(context);
    return FolioScaffold(
      footer: Wrap(
        alignment: WrapAlignment.center,
        spacing: 8,
        runSpacing: 4,
        children: [
          TextAction(label: 'Sit', onPressed: onSit),
          TextAction(label: 'Seek', onPressed: onSeek),
          if (onSeven != null) TextAction(label: 'Seven', onPressed: onSeven!),
          if (onBless != null) TextAction(label: 'Bless', onPressed: onBless!),
          TextAction(label: 'About', onPressed: onAbout),
        ],
      ),
      child: Column(
        children: [
          RunningHead(text: paper.season.runningHead),
          const SizedBox(height: 6),
          Text(
            office.name,
            key: const Key('today-office'),
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 12, letterSpacing: 1.4, color: paper.colors.gold),
          ),
          const SizedBox(height: 4),
          Text(
            moment.theme,
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 13, color: paper.colors.gold),
          ),
          const SizedBox(height: 18),
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                children: [
                  WordBlock(
                    text: moment.word.text,
                    citation: moment.word.citation,
                    textKey: const Key('today-word'),
                    citationKey: const Key('today-citation'),
                  ),
                  const SizedBox(height: 22),
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
                  if (office.isEvening) ...[
                    const SizedBox(height: 28),
                    Text(
                      office.vespersPromptOn(DateTime.now()),
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontFamily: 'serif',
                        fontStyle: FontStyle.italic,
                        fontSize: 18,
                        color: paper.colors.ink,
                      ),
                    ),
                  ],
                  if (seven.isNotEmpty) ...[
                    const SizedBox(height: 28),
                    SevenRibbon(days: seven, onOpen: onSeven),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class SevenRibbon extends StatelessWidget {
  const SevenRibbon({super.key, required this.days, this.onOpen});

  final List<PathDay> days;
  final VoidCallback? onOpen;

  @override
  Widget build(BuildContext context) {
    final paper = PaperScope.of(context);
    return GestureDetector(
      onTap: onOpen,
      child: Column(
        children: [
          Text(
            'Seven Days',
            style: TextStyle(
              fontSize: 11,
              letterSpacing: 1.6,
              color: paper.colors.gold,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              for (final day in days)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 6),
                  child: Tooltip(
                    message: day.title,
                    child: Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: paper.colors.crimson.withValues(alpha: 0.55)),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class SitPage extends StatefulWidget {
  const SitPage({super.key, required this.moment, required this.onBack});

  final DailyMoment moment;
  final VoidCallback onBack;

  @override
  State<SitPage> createState() => _SitPageState();
}

class _SitPageState extends State<SitPage> {
  static const leaves = ['Read', 'Reflect', 'Rest', 'Respond'];
  int leaf = 0;

  @override
  Widget build(BuildContext context) {
    final paper = PaperScope.of(context);
    final moment = widget.moment;
    return FolioScaffold(
      showRibbon: false,
      footer: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          TextAction(label: 'Back', onPressed: widget.onBack),
          Row(
            children: [
              for (var i = 0; i < leaves.length; i++)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 3),
                  child: Text(
                    leaves[i],
                    style: TextStyle(
                      fontSize: 11,
                      letterSpacing: 0.8,
                      color: i == leaf ? paper.colors.crimson : paper.colors.inkMuted,
                    ),
                  ),
                ),
            ],
          ),
          TextAction(
            label: leaf == leaves.length - 1 ? 'Amen' : 'Next',
            onPressed: () {
              if (leaf == leaves.length - 1) {
                widget.onBack();
              } else {
                setState(() => leaf += 1);
              }
            },
          ),
        ],
      ),
      child: Column(
        children: [
          RunningHead(text: leaves[leaf]),
          const SizedBox(height: 20),
          Expanded(child: _leaf(paper, moment)),
        ],
      ),
    );
  }

  Widget _leaf(PaperScope paper, DailyMoment moment) {
    switch (leaf) {
      case 1:
        return Center(
          child: Text(
            moment.reflection,
            textAlign: TextAlign.center,
            style: TextStyle(fontFamily: 'serif', fontSize: 20, height: 1.55, color: paper.colors.ink),
          ),
        );
      case 2:
        return Center(
          child: Text(
            _titleCase(catchword(moment.word.text)),
            textAlign: TextAlign.center,
            style: TextStyle(
              fontFamily: 'serif',
              fontStyle: FontStyle.italic,
              fontSize: 40,
              color: paper.colors.crimson,
            ),
          ),
        );
      case 3:
        return Center(
          child: Text(
            'One sentence is enough. You do not have to finish the thought.',
            textAlign: TextAlign.center,
            style: TextStyle(fontFamily: 'serif', fontSize: 18, height: 1.55, color: paper.colors.inkMuted),
          ),
        );
      default:
        return Center(
          child: WordBlock(
            text: moment.word.text,
            citation: moment.word.citation,
            textKey: const Key('sit-word'),
            size: 24,
          ),
        );
    }
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
    return FolioScaffold(
      child: ListView(
        children: [
          Align(
            alignment: Alignment.centerLeft,
            child: TextAction(label: 'Back', onPressed: onBack),
          ),
          Text(
            'Seek',
            textAlign: TextAlign.center,
            style: TextStyle(fontFamily: 'serif', fontSize: 28, color: paper.colors.ink),
          ),
          const SizedBox(height: 8),
          Text(
            'Twelve rooms. His words only.',
            textAlign: TextAlign.center,
            style: TextStyle(color: paper.colors.inkMuted),
          ),
          const SizedBox(height: 20),
          for (var i = 0; i < rooms.length; i++)
            ListTile(
              contentPadding: const EdgeInsets.symmetric(vertical: 6),
              leading: Text(
                (i + 1).toString().padLeft(2, '0'),
                style: TextStyle(letterSpacing: 1.1, color: paper.colors.inkMuted),
              ),
              title: Text(rooms[i].theme, style: const TextStyle(fontFamily: 'serif', fontSize: 18)),
              subtitle: Text(rooms[i].headline),
              minVerticalPadding: 12,
              onTap: () => onOpen(rooms[i]),
            ),
        ],
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
    return FolioScaffold(
      child: ListView(
        children: [
          Align(
            alignment: Alignment.centerLeft,
            child: TextAction(label: 'Back', onPressed: onBack),
          ),
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
    );
  }
}

class SevenPage extends StatelessWidget {
  const SevenPage({
    super.key,
    required this.days,
    required this.onBack,
    required this.onOpen,
  });

  final List<PathDay> days;
  final VoidCallback onBack;
  final ValueChanged<PathDay> onOpen;

  @override
  Widget build(BuildContext context) {
    final paper = PaperScope.of(context);
    return FolioScaffold(
      child: ListView(
        children: [
          Align(
            alignment: Alignment.centerLeft,
            child: TextAction(label: 'Back', onPressed: onBack),
          ),
          Text(
            'Seven Days',
            textAlign: TextAlign.center,
            style: TextStyle(fontFamily: 'serif', fontSize: 28, color: paper.colors.ink),
          ),
          const SizedBox(height: 8),
          Text(
            'One room a morning. A missed day is never a failure.',
            textAlign: TextAlign.center,
            style: TextStyle(color: paper.colors.inkMuted),
          ),
          const SizedBox(height: 20),
          for (final day in days)
            ListTile(
              title: Text(day.title, style: const TextStyle(fontFamily: 'serif', fontSize: 20)),
              subtitle: Text(day.word.citation),
              minVerticalPadding: 14,
              onTap: () => onOpen(day),
            ),
        ],
      ),
    );
  }
}

class PathDayPage extends StatelessWidget {
  const PathDayPage({super.key, required this.day, required this.onBack});

  final PathDay day;
  final VoidCallback onBack;

  @override
  Widget build(BuildContext context) {
    final paper = PaperScope.of(context);
    return FolioScaffold(
      footer: Align(
        alignment: Alignment.centerLeft,
        child: TextAction(label: 'Back', onPressed: onBack),
      ),
      child: Column(
        children: [
          RunningHead(text: day.title),
          const SizedBox(height: 24),
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                children: [
                  WordBlock(text: day.word.text, citation: day.word.citation, size: 22),
                  const SizedBox(height: 24),
                  Text(
                    day.reflection,
                    textAlign: TextAlign.center,
                    style: TextStyle(fontFamily: 'serif', fontSize: 16, height: 1.6, color: paper.colors.ink),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class BlessingPage extends StatelessWidget {
  const BlessingPage({super.key, required this.moment, required this.onBack});

  final DailyMoment moment;
  final VoidCallback onBack;

  @override
  Widget build(BuildContext context) {
    final paper = PaperScope.of(context);
    return FolioScaffold(
      footer: TextAction(label: 'Back', onPressed: onBack),
      child: Column(
        children: [
          const RunningHead(text: 'A blessing'),
          const SizedBox(height: 24),
          Expanded(
            child: Center(
              child: Container(
                key: const Key('blessing-card'),
                padding: const EdgeInsets.fromLTRB(22, 36, 22, 32),
                decoration: BoxDecoration(
                  color: paper.colors.folio,
                  border: Border.all(color: paper.colors.rule),
                ),
                child: WordBlock(
                  text: moment.word.text,
                  citation: moment.word.citation,
                  size: 20,
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'One cream leaf. Sit with this. No install wall.',
            textAlign: TextAlign.center,
            style: TextStyle(color: paper.colors.inkMuted),
          ),
        ],
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
    return FolioScaffold(
      child: ListView(
        children: [
          Align(
            alignment: Alignment.centerLeft,
            child: TextAction(label: 'Back', onPressed: onBack),
          ),
          const SizedBox(height: 8),
          const Center(child: PrinterMark()),
          const SizedBox(height: 16),
          Text(
            'His words, for this moment.',
            textAlign: TextAlign.center,
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

String _titleCase(String word) {
  if (word.isEmpty) return word;
  return '${word[0].toUpperCase()}${word.substring(1)}';
}

Future<void> launchDialer(String number) async {
  try {
    await const MethodChannel('redwords/links').invokeMethod<void>('tel', number);
  } on MissingPluginException {
    // Tests and hosts without a dialer.
  }
}
