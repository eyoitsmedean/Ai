import SwiftUI
import WidgetKit

struct SayingEntry: TimelineEntry {
    let date: Date
    let word: String
    let citation: String
    let thread: String
}

struct SayingProvider: TimelineProvider {
    func placeholder(in context: Context) -> SayingEntry {
        SayingEntry(
            date: Date(),
            word: "Therefore don’t be anxious for tomorrow, for tomorrow will be anxious for itself. Each day’s own evil is sufficient.",
            citation: "MATTHEW 6:34",
            thread: "crimson-knot"
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (SayingEntry) -> Void) {
        completion(current())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<SayingEntry>) -> Void) {
        let timeline = Timeline(entries: [current()], policy: .after(Date().addingTimeInterval(60 * 60)))
        completion(timeline)
    }

    private func current() -> SayingEntry {
        let defaults = UserDefaults(suiteName: "group.com.redwords.redWords")
        return SayingEntry(
            date: Date(),
            word: defaults?.string(forKey: "widget.word") ?? "His words, for this moment",
            citation: defaults?.string(forKey: "widget.citation") ?? "",
            thread: defaults?.string(forKey: "widget.thread") ?? "crimson-knot"
        )
    }
}

struct RedWordsWidgetView: View {
    var entry: SayingEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(entry.word)
                .font(.system(.body, design: .serif))
                .foregroundColor(Color(red: 0.55, green: 0.11, blue: 0.14))
                .lineLimit(6)
            Text(entry.citation)
                .font(.system(.caption, design: .default))
                .tracking(1.2)
                .foregroundColor(Color(red: 0.55, green: 0.11, blue: 0.14))
            ThreadMark()
        }
        .padding()
        .widgetBackground(Color(red: 0.96, green: 0.94, blue: 0.90))
        .widgetURL(URL(string: "redwords://today"))
    }
}

extension View {
    /// containerBackground(_:for:) is iOS 17+. On iOS 17 a widget without it renders
    /// "Please adopt containerBackground API"; on the 15.0 target it does not compile
    /// unguarded. Below 17, plain background is the correct call.
    @ViewBuilder
    func widgetBackground(_ color: Color) -> some View {
        if #available(iOSApplicationExtension 17.0, iOS 17.0, *) {
            containerBackground(color, for: .widget)
        } else {
            background(color)
        }
    }
}

struct ThreadMark: View {
    var body: some View {
        Capsule()
            .fill(Color(red: 0.55, green: 0.11, blue: 0.14))
            .frame(width: 28, height: 2)
    }
}

@main
struct RedWordsWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "RedWordsWidget", provider: SayingProvider()) { entry in
            RedWordsWidgetView(entry: entry)
        }
        .configurationDisplayName("Red Words")
        .description("Word, citation, and thread.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
