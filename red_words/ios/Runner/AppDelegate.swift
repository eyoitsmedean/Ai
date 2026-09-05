import Flutter
import UIKit
import WidgetKit

@main
@objc class AppDelegate: FlutterAppDelegate, FlutterImplicitEngineDelegate {
  // Must match RedWordsWidget.swift and WidgetBridge in Dart.
  private let appGroup = "group.com.redwords.redWords"
  private let widgetChannel = "redwords/widget"
  private let widgetKeys = ["widget.word", "widget.citation", "widget.thread"]

  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  func didInitializeImplicitFlutterEngine(_ engineBridge: FlutterImplicitEngineBridge) {
    GeneratedPluginRegistrant.register(with: engineBridge.pluginRegistry)

    let channel = FlutterMethodChannel(
      name: widgetChannel,
      binaryMessenger: engineBridge.applicationRegistrar.messenger()
    )
    channel.setMethodCallHandler { [weak self] call, result in
      guard let self = self else {
        result(FlutterError(code: "gone", message: "AppDelegate released", details: nil))
        return
      }
      switch call.method {
      case "update":
        guard let args = call.arguments as? [String: Any] else {
          result(FlutterError(code: "args", message: "update expects a map", details: nil))
          return
        }
        self.pushToWidget(args)
        result(nil)
      default:
        result(FlutterMethodNotImplemented)
      }
    }
  }

  private func pushToWidget(_ args: [String: Any]) {
    guard let defaults = UserDefaults(suiteName: appGroup) else { return }
    for key in widgetKeys {
      if let value = args[key] as? String {
        defaults.set(value, forKey: key)
      }
    }
    WidgetCenter.shared.reloadAllTimelines()
  }
}
