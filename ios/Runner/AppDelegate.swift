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
        } else if call.method == "keepReply",
                  let args = call.arguments as? [String: Any],
                  let date = args["date"] as? String,
                  let text = args["text"] as? String {
          UserDefaults.standard.set(text, forKey: "reply.\(date)")
          result(nil)
        } else if call.method == "loadReply", let date = call.arguments as? String {
          result(UserDefaults.standard.string(forKey: "reply.\(date)") ?? "")
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
        } else if call.method == "share", let text = call.arguments as? String {
          let sheet = UIActivityViewController(activityItems: [text], applicationActivities: nil)
          let scene = UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .first { $0.activationState == .foregroundActive }
            ?? UIApplication.shared.connectedScenes.first as? UIWindowScene
          var host = scene?.keyWindow?.rootViewController
          while let presented = host?.presentedViewController {
            host = presented
          }
          if let popover = sheet.popoverPresentationController, let view = host?.view {
            popover.sourceView = view
            popover.sourceRect = CGRect(x: view.bounds.midX, y: view.bounds.midY, width: 0, height: 0)
            popover.permittedArrowDirections = []
          }
          guard let presenter = host else {
            result(FlutterError(code: "NO_HOST", message: "No view controller to present the share sheet.", details: nil))
            return
          }
          presenter.present(sheet, animated: true)
          result(nil)
        } else {
          result(FlutterMethodNotImplemented)
        }
      }
  }
}
