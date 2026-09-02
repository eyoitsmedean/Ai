#!/usr/bin/env python3
"""Embed the RedWordsWidget extension in the Flutter iOS project."""
from pathlib import Path

PBX = Path(__file__).resolve().parent.parent / "ios" / "Runner.xcodeproj" / "project.pbxproj"
text = PBX.read_text()

if "RedWordsWidget.appex" in text:
    print("widget target already present")
    raise SystemExit(0)

def insert_after(anchor: str, block: str) -> None:
    global text
    idx = text.find(anchor)
    if idx < 0:
        raise SystemExit(f"missing anchor: {anchor}")
    text = text[: idx + len(anchor)] + block + text[idx + len(anchor) :]


insert_after(
    "/* End PBXBuildFile section */",
    """
		A11D00011F00000100000001 /* RedWordsWidget.swift in Sources */ = {isa = PBXBuildFile; fileRef = A11D00011F00000100000011 /* RedWordsWidget.swift */; };
		A11D00011F00000100000002 /* Assets.xcassets in Resources */ = {isa = PBXBuildFile; fileRef = A11D00011F00000100000014 /* Assets.xcassets */; };
		A11D00011F00000100000003 /* RedWordsWidget.appex in Embed Foundation Extensions */ = {isa = PBXBuildFile; fileRef = A11D00011F00000100000010 /* RedWordsWidget.appex */; settings = {ATTRIBUTES = (RemoveHeadersOnCopy, ); }; };
		A11D00011F00000100000004 /* WidgetKit.framework in Frameworks */ = {isa = PBXBuildFile; fileRef = A11D00011F00000100000024 /* WidgetKit.framework */; };
		A11D00011F00000100000005 /* SwiftUI.framework in Frameworks */ = {isa = PBXBuildFile; fileRef = A11D00011F00000100000025 /* SwiftUI.framework */; };
""",
)

insert_after(
    "/* End PBXContainerItemProxy section */",
    """
		A11D00011F00000100000019 /* PBXContainerItemProxy */ = {
			isa = PBXContainerItemProxy;
			containerPortal = 97C146E61CF9000F007C117D /* Project object */;
			proxyType = 1;
			remoteGlobalIDString = A11D00011F00000100000011T;
			remoteInfo = RedWordsWidget;
		};
""",
)

insert_after(
    "/* End PBXCopyFilesBuildPhase section */",
    """
		A11D00011F00000100000015 /* Embed Foundation Extensions */ = {
			isa = PBXCopyFilesBuildPhase;
			buildActionMask = 2147483647;
			dstPath = "";
			dstSubfolderSpec = 13;
			files = (
				A11D00011F00000100000003 /* RedWordsWidget.appex in Embed Foundation Extensions */,
			);
			name = "Embed Foundation Extensions";
			runOnlyForDeploymentPostprocessing = 0;
		};
""",
)

insert_after(
    "/* End PBXFileReference section */",
    """
		A11D00011F00000100000010 /* RedWordsWidget.appex */ = {isa = PBXFileReference; explicitFileType = "wrapper.app-extension"; includeInIndex = 0; path = RedWordsWidget.appex; sourceTree = BUILT_PRODUCTS_DIR; };
		A11D00011F00000100000011 /* RedWordsWidget.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = RedWordsWidget.swift; sourceTree = "<group>"; };
		A11D00011F00000100000012 /* Info.plist */ = {isa = PBXFileReference; lastKnownFileType = text.plist.xml; path = Info.plist; sourceTree = "<group>"; };
		A11D00011F00000100000013 /* RedWordsWidget.entitlements */ = {isa = PBXFileReference; lastKnownFileType = text.plist.entitlements; path = RedWordsWidget.entitlements; sourceTree = "<group>"; };
		A11D00011F00000100000014 /* Assets.xcassets */ = {isa = PBXFileReference; lastKnownFileType = folder.assetcatalog; path = Assets.xcassets; sourceTree = "<group>"; };
		A11D00011F00000100000024 /* WidgetKit.framework */ = {isa = PBXFileReference; lastKnownFileType = wrapper.framework; name = WidgetKit.framework; path = System/Library/Frameworks/WidgetKit.framework; sourceTree = SDKROOT; };
		A11D00011F00000100000025 /* SwiftUI.framework */ = {isa = PBXFileReference; lastKnownFileType = wrapper.framework; name = SwiftUI.framework; path = System/Library/Frameworks/SwiftUI.framework; sourceTree = SDKROOT; };
		A11D00011F00000100000030 /* Runner.entitlements */ = {isa = PBXFileReference; lastKnownFileType = text.plist.entitlements; path = Runner.entitlements; sourceTree = "<group>"; };
""",
)

