import Flutter
import UIKit
import WidgetKit

@main
@objc class AppDelegate: FlutterAppDelegate, FlutterImplicitEngineDelegate {
  static var initialLink: String?

  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    if let url = launchOptions?[.url] as? URL {
      AppDelegate.initialLink = url.absoluteString
    }
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  override func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    AppDelegate.initialLink = url.absoluteString
    return super.application(app, open: url, options: options)
  }

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
        let defaults = UserDefaults(suiteName: "group.com.redwords.redWords")
        defaults?.set(word, forKey: "word")
        defaults?.set(citation, forKey: "citation")
        WidgetCenter.shared.reloadTimelines(ofKind: "RedWordsWidget")
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
          result(AppDelegate.initialLink)
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
