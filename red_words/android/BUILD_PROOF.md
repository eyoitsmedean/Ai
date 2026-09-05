# Android release build proof

Three runs on Linux agents. All green.

## Run 3 — 2026-09-05 (after widget channel + 988 fallback)

Same toolchain as Run 2. New Kotlin (`MainActivity` method channel, `SayingWidgetProvider` prefs file) compiled under AGP 9.1 / R8.

```
flutter analyze          No issues found!
flutter test             +53: All tests passed!
flutter build apk --release        ✓ app-release.apk (49.9MB)   assembleRelease 32.9s
flutter build appbundle --release  ✓ app-release.aab (49.4MB)   bundleRelease 4.9s
```

Badging unchanged (`com.redwords.redwords`, `Red Words`, min 24, target 36). Signer unchanged (placeholder, not debug).

R8 kept what the widget needs — strings present in `classes.dex`: `redwords/widget`, `red_words_widget`, `widget.word`, `widget.citation`, `widget.thread`; `mapping.txt` keeps `MainActivity` and `SayingWidgetProvider` under their real names (manifest components).

Pack read back from the AAB: 100 · `anxiety-mt-6-34` · Matthew 6:34 · John/Luke/Mark/Matthew · `"license": "Public domain"`.

SHA-256:

```
7352cde6e646fdeff80b055178e1f8900d52bdd492bee60c6dd6a528fa2878bc  app-release.apk
e4ec2e307a34c250a157b8ce3e3e1fffbb0c29fbeb2c3addecf77e7956c8f2a7  app-release.aab
```

## Run 2 — 2026-09-05 (fresh VM, toolchain reinstalled from scratch)

Flutter stable (framework `d3b14c8769`, Dart 3.13.2), Android SDK 36 / build-tools 36.0.0, Gradle 9.3.1, AGP 9.1.0, OpenJDK 21.

```
flutter analyze          No issues found!
flutter test             +39: All tests passed!

flutter build apk --release
Running Gradle task 'assembleRelease'...   157.5s
✓ Built build/app/outputs/flutter-apk/app-release.apk (49.7MB)

flutter build appbundle --release
Running Gradle task 'bundleRelease'...       6.2s
✓ Built build/app/outputs/bundle/release/app-release.aab (49.2MB)
```

Play Console only accepts an **AAB**; the APK is for sideload QA on founder phones.

`aapt dump badging app-release.apk`:

```
package: name='com.redwords.redwords' versionCode='1' versionName='1.0.0' compileSdkVersion='36'
sdkVersion:'24'
targetSdkVersion:'36'
application-label:'Red Words'
```

Compiled manifest (post-R8, post-shrinkResources) still has:

- `<queries>` with `tel` data — `tel:988` launcher intent can resolve
- `redwords://today` deep link (`scheme="redwords"`, `host="today"`)
- `com.redwords.red_words.SayingWidgetProvider` receiver, `APPWIDGET_UPDATE`

Bundled Scripture pack read back out of the AAB (`base/assets/flutter_assets/assets/sayings.json`): **100 sayings**, first `anxiety-mt-6-34` / Matthew 6:34, books = John, Luke, Mark, Matthew only.

Signing — **not** the Android debug cert:

```
apksigner verify --print-certs app-release.apk
Signer #1 certificate DN: CN=Red Words Placeholder, O=Red Words, C=US

jarsigner -verify app-release.aab
jar verified.
- Signed by "CN=Red Words Placeholder, O=Red Words, C=US"
```

R8/ProGuard ran: `build/app/outputs/mapping/release/mapping.txt` (7.3 MB), `usage.txt`, `seeds.txt`, `configuration.txt` present.

SHA-256:

```
fcccacb1608d8f68766bbe9d08bcb6070566b2b425e8be84c4184ca54d1adabe  app-release.apk
b70bc73d23330286d1bab5a68fc79c318b41ecf9345eb4019af917c17db08420  app-release.aab
```

## Run 1 — 2026-09-02

```
flutter build apk --release
BUILD SUCCESSFUL in 2m 42s
142 actionable tasks: 141 executed, 1 up-to-date
✓ Built build/app/outputs/flutter-apk/app-release.apk (49.7MB)
```

Same badging, same placeholder signer. APK SHA-256 `d8c340c417b67fb3b4fa1dc65f5c79fe54aa10387054bf74965c992b34284ed5`.

## Not Play-uploadable yet

Both runs used a local placeholder keystore (`/tmp/redwords-placeholder.jks`, gitignored `android/key.properties`). Dean must replace `android/key.properties` with the real Play upload keystore and rebuild the AAB. Nothing else changes.
