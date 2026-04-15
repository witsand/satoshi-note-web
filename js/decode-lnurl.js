/* ── Shared LNURL1 bech32 payload decode (strict charset) ─────────────────── */
(function () {
  'use strict';

  /**
   * @param {string} str
   * @param {function(string): string} [translate] optional; maps error message keys
   */
  window.snDecodeLnurlBech32 = function (str, translate) {
    var t = typeof translate === 'function' ? translate : function (k) {
      return k;
    };
    var s = String(str).toLowerCase();
    var sep = s.lastIndexOf('1');
    if (sep < 1) {
      throw new Error(t('Invalid bech32'));
    }
    var CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
    var data5 = [];
    for (var i = sep + 1; i < s.length - 6; i++) {
      var idx = CHARSET.indexOf(s[i]);
      if (idx < 0) {
        throw new Error(t('Invalid bech32 char'));
      }
      data5.push(idx);
    }
    var acc = 0;
    var bits = 0;
    var bytes = [];
    for (var j = 0; j < data5.length; j++) {
      var v = data5[j];
      acc = (acc << 5) | v;
      bits += 5;
      while (bits >= 8) {
        bits -= 8;
        bytes.push((acc >> bits) & 0xff);
      }
    }
    return new TextDecoder().decode(new Uint8Array(bytes));
  };
})();
