/// Crisis help is a phone intent, never a generated pastoral answer.
abstract final class Crisis {
  static const telUri = 'tel:988';
  static const copy =
      'If you are in crisis in the US, call or text 988. This app is not a person, and it is not emergency care.';

  /// Shown when the OS has no dialer for tel: (Wi-Fi tablets, restricted
  /// profiles). Still no pastoral invention; the number stays the answer.
  static const fallback =
      'This device can’t place calls. From a phone, call or text 988.';
}
