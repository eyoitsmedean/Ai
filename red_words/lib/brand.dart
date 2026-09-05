import 'package:flutter/material.dart';

/// Locked brand. Crimson is speech, not chrome.
abstract final class Brand {
  static const name = 'Red Words';
  static const promise = 'His words, for this moment';
  static const stepPromise = 'His words. One honest step.';
  static const paper = Color(0xFFF6F0E6);
  static const crimson = Color(0xFF8C1C24);
  static const charcoal = Color(0xFF1C1816);
  static const ink = Color(0xFF2A2420);
  static const muted = Color(0xFF7A6E5E);
  static const firstSayingId = 'anxiety-mt-6-34';
  static const urlSchemeToday = 'redwords://today';
  static const iosBundle = 'com.redwords.redWords';
  static const iosWidgetBundle = 'com.redwords.redWords.RedWordsWidget';
  static const appGroup = 'group.com.redwords.redWords';
  /// Play applicationId is lowercase. iOS keeps the locked camelCase bundle.
  static const androidApplicationId = 'com.redwords.redwords';
  static const gospelBooks = {'Matthew', 'Mark', 'Luke', 'John'};
}

abstract final class SayingOrder {
  static const word = 1;
  static const citation = 2;
  static const knot = 3;
  static const reflection = 4;
  static const chips = 5;
  static const stepCue = 6;
}
