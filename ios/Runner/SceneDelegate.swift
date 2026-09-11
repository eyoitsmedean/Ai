import Flutter
import UIKit

/// Sole URL capture under the UIScene lifecycle.
/// Cold start: connectionOptions.urlContexts. Warm start: openURLContexts.
class SceneDelegate: FlutterSceneDelegate {
  override func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    if let url = connectionOptions.urlContexts.first?.url {
      AppDelegate.pendingLink = url.absoluteString
    }
    super.scene(scene, willConnectTo: session, options: connectionOptions)
  }

  override func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    if let url = URLContexts.first?.url {
      AppDelegate.pendingLink = url.absoluteString
    }
    super.scene(scene, openURLContexts: URLContexts)
  }
}
