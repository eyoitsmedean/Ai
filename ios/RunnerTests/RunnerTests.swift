import XCTest

final class RunnerTests: XCTestCase {
  func testLockedIdentifiers() {
    let bundle = Bundle.main.bundleIdentifier
    XCTAssertEqual(bundle, "com.redwords.redWords.RunnerTests")
  }

  func testWidgetCraftConstants() {
    XCTAssertEqual("group.com.redwords.redWords", "group.com.redwords.redWords")
    XCTAssertEqual("RedWordsWidget", "RedWordsWidget")
    XCTAssertEqual("redwords://today", "redwords://today")
  }
}
