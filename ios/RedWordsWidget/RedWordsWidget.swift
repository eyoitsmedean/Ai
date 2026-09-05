import SwiftUI
import WidgetKit

/// One Word-only card: the saying and its address.
struct WordSlot: Decodable {
  let word: String
  let citation: String
}

enum WordStore {
  static let suite = "group.com.redwords.redWords"
  static let kind = "RedWordsWidget"

  /// The seven-slot daily cycle the app wrote at last open. Empty until then.
  static func rotation() -> [WordSlot] {
    guard let defaults = UserDefaults(suiteName: suite),
          let raw = defaults.string(forKey: "rotation"),
          let data = raw.data(using: .utf8),
          let slots = try? JSONDecoder().decode([WordSlot].self, from: data)
    else {
      return []
    }
    return slots.filter { !$0.word.isEmpty && !$0.citation.isEmpty }
  }

  /// Today's card as the app last saw it. Fallback when no rotation is stored.
  static func legacy() -> WordSlot {
    let defaults = UserDefaults(suiteName: suite)
    return WordSlot(
      word: defaults?.string(forKey: "word") ?? "",
      citation: defaults?.string(forKey: "citation") ?? ""
    )
  }

  /// Same clock as Dart `dailyIndexFor` and Node `dailyForDate`:
  /// floor(epochMs(local midnight) / 86_400_000) mod length.
  static func slotIndex(for date: Date, length: Int, calendar: Calendar = .current) -> Int {
    guard length > 0 else { return 0 }
    let midnight = calendar.startOfDay(for: date)
    let epochMs = (midnight.timeIntervalSince1970 * 1000).rounded(.down)
    let day = Int((epochMs / 86_400_000).rounded(.down))
    return ((day % length) + length) % length
  }

  static func slot(for date: Date) -> WordSlot {
    let slots = rotation()
    if slots.isEmpty { return legacy() }
    return slots[slotIndex(for: date, length: slots.count)]
  }
}

struct WordEntry: TimelineEntry {
  let date: Date
  let word: String
  let citation: String
}

struct WordProvider: TimelineProvider {
  func placeholder(in context: Context) -> WordEntry {
    WordEntry(date: Date(), word: "", citation: "")
  }

  func getSnapshot(in context: Context, completion: @escaping (WordEntry) -> Void) {
    let now = Date()
    let slot = WordStore.slot(for: now)
    completion(WordEntry(date: now, word: slot.word, citation: slot.citation))
  }

  /// One entry now, then one at each of the next six local midnights.
  /// Entries render on schedule without the app; `.after(nextMidnight)`
  /// asks for a fresh timeline once a day, well inside the reload budget.
  func getTimeline(in context: Context, completion: @escaping (Timeline<WordEntry>) -> Void) {
    let calendar = Calendar.current
    let now = Date()
    var entries: [WordEntry] = []

    let today = WordStore.slot(for: now)
    entries.append(WordEntry(date: now, word: today.word, citation: today.citation))

    let startOfToday = calendar.startOfDay(for: now)
    for dayOffset in 1...6 {
      guard let midnight = calendar.date(byAdding: .day, value: dayOffset, to: startOfToday) else { continue }
      let slot = WordStore.slot(for: midnight)
      entries.append(WordEntry(date: midnight, word: slot.word, citation: slot.citation))
    }

    let nextMidnight = calendar.date(byAdding: .day, value: 1, to: startOfToday) ?? now.addingTimeInterval(6 * 3600)
    completion(Timeline(entries: entries, policy: .after(nextMidnight)))
  }
}

enum Crimson {
  static let ink = Color(red: 0x8F / 255, green: 0x1D / 255, blue: 0x1D / 255)
  static let paper = Color(red: 0xF4 / 255, green: 0xEF / 255, blue: 0xE4 / 255)
}

/// What a small card may show of the saying: the whole sentence if it is
/// short, else the longest opening clause that closes on punctuation within
/// 60 characters, else nothing. The address alone beats a mid-clause ellipsis
/// on scripture.
func openingClause(_ word: String) -> String? {
  let limit = 60
  if word.count <= limit { return word }
  var strong: String?
  var soft: String?
  var index = word.startIndex
  var count = 0
  while index < word.endIndex && count < limit {
    let ch = word[index]
    if ch == ":" || ch == ";" || ch == "." {
      strong = String(word[word.startIndex...index])
    } else if ch == "," {
      soft = String(word[word.startIndex...index])
    }
    index = word.index(after: index)
    count += 1
  }
  return strong ?? soft
}

struct WordCard: View {
  @Environment(\.widgetFamily) private var family
  var entry: WordEntry

  var body: some View {
    VStack(alignment: .leading, spacing: 10) {
      if entry.word.isEmpty {
        Text("")
      } else if family == .systemSmall {
        smallCard
      } else {
        fullCard
      }
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    .widgetURL(URL(string: "redwords://today"))
  }

  private var fullCard: some View {
    Group {
      Text(entry.word)
        .font(.system(.title3, design: .serif).italic())
        .foregroundColor(Crimson.ink)
        .minimumScaleFactor(0.8)
        .lineLimit(family == .systemLarge ? 12 : 6)
      Text(entry.citation)
        .font(.system(.caption2, design: .default))
        .tracking(1.1)
        .foregroundColor(Crimson.ink)
    }
  }

  private var smallCard: some View {
    Group {
      if let clause = openingClause(entry.word) {
        Text(clause)
          .font(.system(.body, design: .serif).italic())
          .foregroundColor(Crimson.ink)
          .minimumScaleFactor(0.85)
          .lineLimit(4)
      }
      Text(entry.citation)
        .font(.system(.footnote, design: .serif))
        .foregroundColor(Crimson.ink)
        .lineLimit(2)
    }
  }
}

@available(iOS 17.0, *)
struct WordCardContainer: View {
  var entry: WordEntry

  var body: some View {
    WordCard(entry: entry)
      .containerBackground(for: .widget) {
        Crimson.paper
      }
  }
}

struct WordCardLegacy: View {
  var entry: WordEntry

  var body: some View {
    WordCard(entry: entry)
      .padding(14)
      .background(Crimson.paper)
  }
}

struct RedWordsWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: WordStore.kind, provider: WordProvider()) { entry in
      if #available(iOS 17.0, *) {
        WordCardContainer(entry: entry)
      } else {
        WordCardLegacy(entry: entry)
      }
    }
    .configurationDisplayName("Word")
    .description("The sentence for this moment.")
    .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
  }
}

@main
struct RedWordsWidgetBundle: WidgetBundle {
  var body: some Widget {
    RedWordsWidget()
  }
}
