/* ── Satoshi Note — lnaddr-redeem.js ── */
/* Shared: send a voucher's balance to a Lightning address or LNURL-pay code. */
'use strict';

(function () {
  /** Same contract as `snL10nT`: English default is the key; optional `{name}` subs. */
  function t(key, subs) {
    if (typeof window.snL10nT === 'function') {
      return window.snL10nT(key, subs);
    }
    if (!subs) {
      return key;
    }
    var out = String(key);
    Object.keys(subs).forEach(function (k) {
      out = out.split('{' + k + '}').join(String(subs[k]));
    });
    return out;
  }

  function _decodeLNURL(str) {
    if (typeof window.snDecodeLnurlBech32 !== 'function') {
      throw new Error(t('Invalid bech32'));
    }
    return window.snDecodeLnurlBech32(str, t);
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
      throw new Error(t('Invalid format. Use user@domain.com or a LNURL1\u2026 code.'));
    }

    onStatus(t('Fetching payment details\u2026'));
    const payResp = await fetch(lnurlPayUrl);
    if (!payResp.ok) { throw new Error(t('Could not reach payment endpoint')); }
    const payData = await payResp.json();
    if (payData.status === 'ERROR') { throw new Error(payData.reason || t('Payment endpoint error')); }
    if (payData.tag !== 'payRequest') { throw new Error(t('Not a valid LNURL-pay endpoint')); }
    const { callback, minSendable, maxSendable } = payData;
    if (balanceMsat < minSendable || balanceMsat > maxSendable) {
      throw new Error(
        t('Voucher amount ({amount} sats) is outside the allowed range ({min}\u2013{max} sats)', {
          amount: String(Math.floor(balanceMsat / 1000)),
          min: String(Math.ceil(minSendable / 1000)),
          max: String(Math.floor(maxSendable / 1000)),
        })
      );
    }

    onStatus(t('Requesting invoice\u2026'));
    const cbUrl = new URL(callback);
    cbUrl.searchParams.set('amount', balanceMsat);
    const invResp = await fetch(cbUrl.toString());
    if (!invResp.ok) { throw new Error(t('Failed to get invoice from payment endpoint')); }
    const invData = await invResp.json();
    if (invData.status === 'ERROR') { throw new Error(invData.reason || t('Invoice error')); }
    const pr = invData.pr;
    if (!pr) { throw new Error(t('No invoice in response')); }

    onStatus(t('Submitting to voucher server\u2026'));
    const wResp = await fetch(serverURL + '/w/' + secret);
    if (!wResp.ok) { throw new Error(t('Failed to fetch voucher details')); }
    const wData = await wResp.json();
    if (wData.status === 'ERROR') { throw new Error(wData.reason || t('Voucher error')); }
    const k1 = wData.k1;
    if (!k1) { throw new Error(t('No k1 in voucher response')); }

    const redeemUrl = serverURL + '/redeem/' + secret + '/callback?k1=' + encodeURIComponent(k1) + '&pr=' + encodeURIComponent(pr);
    const redeemResp = await fetch(redeemUrl);
    if (!redeemResp.ok) { throw new Error(t('Server rejected the request')); }
    const redeemData = await redeemResp.json();
    if (redeemData.status === 'ERROR') { throw new Error(redeemData.reason || t('Redemption failed')); }
  }

  window.redeemToLightningAddress = redeemToLightningAddress;
})();
