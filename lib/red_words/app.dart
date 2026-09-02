import 'package:flutter/material.dart';

import 'moment/catalog.dart';
import 'moment/engine.dart';
import 'moment/models.dart';
import 'moment/widget_contract.dart';
import 'platform/session.dart';
import 'screens/pages.dart';
import 'theme.dart';

enum AppLeaf { title, today, sit, seek, room, about, empty }

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
  bool ready = false;

  DateTime get now => widget.now ?? DateTime.now();

  DailyMoment? get moment => engine.forDate(now);

  @override
  void initState() {
    super.initState();
    session = widget.session ?? SessionStore();
    _boot();
  }

  Future<void> _boot() async {
    final opened = await session.hasOpened();
    final link = RedWordsLink.parse(widget.initialLink) ??
        RedWordsLink.parse(await LinkBridge.initial());
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
      await _pushWidget();
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
          onSit: () => setState(() => leaf = AppLeaf.sit),
          onSeek: () => setState(() => leaf = AppLeaf.seek),
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
      case AppLeaf.about:
        return AboutPage(onBack: () => setState(() => leaf = AppLeaf.today));
    }
  }
}
