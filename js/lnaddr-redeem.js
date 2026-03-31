/* ── Satoshi Note — lnaddr-redeem.js ── */
/* Shared: send a voucher's balance to a Lightning address or LNURL-pay code. */
'use strict';

(function () {
  function _decodeLNURL(str) {
    const s = str.toLowerCase();
    const sep = s.lastIndexOf('1');
    if (sep < 1) throw new Error('Invalid bech32');
    const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
    const data5 = [];
    for (let i = sep + 1; i < s.length - 6; i++) {
      const idx = CHARSET.indexOf(s[i]);
      if (idx < 0) throw new Error('Invalid bech32 char');
      data5.push(idx);
    }
    let acc = 0, bits = 0;
    const bytes = [];
    for (const v of data5) {
      acc = (acc << 5) | v;
      bits += 5;
      while (bits >= 8) { bits -= 8; bytes.push((acc >> bits) & 0xff); }
    }
    return new TextDecoder().decode(new Uint8Array(bytes));
  }

  /**
   * Sends a voucher's balance to a Lightning address or LNURL-pay code.
   *
   * @param {object} opts
   * @param {string}   opts.serverURL   - Server base URL (e.g. "https://server.com")
   * @param {string}   opts.secret      - Voucher secret hex string
   * @param {number}   opts.balanceMsat - Amount in millisatoshis to send
   * @param {string}   opts.lnInput     - Lightning address or LNURL1… pay code
   * @param {function} [opts.onStatus]  - Optional progress callback (receives a string)
   * @returns {Promise<void>} Resolves on success, rejects with Error on failure
   */
  async function redeemToLightningAddress({ serverURL, secret, balanceMsat, lnInput, onStatus = () => {} }) {
    const trimmed = lnInput.trim();
    let lnurlPayUrl;
    if (/^lnurl1[a-z02-9]+$/i.test(trimmed)) {
      lnurlPayUrl = _decodeLNURL(trimmed.toUpperCase());
    } else if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
      const at = trimmed.lastIndexOf('@');
      const user = trimmed.slice(0, at);
      const domain = trimmed.slice(at + 1);
      lnurlPayUrl = 'https://' + domain + '/.well-known/lnurlp/' + encodeURIComponent(user);
    } else {
      throw new Error('Invalid format. Use user@domain.com or a LNURL1\u2026 code.');
    }

    onStatus('Fetching payment details\u2026');
    const payResp = await fetch(lnurlPayUrl);
    if (!payResp.ok) throw new Error('Could not reach payment endpoint');
    const payData = await payResp.json();
    if (payData.status === 'ERROR') throw new Error(payData.reason || 'Payment endpoint error');
    if (payData.tag !== 'payRequest') throw new Error('Not a valid LNURL-pay endpoint');
    const { callback, minSendable, maxSendable } = payData;
    if (balanceMsat < minSendable || balanceMsat > maxSendable) {
      throw new Error(
        'Voucher amount (' + Math.floor(balanceMsat / 1000) + ' sats) is outside the allowed range (' +
        Math.ceil(minSendable / 1000) + '\u2013' + Math.floor(maxSendable / 1000) + ' sats)'
      );
    }

    onStatus('Requesting invoice\u2026');
    const cbUrl = new URL(callback);
    cbUrl.searchParams.set('amount', balanceMsat);
    const invResp = await fetch(cbUrl.toString());
    if (!invResp.ok) throw new Error('Failed to get invoice from payment endpoint');
    const invData = await invResp.json();
    if (invData.status === 'ERROR') throw new Error(invData.reason || 'Invoice error');
    const pr = invData.pr;
    if (!pr) throw new Error('No invoice in response');

    onStatus('Submitting to voucher server\u2026');
    const wResp = await fetch(serverURL + '/w/' + secret);
    if (!wResp.ok) throw new Error('Failed to fetch voucher details');
    const wData = await wResp.json();
    if (wData.status === 'ERROR') throw new Error(wData.reason || 'Voucher error');
    const k1 = wData.k1;
    if (!k1) throw new Error('No k1 in voucher response');

    const redeemUrl = serverURL + '/redeem/' + secret + '/callback?k1=' + encodeURIComponent(k1) + '&pr=' + encodeURIComponent(pr);
    const redeemResp = await fetch(redeemUrl);
    if (!redeemResp.ok) throw new Error('Server rejected the request');
    const redeemData = await redeemResp.json();
    if (redeemData.status === 'ERROR') throw new Error(redeemData.reason || 'Redemption failed');
  }

  window.redeemToLightningAddress = redeemToLightningAddress;
})();
