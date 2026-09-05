import Flutter
import UIKit
import WidgetKit

@main
@objc class AppDelegate: FlutterAppDelegate, FlutterImplicitEngineDelegate {
  /// Set by SceneDelegate. Under the UIScene lifecycle UIKit does not deliver
  /// URLs to the app delegate, so this is the only capture point.
  static var pendingLink: String?

  static let suite = "group.com.redwords.redWords"
  static let widgetKind = "RedWordsWidget"

  func didInitializeImplicitFlutterEngine(_ engineBridge: FlutterImplicitEngineBridge) {
    GeneratedPluginRegistrant.register(with: engineBridge.pluginRegistry)
    let messenger = engineBridge.applicationRegistrar.messenger()

    FlutterMethodChannel(name: "redwords/widget", binaryMessenger: messenger)
      .setMethodCallHandler { call, result in
        guard call.method == "sync",
              let args = call.arguments as? [String: Any],
              let word = args["word"] as? String,
              let citation = args["citation"] as? String
        else {
          result(FlutterMethodNotImplemented)
          return
        }
        let defaults = UserDefaults(suiteName: AppDelegate.suite)
        defaults?.set(word, forKey: "word")
        defaults?.set(citation, forKey: "citation")
        if let rotation = args["rotation"] as? String {
          defaults?.set(rotation, forKey: "rotation")
        }
        WidgetCenter.shared.reloadTimelines(ofKind: AppDelegate.widgetKind)
        result(nil)
      }

    FlutterMethodChannel(name: "redwords/session", binaryMessenger: messenger)
      .setMethodCallHandler { call, result in
        if call.method == "hasOpened" {
          result(UserDefaults.standard.bool(forKey: "hasOpened"))
        } else if call.method == "markOpened" {
          UserDefaults.standard.set(true, forKey: "hasOpened")
          result(nil)
        } else {
          result(FlutterMethodNotImplemented)
        }
      }

    FlutterMethodChannel(name: "redwords/links", binaryMessenger: messenger)
      .setMethodCallHandler { call, result in
        if call.method == "initial" {
          // Consume: a widget tap routes once, then the slate is clean.
          let link = AppDelegate.pendingLink
          AppDelegate.pendingLink = nil
          result(link)
        } else if call.method == "tel", let number = call.arguments as? String {
          if let url = URL(string: "tel:\(number)") {
            UIApplication.shared.open(url)
          }
          result(nil)
        } else {
          result(FlutterMethodNotImplemented)
        }
      }
  }
}
