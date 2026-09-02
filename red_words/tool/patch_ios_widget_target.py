#!/usr/bin/env python3
"""Inject the RedWordsWidget extension target into Runner.xcodeproj."""

from pathlib import Path

PBX = Path(__file__).resolve().parents[1] / "ios" / "Runner.xcodeproj" / "project.pbxproj"

WIDGET_BLOCK = r"""
		A1W000010000000000000001 /* RedWordsWidget.swift in Sources */ = {isa = PBXBuildFile; fileRef = A1W000020000000000000001 /* RedWordsWidget.swift */; };
		A1W000010000000000000002 /* WidgetKit.framework in Frameworks */ = {isa = PBXBuildFile; fileRef = A1W000020000000000000004 /* WidgetKit.framework */; };
		A1W000010000000000000003 /* SwiftUI.framework in Frameworks */ = {isa = PBXBuildFile; fileRef = A1W000020000000000000005 /* SwiftUI.framework */; };
		A1W000010000000000000004 /* RedWordsWidget.appex in Embed App Extensions */ = {isa = PBXBuildFile; fileRef = A1W000020000000000000006 /* RedWordsWidget.appex */; settings = {ATTRIBUTES = (RemoveHeadersOnCopy, ); }; };
"""

FILE_REFS = r"""
		A1W000020000000000000001 /* RedWordsWidget.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = RedWordsWidget.swift; sourceTree = "<group>"; };
		A1W000020000000000000002 /* Info.plist */ = {isa = PBXFileReference; lastKnownFileType = text.plist.xml; path = Info.plist; sourceTree = "<group>"; };
		A1W000020000000000000003 /* RedWordsWidget.entitlements */ = {isa = PBXFileReference; lastKnownFileType = text.plist.entitlements; path = RedWordsWidget.entitlements; sourceTree = "<group>"; };
		A1W000020000000000000004 /* WidgetKit.framework */ = {isa = PBXFileReference; lastKnownFileType = wrapper.framework; name = WidgetKit.framework; path = System/Library/Frameworks/WidgetKit.framework; sourceTree = SDKROOT; };
		A1W000020000000000000005 /* SwiftUI.framework */ = {isa = PBXFileReference; lastKnownFileType = wrapper.framework; name = SwiftUI.framework; path = System/Library/Frameworks/SwiftUI.framework; sourceTree = SDKROOT; };
		A1W000020000000000000006 /* RedWordsWidget.appex */ = {isa = PBXFileReference; explicitFileType = "wrapper.app-extension"; includeInIndex = 0; path = RedWordsWidget.appex; sourceTree = BUILT_PRODUCTS_DIR; };
"""

