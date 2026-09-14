import 'dart:convert';

import 'package:flutter/services.dart';

import '../brand.dart';
import '../models/saying.dart';

class PackLoadException implements Exception {
  const PackLoadException(this.message);
  final String message;
  @override
  String toString() => message;
}

class ScripturePack {
  ScripturePack(this.sayings) {
    if (sayings.isEmpty) {
      throw const PackLoadException('Scripture pack is empty.');
    }
    if (sayings.first.id != Brand.firstSayingId) {
      throw const PackLoadException('First saying must be Matthew 6:34.');
    }
    for (final saying in sayings) {
      if (!Brand.gospelBooks.contains(saying.book)) {
        throw PackLoadException('Non-Gospel book: ${saying.book}');
      }
      if (saying.word.trim().isEmpty) {
        throw PackLoadException('Empty word: ${saying.id}');
      }
    }
  }

  final List<Saying> sayings;

  Saying get first => sayings.first;

  Saying byId(String id) =>
      sayings.firstWhere((s) => s.id == id, orElse: () => first);

  static ScripturePack parse(String raw) {
    final decoded = jsonDecode(raw);
    if (decoded is! Map<String, dynamic>) {
      throw const PackLoadException('Pack is not an object.');
    }
    final rows = decoded['sayings'];
    if (rows is! List) {
      throw const PackLoadException('Pack is missing sayings.');
    }
    final sayings = rows
        .map((row) => Saying.fromJson(Map<String, dynamic>.from(row as Map)))
        .toList();
    return ScripturePack(sayings);
  }

  static Future<ScripturePack> loadAsset({
    AssetBundle? bundle,
    String key = 'assets/sayings.json',
  }) async {
    try {
      final raw = await (bundle ?? rootBundle).loadString(key);
      return parse(raw);
    } on PackLoadException {
      rethrow;
    } catch (error) {
      throw PackLoadException('Could not load the Scripture pack. $error');
    }
  }
}
