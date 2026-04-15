/* ── Voucher redeem flow (recipient) — strings from HTML + data-i18n / l10n refs ── */
(function () {
  'use strict';

  function ref(id) {
    var el = document.querySelector('#sn-l10n-refs [data-l10n-ref="' + id + '"]');
    return el ? el.textContent : '';
  }

  function escHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function buildInfoCardHtml(openDefault) {
    var tpl = document.getElementById('tpl-redeem-info');
    if (!tpl) {
      return '';
    }
    var wrap = document.createElement('div');
    wrap.appendChild(document.importNode(tpl.content, true));
    var card = wrap.querySelector('.card');
    if (typeof window.applyDomI18n === 'function') {
      window.applyDomI18n(card, window.snL10nDict || {});
    }
    if (openDefault === 'wallet') {
      var b = card.querySelector('#details-blink');
      if (b) {
        b.open = true;
      }
    } else if (openDefault === 'spend') {
      var s = card.querySelector('#details-spend');
      if (s) {
        s.open = true;
      }
    }
    return wrap.innerHTML;
  }

  function stateCard(stickerLabel, stickerClass, icon, title, desc, extraHTML, serverHost) {
    var hostTag = serverHost
      ? '<div style="text-align:center;margin-top:14px;font-size:0.7rem;color:var(--text-muted);opacity:0.65;">' +
        escHtml(serverHost) +
        '</div>'
      : '';
    return (
      '<div class="card" style="position:relative;overflow:hidden;text-align:center;margin-bottom:20px;">' +
      '<div class="hc-sticker ' +
      stickerClass +
      '">' +
      escHtml(stickerLabel) +
      '</div>' +
      '<div style="font-size:2rem;margin:20px 0 10px;">' +
      escHtml(icon) +
      '</div>' +
      '<div style="font-weight:700;margin-bottom:8px;">' +
      escHtml(title) +
      '</div>' +
      '<div style="font-size:0.85rem;color:var(--text-muted);">' +
      escHtml(desc) +
      '</div>' +
      (extraHTML || '') +
      hostTag +
      '</div>'
    );
  }

  function redeemRunner() {
    var hashParams = new URLSearchParams(location.hash.replace(/^#/, ''));
    var queryParams = new URLSearchParams(location.search);
    var rawLnurl = hashParams.get('lightning') || queryParams.get('lightning') || '';
    var lnurl = rawLnurl.match(/LNURL1[A-Z02-9]+/i)?.[0]?.toUpperCase() || rawLnurl;
    var main = document.getElementById('redeem-main');

    fetch('/manifest.json')
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .then(function (m) {
        if (!m || !m.name) {
          return;
        }
        var words = m.name.split(' ').filter(function (w) {
          return w.length > 0;
        });
        var logoInner = words
          .map(function (w, i) {
            return i % 2 === 0 ? w : '<span>' + w + '</span>';
          })
          .join('');
        document.title = ref('metaTitleWithApp') + m.name;
        var logoEl = document.getElementById('app-logo');
        if (logoEl) {
          logoEl.innerHTML = '\u26A1 ' + logoInner;
        }
      })
      .catch(function () {});

    function showInvalid() {
      main.innerHTML =
        stateCard(ref('stickerInvalid'), 'hc-sticker-gray', '\uD83D\uDD17', ref('stateInvalidTitle'), ref('stateInvalidDesc')) +
        buildInfoCardHtml(null);
    }

    if (!lnurl || !lnurl.toUpperCase().startsWith('LNURL1')) {
      showInvalid();
      return;
    }

    function decodeLNURL(ln) {
      if (typeof window.snDecodeLnurlBech32 !== 'function') {
        throw new Error('Invalid bech32');
      }
      var tr = typeof window.snL10nT === 'function' ? window.snL10nT : function (k) {
        return k;
      };
      return window.snDecodeLnurlBech32(ln, tr);
    }

    function secretToPubKey(secret) {
      var bytes = Uint8Array.from(secret.match(/../g).map(function (h) {
        return parseInt(h, 16);
      }));
      return crypto.subtle.digest('SHA-256', bytes).then(function (hash) {
        return Array.from(new Uint8Array(hash).slice(0, bytes.length))
          .map(function (b) {
            return b.toString(16).padStart(2, '0');
          })
          .join('');
      });
    }

    function resolveRedeemServerURL(decodedLNURL) {
      try {
        return new URL(decodedLNURL).origin;
      } catch (_) {}
      var stored = localStorage.getItem('sn_server_url');
      if (stored) {
        return stored.replace(/\/$/, '');
      }
      if (window.SATOSHI_NOTE_DEFAULT_SERVER) {
        return window.SATOSHI_NOTE_DEFAULT_SERVER;
      }
      return window.location.origin;
    }

    function init() {
      var secret;
      var serverURL;
      try {
        var decoded = decodeLNURL(lnurl);
        serverURL = resolveRedeemServerURL(decoded);
        secret = new URL(decoded).pathname.split('/').pop();
      } catch (_) {
        showInvalid();
        return;
      }

      secretToPubKey(secret).then(async function (pk) {
        var fallbackChain = [
          serverURL,
          (localStorage.getItem('sn_server_url') || '').replace(/\/$/, ''),
          (window.SATOSHI_NOTE_DEFAULT_SERVER || '').replace(/\/$/, ''),
          window.location.origin,
        ].filter(Boolean);
        var uniqueServers = Array.from(new Set(fallbackChain));

        var status = null;
        for (var j = 0; j < uniqueServers.length; j++) {
          var candidate = uniqueServers[j];
          try {
            var resp = await fetch(candidate + '/status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ pubkeys: [pk] }),
            });
            if (resp.ok) {
              var jbody = await resp.json();
              status = jbody[pk];
              serverURL = candidate;
              break;
            }
          } catch (_) {}
        }
        if (!status) {
          showInvalid();
          return;
        }

        function registerServer() {
          var knownKey = 'sn_known_servers';
          var activeKey = 'sn_server_url';
          var known = [];
          try {
            known = JSON.parse(localStorage.getItem(knownKey)) || [];
          } catch (_) {}
          var alreadyKnown = known.indexOf(serverURL) >= 0;
          if (!alreadyKnown) {
            known.push(serverURL);
            localStorage.setItem(knownKey, JSON.stringify(known));
          }
          var configured = (localStorage.getItem(activeKey) || '').replace(/\/$/, '');
          if (!configured) {
            localStorage.setItem(activeKey, serverURL);
          } else if (!alreadyKnown && configured !== serverURL) {
            var notice = document.getElementById('server-notice');
            var hostEl = document.getElementById('server-notice-host');
            if (notice && hostEl) {
              try {
                hostEl.textContent = new URL(serverURL).hostname;
              } catch (_) {
                hostEl.textContent = serverURL;
              }
              notice.classList.remove('hidden');
              document.getElementById('server-notice-close').onclick = function () {
                notice.classList.add('hidden');
              };
            }
          }
        }

        function continueAfterStatus() {
          registerServer();
          var active = status.active;
          var refunded = status.refunded;
          var balance_msat = status.balance_msat;
          var expires_at = status.expires_at;

          var _serverHost = (function () {
            try {
              return new URL(serverURL).hostname;
            } catch (_) {
              return serverURL;
            }
          })();

          if (!active && refunded) {
            main.innerHTML =
              stateCard(
                ref('stickerExpired'),
                'hc-sticker-gray',
                '\u23F0',
                ref('stateExpiredTitle'),
                ref('stateExpiredDesc'),
                null,
                _serverHost
              ) + buildInfoCardHtml(null);
            return;
          }

          if (!active && !refunded) {
            main.innerHTML =
              stateCard(
                ref('stickerRedeemed'),
                'hc-sticker-green',
                '\u2705',
                ref('stateRedeemedTitle'),
                ref('stateRedeemedDesc'),
                null,
                _serverHost
              ) + buildInfoCardHtml('spend');
            return;
          }

          if (active && balance_msat === 0) {
            main.innerHTML =
              stateCard(
                ref('stickerNotFunded'),
                '',
                '\u23F3',
                ref('stateUnfundedTitle'),
                ref('stateUnfundedDesc'),
                '<button class="btn btn-secondary btn-sm" style="width:auto;margin:12px auto 0;" onclick="location.reload()">' +
                  escHtml(ref('stateCheckAgain')) +
                  '</button>',
                _serverHost
              ) + buildInfoCardHtml(null);
            return;
          }

          var sats = Math.floor(balance_msat / 1000);
          var satsFormatted = sats.toLocaleString();
          var hasExpiry = expires_at && expires_at > 0;
          var confettiSeed = Math.floor(Date.now() / 1000);
          var CELEBRATION_META = [
            { ref: 'celebration0', emoji: '\uD83C\uDF89' },
            { ref: 'celebration1', emoji: '\uD83C\uDF1F' },
            { ref: 'celebration2', emoji: '\uD83C\uDFC6' },
            { ref: 'celebration3', emoji: '\u26A1' },
            { ref: 'celebration4', emoji: '\uD83C\uDF8A' },
            { ref: 'celebration5', emoji: '\u2728' },
          ];
          var cel = CELEBRATION_META[confettiSeed % CELEBRATION_META.length];
          var CONFETTI_COLORS = ['#F7931A', '#6dba6d', '#7eb5f7', '#f5a623', '#e879a0', '#a78bfa'];
          var confettiHTML = '<div class="hc-confetti" aria-hidden="true">';
          for (var ci = 0; ci < 14; ci++) {
            var seed = confettiSeed + ci;
            var left = ((seed * 37 + ci * 97) % 86) + 7;
            var color = CONFETTI_COLORS[(seed + ci) % CONFETTI_COLORS.length];
            var size = ((seed + ci) % 3) + 3;
            var delay = ((ci * 0.18) % 2.4).toFixed(2);
            var dur = (2.2 + ((seed * ci) % 14) * 0.1).toFixed(1);
            var rot = (seed * ci * 13) % 360;
            confettiHTML +=
              '<span class="hc-confetti-piece" style="left:' +
              left +
              '%;background:' +
              color +
              ';width:' +
              size +
              'px;height:' +
              size +
              'px;animation-delay:' +
              delay +
              's;animation-duration:' +
              dur +
              's;--rot:' +
              rot +
              'deg;"></span>';
          }
          confettiHTML += '</div>';

          var tplFunded = document.getElementById('tpl-redeem-funded');
          if (!tplFunded) {
            return;
          }
          var wrap = document.createElement('div');
          wrap.appendChild(document.importNode(tplFunded.content, true));
          var fundedRoot = wrap.firstElementChild;
          if (typeof window.applyDomI18n === 'function') {
            window.applyDomI18n(fundedRoot, window.snL10nDict || {});
          }
          main.innerHTML = '';
          main.appendChild(fundedRoot);
          main.insertAdjacentHTML('beforeend', buildInfoCardHtml('wallet'));

          var confettiRoot = document.getElementById('redeem-confetti-root');
          if (confettiRoot) {
            confettiRoot.innerHTML = confettiHTML;
          }
          var amtEl = document.getElementById('redeem-sats-amount');
          if (amtEl) {
            amtEl.textContent = satsFormatted;
          }
          var expiryRow = document.getElementById('redeem-expiry-row');
          if (expiryRow) {
            if (!hasExpiry) {
              expiryRow.innerHTML = '<div style="margin-bottom:14px;"></div>';
            }
          }
          var celEl = document.getElementById('redeem-celebration');
          if (celEl) {
            celEl.textContent = cel.emoji + ' ' + ref(cel.ref);
          }
          var hostFoot = document.getElementById('redeem-funded-host');
          if (hostFoot) {
            hostFoot.textContent = _serverHost;
          }

          var container = document.getElementById('redeem-qr-container');
          if (typeof QRCode !== 'undefined' && container) {
            new QRCode(container, {
              text: 'lightning:' + lnurl,
              width: 180,
              height: 180,
              correctLevel: QRCode.CorrectLevel.M,
            });
            container.style.cursor = 'pointer';
            container.title = ref('qrTapTitle');
            container.addEventListener('click', function () {
              window.location.href = 'lightning:' + lnurl;
            });
          }

          var btnOpenWallet = document.getElementById('btn-open-wallet');
          if (btnOpenWallet) {
            btnOpenWallet.addEventListener('click', function () {
              window.location.href = 'lightning:' + lnurl;
            });
          }

          var lnurlEl = document.getElementById('redeem-lnurl-text');
          var copyClaimLabel = ref('btnCopyClaim');
          if (lnurlEl) {
            lnurlEl.addEventListener('click', async function () {
              try {
                await navigator.clipboard.writeText(lnurl);
                lnurlEl.textContent = ref('btnCopied');
                setTimeout(function () {
                  lnurlEl.textContent = copyClaimLabel;
                }, 1500);
              } catch (_) {
                prompt(ref('promptCopyLnurl'), lnurl);
              }
            });
            if (typeof attachWalletButton === 'function') {
              attachWalletButton(lnurlEl, lnurl);
            }
          }

          var cardInner = document.getElementById('redeem-card-inner');
          var pollInterval = null;

          var btnReveal = document.getElementById('btn-reveal-secret');
          if (btnReveal && cardInner) {
            btnReveal.addEventListener('click', function () {
              cardInner.classList.add('flipped');
              if (!pollInterval) {
                pollInterval = startRedemptionPoll();
              }
            });
          }

          var btnFlipBack = document.getElementById('btn-flip-back');
          if (btnFlipBack && cardInner) {
            btnFlipBack.addEventListener('click', function () {
              cardInner.classList.remove('flipped');
            });
          }

          var btnSatsInfo = document.getElementById('btn-sats-info');
          if (btnSatsInfo) {
            btnSatsInfo.addEventListener('click', function () {
              document.getElementById('sats-info-modal').classList.remove('hidden');
            });
          }
          var satsClose = document.getElementById('sats-info-close');
          if (satsClose) {
            satsClose.addEventListener('click', function () {
              document.getElementById('sats-info-modal').classList.add('hidden');
            });
          }
          var satsModal = document.getElementById('sats-info-modal');
          if (satsModal) {
            satsModal.addEventListener('click', function (e) {
              if (e.target === this) {
                this.classList.add('hidden');
              }
            });
          }

          var btnLnaddr = document.getElementById('btn-lnaddr');
          if (btnLnaddr) {
            btnLnaddr.addEventListener('click', function () {
              var inp = document.getElementById('lnaddr-input');
              if (inp && !inp.value) {
                var saved = localStorage.getItem('sn_refund_code') || '';
                if (saved) {
                  inp.value = saved;
                }
              }
              document.getElementById('lnaddr-modal').classList.remove('hidden');
              if (inp) {
                inp.focus();
              }
            });
          }
          var lnaddrClose = document.getElementById('lnaddr-close');
          if (lnaddrClose) {
            lnaddrClose.addEventListener('click', function () {
              document.getElementById('lnaddr-modal').classList.add('hidden');
            });
          }
          var lnaddrModal = document.getElementById('lnaddr-modal');
          if (lnaddrModal) {
            lnaddrModal.addEventListener('click', function (e) {
              if (e.target === this) {
                this.classList.add('hidden');
              }
            });
          }
          var lnaddrInput = document.getElementById('lnaddr-input');
          if (lnaddrInput) {
            lnaddrInput.addEventListener('keydown', function (e) {
              if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('lnaddr-submit').click();
              }
            });
          }
          var lnaddrSubmit = document.getElementById('lnaddr-submit');
          if (lnaddrSubmit) {
            lnaddrSubmit.addEventListener('click', async function () {
              var input = document.getElementById('lnaddr-input').value.trim();
              var statusEl = document.getElementById('lnaddr-status');
              var submitBtn = document.getElementById('lnaddr-submit');
              if (!input) {
                statusEl.style.color = 'var(--text-muted)';
                statusEl.textContent = ref('lnaddrEmptyError');
                return;
              }
              submitBtn.disabled = true;
              statusEl.style.color = 'var(--text-muted)';
              try {
                await window.redeemToLightningAddress({
                  serverURL: serverURL,
                  secret: secret,
                  balanceMsat: balance_msat,
                  lnInput: input,
                  onStatus: function (msg) {
                    statusEl.textContent = msg;
                  },
                });
                document.getElementById('lnaddr-modal').classList.add('hidden');
                var celEl2 = document.getElementById('redeem-celebration');
                if (celEl2) {
                  celEl2.textContent = ref('paymentPendingLine');
                }
                if (!pollInterval) {
                  pollInterval = startRedemptionPoll();
                }
                statusEl.textContent = '';
                submitBtn.disabled = false;
              } catch (err) {
                statusEl.style.color = 'var(--red, #e05252)';
                statusEl.textContent = err.message || ref('lnaddrGenericError');
                submitBtn.disabled = false;
              }
            });
          }

          if (hasExpiry) {
            var countdownEl = document.getElementById('expiry-countdown');
            var countdownTimer;
            function updateCountdown() {
              var secsLeft = expires_at - Math.floor(Date.now() / 1000);
              if (secsLeft <= 0) {
                clearInterval(countdownTimer);
                var sticker = document.getElementById('redeem-sticker');
                var revealBtn = document.getElementById('btn-reveal-secret');
                var celEl3 = document.getElementById('redeem-celebration');
                if (sticker) {
                  sticker.textContent = ref('stickerExpired');
                  sticker.className = 'hc-sticker hc-sticker-gray';
                }
                if (revealBtn) {
                  revealBtn.disabled = true;
                  revealBtn.style.opacity = '0.5';
                }
                if (celEl3) {
                  celEl3.textContent = ref('countdownExpiredMessage');
                }
                if (countdownEl) {
                  countdownEl.textContent = '';
                }
                return;
              }
              var d = Math.floor(secsLeft / 86400);
              var h = Math.floor((secsLeft % 86400) / 3600);
              var m = Math.floor((secsLeft % 3600) / 60);
              var s = secsLeft % 60;
              var parts = [];
              if (d > 0) {
                parts.push(d + 'd');
              }
              parts.push(String(h).padStart(2, '0') + 'h');
              parts.push(String(m).padStart(2, '0') + 'm');
              parts.push(String(s).padStart(2, '0') + 's');
              countdownEl.textContent = ref('countdownPrefix') + parts.join(' ');
            }
            updateCountdown();
            countdownTimer = setInterval(updateCountdown, 1000);
          }

          (async function fetchFiat() {
            var fiatEl = document.getElementById('redeem-fiat-value');
            if (!fiatEl) {
              return;
            }
            try {
              var r = await fetch(
                'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=zar'
              );
              if (!r.ok) {
                return;
              }
              var data = await r.json();
              var zarPerBtc = data && data.bitcoin && data.bitcoin.zar;
              if (!zarPerBtc) {
                return;
              }
              var zarValue = (sats / 100000000) * zarPerBtc;
              if (zarValue < 0.01) {
                return;
              }
              fiatEl.textContent =
                '\u2248 R' +
                zarValue.toLocaleString('en-ZA', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                });
            } catch (_) {}
          })();

          function startRedemptionPoll() {
            return setInterval(async function () {
              try {
                var pk2 = await secretToPubKey(secret);
                var r = await fetch(serverURL + '/status', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ pubkeys: [pk2] }),
                });
                if (!r.ok) {
                  return;
                }
                var s = (await r.json())[pk2];
                if (s.active) {
                  return;
                }
                clearInterval(pollInterval);
                pollInterval = null;
                cardInner.classList.remove('flipped');
                var sticker = document.getElementById('redeem-sticker');
                var revealBtn = document.getElementById('btn-reveal-secret');
                var celEl4 = document.getElementById('redeem-celebration');
                if (s.refunded) {
                  if (sticker) {
                    sticker.textContent = ref('stickerExpired');
                    sticker.className = 'hc-sticker hc-sticker-gray';
                  }
                  if (celEl4) {
                    celEl4.textContent = ref('countdownExpiredMessage');
                  }
                } else {
                  if (sticker) {
                    sticker.textContent = ref('stickerRedeemed');
                    sticker.className = 'hc-sticker hc-sticker-green';
                  }
                  if (celEl4) {
                    celEl4.textContent = ref('claimedSuccessLine');
                  }
                  var blinkDetails = document.getElementById('details-blink');
                  var spendDetails = document.getElementById('details-spend');
                  if (blinkDetails) {
                    blinkDetails.removeAttribute('open');
                  }
                  if (spendDetails) {
                    spendDetails.setAttribute('open', '');
                  }
                }
                if (revealBtn) {
                  revealBtn.disabled = true;
                  revealBtn.style.opacity = '0.5';
                }
              } catch (_) {}
            }, 12000);
          }
        }

        continueAfterStatus();
      });
    }

    init();
  }

  function snRedeemMain() {
    redeemRunner();
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-tab]');
    if (!btn) {
      return;
    }
    var tabsEl = btn.closest('#wallet-tabs');
    if (!tabsEl) {
      return;
    }
    var card = tabsEl.closest('.card, .faq-answer');
    tabsEl.querySelectorAll('.tab-btn').forEach(function (b) {
      b.classList.remove('active');
    });
    btn.classList.add('active');
    card.querySelectorAll('.tab-pane').forEach(function (p) {
      p.classList.remove('active');
    });
    var pane = card.querySelector('#tab-' + btn.dataset.tab);
    if (pane) {
      pane.classList.add('active');
    }
  });

  window.snRedeemMain = snRedeemMain;
})();
