import 'package:flutter/material.dart';

import 'moment/catalog.dart';
import 'moment/engine.dart';
import 'moment/models.dart';
import 'moment/widget_contract.dart';
import 'platform/session.dart';
import 'screens/pages.dart';
import 'theme.dart';

enum AppLeaf { title, today, sit, seek, room, seven, pathDay, blessing, about, empty }

class RedWordsApp extends StatefulWidget {
  const RedWordsApp({
    super.key,
    required this.catalog,
    this.now,
    this.session,
    this.initialLink,
    this.syncWidget = true,
  });

  final MomentCatalog catalog;
  final DateTime? now;
  final SessionStore? session;
  final String? initialLink;
  final bool syncWidget;

  @override
  State<RedWordsApp> createState() => _RedWordsAppState();
}

class _RedWordsAppState extends State<RedWordsApp> {
  late final MomentEngine engine = MomentEngine(widget.catalog);
  late SessionStore session;
  AppLeaf leaf = AppLeaf.title;
  ThemeRoom? openedRoom;
  PathDay? openedDay;
  bool ready = false;

  DateTime get now => widget.now ?? DateTime.now();

  DailyMoment? get moment => engine.forDate(now);

  @override
  void initState() {
    super.initState();
    session = widget.session ?? SessionStore();
    _boot();
  }

  bool get _hostless => widget.session != null;

  Future<void> _boot() async {
    final opened = await session.hasOpened();
    Uri? link = RedWordsLink.parse(widget.initialLink);
    if (link == null && !_hostless) {
      link = RedWordsLink.parse(await LinkBridge.initial());
    }
    AppLeaf next;
    if (widget.catalog.isEmpty || moment == null) {
      next = AppLeaf.empty;
    } else if (RedWordsLink.isToday(link) || opened) {
      next = AppLeaf.today;
    } else {
      next = AppLeaf.title;
    }
    if (next == AppLeaf.today) {
      await session.markOpened();
      if (widget.syncWidget && !_hostless) {
        await _pushWidget();
      }
    }
    if (mounted) {
      setState(() {
        leaf = next;
        ready = true;
      });
    }
  }

  Future<void> _pushWidget() async {
    if (!widget.syncWidget) return;
    final payload = engine.widgetFor(now);
    if (payload == null) return;
    await WidgetBridge.sync(word: payload.word, citation: payload.citation);
  }

  Future<void> _openToday() async {
    await session.markOpened();
    await _pushWidget();
    if (mounted) setState(() => leaf = AppLeaf.today);
  }

  @override
  Widget build(BuildContext context) {
    final season = engine.seasonOn(now);
    final colors = RedWordsColors.forSeason(season);
    if (!ready) {
      return MaterialApp(
        title: 'Red Words',
        debugShowCheckedModeBanner: false,
        theme: redWordsTheme(season),
        home: Scaffold(backgroundColor: colors.paper, body: const SizedBox.expand()),
      );
    }
    return PaperScope(
      colors: colors,
      season: season,
      child: MaterialApp(
        title: 'Red Words',
        debugShowCheckedModeBanner: false,
        theme: redWordsTheme(season),
        home: _leaf(),
      ),
    );
  }

  Widget _leaf() {
    final current = moment;
    switch (leaf) {
      case AppLeaf.empty:
        return const EmptyPage();
      case AppLeaf.title:
        return TitlePage(onTurn: _openToday);
      case AppLeaf.today:
        if (current == null) return const EmptyPage();
        return TodayPage(
          moment: current,
          office: engine.officeAt(now),
          seven: engine.seven,
          onSit: () => setState(() => leaf = AppLeaf.sit),
          onSeek: () => setState(() => leaf = AppLeaf.seek),
          onSeven: () => setState(() => leaf = AppLeaf.seven),
          onBless: () => setState(() => leaf = AppLeaf.blessing),
          onAbout: () => setState(() => leaf = AppLeaf.about),
        );
      case AppLeaf.sit:
        if (current == null) return const EmptyPage();
        return SitPage(
          moment: current,
          onBack: () => setState(() => leaf = AppLeaf.today),
        );
      case AppLeaf.seek:
        return SeekPage(
          rooms: widget.catalog.themes.values.toList(),
          onBack: () => setState(() => leaf = AppLeaf.today),
          onOpen: (room) => setState(() {
            openedRoom = room;
            leaf = AppLeaf.room;
          }),
        );
      case AppLeaf.room:
        final room = openedRoom;
        if (room == null) {
          return SeekPage(
            rooms: widget.catalog.themes.values.toList(),
            onBack: () => setState(() => leaf = AppLeaf.today),
            onOpen: (next) => setState(() {
              openedRoom = next;
              leaf = AppLeaf.room;
            }),
          );
        }
        return RoomPage(
          room: room,
          onBack: () => setState(() => leaf = AppLeaf.seek),
        );
      case AppLeaf.seven:
        return SevenPage(
          days: engine.seven,
          onBack: () => setState(() => leaf = AppLeaf.today),
          onOpen: (day) => setState(() {
            openedDay = day;
            leaf = AppLeaf.pathDay;
          }),
        );
      case AppLeaf.pathDay:
        final day = openedDay;
        if (day == null) {
          return SevenPage(
            days: engine.seven,
            onBack: () => setState(() => leaf = AppLeaf.today),
            onOpen: (next) => setState(() {
              openedDay = next;
              leaf = AppLeaf.pathDay;
            }),
          );
        }
        return PathDayPage(
          day: day,
          onBack: () => setState(() => leaf = AppLeaf.seven),
        );
      case AppLeaf.blessing:
        if (current == null) return const EmptyPage();
        return BlessingPage(
          moment: current,
          onBack: () => setState(() => leaf = AppLeaf.today),
        );
      case AppLeaf.about:
        return AboutPage(onBack: () => setState(() => leaf = AppLeaf.today));
    }
  }
}
