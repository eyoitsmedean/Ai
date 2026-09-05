import 'catalog.dart';
import 'church_year.dart';
import 'models.dart';
import 'office.dart';
import 'widget_contract.dart';

/// Same clock as `dailyForDate` in `lib/curated.js`.
int dailyIndexFor(DateTime date, int length) {
  if (length <= 0) return 0;
  final local = DateTime(date.year, date.month, date.day);
  return (local.millisecondsSinceEpoch / 86400000).floor() % length;
}

class MomentEngine {
  MomentEngine(this.catalog);

  final MomentCatalog catalog;

  DailyMoment? forDate(DateTime date) {
    if (catalog.daily.isEmpty) return null;
    final idx = dailyIndexFor(date, catalog.daily.length);
    return catalog.lock(catalog.daily[idx]);
  }

  DailyMoment? get today => forDate(DateTime.now());

  ChurchSeason seasonOn(DateTime date) => churchYear(date);

  ThemeRoom? room(String name) => catalog.themes[name];

  DailyOffice officeAt(DateTime time) => DailyOffice.at(time);

  List<PathDay> get seven {
    return catalog.seven
        .map(catalog.lockPath)
        .whereType<PathDay>()
        .toList();
  }

  WidgetPayload? widgetFor(DateTime date) {
    final moment = forDate(date);
    if (moment == null) return null;
    return WidgetPayload.fromSaying(moment.word);
  }
}
