import 'package:flutter/material.dart';

import 'moment/models.dart';

/// Paper and crimson from DESIGN.md. Seasons retint the leaf.
class RedWordsColors {
  const RedWordsColors({
    required this.paper,
    required this.folio,
    required this.ink,
    required this.inkMuted,
    required this.crimson,
    required this.gold,
    required this.rule,
  });

  final Color paper;
  final Color folio;
  final Color ink;
  final Color inkMuted;
  final Color crimson;
  final Color gold;
  final Color rule;

  static const ordinary = RedWordsColors(
    paper: Color(0xFFF4EFE4),
    folio: Color(0xFFFBF7EE),
    ink: Color(0xFF1B1610),
    inkMuted: Color(0xFF7A6E5E),
    crimson: Color(0xFF8F1D1D),
    gold: Color(0xFF8A6A28),
    rule: Color(0x1A1B1610),
  );

  static const advent = RedWordsColors(
    paper: Color(0xFFEEEBE6),
    folio: Color(0xFFF4F1EA),
    ink: Color(0xFF1B1610),
    inkMuted: Color(0xFF7A6E5E),
    crimson: Color(0xFF5C2448),
    gold: Color(0xFF5A4A6A),
    rule: Color(0x1A1B1610),
  );

  static const christmas = RedWordsColors(
    paper: Color(0xFFF7F0E2),
    folio: Color(0xFFFBF6EC),
    ink: Color(0xFF1B1610),
    inkMuted: Color(0xFF7A6E5E),
    crimson: Color(0xFF9A1C24),
    gold: Color(0xFFA07A2A),
    rule: Color(0x1A1B1610),
  );

  static const lent = RedWordsColors(
    paper: Color(0xFFE8E0D2),
    folio: Color(0xFFEFE8DA),
    ink: Color(0xFF1B1610),
    inkMuted: Color(0xFF7A6E5E),
    crimson: Color(0xFF6E2E24),
    gold: Color(0xFF6B5344),
    rule: Color(0x1A1B1610),
  );

  static const easter = RedWordsColors(
    paper: Color(0xFFF7F2E6),
    folio: Color(0xFFFBF7EE),
    ink: Color(0xFF1B1610),
    inkMuted: Color(0xFF7A6E5E),
    crimson: Color(0xFF8F1D1D),
    gold: Color(0xFFC4A35A),
    rule: Color(0x1A1B1610),
  );

  factory RedWordsColors.forSeason(ChurchSeason season) {
    switch (season.id) {
      case 'advent':
        return advent;
      case 'christmas':
        return christmas;
      case 'lent':
        return lent;
      case 'easter':
        return easter;
      default:
        return ordinary;
    }
  }
}

ThemeData redWordsTheme(ChurchSeason season) {
  final colors = RedWordsColors.forSeason(season);
  final base = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    scaffoldBackgroundColor: colors.paper,
    colorScheme: ColorScheme.light(
      primary: colors.crimson,
      onPrimary: colors.folio,
      surface: colors.paper,
      onSurface: colors.ink,
      secondary: colors.gold,
    ),
  );
  return base.copyWith(
    textTheme: base.textTheme.apply(
      bodyColor: colors.ink,
      displayColor: colors.ink,
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: colors.paper,
      foregroundColor: colors.ink,
      elevation: 0,
      centerTitle: true,
      titleTextStyle: TextStyle(
        fontFamily: 'serif',
        fontSize: 16,
        letterSpacing: 1.4,
        color: colors.inkMuted,
      ),
    ),
  );
}

class PaperScope extends InheritedWidget {
  const PaperScope({
    super.key,
    required this.colors,
    required this.season,
    required super.child,
  });

  final RedWordsColors colors;
  final ChurchSeason season;

  static PaperScope of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<PaperScope>();
    if (scope == null) {
      throw StateError('PaperScope missing');
    }
    return scope;
  }

  @override
  bool updateShouldNotify(PaperScope oldWidget) =>
      colors != oldWidget.colors || season.id != oldWidget.season.id;
}