insert_after(
    "/* End PBXFrameworksBuildPhase section */",
    """
		A11D00011F00000100000013F /* Frameworks */ = {
			isa = PBXFrameworksBuildPhase;
			buildActionMask = 2147483647;
			files = (
				A11D00011F00000100000004 /* WidgetKit.framework in Frameworks */,
				A11D00011F00000100000005 /* SwiftUI.framework in Frameworks */,
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
""",
)

text = text.replace(
    """		97C146E51CF9000F007C117D = {
			isa = PBXGroup;
			children = (
				9740EEB11CF90186004384FC /* Flutter */,
				97C146F01CF9000F007C117D /* Runner */,
				97C146EF1CF9000F007C117D /* Products */,
				331C8082294A63A400263BE5 /* RunnerTests */,
			);""",
    """		97C146E51CF9000F007C117D = {
			isa = PBXGroup;
			children = (
				9740EEB11CF90186004384FC /* Flutter */,
				97C146F01CF9000F007C117D /* Runner */,
				A11D00011F00000100000018 /* RedWordsWidget */,
				97C146EF1CF9000F007C117D /* Products */,
				331C8082294A63A400263BE5 /* RunnerTests */,
			);""",
)

text = text.replace(
    """			children = (
				97C146EE1CF9000F007C117D /* Runner.app */,
				331C8081294A63A400263BE5 /* RunnerTests.xctest */,
			);""",
    """			children = (
				97C146EE1CF9000F007C117D /* Runner.app */,
				331C8081294A63A400263BE5 /* RunnerTests.xctest */,
				A11D00011F00000100000010 /* RedWordsWidget.appex */,
			);""",
)

text = text.replace(
    """				74858FAE1ED2DC5600515810 /* AppDelegate.swift */,
				7884E8672EC3CC0400C636F2 /* SceneDelegate.swift */,
				74858FAD1ED2DC5600515810 /* Runner-Bridging-Header.h */,
			);""",
    """				74858FAE1ED2DC5600515810 /* AppDelegate.swift */,
				7884E8672EC3CC0400C636F2 /* SceneDelegate.swift */,
				74858FAD1ED2DC5600515810 /* Runner-Bridging-Header.h */,
				A11D00011F00000100000030 /* Runner.entitlements */,
			);""",
)

insert_after(
    "/* End PBXGroup section */",
    """
		A11D00011F00000100000018 /* RedWordsWidget */ = {
			isa = PBXGroup;
			children = (
				A11D00011F00000100000011 /* RedWordsWidget.swift */,
				A11D00011F00000100000012 /* Info.plist */,
				A11D00011F00000100000013 /* RedWordsWidget.entitlements */,
				A11D00011F00000100000014 /* Assets.xcassets */,
			);
			path = RedWordsWidget;
			sourceTree = "<group>";
		};
""",
)

insert_after(
    "/* End PBXNativeTarget section */",
    """
		A11D00011F00000100000011T /* RedWordsWidget */ = {
			isa = PBXNativeTarget;
			buildConfigurationList = A11D00011F00000100000023 /* Build configuration list for PBXNativeTarget "RedWordsWidget" */;
			buildPhases = (
				A11D00011F00000100000012S /* Sources */,
				A11D00011F00000100000013F /* Frameworks */,
				A11D00011F00000100000014R /* Resources */,
			);
			buildRules = (
			);
			dependencies = (
			);
			name = RedWordsWidget;
			productName = RedWordsWidget;
			productReference = A11D00011F00000100000010 /* RedWordsWidget.appex */;
			productType = "com.apple.product-type.app-extension";
		};
""",
)

text = text.replace(
    """				9705A1C41CF9048500538489 /* Embed Frameworks */,
				3B06AD1E1E4923F5004D2608 /* Thin Binary */,
			);""",
    """				9705A1C41CF9048500538489 /* Embed Frameworks */,
				A11D00011F00000100000015 /* Embed Foundation Extensions */,
				3B06AD1E1E4923F5004D2608 /* Thin Binary */,
			);""",
)

