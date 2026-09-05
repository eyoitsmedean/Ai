import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'brand.dart';
import 'ui/shell.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ProviderScope(child: RedWordsApp()));
}

class RedWordsApp extends ConsumerStatefulWidget {
  const RedWordsApp({super.key});

  @override
  ConsumerState<RedWordsApp> createState() => _RedWordsAppState();
}

class _RedWordsAppState extends ConsumerState<RedWordsApp> {
  @override
  void initState() {
    super.initState();
    Future<void>.delayed(const Duration(milliseconds: 900), () {
      if (mounted) {
        ref.read(engineProvider.notifier).finishSplash();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: Brand.name,
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: Brand.paper,
        colorScheme: ColorScheme.fromSeed(
          seedColor: Brand.crimson,
          surface: Brand.paper,
          brightness: Brightness.light,
        ),
        navigationBarTheme: const NavigationBarThemeData(
          backgroundColor: Brand.paper,
          indicatorColor: Color(0x22000000),
        ),
      ),
      home: const AppShell(),
    );
  }
}
