import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';

import '../engine/crisis.dart';

typedef CrisisLauncher = Future<bool> Function(Uri uri);

Future<bool> launchCrisisTel(Uri uri) {
  return launchUrl(uri, mode: LaunchMode.externalApplication);
}

/// url_launcher returns false (Android: ActivityNotFoundException) when no
/// dialer exists. That result must be visible, never swallowed.
Future<bool> openCrisisLine(
  BuildContext context, {
  CrisisLauncher launcher = launchCrisisTel,
}) async {
  var opened = false;
  try {
    opened = await launcher(Uri.parse(Crisis.telUri));
  } on PlatformException {
    opened = false;
  }
  if (!opened && context.mounted) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        key: Key('crisis-fallback'),
        content: Text(Crisis.fallback),
        duration: Duration(seconds: 8),
      ),
    );
  }
  return opened;
}

class CrisisButton extends StatelessWidget {
  const CrisisButton({
    super.key,
    this.label = Crisis.telUri,
    this.launcher = launchCrisisTel,
  });

  final String label;
  final CrisisLauncher launcher;

  @override
  Widget build(BuildContext context) {
    return TextButton(
      onPressed: () => openCrisisLine(context, launcher: launcher),
      child: Text(label),
    );
  }
}
