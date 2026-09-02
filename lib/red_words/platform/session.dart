import 'package:flutter/services.dart';

/// First-open leaf. Tests inject [opened].
class SessionStore {
  SessionStore({bool? opened})
      : _opened = opened,
        _injected = opened != null;

  bool? _opened;
  final bool _injected;

  static const _channel = MethodChannel('redwords/session');

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
  }) async {
    try {
      await channel.invokeMethod<void>('sync', {
        'word': word,
        'citation': citation,
      });
    } on MissingPluginException {
      // Widget host is iOS/Android only.
    }
  }
}

class LinkBridge {
  static const channel = MethodChannel('redwords/links');

  static Future<String?> initial() async {
    try {
      return await channel.invokeMethod<String>('initial');
    } on MissingPluginException {
      return null;
    }
  }
}
