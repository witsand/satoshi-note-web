/* ── HTML l10n: lang normalization + fetch bundle JSON + snL10nT; applyDomI18n patches data-i18n in a subtree ── */
(function () {
  'use strict';

  var MAX_LANG_UTF8_BYTES = 32;

  function utf8Truncate(s) {
    var enc = new TextEncoder();
    var buf = enc.encode(s);
    if (buf.length <= MAX_LANG_UTF8_BYTES) {
      return s;
    }
    var cut = MAX_LANG_UTF8_BYTES;
    while (cut > 0 && (buf[cut - 1] & 0xc0) === 0x80) {
      cut--;
    }
    return new TextDecoder().decode(buf.slice(0, cut));
  }

  function snNormalizeLang(raw) {
    if (!raw || typeof raw !== 'string') {
      return '';
    }
    var s = raw.trim().replace(/\s+/g, '-').replace(/[^A-Za-z0-9-]/g, '');
    if (!s) {
      return '';
    }
    return utf8Truncate(s);
  }

  function applySubs(str, subs) {
    if (!subs || typeof subs !== 'object') {
      return str;
    }
    var out = String(str);
    Object.keys(subs).forEach(function (k) {
      out = out.split('{' + k + '}').join(String(subs[k]));
    });
    return out;
  }

  function makeT(dict) {
    function t(key, subs) {
      var p = dict[key];
      var s;
      if (typeof p === 'string') {
        s = p;
      } else if (p && typeof p === 'object') {
        if (p.text != null) {
          s = String(p.text);
        } else if (p.html != null) {
          s = String(p.html);
        } else {
          s = key;
        }
      } else {
        s = key;
      }
      return applySubs(s, subs);
    }
    return t;
  }

  /**
   * @returns {Promise<{ dict: object, lang: string, t: function(string, object?): string }>}
   */
  function snInitL10n() {
    var params = new URLSearchParams(location.search);
    var code = snNormalizeLang(params.get('lang') || '');
    var empty = {};

    if (!code) {
      return Promise.resolve({ dict: empty, lang: '', t: makeT(empty) });
    }

    // First deployed bundle; other pages can use the same runtime with a different base path later.
    var url = '/l10n/redeem/' + encodeURIComponent(code) + '.json';
    return fetch(url, { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) {
          return {};
        }
        return r.json();
      })
      .then(function (json) {
        if (!json || typeof json !== 'object' || Array.isArray(json)) {
          return {};
        }
        return json;
      })
      .catch(function () {
        return {};
      })
      .then(function (dict) {
        if (code) {
          document.documentElement.setAttribute('lang', code);
        }
        return { dict: dict, lang: code, t: makeT(dict) };
      });
  }

  /**
   * @param {ParentNode} root
   * @param {object} dict - keys are data-i18n ids; values are nested { text, html, title, ... } or a string (treated as { text }).
   */
  function applyDomI18n(root, dict) {
    if (!root || !dict || typeof dict !== 'object') {
      return;
    }
    root.querySelectorAll('[data-i18n]').forEach(function (el) {
      var id = el.getAttribute('data-i18n');
      if (!id) {
        return;
      }
      var patch = dict[id];
      if (patch == null) {
        return;
      }
      var obj = typeof patch === 'string' ? { text: patch } : patch;
      var useHtmlFlag = el.hasAttribute('data-i18n-html');
      if (obj.html != null && useHtmlFlag) {
        el.innerHTML = obj.html;
      } else if (obj.text != null) {
        el.textContent = obj.text;
      } else if (obj.html != null && !useHtmlFlag) {
        el.innerHTML = obj.html;
      }
      var attrList = el.getAttribute('data-i18n-attrs');
      if (attrList && typeof attrList === 'string') {
        attrList.split(/\s+/).forEach(function (a) {
          if (!a || obj[a] == null) {
            return;
          }
          el.setAttribute(a, String(obj[a]));
        });
      }
    });
  }

  window.applyDomI18n = applyDomI18n;
  window.snInitL10n = snInitL10n;
  window.snNormalizeLang = snNormalizeLang;
})();
