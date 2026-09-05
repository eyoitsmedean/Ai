import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'red_words/app.dart';
import 'red_words/moment/catalog.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final catalog = await loadBundledCatalog();
  runApp(RedWordsApp(catalog: catalog));
}

Future<MomentCatalog> loadBundledCatalog() async {
  try {
    final raw = await rootBundle.loadString('assets/moments/catalog.json');
    return MomentCatalog.parse(raw);
  } catch (_) {
    return MomentCatalog(daily: const [], themes: const {}, verses: const {});
  }
}
