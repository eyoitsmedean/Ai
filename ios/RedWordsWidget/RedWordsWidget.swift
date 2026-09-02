import SwiftUI
import WidgetKit

enum WordStore {
  static let suite = "group.com.redwords.redWords"
  static let kind = "RedWordsWidget"

  static func payload() -> (word: String, citation: String) {
    let defaults = UserDefaults(suiteName: suite)
    let word = defaults?.string(forKey: "word") ?? ""
    let citation = defaults?.string(forKey: "citation") ?? ""
    return (word, citation)
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
    let payload = WordStore.payload()
    completion(WordEntry(date: Date(), word: payload.word, citation: payload.citation))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<WordEntry>) -> Void) {
    let payload = WordStore.payload()
    let entry = WordEntry(date: Date(), word: payload.word, citation: payload.citation)
    let next = Calendar.current.date(byAdding: .hour, value: 6, to: Date()) ?? Date()
    completion(Timeline(entries: [entry], policy: .after(next)))
  }
}

struct WordCard: View {
  var entry: WordEntry

  var body: some View {
    VStack(alignment: .leading, spacing: 10) {
      if entry.word.isEmpty {
        Text("")
      } else {
        Text(entry.word)
          .font(.system(.title3, design: .serif).italic())
          .foregroundColor(Color(red: 0x8F / 255, green: 0x1D / 255, blue: 0x1D / 255))
          .minimumScaleFactor(0.6)
          .lineLimit(8)
        Text(entry.citation)
          .font(.system(size: 11, weight: .regular, design: .default))
          .tracking(1.1)
          .foregroundColor(Color(red: 0x8F / 255, green: 0x1D / 255, blue: 0x1D / 255))
      }
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    .widgetURL(URL(string: "redwords://today"))
  }
}

@available(iOS 17.0, *)
struct WordCardContainer: View {
  var entry: WordEntry

  var body: some View {
    WordCard(entry: entry)
      .containerBackground(for: .widget) {
        Color(red: 0xF4 / 255, green: 0xEF / 255, blue: 0xE4 / 255)
      }
  }
}

struct WordCardLegacy: View {
  var entry: WordEntry

  var body: some View {
    WordCard(entry: entry)
      .padding(14)
      .background(Color(red: 0xF4 / 255, green: 0xEF / 255, blue: 0xE4 / 255))
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
