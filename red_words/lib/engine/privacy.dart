/// In-app privacy notice. Same facts as STORE_ANSWERS.md.
/// Apple Guideline 5.1.1(i) requires this inside the app, not only as a URL.
abstract final class PrivacyNotice {
  static const title = 'Privacy';

  static const body =
      'Red Words stores your last saying, saved sayings, your one honest step, '
      'and a dark-mode preference on your device only. It has no accounts, no '
      'analytics, no advertising, and does not connect to the internet. Tapping '
      '988 opens your phone’s dialer; Red Words does not place calls, read call '
      'history, or access contacts.';

  static const thirdParties =
      'No third-party analytics, advertising, or crash SDKs are included. '
      'Nothing is shared off the device.';

  static const deletion =
      'Deleting the app deletes this data. There is no account to delete.';

  static const scripture =
      'Scripture text is the public-domain World English Bible. '
      'Reflections are not Scripture.';
}