text = text.replace(
    """			dependencies = (
			);
			name = Runner;""",
    """			dependencies = (
				A11D00011F0000010000001A /* PBXTargetDependency */,
			);
			name = Runner;""",
)

text = text.replace(
    """			targets = (
				97C146ED1CF9000F007C117D /* Runner */,
				331C8080294A63A400263BE5 /* RunnerTests */,
			);""",
    """			targets = (
				97C146ED1CF9000F007C117D /* Runner */,
				331C8080294A63A400263BE5 /* RunnerTests */,
				A11D00011F00000100000011T /* RedWordsWidget */,
			);""",
)

insert_after(
    "		97C146EC1CF9000F007C117D /* Resources */ = {",
    """
			isa = PBXResourcesBuildPhase;
			buildActionMask = 2147483647;
			files = (
				97C147011CF9000F007C117D /* LaunchScreen.storyboard in Resources */,
				3B3967161E833CAA004F5970 /* AppFrameworkInfo.plist in Resources */,
				97C146FE1CF9000F007C117D /* Assets.xcassets in Resources */,
				97C146FC1CF9000F007C117D /* Main.storyboard in Resources */,
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
		A11D00011F00000100000014R /* Resources */ = {
			isa = PBXResourcesBuildPhase;
			buildActionMask = 2147483647;
			files = (
				A11D00011F00000100000002 /* Assets.xcassets in Resources */,
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
		__STRIPPED_RESOURCES__ = {""",
)

# The insert above duplicated the Resources phase start. Remove the leftover original body.
text = text.replace(
    """		A11D00011F00000100000014R /* Resources */ = {
			isa = PBXResourcesBuildPhase;
			buildActionMask = 2147483647;
			files = (
				A11D00011F00000100000002 /* Assets.xcassets in Resources */,
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
		__STRIPPED_RESOURCES__ = {
			isa = PBXResourcesBuildPhase;
			buildActionMask = 2147483647;
			files = (
				97C147011CF9000F007C117D /* LaunchScreen.storyboard in Resources */,
				3B3967161E833CAA004F5970 /* AppFrameworkInfo.plist in Resources */,
				97C146FE1CF9000F007C117D /* Assets.xcassets in Resources */,
				97C146FC1CF9000F007C117D /* Main.storyboard in Resources */,
			);
			runOnlyForDeploymentPostprocessing = 0;
		};""",
    """		A11D00011F00000100000014R /* Resources */ = {
			isa = PBXResourcesBuildPhase;
			buildActionMask = 2147483647;
			files = (
				A11D00011F00000100000002 /* Assets.xcassets in Resources */,
			);
			runOnlyForDeploymentPostprocessing = 0;
		};""",
)

insert_after(
    "/* End PBXSourcesBuildPhase section */",
    """
		A11D00011F00000100000012S /* Sources */ = {
			isa = PBXSourcesBuildPhase;
			buildActionMask = 2147483647;
			files = (
				A11D00011F00000100000001 /* RedWordsWidget.swift in Sources */,
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
""",
)

insert_after(
    "/* End PBXTargetDependency section */",
    """
		A11D00011F0000010000001A /* PBXTargetDependency */ = {
			isa = PBXTargetDependency;
			target = A11D00011F00000100000011T /* RedWordsWidget */;
			targetProxy = A11D00011F00000100000019 /* PBXContainerItemProxy */;
		};
""",
)

