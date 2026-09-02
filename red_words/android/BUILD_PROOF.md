# Android assembleRelease proof

Run on this Linux agent, 2026-09-02.

```
flutter build apk --release
BUILD SUCCESSFUL in 2m 42s
142 actionable tasks: 141 executed, 1 up-to-date
✓ Built build/app/outputs/flutter-apk/app-release.apk (49.7MB)
```

`aapt dump badging`:

```
package: name='com.redwords.redwords' versionCode='1' versionName='1.0.0'
sdkVersion:'24'
targetSdkVersion:'36'
application-label:'Red Words'
```

SHA-256 of that local APK: `d8c340c417b67fb3b4fa1dc65f5c79fe54aa10387054bf74965c992b34284ed5`

Signing: **not** the Android debug cert. `apksigner verify --print-certs`:

```
Verifies
Verified using v2 scheme (APK Signature Scheme v2): true
Signer #1 certificate DN: CN=Red Words Placeholder, O=Red Words, C=US
```

Local placeholder keystore only (`/tmp/redwords-placeholder.jks`). This APK is **not** Play-uploadable. Dean must replace `android/key.properties` with the real upload keystore.

R8/ProGuard: enabled for release (`isMinifyEnabled = true`).