MORE = r"""
/* Begin PBXCopyFilesBuildPhase section extra */
		A1W000030000000000000001 /* Embed App Extensions */ = {
			isa = PBXCopyFilesBuildPhase;
			buildActionMask = 2147483647;
			dstPath = "";
			dstSubfolderSpec = 13;
			files = (
				A1W000010000000000000004 /* RedWordsWidget.appex in Embed App Extensions */,
			);
			name = "Embed App Extensions";
			runOnlyForDeploymentPostprocessing = 0;
		};
/* End PBXCopyFilesBuildPhase section extra */

		A1W000040000000000000001 /* RedWordsWidget */ = {
			isa = PBXGroup;
			children = (
				A1W000020000000000000001 /* RedWordsWidget.swift */,
				A1W000020000000000000002 /* Info.plist */,
				A1W000020000000000000003 /* RedWordsWidget.entitlements */,
			);
			path = RedWordsWidget;
			sourceTree = "<group>";
		};

		A1W000050000000000000001 /* Frameworks */ = {
			isa = PBXFrameworksBuildPhase;
			buildActionMask = 2147483647;
			files = (
				A1W000010000000000000002 /* WidgetKit.framework in Frameworks */,
				A1W000010000000000000003 /* SwiftUI.framework in Frameworks */,
			);
			runOnlyForDeploymentPostprocessing = 0;
		};

		A1W000050000000000000002 /* Sources */ = {
			isa = PBXSourcesBuildPhase;
			buildActionMask = 2147483647;
			files = (
				A1W000010000000000000001 /* RedWordsWidget.swift in Sources */,
			);
			runOnlyForDeploymentPostprocessing = 0;
		};

		A1W000050000000000000003 /* Resources */ = {
			isa = PBXResourcesBuildPhase;
			buildActionMask = 2147483647;
			files = (
			);
			runOnlyForDeploymentPostprocessing = 0;
		};

		A1W000060000000000000001 /* PBXContainerItemProxy */ = {
			isa = PBXContainerItemProxy;
			containerPortal = 97C146E61CF9000F007C117D /* Project object */;
			proxyType = 1;
			remoteGlobalIDString = A1W000070000000000000001;
			remoteInfo = RedWordsWidget;
		};

		A1W000060000000000000002 /* PBXTargetDependency */ = {
			isa = PBXTargetDependency;
			target = A1W000070000000000000001 /* RedWordsWidget */;
			targetProxy = A1W000060000000000000001 /* PBXContainerItemProxy */;
		};

		A1W000070000000000000001 /* RedWordsWidget */ = {
			isa = PBXNativeTarget;
			buildConfigurationList = A1W000080000000000000004 /* Build configuration list for PBXNativeTarget "RedWordsWidget" */;
			buildPhases = (
				A1W000050000000000000002 /* Sources */,
				A1W000050000000000000001 /* Frameworks */,
				A1W000050000000000000003 /* Resources */,
			);
			buildRules = (
			);
			dependencies = (
			);
			name = RedWordsWidget;
			productName = RedWordsWidget;
			productReference = A1W000020000000000000006 /* RedWordsWidget.appex */;
			productType = "com.apple.product-type.app-extension";
		};
"""

CONFIGS = r"""
		A1W000080000000000000001 /* Debug */ = {
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
				MARKETING_VERSION = 1.0;
				PRODUCT_BUNDLE_IDENTIFIER = com.redwords.redWords.RedWordsWidget;
				PRODUCT_NAME = "$(TARGET_NAME)";
				SKIP_INSTALL = YES;
				SWIFT_VERSION = 5.0;
				TARGETED_DEVICE_FAMILY = "1,2";
			};
			name = Debug;
		};
		A1W000080000000000000002 /* Release */ = {
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
				MARKETING_VERSION = 1.0;
				PRODUCT_BUNDLE_IDENTIFIER = com.redwords.redWords.RedWordsWidget;
				PRODUCT_NAME = "$(TARGET_NAME)";
				SKIP_INSTALL = YES;
				SWIFT_VERSION = 5.0;
				TARGETED_DEVICE_FAMILY = "1,2";
			};
			name = Release;
		};
		A1W000080000000000000003 /* Profile */ = {
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
				MARKETING_VERSION = 1.0;
				PRODUCT_BUNDLE_IDENTIFIER = com.redwords.redWords.RedWordsWidget;
				PRODUCT_NAME = "$(TARGET_NAME)";
				SKIP_INSTALL = YES;
				SWIFT_VERSION = 5.0;
				TARGETED_DEVICE_FAMILY = "1,2";
			};
			name = Profile;
		};
"""


