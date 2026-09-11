import 'package:flutter/services.dart';

/// First-open leaf. Tests inject [opened].
class SessionStore {
  SessionStore({bool? opened, Map<String, String>? replies})
      : _opened = opened,
        _injected = opened != null,
        _replies = Map<String, String>.from(replies ?? const {});

  bool? _opened;
  final bool _injected;
  final Map<String, String> _replies;

  static const _channel = MethodChannel('redwords/session');

  static String dateKey(DateTime date) {
    final y = date.year.toString().padLeft(4, '0');
    final m = date.month.toString().padLeft(2, '0');
    final d = date.day.toString().padLeft(2, '0');
    return '$y-$m-$d';
  }

  Future<void> keepReply(String key, String text) async {
    _replies[key] = text;
    if (_injected) return;
    try {
      await _channel.invokeMethod<void>('keepReply', {'date': key, 'text': text});
    } on MissingPluginException {
      // Hosted tests and Linux have no plugin.
    }
  }

  Future<String> loadReply(String key) async {
    if (_replies.containsKey(key)) return _replies[key]!;
    if (_injected) return '';
    try {
      final value = await _channel.invokeMethod<String>('loadReply', key);
      final text = value ?? '';
      _replies[key] = text;
      return text;
    } on MissingPluginException {
      return '';
    }
  }

  Future<bool> hasOpened() async {
    if (_opened != null) return _opened!;
    if (_injected) return false;
    try {
      final value = await _channel.invokeMethod<bool>('hasOpened');
      _opened = value ?? false;
    } on MissingPluginException {
      _opened = false;
    }
    return _opened!;
  }

  Future<void> markOpened() async {
    _opened = true;
    if (_injected) return;
    try {
      await _channel.invokeMethod<void>('markOpened');
    } on MissingPluginException {
      // Hosted tests and Linux have no plugin.
    }
  }
}

class WidgetBridge {
  static const channel = MethodChannel('redwords/widget');

  static Future<void> sync({
    required String word,
    required String citation,
    String? rotation,
  }) async {
    try {
      await channel.invokeMethod<void>('sync', {
        'word': word,
        'citation': citation,
        'rotation': ?rotation,
      });
    } on MissingPluginException {
      // Widget host is iOS/Android only.
    }
  }
}

class LinkBridge {
  static const channel = MethodChannel('redwords/links');

  /// Returns the pending link and clears it on the host, so a widget tap
  /// while the app is suspended routes once and only once.
  static Future<String?> initial() async {
    try {
      return await channel.invokeMethod<String>('initial');
    } on MissingPluginException {
      return null;
    }
  }

  /// OS share sheet. The text is the Word and the citation. No brand.
  static Future<void> share(String text) async {
    try {
      await channel.invokeMethod<void>('share', text);
    } on MissingPluginException {
      // Tests and Linux have no share sheet.
    }
  }
}

/// Blessing text that leaves the device. Craft law: Word + citation + `· KJV`. No brand.
class BlessingShare {
  static String body({required String word, required String citation}) =>
      '$word\n\n$citation  ·  KJV';
}
