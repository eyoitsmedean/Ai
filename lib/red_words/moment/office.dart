/// Daily office — same clock as `officeName()` / `setWatch()` in the Quiet Page.
enum Office { morning, afternoon, vespers, compline }

enum Watch { dawn, day, vespers, night }

class DailyOffice {
  const DailyOffice({required this.office, required this.watch});

  final Office office;
  final Watch watch;

  String get name {
    switch (office) {
      case Office.morning:
        return 'Morning';
      case Office.afternoon:
        return 'Afternoon';
      case Office.vespers:
        return 'Vespers';
      case Office.compline:
        return 'Compline';
    }
  }

  String get runningTitle {
    switch (office) {
      case Office.compline:
        return 'Night office';
      case Office.vespers:
        return 'Evening office';
      case Office.morning:
        return "Today’s light";
      case Office.afternoon:
        return "Today’s light";
    }
  }

  bool get isEvening => office == Office.vespers || office == Office.compline;

  static const vespersPrompts = [
    'What are you laying down?',
    'Where did you need rest?',
    'What stayed after the day?',
    'Whom will you forgive before sleep?',
    'What fear can wait until morning?',
    'Where was mercy given to you?',
    'What will you leave in His hands?',
  ];

  factory DailyOffice.at(DateTime time) {
    final h = time.hour;
    final night = h >= 21 || h < 6;
    final evening = h >= 17 || h < 6;
    final Office office;
    if (night) {
      office = Office.compline;
    } else if (evening) {
      office = Office.vespers;
    } else if (h < 12) {
      office = Office.morning;
    } else {
      office = Office.afternoon;
    }
    final Watch watch;
    if (h < 6) {
      watch = Watch.night;
    } else if (h < 11) {
      watch = Watch.dawn;
    } else if (h < 17) {
      watch = Watch.day;
    } else if (h < 21) {
      watch = Watch.vespers;
    } else {
      watch = Watch.night;
    }
    return DailyOffice(office: office, watch: watch);
  }

  String vespersPromptOn(DateTime time) => vespersPrompts[time.weekday % 7];
}

const _catchwordSkip = {
  'these',
  'things',
  'that',
  'unto',
  'have',
  'from',
  'shall',
  'they',
  'them',
  'this',
  'into',
  'your',
  'their',
  'with',
  'been',
  'were',
  'said',
  'saith',
  'spoken',
  'before',
  'after',
  'which',
  'there',
  'about',
  'would',
  'could',
  'should',
  'might',
  'what',
  'when',
  'where',
};

/// Letterpress catchword: a weighty word from the saying, not a particle.
String catchword(String passage) {
  final words = passage
      .replaceAll(RegExp(r"[^A-Za-z\s]"), ' ')
      .split(RegExp(r'\s+'))
      .where((w) => w.isNotEmpty)
      .toList();
  for (final word in words) {
    if (word.length >= 4 && !_catchwordSkip.contains(word.toLowerCase())) {
      return word;
    }
  }
  for (final word in words) {
    if (word.length > 3) return word;
  }
  return words.isEmpty ? 'Peace' : words.first;
}