def main() -> None:
    text = PBX.read_text()
    if "RedWordsWidget" in text and "A1W000070000000000000001" in text:
        print("widget target already present")
        return

    text = text.replace(
        "/* End PBXBuildFile section */",
        WIDGET_BLOCK + "/* End PBXBuildFile section */",
    )
    text = text.replace(
        "/* End PBXFileReference section */",
        FILE_REFS + "/* End PBXFileReference section */",
    )
    text = text.replace(
        "/* Begin PBXContainerItemProxy section */",
        "/* Begin PBXContainerItemProxy section */\n"
        "		A1W000060000000000000001 /* PBXContainerItemProxy */ = {\n"
        "			isa = PBXContainerItemProxy;\n"
        "			containerPortal = 97C146E61CF9000F007C117D /* Project object */;\n"
        "			proxyType = 1;\n"
        "			remoteGlobalIDString = A1W000070000000000000001;\n"
        "			remoteInfo = RedWordsWidget;\n"
        "		};\n",
    )
    text = text.replace(
        "		331C8086294A63A400263BE5 /* PBXTargetDependency */ = {",
        "		A1W000060000000000000002 /* PBXTargetDependency */ = {\n"
        "			isa = PBXTargetDependency;\n"
        "			target = A1W000070000000000000001 /* RedWordsWidget */;\n"
        "			targetProxy = A1W000060000000000000001 /* PBXContainerItemProxy */;\n"
        "		};\n"
        "		331C8086294A63A400263BE5 /* PBXTargetDependency */ = {",
    )
    text = text.replace(
        "			files = (\n			);\n			name = \"Embed Frameworks\";",
        "			files = (\n			);\n			name = \"Embed Frameworks\";",
    )
    # Embed extensions phase after Embed Frameworks section
    text = text.replace(
        "/* End PBXCopyFilesBuildPhase section */",
        "		A1W000030000000000000001 /* Embed App Extensions */ = {\n"
        "			isa = PBXCopyFilesBuildPhase;\n"
        "			buildActionMask = 2147483647;\n"
        "			dstPath = \"\";\n"
        "			dstSubfolderSpec = 13;\n"
        "			files = (\n"
        "				A1W000010000000000000004 /* RedWordsWidget.appex in Embed App Extensions */,\n"
        "			);\n"
        "			name = \"Embed App Extensions\";\n"
        "			runOnlyForDeploymentPostprocessing = 0;\n"
        "		};\n"
        "/* End PBXCopyFilesBuildPhase section */",
    )
    text = text.replace(
        "				331C8082294A63A400263BE5 /* RunnerTests */,\n			);\n			sourceTree = \"<group>\";",
        "				331C8082294A63A400263BE5 /* RunnerTests */,\n"
        "				A1W000040000000000000001 /* RedWordsWidget */,\n"
        "			);\n			sourceTree = \"<group>\";",
    )
    text = text.replace(
        "				331C8081294A63A400263BE5 /* RunnerTests.xctest */,\n			);",
        "				331C8081294A63A400263BE5 /* RunnerTests.xctest */,\n"
        "				A1W000020000000000000006 /* RedWordsWidget.appex */,\n"
        "			);",
    )
    text = text.replace(
        "			path = Runner;\n			sourceTree = \"<group>\";\n		};\n/* End PBXGroup section */",
        "			path = Runner;\n			sourceTree = \"<group>\";\n		};\n"
        "		A1W000040000000000000001 /* RedWordsWidget */ = {\n"
        "			isa = PBXGroup;\n"
        "			children = (\n"
        "				A1W000020000000000000001 /* RedWordsWidget.swift */,\n"
        "				A1W000020000000000000002 /* Info.plist */,\n"
        "				A1W000020000000000000003 /* RedWordsWidget.entitlements */,\n"
        "			);\n"
        "			path = RedWordsWidget;\n"
        "			sourceTree = \"<group>\";\n"
        "		};\n"
        "/* End PBXGroup section */",
    )
    text = text.replace(
        "				9705A1C41CF9048500538489 /* Embed Frameworks */,\n"
        "				3B06AD1E1E4923F5004D2608 /* Thin Binary */,",
        "				9705A1C41CF9048500538489 /* Embed Frameworks */,\n"
        "				A1W000030000000000000001 /* Embed App Extensions */,\n"
        "				3B06AD1E1E4923F5004D2608 /* Thin Binary */,",
    )
    text = text.replace(
        "			dependencies = (\n			);\n			name = Runner;",
        "			dependencies = (\n"
        "				A1W000060000000000000002 /* PBXTargetDependency */,\n"
        "			);\n			name = Runner;",
    )
    text = text.replace(
        "				97C146ED1CF9000F007C117D /* Runner */,\n"
        "				331C8080294A63A400263BE5 /* RunnerTests */,",
        "				97C146ED1CF9000F007C117D /* Runner */,\n"
        "				331C8080294A63A400263BE5 /* RunnerTests */,\n"
        "				A1W000070000000000000001 /* RedWordsWidget */,",
    )
    text = text.replace(
        "					97C146ED1CF9000F007C117D = {",
        "					A1W000070000000000000001 = {\n"
        "						CreatedOnToolsVersion = 15.0;\n"
        "					};\n"
        "					97C146ED1CF9000F007C117D = {",
    )
    text = text.replace(
        "/* End PBXNativeTarget section */",
        "		A1W000070000000000000001 /* RedWordsWidget */ = {\n"
        "			isa = PBXNativeTarget;\n"
        "			buildConfigurationList = A1W000080000000000000004 /* Build configuration list for PBXNativeTarget \"RedWordsWidget\" */;\n"
        "			buildPhases = (\n"
        "				A1W000050000000000000002 /* Sources */,\n"
        "				A1W000050000000000000001 /* Frameworks */,\n"
        "				A1W000050000000000000003 /* Resources */,\n"
        "			);\n"
        "			buildRules = (\n"
        "			);\n"
        "			dependencies = (\n"
        "			);\n"
        "			name = RedWordsWidget;\n"
        "			productName = RedWordsWidget;\n"
        "			productReference = A1W000020000000000000006 /* RedWordsWidget.appex */;\n"
        "			productType = \"com.apple.product-type.app-extension\";\n"
        "		};\n"
        "/* End PBXNativeTarget section */",
    )
    text = text.replace(
        "/* End PBXFrameworksBuildPhase section */",
        "		A1W000050000000000000001 /* Frameworks */ = {\n"
        "			isa = PBXFrameworksBuildPhase;\n"
        "			buildActionMask = 2147483647;\n"
        "			files = (\n"
        "				A1W000010000000000000002 /* WidgetKit.framework in Frameworks */,\n"
        "				A1W000010000000000000003 /* SwiftUI.framework in Frameworks */,\n"
        "			);\n"
        "			runOnlyForDeploymentPostprocessing = 0;\n"
        "		};\n"
        "/* End PBXFrameworksBuildPhase section */",
    )
    text = text.replace(
        "/* End PBXSourcesBuildPhase section */",
        "		A1W000050000000000000002 /* Sources */ = {\n"
        "			isa = PBXSourcesBuildPhase;\n"
        "			buildActionMask = 2147483647;\n"
        "			files = (\n"
        "				A1W000010000000000000001 /* RedWordsWidget.swift in Sources */,\n"
        "			);\n"
        "			runOnlyForDeploymentPostprocessing = 0;\n"
        "		};\n"
        "/* End PBXSourcesBuildPhase section */",
    )
    text = text.replace(
        "/* End PBXResourcesBuildPhase section */",
        "		A1W000050000000000000003 /* Resources */ = {\n"
        "			isa = PBXResourcesBuildPhase;\n"
        "			buildActionMask = 2147483647;\n"
        "			files = (\n"
        "			);\n"
        "			runOnlyForDeploymentPostprocessing = 0;\n"
        "		};\n"
        "/* End PBXResourcesBuildPhase section */",
    )
    text = text.replace(
        "				PRODUCT_BUNDLE_IDENTIFIER = com.redwords.redWords;\n"
        "				PRODUCT_NAME = \"$(TARGET_NAME)\";\n"
        "				SWIFT_OBJC_BRIDGING_HEADER = \"Runner/Runner-Bridging-Header.h\";",
        "				CODE_SIGN_ENTITLEMENTS = Runner/Runner.entitlements;\n"
        "				PRODUCT_BUNDLE_IDENTIFIER = com.redwords.redWords;\n"
        "				PRODUCT_NAME = \"$(TARGET_NAME)\";\n"
        "				SWIFT_OBJC_BRIDGING_HEADER = \"Runner/Runner-Bridging-Header.h\";",
    )
    text = text.replace(
        "/* End XCBuildConfiguration section */",
        CONFIGS + "/* End XCBuildConfiguration section */",
    )
    text = text.replace(
        "/* End XCConfigurationList section */",
        "		A1W000080000000000000004 /* Build configuration list for PBXNativeTarget \"RedWordsWidget\" */ = {\n"
        "			isa = XCConfigurationList;\n"
        "			buildConfigurations = (\n"
        "				A1W000080000000000000001 /* Debug */,\n"
        "				A1W000080000000000000002 /* Release */,\n"
        "				A1W000080000000000000003 /* Profile */,\n"
        "			);\n"
        "			defaultConfigurationIsVisible = 0;\n"
        "			defaultConfigurationName = Release;\n"
        "		};\n"
        "/* End XCConfigurationList section */",
    )
    PBX.write_text(text)
    print("patched", PBX)


if __name__ == "__main__":
    main()
