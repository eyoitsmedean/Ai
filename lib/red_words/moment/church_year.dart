import 'models.dart';

/// Western church year — port of `lib/year.js`. Seasons change the paper.
int ymd(DateTime date) => date.year * 10000 + date.month * 100 + date.day;

DateTime civil(int year, int month, int day) => DateTime(year, month, day);

DateTime addDays(DateTime date, int n) =>
    DateTime(date.year, date.month, date.day + n);

/// Gregorian Easter (Anonymous / Meeus), same as the Node room.
DateTime easterSunday(int year) {
  final a = year % 19;
  final b = year ~/ 100;
  final c = year % 100;
  final d = b ~/ 4;
  final e = b % 4;
  final f = (b + 8) ~/ 25;
  final g = (b - f + 1) ~/ 3;
  final h = (19 * a + b - d - g + 15) % 30;
  final i = c ~/ 4;
  final k = c % 4;
  final l = (32 + 2 * e + 2 * i - h - k) % 7;
  final m = (a + 11 * h + 22 * l) ~/ 451;
  final month = (h + l - 7 * m + 114) ~/ 31;
  final day = ((h + l - 7 * m + 114) % 31) + 1;
  return civil(year, month, day);
}

DateTime adventSunday(int year) => _adventSundayJs(year);

DateTime ashWednesday(int year) => addDays(easterSunday(year), -46);

DateTime pentecost(int year) => addDays(easterSunday(year), 49);

const _seasons = <String, ChurchSeason>{
  'advent': ChurchSeason(id: 'advent', name: 'Advent', runningHead: 'Advent'),
  'christmas': ChurchSeason(
    id: 'christmas',
    name: 'Christmas',
    runningHead: 'Christmas',
  ),
  'lent': ChurchSeason(id: 'lent', name: 'Lent', runningHead: 'Lent'),
  'easter': ChurchSeason(id: 'easter', name: 'Easter', runningHead: 'Easter'),
  'ordinary': ChurchSeason(
    id: 'ordinary',
    name: 'Ordinary Time',
    runningHead: 'Ordinary Time',
  ),
};

/// JS `Date#getDay()` is 0=Sunday. Dart `weekday` is 1=Monday…7=Sunday.
/// Advent Sunday is the Sunday from Nov 27 through Dec 3.
int _jsWeekday(DateTime d) => d.weekday % 7;

DateTime _adventSundayJs(int year) {
  final start = civil(year, 11, 27);
  final add = (7 - _jsWeekday(start)) % 7;
  return addDays(start, add);
}

ChurchSeason churchYear(DateTime date) {
  final d = DateTime(date.year, date.month, date.day);
  final year = d.year;
  final n = ymd(d);

  final xmasStart = ymd(civil(year, 12, 25));
  final xmasEnd = ymd(civil(year, 12, 31));
  final xmasTailEnd = ymd(civil(year, 1, 5));
  if (n >= xmasStart && n <= xmasEnd) return _seasons['christmas']!;
  if (n <= xmasTailEnd) return _seasons['christmas']!;

  final advent = ymd(_adventSundayJs(year));
  final christmasEve = ymd(civil(year, 12, 24));
  if (n >= advent && n <= christmasEve) return _seasons['advent']!;

  final ash = ymd(ashWednesday(year));
  final holySaturday = ymd(addDays(easterSunday(year), -1));
  if (n >= ash && n <= holySaturday) return _seasons['lent']!;

  final easter = ymd(easterSunday(year));
  final whit = ymd(pentecost(year));
  if (n >= easter && n <= whit) return _seasons['easter']!;

  return _seasons['ordinary']!;
}