WIDGET_CONFIG = """
		A11D00011F00000100000020 /* Debug */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME = AccentColor;
				CODE_SIGN_ENTITLEMENTS = RedWordsWidget/RedWordsWidget.entitlements;
				CODE_SIGN_STYLE = Automatic;
				CURRENT_PROJECT_VERSION = "$(FLUTTER_BUILD_NUMBER)";
				GENERATE_INFOPLIST_FILE = NO;
				INFOPLIST_FILE = RedWordsWidget/Info.plist;
				IPHONEOS_DEPLOYMENT_TARGET = 15.0;
				LD_RUNPATH_SEARCH_PATHS = (
					"$(inherited)",
					"@executable_path/Frameworks",
					"@executable_path/../../Frameworks",
				);
				MARKETING_VERSION = "$(FLUTTER_BUILD_NAME)";
				PRODUCT_BUNDLE_IDENTIFIER = com.redwords.redWords.RedWordsWidget;
				PRODUCT_NAME = RedWordsWidget;
				SKIP_INSTALL = YES;
				SWIFT_EMIT_LOC_STRINGS = YES;
				SWIFT_VERSION = 5.0;
				TARGETED_DEVICE_FAMILY = "1,2";
			};
			name = Debug;
		};
		A11D00011F00000100000021 /* Release */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				CODE_SIGN_ENTITLEMENTS = RedWordsWidget/RedWordsWidget.entitlements;
				CODE_SIGN_STYLE = Automatic;
				CURRENT_PROJECT_VERSION = "$(FLUTTER_BUILD_NUMBER)";
				GENERATE_INFOPLIST_FILE = NO;
				INFOPLIST_FILE = RedWordsWidget/Info.plist;
				IPHONEOS_DEPLOYMENT_TARGET = 15.0;
				LD_RUNPATH_SEARCH_PATHS = (
					"$(inherited)",
					"@executable_path/Frameworks",
					"@executable_path/../../Frameworks",
				);
				MARKETING_VERSION = "$(FLUTTER_BUILD_NAME)";
				PRODUCT_BUNDLE_IDENTIFIER = com.redwords.redWords.RedWordsWidget;
				PRODUCT_NAME = RedWordsWidget;
				SKIP_INSTALL = YES;
				SWIFT_VERSION = 5.0;
				TARGETED_DEVICE_FAMILY = "1,2";
			};
			name = Release;
		};
		A11D00011F00000100000022 /* Profile */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				CODE_SIGN_ENTITLEMENTS = RedWordsWidget/RedWordsWidget.entitlements;
				CODE_SIGN_STYLE = Automatic;
				CURRENT_PROJECT_VERSION = "$(FLUTTER_BUILD_NUMBER)";
				GENERATE_INFOPLIST_FILE = NO;
				INFOPLIST_FILE = RedWordsWidget/Info.plist;
				IPHONEOS_DEPLOYMENT_TARGET = 15.0;
				LD_RUNPATH_SEARCH_PATHS = (
					"$(inherited)",
					"@executable_path/Frameworks",
					"@executable_path/../../Frameworks",
				);
				MARKETING_VERSION = "$(FLUTTER_BUILD_NAME)";
				PRODUCT_BUNDLE_IDENTIFIER = com.redwords.redWords.RedWordsWidget;
				PRODUCT_NAME = RedWordsWidget;
				SKIP_INSTALL = YES;
				SWIFT_VERSION = 5.0;
				TARGETED_DEVICE_FAMILY = "1,2";
			};
			name = Profile;
		};
"""

insert_after("/* End XCBuildConfiguration section */", WIDGET_CONFIG)

insert_after(
    "/* End XCConfigurationList section */",
    """
		A11D00011F00000100000023 /* Build configuration list for PBXNativeTarget "RedWordsWidget" */ = {
			isa = XCConfigurationList;
			buildConfigurations = (
				A11D00011F00000100000020 /* Debug */,
				A11D00011F00000100000021 /* Release */,
				A11D00011F00000100000022 /* Profile */,
			);
			defaultConfigurationIsVisible = 0;
			defaultConfigurationName = Release;
		};
""",
)

# Runner entitlements + iOS 15 on the app target.
for marker in (
    "		97C147061CF9000F007C117D /* Debug */ = {",
    "		97C147071CF9000F007C117D /* Release */ = {",
    "		249021D4217E4FDB00AE95B9 /* Profile */ = {",
):
    old = f"""{marker}
			isa = XCBuildConfiguration;
			baseConfigurationReference"""
    # add keys into each Runner target config
    pass

text = text.replace(
    "				ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;\n				CLANG_ENABLE_MODULES = YES;\n				CURRENT_PROJECT_VERSION = \"$(FLUTTER_BUILD_NUMBER)\";\n				ENABLE_BITCODE = NO;\n				INFOPLIST_FILE = Runner/Info.plist;",
    "				ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;\n				CLANG_ENABLE_MODULES = YES;\n				CODE_SIGN_ENTITLEMENTS = Runner/Runner.entitlements;\n				CURRENT_PROJECT_VERSION = \"$(FLUTTER_BUILD_NUMBER)\";\n				ENABLE_BITCODE = NO;\n				INFOPLIST_FILE = Runner/Info.plist;\n				IPHONEOS_DEPLOYMENT_TARGET = 15.0;",
)

PBX.write_text(text)
print("patched", PBX)
