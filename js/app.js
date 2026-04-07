/* ── Satoshi Note — app.js ── */
'use strict';

// ── Constants ────────────────────────────────────────────────────────────────
const LS_REFUND = 'sn_refund_code';
const LS_HISTORY = 'sn_history';
const LS_DIAL_CODE = 'sn_dial_code';
const LS_MSG_TEMPLATE = 'sn_msg_template';
const LS_WALLET_VOUCHER = 'sn_wallet_voucher';
const LS_WALLET_AMOUNTS = 'sn_wallet_amounts';
const LS_SERVER_URL = 'sn_server_url';
const LS_KNOWN_SERVERS = 'sn_known_servers';
const APP_FV = 1; // frontend version — stamped on vouchers created by this build

const DEFAULT_MSG_TEMPLATE =
`I sent you a small amount of Bitcoin to try.

You can claim it here: {link}

This page explains how to get a wallet and redeem it step by step.

The voucher expires soon, so try claim it when you get a chance.`;

const DIAL_CODES = [
  ['+93',  'Afghanistan (+93)'],
  ['+355', 'Albania (+355)'],
  ['+213', 'Algeria (+213)'],
  ['+376', 'Andorra (+376)'],
  ['+244', 'Angola (+244)'],
  ['+54',  'Argentina (+54)'],
  ['+374', 'Armenia (+374)'],
  ['+297', 'Aruba (+297)'],
  ['+247', 'Ascension Island (+247)'],
  ['+61',  'Australia (+61)'],
  ['+43',  'Austria (+43)'],
  ['+994', 'Azerbaijan (+994)'],
  ['+973', 'Bahrain (+973)'],
  ['+880', 'Bangladesh (+880)'],
  ['+375', 'Belarus (+375)'],
  ['+32',  'Belgium (+32)'],
  ['+501', 'Belize (+501)'],
  ['+229', 'Benin (+229)'],
  ['+975', 'Bhutan (+975)'],
  ['+591', 'Bolivia (+591)'],
  ['+387', 'Bosnia and Herzegovina (+387)'],
  ['+267', 'Botswana (+267)'],
  ['+55',  'Brazil (+55)'],
  ['+246', 'British Indian Ocean Territory (+246)'],
  ['+673', 'Brunei (+673)'],
  ['+359', 'Bulgaria (+359)'],
  ['+257', 'Burundi (+257)'],
  ['+855', 'Cambodia (+855)'],
  ['+237', 'Cameroon (+237)'],
  ['+1',   'Canada / United States (+1)'],
  ['+238', 'Cape Verde (+238)'],
  ['+236', 'Central African Republic (+236)'],
  ['+235', 'Chad (+235)'],
  ['+56',  'Chile (+56)'],
  ['+86',  'China (+86)'],
  ['+57',  'Colombia (+57)'],
  ['+269', 'Comoros (+269)'],
  ['+682', 'Cook Islands (+682)'],
  ['+506', 'Costa Rica (+506)'],
  ['+385', 'Croatia (+385)'],
  ['+53',  'Cuba (+53)'],
  ['+357', 'Cyprus (+357)'],
  ['+420', 'Czech Republic (+420)'],
  ['+45',  'Denmark (+45)'],
  ['+253', 'Djibouti (+253)'],
  ['+243', 'DR Congo (+243)'],
  ['+670', 'East Timor (+670)'],
  ['+593', 'Ecuador (+593)'],
  ['+20',  'Egypt (+20)'],
  ['+503', 'El Salvador (+503)'],
  ['+240', 'Equatorial Guinea (+240)'],
  ['+291', 'Eritrea (+291)'],
  ['+372', 'Estonia (+372)'],
  ['+268', 'Eswatini (+268)'],
  ['+251', 'Ethiopia (+251)'],
  ['+500', 'Falkland Islands (+500)'],
  ['+298', 'Faroe Islands (+298)'],
  ['+679', 'Fiji (+679)'],
  ['+358', 'Finland (+358)'],
  ['+33',  'France (+33)'],
  ['+594', 'French Guiana (+594)'],
  ['+689', 'French Polynesia (+689)'],
  ['+241', 'Gabon (+241)'],
  ['+220', 'Gambia (+220)'],
  ['+995', 'Georgia (+995)'],
  ['+49',  'Germany (+49)'],
  ['+233', 'Ghana (+233)'],
  ['+350', 'Gibraltar (+350)'],
  ['+30',  'Greece (+30)'],
  ['+299', 'Greenland (+299)'],
  ['+590', 'Guadeloupe (+590)'],
  ['+502', 'Guatemala (+502)'],
  ['+224', 'Guinea (+224)'],
  ['+245', 'Guinea-Bissau (+245)'],
  ['+592', 'Guyana (+592)'],
  ['+509', 'Haiti (+509)'],
  ['+504', 'Honduras (+504)'],
  ['+852', 'Hong Kong (+852)'],
  ['+36',  'Hungary (+36)'],
  ['+354', 'Iceland (+354)'],
  ['+91',  'India (+91)'],
  ['+62',  'Indonesia (+62)'],
  ['+98',  'Iran (+98)'],
  ['+964', 'Iraq (+964)'],
  ['+353', 'Ireland (+353)'],
  ['+972', 'Israel (+972)'],
  ['+39',  'Italy (+39)'],
  ['+225', 'Ivory Coast (+225)'],
  ['+81',  'Japan (+81)'],
  ['+962', 'Jordan (+962)'],
  ['+254', 'Kenya (+254)'],
  ['+686', 'Kiribati (+686)'],
  ['+965', 'Kuwait (+965)'],
  ['+996', 'Kyrgyzstan (+996)'],
  ['+856', 'Laos (+856)'],
  ['+371', 'Latvia (+371)'],
  ['+961', 'Lebanon (+961)'],
  ['+266', 'Lesotho (+266)'],
  ['+231', 'Liberia (+231)'],
  ['+218', 'Libya (+218)'],
  ['+423', 'Liechtenstein (+423)'],
  ['+370', 'Lithuania (+370)'],
  ['+352', 'Luxembourg (+352)'],
  ['+853', 'Macau (+853)'],
  ['+261', 'Madagascar (+261)'],
  ['+265', 'Malawi (+265)'],
  ['+60',  'Malaysia (+60)'],
  ['+960', 'Maldives (+960)'],
  ['+223', 'Mali (+223)'],
  ['+356', 'Malta (+356)'],
  ['+692', 'Marshall Islands (+692)'],
  ['+596', 'Martinique (+596)'],
  ['+230', 'Mauritius (+230)'],
  ['+52',  'Mexico (+52)'],
  ['+691', 'Micronesia (+691)'],
  ['+373', 'Moldova (+373)'],
  ['+377', 'Monaco (+377)'],
  ['+976', 'Mongolia (+976)'],
  ['+382', 'Montenegro (+382)'],
  ['+212', 'Morocco (+212)'],
  ['+258', 'Mozambique (+258)'],
  ['+95',  'Myanmar (+95)'],
  ['+264', 'Namibia (+264)'],
  ['+674', 'Nauru (+674)'],
  ['+977', 'Nepal (+977)'],
  ['+31',  'Netherlands (+31)'],
  ['+599', 'Netherlands Antilles (+599)'],
  ['+687', 'New Caledonia (+687)'],
  ['+64',  'New Zealand (+64)'],
  ['+505', 'Nicaragua (+505)'],
  ['+227', 'Niger (+227)'],
  ['+234', 'Nigeria (+234)'],
  ['+683', 'Niue (+683)'],
  ['+672', 'Norfolk Island (+672)'],
  ['+850', 'North Korea (+850)'],
  ['+389', 'North Macedonia (+389)'],
  ['+47',  'Norway (+47)'],
  ['+968', 'Oman (+968)'],
  ['+92',  'Pakistan (+92)'],
  ['+680', 'Palau (+680)'],
  ['+970', 'Palestine (+970)'],
  ['+507', 'Panama (+507)'],
  ['+675', 'Papua New Guinea (+675)'],
  ['+595', 'Paraguay (+595)'],
  ['+51',  'Peru (+51)'],
  ['+63',  'Philippines (+63)'],
  ['+48',  'Poland (+48)'],
  ['+351', 'Portugal (+351)'],
  ['+974', 'Qatar (+974)'],
  ['+242', 'Republic of the Congo (+242)'],
  ['+40',  'Romania (+40)'],
  ['+7',   'Russia (+7)'],
  ['+250', 'Rwanda (+250)'],
  ['+290', 'Saint Helena (+290)'],
  ['+508', 'Saint Pierre and Miquelon (+508)'],
  ['+685', 'Samoa (+685)'],
  ['+378', 'San Marino (+378)'],
  ['+239', 'São Tomé and Príncipe (+239)'],
  ['+966', 'Saudi Arabia (+966)'],
  ['+221', 'Senegal (+221)'],
  ['+381', 'Serbia (+381)'],
  ['+248', 'Seychelles (+248)'],
  ['+232', 'Sierra Leone (+232)'],
  ['+65',  'Singapore (+65)'],
  ['+421', 'Slovakia (+421)'],
  ['+386', 'Slovenia (+386)'],
  ['+677', 'Solomon Islands (+677)'],
  ['+252', 'Somalia (+252)'],
  ['+27',  'South Africa (+27)'],
  ['+82',  'South Korea (+82)'],
  ['+34',  'Spain (+34)'],
  ['+94',  'Sri Lanka (+94)'],
  ['+249', 'Sudan (+249)'],
  ['+597', 'Suriname (+597)'],
  ['+46',  'Sweden (+46)'],
  ['+41',  'Switzerland (+41)'],
  ['+963', 'Syria (+963)'],
  ['+886', 'Taiwan (+886)'],
  ['+992', 'Tajikistan (+992)'],
  ['+255', 'Tanzania (+255)'],
  ['+66',  'Thailand (+66)'],
  ['+228', 'Togo (+228)'],
  ['+690', 'Tokelau (+690)'],
  ['+676', 'Tonga (+676)'],
  ['+216', 'Tunisia (+216)'],
  ['+90',  'Turkey (+90)'],
  ['+993', 'Turkmenistan (+993)'],
  ['+688', 'Tuvalu (+688)'],
  ['+256', 'Uganda (+256)'],
  ['+380', 'Ukraine (+380)'],
  ['+971', 'United Arab Emirates (+971)'],
  ['+44',  'United Kingdom (+44)'],
  ['+598', 'Uruguay (+598)'],
  ['+998', 'Uzbekistan (+998)'],
  ['+678', 'Vanuatu (+678)'],
  ['+58',  'Venezuela (+58)'],
  ['+84',  'Vietnam (+84)'],
  ['+681', 'Wallis and Futuna (+681)'],
  ['+967', 'Yemen (+967)'],
  ['+260', 'Zambia (+260)'],
  ['+263', 'Zimbabwe (+263)'],
];

// ── State ─────────────────────────────────────────────────────────────────────
const state = {
  step: 1,               // single voucher wizard step
  vouchers: null,        // current voucher array from API
};

// ── Server URL resolution ─────────────────────────────────────────────────────
// Priority: 1) #lightning= or ?lightning= URL param (decoded to extract origin)
//           2) localStorage sn_server_url (user-configured or persisted from param)
//           3) window.SATOSHI_NOTE_DEFAULT_SERVER (from config.js)
//           4) same-origin fallback (self-hosted deployments)
function resolveServerURL() {
  const hashParam   = new URLSearchParams(location.hash.replace(/^#/, '')).get('lightning');
  const searchParam = new URLSearchParams(location.search).get('lightning');
  const lightningParam = hashParam || searchParam;
  if (lightningParam) {
    try {
      const decoded = decodeLNURL(lightningParam.toUpperCase());
      const origin = new URL(decoded).origin;
      if (origin) {
        localStorage.setItem(LS_SERVER_URL, origin);
        return origin;
      }
    } catch (_) {}
  }
  const stored = localStorage.getItem(LS_SERVER_URL);
  if (stored) return stored.replace(/\/$/, '');
  if (window.SATOSHI_NOTE_DEFAULT_SERVER) return window.SATOSHI_NOTE_DEFAULT_SERVER;
  return window.location.origin;
}
const _serverURL = resolveServerURL();

// ── Config + crypto helpers ───────────────────────────────────────────────────
let _randomBytesLength = (typeof window.DEFAULT_RANDOM_BYTES_LENGTH === 'number') ? window.DEFAULT_RANDOM_BYTES_LENGTH : 16;

// Build logo HTML from a CamelCase name: words alternate orange/white starting with orange.
// e.g. 'SatoshiNote' → 'Satoshi<span>Note</span>'
function _buildSiteLogoInner(name) {
  const words = name.split(' ').filter(w => w.length > 0);
  if (!words.length) return name;
  return words.map((w, i) => i % 2 === 0 ? w : '<span>' + w + '</span>').join('');
}

let _siteName = 'Satoshi Note';
let _siteLogoInner = 'Satoshi<span>Note</span>';
let _githubURL = window.SATOSHI_NOTE_GITHUB_URL || '';
let _donateLNURL = window.SATOSHI_NOTE_DONATE_LNURL || '';
let _defaultDialCode = (window.DEFAULT_DIAL_CODE ? '+' + window.DEFAULT_DIAL_CODE : '+27');
const _configReady = (async () => {
  try {
    const [configRes, manifestRes] = await Promise.all([
      fetch(_serverURL + '/config').catch(() => null),
      fetch('/manifest.json').catch(() => null)
    ]);
    if (manifestRes && manifestRes.ok) {
      const m = await manifestRes.json();
      if (m.name) { _siteName = m.name; _siteLogoInner = _buildSiteLogoInner(m.name); }
    }
    if (configRes && configRes.ok) {
      const d = await configRes.json();
      if (typeof d.random_bytes_length === 'number') _randomBytesLength = d.random_bytes_length;
      if (typeof d.min_fund_amount_msat === 'number') _minFundAmountMsat = d.min_fund_amount_msat;
      if (d.site_name)       _siteName = d.site_name;
      if (d.site_logo_inner) _siteLogoInner = d.site_logo_inner;
    }
  } catch (_) {}
})();

function generateSecretHex(length) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function secretToPubKey(secretHex) {
  const n = secretHex.length / 2;
  const bytes = new Uint8Array(n);
  for (let i = 0; i < n; i++) bytes[i] = parseInt(secretHex.slice(i * 2, i * 2 + 2), 16);
  const hashBuf = await crypto.subtle.digest('SHA-256', bytes);
  // Take first n bytes of 32-byte hash (matches Go's h[:len(b)])
  const hashBytes = new Uint8Array(hashBuf, 0, n);
  return Array.from(hashBytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Bech32 LNURL encoder (port of lnurl.go) ───────────────────────────────────
const _BECH32 = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
function _b32poly(pre) {
  const b = (pre >>> 25) & 0x1f, c = ((pre & 0x1FFFFFF) * 32) >>> 0;
  return [0x3b6a57b2,0x26508e6d,0x1ea119fa,0x3d4233dd,0x2a1462b3]
    .reduce((acc, g, i) => (b >> i) & 1 ? (acc ^ g) >>> 0 : acc, c);
}
function _b32expand(hrp) {
  const r = [...hrp].map(c => c.charCodeAt(0) >> 5);
  r.push(0);
  return r.concat([...hrp].map(c => c.charCodeAt(0) & 31));
}
function _b32checksum(hrp, data) {
  let p = 1;
  for (const v of [..._b32expand(hrp), ...data, 0,0,0,0,0,0]) p = (_b32poly(p) ^ v) >>> 0;
  p = (p ^ 1) >>> 0;
  return [5,4,3,2,1,0].map(i => (p >>> (5*i)) & 31);
}
function _to5bit(data) {
  let acc = 0, bits = 0; const out = [];
  for (const v of data) {
    acc = ((acc << 8) | v) >>> 0; bits += 8;
    while (bits >= 5) { bits -= 5; out.push((acc >>> bits) & 31); }
  }
  if (bits > 0) out.push((acc << (5 - bits)) & 31);
  return out;
}
function lnurlEncode(url) {
  const data = _to5bit(new TextEncoder().encode(url));
  return ('lnurl1' + [...data, ..._b32checksum('lnurl', data)].map(b => _BECH32[b]).join('')).toUpperCase();
}

// ── Legacy voucher migration ──────────────────────────────────────────────────
// Rewrites URL prefixes in a voucher and regenerates its encoded LNURLs.
function rebaseVoucher(v, newOrigin) {
  const oldOrigin = new URL(v.fund_url_prefix).origin;
  v.fund_url_prefix     = v.fund_url_prefix.replace(oldOrigin, newOrigin);
  v.withdraw_url_prefix = v.withdraw_url_prefix.replace(oldOrigin, newOrigin);
  v.fund_lnurl          = lnurlEncode(v.fund_url_prefix + v.pubkey);
  v.claim_lnurl         = lnurlEncode(v.withdraw_url_prefix + v.secret);
}

// For legacy vouchers (no _fv): check the voucher's own saved server first.
// Only rebase to _serverURL if the original server fails. Returns true if changed.
async function tryMigrateVoucher(v) {
  if (v._fv) return false;
  const currentOrigin = new URL(_serverURL).origin;
  let prefixOrigin;
  try { prefixOrigin = new URL(v.fund_url_prefix).origin; } catch { return false; }
  if (prefixOrigin === currentOrigin) {
    // Origins already match — just stamp.
    v._fv = APP_FV;
    return true;
  }
  // Check if the voucher's original server still has it.
  try {
    const res = await fetch(`${prefixOrigin}/status`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pubkeys: [v.pubkey] }),
    });
    if (res.ok) {
      // Original server is alive — keep URLs as-is, just stamp version.
      v._fv = APP_FV;
      return true;
    }
  } catch {}
  // Original server failed — try current _serverURL as fallback.
  try {
    const res = await fetch(`${_serverURL}/status`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pubkeys: [v.pubkey] }),
    });
    if (!res.ok) return false;
    rebaseVoucher(v, currentOrigin);
    v._fv = APP_FV;
    return true;
  } catch { return false; }
}

// If the wallet voucher belongs to a server that is no longer responding, check
// the current _serverURL as a fallback (mirrors the history voucher behaviour).
// Rebases and re-saves the voucher under the new origin when found. Returns true
// if any wallet was migrated.
async function tryMigrateWalletVouchers() {
  const currentOrigin = new URL(_serverURL).origin;
  const all = getWalletVouchers();
  let migrated = false;
  for (const [origin, wv] of Object.entries(all)) {
    if (origin === currentOrigin) continue;
    // Try the wallet's own server first.
    let originalReachable = false;
    try {
      const res = await fetch(`${origin}/status`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pubkeys: [wv.pubkey] }),
      });
      if (res.ok) originalReachable = true;
    } catch {}
    if (originalReachable) continue; // Original server alive — leave as-is.
    // Original server unreachable — try current server as fallback.
    try {
      const res = await fetch(`${_serverURL}/status`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pubkeys: [wv.pubkey] }),
      });
      if (!res.ok) continue;
      const data = (await res.json())[wv.pubkey];
      if (!data) continue;
      // Voucher found on current server — rebase URLs and re-save.
      delete all[origin];
      rebaseVoucher(wv, currentOrigin);
      wv._fv = APP_FV;
      all[currentOrigin] = wv;
      saveWalletVouchers(all);
      migrated = true;
    } catch {}
  }
  return migrated;
}

// ── Known servers list ────────────────────────────────────────────────────────
function getKnownServers() {
  try { return JSON.parse(localStorage.getItem(LS_KNOWN_SERVERS)) || []; } catch { return []; }
}

function addKnownServer(origin) {
  const list = getKnownServers();
  if (!list.includes(origin)) {
    list.push(origin);
    localStorage.setItem(LS_KNOWN_SERVERS, JSON.stringify(list));
  }
}

function removeKnownServer(origin) {
  localStorage.setItem(LS_KNOWN_SERVERS, JSON.stringify(getKnownServers().filter(o => o !== origin)));
}

let _fundPoller = null;
let _settingsPoller = null;
let _countdownTimer = null;
let _walletCountdownTimer = null;
let _dialCode = '+1';
let _singleExpiry = 259200;
let _walletExpiry = 604800;
let _minFundAmountMsat = 120000; // safe fallback
let _walletRawBalanceMsat = 0;

function normalizeToE164(raw, dialCode) {
  const dialDigits = dialCode.replace('+', '');
  const trimmed = raw.trim();
  if (trimmed.startsWith('+')) {
    return trimmed.replace(/\D/g, '');
  }
  const digits = trimmed.replace(/\D/g, '').replace(/^0+/, '');
  if (digits.startsWith(dialDigits)) {
    return digits;
  }
  return dialDigits + digits;
}

function buildDialDropdown(preferred) {
  _dialCode = preferred;
  const btn    = $('dial-code-btn');
  const panel  = $('dial-code-panel');
  const search = $('dial-code-search');
  const list   = $('dial-code-list');
  btn.textContent = preferred;

  function renderList(filter) {
    list.innerHTML = '';
    const lf = filter.toLowerCase();
    DIAL_CODES.forEach(([code, label]) => {
      const name = label.replace(/ \([^)]+\)$/, '');
      if (lf && !name.toLowerCase().includes(lf) && !code.includes(lf)) return;
      const li = document.createElement('li');
      li.textContent = `${name} (${code})`;
      li.dataset.code = code;
      if (code === _dialCode) li.classList.add('selected');
      li.onclick = () => {
        _dialCode = code;
        localStorage.setItem(LS_DIAL_CODE, code);
        btn.textContent = code;
        btn.classList.remove('open');
        panel.classList.add('hidden');
        search.value = '';
        renderList('');
      };
      list.appendChild(li);
    });
  }

  renderList('');

  btn.onclick = e => {
    e.stopPropagation();
    const opening = panel.classList.contains('hidden');
    panel.classList.toggle('hidden', !opening);
    btn.classList.toggle('open', opening);
    if (opening) { search.value = ''; renderList(''); search.focus(); }
  };

  search.addEventListener('input', () => renderList(search.value));
  search.addEventListener('keydown', e => {
    if (e.key === 'Escape') { panel.classList.add('hidden'); btn.classList.remove('open'); }
  });

  document.addEventListener('click', e => {
    if (!$('dial-code-wrapper').contains(e.target)) {
      panel.classList.add('hidden');
      btn.classList.remove('open');
    }
  });
}

function startFundingPoll(pubkey) {
  stopFundingPoll();
  _fundPoller = setInterval(async () => {
    try {
      const r = await fetch(_serverURL + '/status', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pubkeys: [pubkey] }),
      });
      if (!r.ok) return;
      const s = (await r.json())[pubkey];
      if (s && s.balance_msat > 0) {
        stopFundingPoll();
        renderShareStep(state.vouchers[0]);
        showStep(3);
      }
    } catch { /* network blip — retry next tick */ }
  }, 2500);
}

function stopFundingPoll() {
  if (_fundPoller) { clearInterval(_fundPoller); _fundPoller = null; }
}

// ── DOM refs ──────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

// ── UUID v4 ───────────────────────────────────────────────────────────────────
function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
}

// ── localStorage helpers ──────────────────────────────────────────────────────
function getHistory() {
  try { return JSON.parse(localStorage.getItem(LS_HISTORY) || '[]'); }
  catch { return []; }
}

function saveHistory(arr) {
  localStorage.setItem(LS_HISTORY, JSON.stringify(arr));
}

function pushHistory(entry) {
  const arr = getHistory();
  arr.unshift(entry);
  saveHistory(arr);
}

// ── QR helpers ────────────────────────────────────────────────────────────────
function renderQR(container, text, size) {
  container.innerHTML = '';
  new QRCode(container, { text, width: size, height: size, correctLevel: QRCode.CorrectLevel.M });
}

function qrToDataURL(text, size) {
  return new Promise(resolve => {
    const div = document.createElement('div');
    div.style.cssText = 'position:absolute;left:-9999px;top:-9999px';
    document.body.appendChild(div);
    new QRCode(div, { text, width: size, height: size, correctLevel: QRCode.CorrectLevel.M });
    // QRCode renders canvas or img; canvas has toDataURL directly
    setTimeout(() => {
      const canvas = div.querySelector('canvas');
      const dataURL = canvas ? canvas.toDataURL('image/png') : null;
      document.body.removeChild(div);
      resolve(dataURL);
    }, 80);
  });
}

// ── Clipboard ─────────────────────────────────────────────────────────────────
async function copyToClipboard(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
    const origHTML = btn.innerHTML;
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.innerHTML = origHTML; }, 1500);
  } catch {
    prompt('Copy this:', text);
  }
}

// ── API call ─────────────────────────────────────────────────────────────────
async function createVouchers(payload) {
  const res = await fetch(_serverURL + '/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => 'Request failed');
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Dial code detect ──────────────────────────────────────────────────────────
function defaultDialCode() {
  return localStorage.getItem(LS_DIAL_CODE)
    || (_defaultDialCode && _defaultDialCode.trim())
    || '+27';
}

// ── Expiry text ───────────────────────────────────────────────────────────────
function expiryText(createdAt, refundAfterSeconds) {
  const secsLeft = (createdAt + refundAfterSeconds) - Math.floor(Date.now() / 1000);
  if (secsLeft <= 0) return { text: 'Expired', cls: 'expiry-expired' };
  const hrs = Math.floor(secsLeft / 3600);
  if (hrs < 24) return { text: `${hrs}h left`, cls: hrs < 6 ? 'expiry-warn' : 'expiry-ok' };
  const days = Math.floor(hrs / 24);
  return { text: `${days}d left`, cls: days < 2 ? 'expiry-warn' : 'expiry-ok' };
}

function daysFromSeconds(secs) {
  const d = Math.round(secs / 86400);
  if (d < 7) return d === 1 ? '1 day' : `${d} days`;
  const w = Math.round(d / 7);
  return w === 1 ? '1 week' : `${w} weeks`;
}

function fmtSats(msat) {
  return Math.round(msat / 1000).toLocaleString();
}


function expiryAfterFundingLabel(refundAfterSeconds) {
  const days = Math.round(refundAfterSeconds / 86400);
  if (days < 14) return `Valid for ${days} days after funding`;
  if (days < 60) return `Valid for ${Math.round(days / 7)} weeks after funding`;
  const months = Math.round(days / 30);
  return `Valid for ${months} month${months > 1 ? 's' : ''} after funding`;
}

// ── WhatsApp message ──────────────────────────────────────────────────────────
function buildWAMessage(claimLnurl) {
  const link = `${window.location.origin}/redeem.html#lightning=${encodeURIComponent(claimLnurl)}`;
  const template = localStorage.getItem(LS_MSG_TEMPLATE) || DEFAULT_MSG_TEMPLATE;
  return template.replace('{link}', link);
}

let _msgSheetEl = null;
function showMsgSheet() {
  if (!_msgSheetEl) {
    const overlay = document.createElement('div');
    overlay.className = 'wallet-sheet-overlay hidden';
    overlay.innerHTML = `
      <div class="wallet-sheet">
        <p class="wallet-sheet-title">Customise your message</p>
        <p style="font-size:0.78rem;color:var(--text-muted);margin-bottom:10px;text-align:center;">
          Use <strong style="color:var(--text);">{link}</strong> where you want the voucher link to appear.
        </p>
        <textarea id="msg-sheet-textarea" class="msg-sheet-textarea"></textarea>
        <p id="msg-sheet-warning" style="display:none;font-size:0.78rem;color:#e06c6c;margin-top:8px;">
          Your message must contain <strong>{link}</strong> so the voucher URL is included.
        </p>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;">
          <button id="msg-sheet-restore" style="background:none;border:none;color:var(--text-muted);font-size:0.82rem;cursor:pointer;padding:0;">Restore default</button>
          <button id="msg-sheet-save" class="btn btn-primary btn-sm">Save</button>
        </div>
      </div>`;
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.add('hidden'); });
    document.body.appendChild(overlay);
    _msgSheetEl = overlay;

    const ta      = overlay.querySelector('#msg-sheet-textarea');
    const warn    = overlay.querySelector('#msg-sheet-warning');

    overlay.querySelector('#msg-sheet-restore').onclick = () => {
      ta.value = DEFAULT_MSG_TEMPLATE;
      warn.style.display = 'none';
    };
    overlay.querySelector('#msg-sheet-save').onclick = () => {
      const val = ta.value.trim();
      if (!val.includes('{link}')) {
        warn.style.display = '';
        ta.focus();
        return;
      }
      warn.style.display = 'none';
      localStorage.setItem(LS_MSG_TEMPLATE, val);
      overlay.classList.add('hidden');
    };
    ta.addEventListener('input', () => {
      if (ta.value.includes('{link}')) warn.style.display = 'none';
    });
  }

  const textarea = _msgSheetEl.querySelector('#msg-sheet-textarea');
  const warning  = _msgSheetEl.querySelector('#msg-sheet-warning');
  textarea.value = localStorage.getItem(LS_MSG_TEMPLATE) || DEFAULT_MSG_TEMPLATE;
  warning.style.display = 'none';

  _msgSheetEl.classList.remove('hidden');
}

// ── Single voucher wizard ─────────────────────────────────────────────────────
function showStep(n) {
  state.step = n;
  [1, 2, 3].forEach(i => {
    const el = $(`single-step-${i}`);
    if (el) el.classList.toggle('hidden', i !== n);
  });
  // update step dots
  const dots = document.querySelectorAll('#tab-single .step-dot');
  dots.forEach((d, i) => {
    d.classList.toggle('done', i < n - 1);
    d.classList.toggle('active', i === n - 1);
  });
  const lbl = $('step-label');
  if (lbl) lbl.textContent = `Step ${n} of 3`;
}

function initSingleStep1() {
  document.querySelectorAll('#single-expiry-pills .pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#single-expiry-pills .pill-btn')
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _singleExpiry = parseInt(btn.dataset.secs, 10);
    });
  });

}

async function handleCreateSingle() {
  const btn = $('btn-create-single');
  const errEl = $('single-step1-error');
  errEl.classList.remove('visible');

  const note = ($('voucher-note') && $('voucher-note').value.trim()) || '';

  const refundCode = localStorage.getItem(LS_REFUND) || '';

  await _configReady;
  const secret = generateSecretHex(_randomBytesLength);
  const pubKey = await secretToPubKey(secret);

  btn.disabled = true;
  const origHTML = btn.innerHTML;
  btn.innerHTML = '<span class="spinner"></span> Creating…';

  try {
    const vouchers = await createVouchers({
      pub_keys: [pubKey],
      refund_code: refundCode,
      refund_after_seconds: _singleExpiry,
      single_use: true,
    });

    vouchers[0].secret = secret;
    vouchers[0].claim_lnurl = lnurlEncode(vouchers[0].withdraw_url_prefix + secret);
    vouchers[0].fund_lnurl = lnurlEncode(vouchers[0].fund_url_prefix + vouchers[0].pubkey);
    vouchers[0]._fv = APP_FV;

    state.vouchers = vouchers;
    state.note = note;
    // Phone will be collected in step 3
    state.hasPhone = false;
    state.e164 = '';
    state.dialCode = defaultDialCode();
    state.localNumber = '';

    renderFundStep(vouchers[0]);
    showStep(2);
    await checkWalletForTransfer(vouchers[0]);
  } catch (err) {
    errEl.textContent = err.message || 'Failed to create voucher. Try again.';
    errEl.classList.add('visible');
  } finally {
    btn.disabled = false;
    btn.innerHTML = origHTML;
  }
}

function renderFundStep(voucher) {
  // Phone is not yet known — hide phone-related rows on step 2
  const voucherForRow = $('step2-voucher-for');
  if (voucherForRow) voucherForRow.style.display = 'none';
  $('btn-pay-local-instead').classList.add('hidden');

  $('btn-next-step2').onclick = () => {
    stopFundingPoll();
    renderShareStep(voucher);
    showStep(3);
  };

  // QR — tap to open wallet
  const container = $('single-qr-container');
  renderQR(container, voucher.fund_lnurl, 256);
  container.style.cursor = 'pointer';
  container.title = 'Tap to open in wallet';
  container.onclick = () => { window.location.href = 'lightning:' + voucher.fund_lnurl; };

  $('single-open-wallet-btn').onclick = () => { window.location.href = 'lightning:' + voucher.fund_lnurl; };
  const lnurlEl = $('single-lnurl-text');
  lnurlEl.onclick = () => copyToClipboard(voucher.fund_lnurl, lnurlEl);

  // Save to history now (balance is 0 but LNURLs are ready; phone added in step 3)
  const histEntry = {
    id: uuidv4(),
    createdAt: Math.floor(Date.now() / 1000),
    refundAfterSeconds: voucher.refund_after_seconds,
    vouchers: state.vouchers,
  };
  if (state.note) histEntry.note = state.note;
  pushHistory(histEntry);
  state.historyId = histEntry.id;

}

function renderShareStep(voucher) {
  // Reset phone state for step 3
  state.hasPhone = false;
  state.e164 = '';
  state.localNumber = '';

  // Build dial dropdown now that the phone input is in the DOM (step 3)
  buildDialDropdown(defaultDialCode());

  // WhatsApp button starts disabled until a valid number is entered
  const waBtn = $('btn-whatsapp');
  waBtn.disabled = true;

  const phoneInput = $('phone-number');
  phoneInput.value = '';

  function validateAndUpdatePhone() {
    const rawNumber = phoneInput.value.trim();
    const dialCode = _dialCode;
    let valid = false;
    if (rawNumber.length > 0) {
      const stripped = rawNumber.replace(/[\s+()\-]/g, '');
      if (!/\D/.test(stripped)) {
        const digits = stripped.replace(/^0+/, '');
        if (digits.length >= 6) valid = true;
      }
    }
    state.hasPhone = valid;
    if (valid) {
      state.e164 = normalizeToE164(rawNumber, dialCode);
      state.localNumber = rawNumber;
    } else {
      state.e164 = '';
      state.localNumber = rawNumber;
    }
    waBtn.disabled = !valid;
  }

  phoneInput.addEventListener('input', validateAndUpdatePhone);

  $('btn-paste-phone').onclick = async () => {
    try {
      const text = await navigator.clipboard.readText();
      phoneInput.value = text;
      phoneInput.dispatchEvent(new Event('input'));
    } catch (e) { /* clipboard access denied */ }
  };

  const redeemLinkQR    = `${window.location.origin}/redeem.html?lightning=${encodeURIComponent(voucher.claim_lnurl)}`;
  const redeemLinkShare = `${window.location.origin}/redeem.html#lightning=${encodeURIComponent(voucher.claim_lnurl)}`;

  waBtn.onclick = () => {
    if (!state.hasPhone) return;
    // Persist phone to history entry
    if (state.historyId) {
      const hist = getHistory();
      const entry = hist.find(e => e.id === state.historyId);
      if (entry) {
        entry.phone = '+' + state.e164;
        saveHistory(hist);
      }
    }
    const url = `https://wa.me/${state.e164}?text=${encodeURIComponent(buildWAMessage(voucher.claim_lnurl))}`;
    window.open(url, '_blank');
  };

  const shareBtn = $('btn-share');
  shareBtn.onclick = async () => {
    const msg = buildWAMessage(voucher.claim_lnurl);
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Your Bitcoin voucher', text: msg });
      } catch (e) {
        if (e.name !== 'AbortError') copyToClipboard(redeemLinkShare, shareBtn);
      }
    } else {
      copyToClipboard(redeemLinkShare, shareBtn);
    }
  };

  $('btn-done-single').onclick = () => {
    state.vouchers = null;
    resetSingleWizard();
    showStep(1);
  };

  // Show QR Code toggle — shows redemption QR
  const claimQrSection = $('claim-qr-section');
  $('btn-show-qr').onclick = () => {
    const visible = !claimQrSection.classList.contains('hidden');
    claimQrSection.classList.toggle('hidden', visible);
    $('btn-show-qr').textContent = visible ? 'Show QR Code' : 'Hide QR Code';
    if (!visible) {
      renderQR($('claim-qr-container'), redeemLinkQR, 256);
    } else {
      $('claim-qr-container').innerHTML = '';
    }
  };

  // Add Funds toggle — shows fund QR inline without leaving step 3
  const addFundsSection = $('add-funds-section');
  $('btn-add-funds').onclick = () => {
    const visible = !addFundsSection.classList.contains('hidden');
    addFundsSection.classList.toggle('hidden', visible);
    $('btn-add-funds').textContent = visible ? 'Add Funds' : 'Hide funding QR';
    if (!visible) {
      const qrEl = $('step3-fund-qr-container');
      renderQR(qrEl, voucher.fund_lnurl, 256);
      qrEl.style.cursor = 'pointer';
      qrEl.title = 'Tap to open in wallet';
      qrEl.onclick = () => { window.location.href = 'lightning:' + voucher.fund_lnurl; };
      const lnEl = $('step3-fund-lnurl-text');
      lnEl.textContent = 'Copy Funding Code';
      lnEl.title = 'Tap to copy';
      lnEl.onclick = () => copyToClipboard(voucher.fund_lnurl, lnEl);
      attachWalletButton(lnEl, voucher.fund_lnurl);
      // Restart polling so auto-advance still works from step 3
      startFundingPoll(voucher.pubkey);
    } else {
      stopFundingPoll();
    }
  };
}

function resetSingleWizard() {
  stopFundingPoll();
  if ($('phone-number')) $('phone-number').value = '';
  if ($('voucher-note')) $('voucher-note').value = '';
  $('single-step1-error').classList.remove('visible');
  $('single-qr-container').innerHTML = '';
  $('single-lnurl-text').textContent = '';
}

// ── History screen ────────────────────────────────────────────────────────────
function isAutoName(name) {
  return /^single-\d+$/.test(name);
}

// In-memory cache for the current session. Pre-populated from localStorage for terminal states.
const historyStatusCache = new Map();

function isTerminalStatus(s) {
  if (!s) return false;
  if (s.refunded === true) return true;
  // active=false, not refunded, no pending refund → redeemed
  if (s.active === false && s.refunded === false && s.refund_pending === false) return true;
  return false;
}

// Pre-populates historyStatusCache from vouchers that already have a _cachedStatus in localStorage.
function preloadTerminalStatuses(history) {
  history.forEach(entry => {
    entry.vouchers.forEach(v => {
      if (v._cachedStatus && !historyStatusCache.has(v.pubkey)) {
        historyStatusCache.set(v.pubkey, v._cachedStatus);
      }
    });
  });
}

// Fetches statuses for the given pubkeys individually, updates the in-memory cache,
// and persists any newly-terminal statuses back to localStorage.
async function fetchAndCacheStatuses(pubkeys, history) {
  const currentOrigin = new URL(_serverURL).origin;

  // Build pubkey → home server origin and pubkey → voucher maps.
  const pubkeyOrigin = new Map();
  const pubkeyVoucher = new Map();
  for (const entry of history) {
    for (const v of entry.vouchers) {
      pubkeyVoucher.set(v.pubkey, v);
      try { pubkeyOrigin.set(v.pubkey, new URL(v.fund_url_prefix).origin); } catch {}
    }
  }

  let changed = false;

  // Fetch each pubkey individually from its home server.
  await Promise.all(pubkeys.map(async pk => {
    const origin = pubkeyOrigin.get(pk) || currentOrigin;
    try {
      const res = await fetch(`${origin}/status`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pubkeys: [pk] }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json())[pk] ?? null;
      historyStatusCache.set(pk, data);
    } catch {
      // Retry against current server if home server differs and failed.
      if (origin !== currentOrigin) {
        try {
          const res = await fetch(`${_serverURL}/status`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pubkeys: [pk] }),
          });
          if (!res.ok) throw new Error();
          const data = (await res.json())[pk] ?? null;
          historyStatusCache.set(pk, data);
          const v = pubkeyVoucher.get(pk);
          if (data && v) {
            rebaseVoucher(v, currentOrigin);
            v._fv = APP_FV;
            changed = true;
          }
        } catch {
          historyStatusCache.set(pk, null);
        }
      } else {
        historyStatusCache.set(pk, null);
      }
    }
  }));

  // Persist newly-terminal statuses and track peak net balance for display after redemption.
  history.forEach(entry => {
    entry.vouchers.forEach(v => {
      const s = historyStatusCache.get(v.pubkey);
      if (!v._cachedStatus && isTerminalStatus(s)) {
        v._cachedStatus = s;
        changed = true;
      }
      // Track the highest seen net balance so redeemed/expired cards can still show an amount.
      if (s && s.active && s.balance_msat > 0 && s.balance_msat > (v._peakNetMsat || 0)) {
        v._peakNetMsat = s.balance_msat;
        changed = true;
      }
    });
  });

  // Migrate legacy vouchers whose server URL has changed since they were created.
  for (const entry of history) {
    for (const v of entry.vouchers) {
      if (!v._fv) {
        const migrated = await tryMigrateVoucher(v);
        if (migrated) changed = true;
      }
    }
  }

  if (changed) saveHistory(history);
}

function classifyVoucher(s, now) {
  if (!s) return 'unfunded';
  if (s.active && s.expires_at === 0) return 'unfunded';
  if (s.active) {
    if (s.expires_at > 0 && now > s.expires_at) return 'expired';
    return 'funded';
  }
  if (s.refunded || s.refund_pending) return 'expired';
  return 'redeemed';
}

function getExpiredSubTag(expiredStatuses) {
  if (expiredStatuses.some(s => s && s.refund_pending)) return 'pending';
  if (expiredStatuses.some(s => s && !s.refunded)) return 'processing';
  return 'refunded';
}

function formatCountdown(secsLeft) {
  if (secsLeft <= 0) return '0s';
  const d = Math.floor(secsLeft / 86400);
  const h = Math.floor((secsLeft % 86400) / 3600);
  const m = Math.floor((secsLeft % 3600) / 60);
  const s = secsLeft % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function tickCountdowns() {
  const now = Math.floor(Date.now() / 1000);
  document.querySelectorAll('[data-expires-at]').forEach(el => {
    const expiresAt = parseInt(el.dataset.expiresAt, 10);
    if (!expiresAt) return;
    const secsLeft = expiresAt - now;
    if (secsLeft <= 0) {
      el.textContent = 'Expired';
      return;
    }
    const d = Math.floor(secsLeft / 86400);
    const h = Math.floor((secsLeft % 86400) / 3600);
    const m = Math.floor((secsLeft % 3600) / 60);
    const s = secsLeft % 60;
    const parts = [];
    if (d > 0) parts.push(d + 'd');
    parts.push(String(h).padStart(2, '0') + 'h');
    parts.push(String(m).padStart(2, '0') + 'm');
    parts.push(String(s).padStart(2, '0') + 's');
    el.textContent = '⏳ Expires in ' + parts.join(' ') + ' ⏳';
  });
}

function buildSectionCards(history) {
  const now = Math.floor(Date.now() / 1000);
  const sections = { unfunded: [], funded: [], redeemed: [], expired: [] };

  history.forEach(entry => {
    const total = entry.vouchers.length;
    const byState = { unfunded: [], funded: [], redeemed: [], expired: [] };

    entry.vouchers.forEach(v => {
      const s = historyStatusCache.get(v.pubkey);
      byState[classifyVoucher(s, now)].push(v);
    });

    ['unfunded', 'funded', 'redeemed', 'expired'].forEach(state => {
      const inState = byState[state];
      if (!inState.length) return;
      const expiredTag = state === 'expired'
        ? getExpiredSubTag(inState.map(v => historyStatusCache.get(v.pubkey)))
        : null;
      let expiresAt = 0;
      if (state === 'funded') {
        for (const v of inState) {
          const s = historyStatusCache.get(v.pubkey);
          if (s && s.expires_at > 0) {
            expiresAt = expiresAt === 0 ? s.expires_at : Math.min(expiresAt, s.expires_at);
          }
        }
      }
      sections[state].push({ entry, count: inState.length, total, expiredTag, expiresAt, vouchers: inState });
    });
  });

  return sections;
}

function renderSectionBody(body, cards, state, showQR, history) {
  body.innerHTML = '';
  if (!cards.length) {
    body.innerHTML = `<p style="font-size:0.8rem;color:var(--text-muted);padding:8px 0">Nothing here.</p>`;
    return;
  }

  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function recipientParts(entry) {
    const parts = [];
    const phoneDigits = entry.phone ? entry.phone.replace(/\D/g, '') : '';
    if (phoneDigits.length > 3) parts.push(esc(entry.phone));
    if (entry.note) parts.push(`<em>${esc(entry.note)}</em>`);
    return parts;
  }
  function buildRecipientLine(entry, extraClass) {
    const parts = recipientParts(entry);
    if (!parts.length) return '';
    const cls = extraClass ? `hc-recipient ${extraClass}` : 'hc-recipient';
    return `<div class="${cls}">${parts.join(' &nbsp;·&nbsp; ')}</div>`;
  }

  cards.forEach(({ entry, count, total, expiredTag, expiresAt, vouchers }, idx) => {
    const card = document.createElement('div');
    card.className = 'history-card hc-flip-in';
    card.style.animationDelay = `${idx * 0.07}s`;

    const date = new Date(entry.createdAt * 1000).toLocaleString();

    const recipientLine = buildRecipientLine(entry);
    const serverHost = (() => { try { return new URL(vouchers[0].fund_url_prefix).hostname; } catch { return null; } })();
    const serverHostLine = serverHost ? `<div style="font-size:0.62rem;color:var(--text-muted);opacity:0.6;margin-bottom:3px;">${serverHost}</div>` : '';
    const claimLnurl = vouchers && vouchers[0] && vouchers[0].claim_lnurl;
    const shareBtn = claimLnurl
      ? `<button class="btn btn-ghost btn-sm hc-share-btn" data-action="share" data-claim-lnurl="${claimLnurl}" title="Share">
           <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
         </button>`
      : '';
    const trashBtn = `<button class="btn btn-ghost btn-sm hc-delete-btn" data-action="delete" data-id="${entry.id}" title="Remove from history">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
      </button>`;

    let inner = '';

    if (state === 'unfunded') {
      const fundBtn = showQR
        ? `<button class="btn btn-primary btn-sm" data-action="fund" data-id="${entry.id}">Fund Voucher</button>`
        : '';
      inner = `
        <div class="hc-row">
          <span class="hc-date">${date}</span>
        </div>
        ${serverHostLine}
        ${buildRecipientLine(entry, 'hc-centered')}
        <div class="hc-awaiting">◎ Awaiting funds</div>
        <div class="hc-expiry-duration">Expires ${daysFromSeconds(entry.refundAfterSeconds)} after first payment</div>
        <div class="hc-footer">
          ${fundBtn}
          <div class="hc-footer-right">${shareBtn}${trashBtn}</div>
        </div>`;

    } else if (state === 'funded') {
      const netMsat = vouchers.reduce((sum, v) => {
        const s = historyStatusCache.get(v.pubkey);
        return sum + (s && s.balance_msat > 0 ? s.balance_msat : 0);
      }, 0);
      const amountHTML = netMsat > 0
        ? `<div class="hc-amount">⚡ ${fmtSats(netMsat)} sats</div>`
        : '';
      const fundBtn = showQR
        ? `<button class="btn btn-secondary btn-sm" data-action="fund" data-id="${entry.id}">Fund Voucher</button>`
        : '';
      card.classList.add('history-card-funded');
      inner = `
        <div class="hc-sticker">FUNDED</div>
        ${serverHostLine}
        <div style="text-align:center;margin-bottom:10px;"><span class="hc-expiry-inline expiry" data-expires-at="${expiresAt}"></span></div>
        <div class="hc-funded-hero">
          <img src="/apple-touch-icon.png" class="hc-favicon-icon hc-favicon-funded" alt="" loading="lazy">
          ${amountHTML}
        </div>
        ${buildRecipientLine(entry, 'hc-centered')}
        <div class="hc-footer">
          ${fundBtn}
          <div class="hc-footer-right">${shareBtn}</div>
        </div>`;

    } else if (state === 'redeemed') {
      const peakMsat = vouchers.reduce((sum, v) => sum + (v._peakNetMsat || 0), 0);
      const amountLine = peakMsat > 0
        ? `<div class="hc-amount hc-amount-redeemed">⚡ ${fmtSats(peakMsat)} sats</div>`
        : '';

      // Rotating celebration message based on creation time
      const CELEBRATIONS = [
        { msg: 'Sats delivered!',     emoji: '🎉' },
        { msg: 'You made their day!', emoji: '🌟' },
        { msg: 'Mission complete!',   emoji: '🏆' },
        { msg: 'Lightning fast!',     emoji: '⚡' },
        { msg: 'Bitcoin received!',   emoji: '🎊' },
        { msg: 'Voucher claimed!',    emoji: '✨' },
      ];
      const cel = CELEBRATIONS[entry.createdAt % CELEBRATIONS.length];

      // Confetti pieces — seeded positions so they're consistent per card
      let confettiHTML = '<div class="hc-confetti" aria-hidden="true">';
      const CONFETTI_COLORS = ['#F7931A','#6dba6d','#7eb5f7','#f5a623','#e879a0','#a78bfa'];
      for (let i = 0; i < 14; i++) {
        const seed = entry.createdAt + i;
        const left  = ((seed * 37 + i * 97) % 86) + 7;
        const color = CONFETTI_COLORS[(seed + i) % CONFETTI_COLORS.length];
        const size  = ((seed + i) % 3) + 3;
        const delay = ((i * 0.18) % 2.4).toFixed(2);
        const dur   = (2.2 + ((seed * i) % 14) * 0.1).toFixed(1);
        const rot   = (seed * i * 13) % 360;
        confettiHTML += `<span class="hc-confetti-piece" style="left:${left}%;background:${color};width:${size}px;height:${size}px;animation-delay:${delay}s;animation-duration:${dur}s;--rot:${rot}deg;"></span>`;
      }
      confettiHTML += '</div>';

      card.classList.add('history-card-redeemed');
      inner = `
        <div class="hc-sticker hc-sticker-green">CLAIMED</div>
        ${confettiHTML}
        ${serverHostLine}
        <div class="hc-redeemed-hero">
          <img src="/apple-touch-icon.png" class="hc-favicon-icon" alt="" loading="lazy">
          ${amountLine}
          <div class="hc-celebration-msg">${cel.emoji} ${cel.msg}</div>
        </div>
        ${buildRecipientLine(entry, 'hc-centered')}
        <div class="hc-footer">
          <div class="hc-date-small">${date}</div>
          <div class="hc-footer-right">${trashBtn}</div>
        </div>`;

    } else { // expired
      const tagHTML = expiredTag
        ? `<span class="badge badge-${expiredTag}">${expiredTag}</span>`
        : '';
      inner = `
        <div class="hc-row">
          ${tagHTML}
        </div>
        ${serverHostLine}
        ${recipientLine}
        <div class="hc-footer">
          <div class="hc-date-small">${date}</div>
          <div class="hc-footer-right">${trashBtn}</div>
        </div>`;
    }

    card.innerHTML = inner;
    body.appendChild(card);
  });

  body.querySelectorAll('[data-action="fund"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const entry = history.find(e => e.id === btn.dataset.id);
      if (entry) openFundHistoryModal(entry);
    });
  });

  body.querySelectorAll('[data-action="delete"]').forEach(btn => {
    btn.addEventListener('click', () => promptDeleteHistoryEntry(btn.dataset.id));
  });

  body.querySelectorAll('[data-action="share"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const claimLnurl = btn.dataset.claimLnurl;
      const redeemLink = `${window.location.origin}/redeem.html#lightning=${encodeURIComponent(claimLnurl)}`;
      const msg = buildWAMessage(claimLnurl);
      if (navigator.share) {
        try {
          await navigator.share({ title: 'Your Bitcoin voucher', text: msg });
        } catch (e) {
          if (e.name !== 'AbortError') copyToClipboard(redeemLink, btn);
        }
      } else {
        copyToClipboard(redeemLink, btn);
      }
    });
  });
}

function expandSection(sectionEl, key, showQR, history) {
  const body = sectionEl.querySelector('.history-section-body');
  const isOpen = sectionEl.classList.contains('expanded');

  // Collapse
  if (isOpen) {
    sectionEl.classList.remove('expanded');
    body.style.display = 'none';
    return;
  }

  sectionEl.classList.add('expanded');
  body.style.display = '';

  updateSectionCounts(history, $('history-list'));
  const sections = buildSectionCards(history);
  renderSectionBody(body, sections[key], key, showQR, history);
}

function countByState(history) {
  const now = Math.floor(Date.now() / 1000);
  const counts = { unfunded: 0, funded: 0, redeemed: 0, expired: 0 };
  history.forEach(entry =>
    entry.vouchers.forEach(v => counts[classifyVoucher(historyStatusCache.get(v.pubkey), now)]++)
  );
  return counts;
}

function updateSectionCounts(history, container) {
  const counts = countByState(history);
  container.querySelectorAll('.history-section').forEach(sec => {
    const key = sec.dataset.sectionKey;
    const badge = sec.querySelector('.section-count');
    if (badge && counts[key] !== undefined) {
      badge.textContent = counts[key] > 0 ? counts[key] : '';
    }
  });
}




function renderHistory() {
  const container = $('history-list');
  const history = getHistory();

  if (!history.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🗒️</div>
        <p>No vouchers yet.<br>Create one to see it here.</p>
      </div>`;
    return;
  }

  container.innerHTML = '';

  const sectionDefs = [
    { key: 'unfunded', label: 'Active — Unfunded', showQR: true },
    { key: 'funded',   label: 'Active — Funded',   showQR: true },
    { key: 'redeemed', label: 'Redeemed',           showQR: false },
    { key: 'expired',  label: 'Expired',            showQR: false },
  ];

  sectionDefs.forEach(({ key, label, showQR }) => {
    const section = document.createElement('div');
    section.className = 'history-section';
    section.dataset.sectionKey = key;
    section.innerHTML = `
      <div class="history-section-title" role="button">
        <span class="section-title-label">${label}</span>
        <span class="section-count"></span>
        <span class="section-chevron">›</span>
      </div>
      <div class="history-section-body" style="display:none"></div>`;

    section.querySelector('.history-section-title').addEventListener('click', () => {
      expandSection(section, key, showQR, history);
    });

    container.appendChild(section);
  });
}

// ── Fund from history modal ───────────────────────────────────────────────────

async function openFundHistoryModal(entry) {
  const voucher = entry.vouchers[0];
  const lnurl = voucher.fund_lnurl;
  const modal = $('fund-history-modal');
  const walletPanel = $('fhm-wallet-panel');
  const lightningPanel = $('fhm-lightning-panel');
  const errEl = $('fhm-wallet-error');
  const amtEl = $('fhm-amount-input');

  function showWalletPanel() {
    walletPanel.classList.remove('hidden');
    lightningPanel.classList.add('hidden');
  }
  function showLightningPanel(showLocalLink) {
    walletPanel.classList.add('hidden');
    lightningPanel.classList.remove('hidden');
    $('fhm-btn-local-instead').classList.toggle('hidden', !showLocalLink);
  }

  // Close behaviour
  $('fhm-close').onclick = () => modal.classList.add('hidden');
  modal.onclick = e => { if (e.target === modal) modal.classList.add('hidden'); };

  // Lightning QR setup
  const qrContainer = $('fhm-qr-container');
  qrContainer.innerHTML = '';
  renderQR(qrContainer, lnurl, 220);
  qrContainer.style.cursor = 'pointer';
  qrContainer.onclick = () => { window.location.href = 'lightning:' + lnurl; };
  $('fhm-open-wallet-btn').onclick = () => { window.location.href = 'lightning:' + lnurl; };
  const lnurlEl = $('fhm-lnurl-text');
  lnurlEl.onclick = () => copyToClipboard(lnurl, lnurlEl);

  errEl.classList.remove('visible');
  amtEl.value = '';

  await _configReady;

  // Determine which server this voucher belongs to
  let voucherOrigin;
  try { voucherOrigin = new URL(voucher.fund_url_prefix).origin; } catch { voucherOrigin = new URL(_serverURL).origin; }

  // Find a local wallet voucher specifically for this voucher's server
  const localWv = getWalletVouchers()[voucherOrigin] || null;

  if (!localWv) {
    // No local wallet voucher for this server — Lightning only
    showLightningPanel(false);
    modal.classList.remove('hidden');
    return;
  }

  // Fetch balance for the matching local wallet voucher
  const balanceMsat = await fetchWalletVoucherBalance(localWv);

  // Is this the same server the user is currently connected to?
  const isSameServer = voucherOrigin === new URL(_serverURL).origin;

  // Show cross-server info banner when the wallet is from a different server
  const serverInfoEl = $('fhm-server-info');
  if (!isSameServer && balanceMsat >= _minFundAmountMsat) {
    $('fhm-server-name').textContent = voucherOrigin;
    $('fhm-server-balance').textContent = Math.floor(balanceMsat / 1000).toLocaleString();
    serverInfoEl.classList.remove('hidden');
  } else {
    serverInfoEl.classList.add('hidden');
  }

  if (balanceMsat >= _minFundAmountMsat) {
    const balSats = Math.floor(balanceMsat / 1000);

    const amounts = getWalletAmounts();
    const pillEl = $('fhm-amount-pills');
    pillEl.innerHTML = '';
    amounts.forEach(amt => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'pill-btn pill-btn-recent';
      pill.textContent = amt.toLocaleString();
      pill.addEventListener('click', () => { amtEl.value = amt; doHistoryTransfer(voucher, amtEl, errEl, localWv, voucherOrigin, isSameServer); });
      pillEl.appendChild(pill);
    });

    $('fhm-btn-max').onclick = () => { amtEl.value = balSats; doHistoryTransfer(voucher, amtEl, errEl, localWv, voucherOrigin, isSameServer); };
    $('fhm-btn-transfer').onclick = () => doHistoryTransfer(voucher, amtEl, errEl, localWv, voucherOrigin, isSameServer);
    amtEl.onkeydown = e => { if (e.key === 'Enter') doHistoryTransfer(voucher, amtEl, errEl, localWv, voucherOrigin, isSameServer); };

    $('fhm-btn-lightning-instead').onclick = () => showLightningPanel(true);
    $('fhm-btn-local-instead').onclick = () => showWalletPanel();

    showWalletPanel();
  } else {
    showLightningPanel(false);
  }

  modal.classList.remove('hidden');
}

async function doHistoryTransfer(voucher, amtEl, errEl, wv, transferOrigin, isSameServer) {
  if (!wv) wv = getWalletVoucher();
  if (!wv) return;
  if (!transferOrigin) transferOrigin = _serverURL;

  errEl.classList.remove('visible');

  const amountSats = parseInt(amtEl.value, 10);
  if (isNaN(amountSats) || amountSats < Math.ceil(_minFundAmountMsat / 1000)) {
    errEl.textContent = `Minimum amount is ${Math.ceil(_minFundAmountMsat / 1000)} sats.`;
    errEl.classList.add('visible');
    return;
  }

  const btn = $('fhm-btn-transfer');
  btn.disabled = true;
  btn.textContent = 'Funding…';

  try {
    const res = await fetch(`${transferOrigin}/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: wv.secret, pub_key: voucher.pubkey, amount_msat: amountSats * 1000 }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.reason || `Transfer failed (${res.status})`);
    }
    if (isSameServer !== false) await refreshWalletBalance();
    saveWalletAmount(amountSats);
    $('fund-history-modal').classList.add('hidden');
    // Refresh status and re-render open history sections
    const history = getHistory();
    await fetchAndCacheStatuses([voucher.pubkey], history);
    updateSectionCounts(history, $('history-list'));
    const sectionMeta = [
      { key: 'unfunded', showQR: true },
      { key: 'funded',   showQR: true },
      { key: 'redeemed', showQR: false },
      { key: 'expired',  showQR: false },
    ];
    const sections = buildSectionCards(history);
    document.querySelectorAll('.history-section.expanded').forEach(sec => {
      const key = sec.dataset.sectionKey;
      const meta = sectionMeta.find(m => m.key === key);
      if (!meta) return;
      renderSectionBody(sec.querySelector('.history-section-body'), sections[key], key, meta.showQR, history);
    });
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.add('visible');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Fund Voucher';
  }
}

// ── Delete history entry ──────────────────────────────────────────────────────

let _pendingDeleteId = null;
let _pendingDisableWv = null;
let _pendingDisableBalanceMsat = 0;
let _pendingRemoveOrigin = null;

function promptDeleteHistoryEntry(id) {
  _pendingDeleteId = id;
  $('delete-history-modal').classList.remove('hidden');
}

function confirmDeleteHistoryEntry() {
  if (!_pendingDeleteId) return;
  const history = getHistory().filter(e => e.id !== _pendingDeleteId);
  saveHistory(history);
  _pendingDeleteId = null;
  $('delete-history-modal').classList.add('hidden');
  historyStatusCache.clear();
  renderHistory();
  if (history.length) {
    const missing = history.flatMap(e => e.vouchers.map(v => v.pubkey))
      .filter(pk => !historyStatusCache.has(pk));
    if (missing.length) fetchAndCacheStatuses(missing, history).then(() => updateSectionCounts(history, $('history-list')));
  }
}

function openQRModal(entry) {
  const voucher = entry.vouchers[0];
  const lnurl = voucher.fund_lnurl;
  const container = $('modal-qr-container');
  renderQR(container, lnurl, 240);
  container.style.cursor = 'pointer';
  container.title = 'Tap to open in wallet';
  container.onclick = () => { window.location.href = 'lightning:' + lnurl; };
  $('modal-title').textContent = 'Fund Voucher';

  const lnurlEl = $('modal-lnurl-text');
  lnurlEl.textContent = 'Copy Funding Code';
  lnurlEl.title = 'Tap to copy';
  lnurlEl.onclick = () => copyToClipboard(lnurl, lnurlEl);

  // Rebuild wallet controls each time the modal opens (iOS only)
  const walletArea = $('modal-wallet-area');
  walletArea.innerHTML = '';
  if (isIOS) {
    const pref = getPreferredWallet();
    const walletBtn = document.createElement('button');
    walletBtn.className = 'btn btn-secondary btn-sm';
    walletBtn.textContent = pref ? `Open in ${pref.name}` : 'Open in wallet';
    walletBtn.addEventListener('click', () => {
      const current = getPreferredWallet();
      if (current) {
        window.location.href = 'lightning:' + lnurl;
      } else {
        showWalletPicker(w => {
          setPreferredWallet(w.id);
          walletBtn.textContent = `Open in ${w.name}`;
          changeLink.textContent = 'change wallet';
          window.location.href = 'lightning:' + lnurl;
        });
      }
    });
    const changeLink = document.createElement('a');
    changeLink.href = '#';
    changeLink.className = 'wallet-change-link';
    changeLink.textContent = pref ? 'change wallet' : '';
    changeLink.addEventListener('click', e => {
      e.preventDefault();
      showWalletPicker(w => {
        setPreferredWallet(w.id);
        walletBtn.textContent = `Open in ${w.name}`;
        changeLink.textContent = 'change wallet';
      });
    });
    walletArea.appendChild(walletBtn);
    walletArea.appendChild(changeLink);
  }

  $('qr-modal').classList.remove('hidden');
}

// ── Screen routing ────────────────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = $(id);
  if (el) el.classList.add('active');
  const menuBtn = $('nav-menu');
  if (menuBtn) menuBtn.classList.toggle('hidden', id === 'screen-onboarding');
  if (id !== 'screen-settings') stopSettingsPoller();
}


// ── Onboarding ────────────────────────────────────────────────────────────────
function decodeLNURL(str) {
  const s = str.toLowerCase();
  const sep = s.lastIndexOf('1');
  if (sep < 1) throw new Error('invalid bech32');
  const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
  const data5 = [];
  for (let i = sep + 1; i < s.length - 6; i++) {
    const idx = CHARSET.indexOf(s[i]);
    if (idx < 0) throw new Error('invalid bech32 char');
    data5.push(idx);
  }
  let acc = 0, bits = 0;
  const bytes = [];
  for (const v of data5) {
    acc = (acc << 5) | v;
    bits += 5;
    if (bits >= 8) { bits -= 8; bytes.push((acc >> bits) & 0xff); }
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

async function verifyRefundCode(val) {
  // Returns { ok: true } | { ok: false, error: string } | { ok: null, warn: string }
  // ok=null means unverifiable (network/CORS) — caller shows a warning but may proceed

  if (val.includes('@')) {
    const [user, domain] = val.split('@');
    try {
      const resp = await fetch(`https://${domain}/.well-known/lnurlp/${encodeURIComponent(user)}`);
      if (!resp.ok) return { ok: false, error: 'Lightning address not found (HTTP ' + resp.status + ')' };
      const data = await resp.json();
      if (data.tag !== 'payRequest') return { ok: false, error: 'Not a valid Lightning address endpoint' };
      return { ok: true };
    } catch (e) {
      return { ok: null, warn: 'Could not reach this Lightning address to verify. Double-check it is correct.' };
    }
  }

  // LNURL bech32
  try {
    const url = decodeLNURL(val);
    try {
      const resp = await fetch(url);
      if (!resp.ok) return { ok: false, error: 'LNURL endpoint returned error (HTTP ' + resp.status + ')' };
      const data = await resp.json();
      if (data.tag !== 'payRequest') return { ok: false, error: 'LNURL is not a pay endpoint' };
      return { ok: true };
    } catch (e) {
      return { ok: null, warn: 'Could not reach the LNURL endpoint to verify. Double-check it is correct.' };
    }
  } catch (e) {
    return { ok: false, error: 'Could not decode LNURL: ' + e.message };
  }
}

function validateRefundCode(val) {
  if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)) return true;
  if (/^lnurl1[ac-hj-np-z02-9]{20,}$/i.test(val)) return true;
  return false;
}

async function handleOnboardingSubmit() {
  const val = $('refund-code-input').value.trim();
  const errEl = $('onboarding-error');
  const btn = $('btn-onboarding-submit');

  if (!$('tos-checkbox').checked) {
    errEl.textContent = 'Please accept the Terms & Conditions to continue.';
    errEl.classList.add('visible');
    return;
  }

  // Second tap after unverifiable warning — proceed anyway
  if (btn._warnDismissed === val) {
    btn._warnDismissed = null;
    errEl.classList.remove('visible');
    localStorage.setItem(LS_REFUND, val);
    startApp();
    return;
  }

  if (!validateRefundCode(val)) {
    errEl.textContent = 'Enter a Lightning address (user@wallet.com) or LNURL1… string.';
    errEl.classList.add('visible');
    return;
  }
  errEl.classList.remove('visible');

  const origText = btn.textContent;
  btn.textContent = 'Verifying…';
  btn.disabled = true;

  let result;
  try {
    result = await verifyRefundCode(val);
  } finally {
    btn.textContent = origText;
    btn.disabled = false;
  }

  if (result.ok === false) {
    errEl.textContent = result.error;
    errEl.classList.add('visible');
    return;
  }
  if (result.ok === null) {
    errEl.textContent = result.warn + ' Tap "Get Started" again to proceed anyway.';
    errEl.classList.add('visible');
    btn._warnDismissed = val;
    return;
  }

  localStorage.setItem(LS_REFUND, val);
  startApp();
}

function startApp() {
  showScreen('screen-app');
  refreshWalletBalance();
}

// ── Wallet voucher helpers ─────────────────────────────────────────────────────
// LS_WALLET_VOUCHER stores a map of { [origin]: voucherObject }.
// Legacy: if the stored value has a `pubkey` field it's a plain object — migrate on read.
function getWalletVouchers() {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_WALLET_VOUCHER));
    if (!raw) return {};
    if (raw.pubkey) {
      let origin;
      try { origin = new URL(raw.fund_url_prefix).origin; } catch { origin = new URL(_serverURL).origin; }
      return { [origin]: raw };
    }
    return raw;
  } catch { return {}; }
}

// Returns the wallet voucher for the currently configured server only.
function getWalletVoucher() {
  return getWalletVouchers()[new URL(_serverURL).origin] || null;
}

function saveWalletVouchers(map) {
  localStorage.setItem(LS_WALLET_VOUCHER, JSON.stringify(map));
}

function saveWalletVoucher(voucher) {
  try {
    const origin = new URL(voucher.fund_url_prefix).origin;
    const all = getWalletVouchers();
    all[origin] = voucher;
    saveWalletVouchers(all);
  } catch {}
}

function removeWalletVoucher(origin) {
  const all = getWalletVouchers();
  delete all[origin];
  saveWalletVouchers(all);
}

const DEFAULT_AMOUNTS = [2100, 5000, 10000];

function getWalletAmounts() {
  try {
    const saved = JSON.parse(localStorage.getItem(LS_WALLET_AMOUNTS));
    return (saved && saved.length === 3) ? saved : [...DEFAULT_AMOUNTS];
  } catch { return [...DEFAULT_AMOUNTS]; }
}
function saveWalletAmount(sats) {
  let amounts = getWalletAmounts();
  if (amounts.includes(sats)) return;
  // Replace the value closest to the new amount
  let closestIdx = 0, closestDist = Math.abs(amounts[0] - sats);
  for (let i = 1; i < amounts.length; i++) {
    const d = Math.abs(amounts[i] - sats);
    if (d < closestDist) { closestDist = d; closestIdx = i; }
  }
  amounts[closestIdx] = sats;
  amounts.sort((a, b) => a - b);
  localStorage.setItem(LS_WALLET_AMOUNTS, JSON.stringify(amounts));
}

function startSettingsPoller() {
  stopSettingsPoller();
  if (!getWalletVoucher()) return;
  _settingsPoller = setInterval(() => refreshWalletBalance(), 3000);
}
function stopSettingsPoller() {
  if (_settingsPoller) { clearInterval(_settingsPoller); _settingsPoller = null; }
  if (_walletCountdownTimer) { clearInterval(_walletCountdownTimer); _walletCountdownTimer = null; }
}

function startWalletCountdown(expiresAt) {
  const expiryBar = $('settings-wallet-expiry-bar');
  const expiryEl  = $('settings-wallet-expiry');
  if (!expiryBar || !expiryEl) return;
  if (_walletCountdownTimer) { clearInterval(_walletCountdownTimer); _walletCountdownTimer = null; }
  if (expiresAt > 0) {
    function tick() {
      const secsLeft = expiresAt - Math.floor(Date.now() / 1000);
      if (secsLeft <= 0) {
        expiryEl.textContent = 'Expired';
        clearInterval(_walletCountdownTimer);
        _walletCountdownTimer = null;
        return;
      }
      const d = Math.floor(secsLeft / 86400);
      const h = Math.floor((secsLeft % 86400) / 3600);
      const m = Math.floor((secsLeft % 3600) / 60);
      const s = secsLeft % 60;
      const parts = [];
      if (d > 0) parts.push(d + 'd');
      parts.push(String(h).padStart(2, '0') + 'h');
      parts.push(String(m).padStart(2, '0') + 'm');
      parts.push(String(s).padStart(2, '0') + 's');
      expiryEl.textContent = '⏳ Expires in ' + parts.join(' ') + ' ⏳';
    }
    expiryBar.style.display = '';
    tick();
    _walletCountdownTimer = setInterval(tick, 1000);
  } else {
    expiryBar.style.display = 'none';
  }
}

async function refreshWalletBalance() {
  let wv = getWalletVoucher(); // current server's wallet only
  const pill = $('wallet-balance-pill');
  if (!wv) {
    const migrated = await tryMigrateWalletVouchers();
    if (migrated) wv = getWalletVoucher();
  }
  if (!wv) { if (pill) pill.classList.add('hidden'); return 0; }
  let wvOrigin;
  try { wvOrigin = new URL(wv.fund_url_prefix).origin; } catch { wvOrigin = new URL(_serverURL).origin; }
  try {
    const res = await fetch(`${wvOrigin}/status`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pubkeys: [wv.pubkey] }),
    });
    if (!res.ok) return 0;
    const data = (await res.json())[wv.pubkey];
    if (!data || !data.active) {
      removeWalletVoucher(wvOrigin);
      if (pill) pill.classList.add('hidden');
      return 0;
    }
    _walletRawBalanceMsat = data.raw_balance_msat || 0;
    const sats = Math.floor((data.raw_balance_msat || 0) / 1000);
    if (pill) {
      $('wallet-balance-sats').textContent = sats.toLocaleString();
      pill.classList.toggle('hidden', sats === 0);
    }
    const activeDiv = $('settings-wallet-active');
    if (activeDiv && !activeDiv.classList.contains('hidden')) {
      startWalletCountdown(data.expires_at || 0);
    }
    return _walletRawBalanceMsat;
  } catch { return 0; }
}

// Fetch balance for any wallet voucher (not tied to the currently active server).
async function fetchWalletVoucherBalance(wv) {
  let wvOrigin;
  try { wvOrigin = new URL(wv.fund_url_prefix).origin; } catch { return 0; }
  try {
    const res = await fetch(`${wvOrigin}/status`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pubkeys: [wv.pubkey] }),
    });
    if (!res.ok) return 0;
    const data = (await res.json())[wv.pubkey];
    if (!data || !data.active) { removeWalletVoucher(wvOrigin); return 0; }
    return data.raw_balance_msat || 0;
  } catch { return 0; }
}

// ── Settings screen ────────────────────────────────────────────────────────────
function renderSettingsServerSection() {
  const currentOrigin = new URL(_serverURL).origin;
  const displayEl = document.getElementById('settings-server-url');
  if (displayEl) displayEl.textContent = currentOrigin;

  const listEl = document.getElementById('settings-known-servers');
  if (!listEl) return;

  const known = getKnownServers();
  const others = known.filter(o => o !== currentOrigin);
  if (others.length === 0) { listEl.innerHTML = ''; return; }

  const rows = others.map(origin => {
    const host = (() => { try { return new URL(origin).hostname; } catch { return origin; } })();
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-top:1px solid var(--border);">
      <span style="font-size:0.8rem;color:var(--text);">${host}</span>
      <div style="display:flex;gap:6px;">
        <button class="btn btn-ghost btn-sm" data-switch-server="${origin}">Switch</button>
        <button class="btn btn-ghost btn-sm" data-remove-server="${origin}">Remove</button>
      </div>
    </div>`;
  });

  listEl.innerHTML = `<div style="margin-top:12px;font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--orange);margin-bottom:2px;">Other Servers</div>${rows.join('')}`;

  listEl.querySelectorAll('[data-switch-server]').forEach(btn => {
    btn.addEventListener('click', () => {
      localStorage.setItem(LS_SERVER_URL, btn.dataset.switchServer);
      window.location.reload();
    });
  });
  listEl.querySelectorAll('[data-remove-server]').forEach(btn => {
    btn.addEventListener('click', () => {
      removeKnownServer(btn.dataset.removeServer);
      renderSettingsServerSection();
    });
  });
}

function renderSettingsRefund() {
  const el = $('settings-refund-display');
  if (el) el.textContent = localStorage.getItem(LS_REFUND) || '—';
}

async function renderSettingsWalletSection() {
  const currentOrigin = new URL(_serverURL).origin;
  let wv = getWalletVoucher(); // current server only
  if (!wv) {
    const migrated = await tryMigrateWalletVouchers();
    if (migrated) wv = getWalletVoucher();
  }
  const createDiv = $('settings-wallet-create');
  const activeDiv = $('settings-wallet-active');

  if (!wv) {
    createDiv.classList.remove('hidden');
    activeDiv.classList.add('hidden');
  } else {
    createDiv.classList.add('hidden');
    activeDiv.classList.remove('hidden');

    let wvOrigin;
    try { wvOrigin = new URL(wv.fund_url_prefix).origin; } catch { wvOrigin = currentOrigin; }

    let expiresAt = 0;
    try {
      const res = await fetch(`${wvOrigin}/status`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pubkeys: [wv.pubkey] }),
      });
      if (res.ok) {
        const data = (await res.json())[wv.pubkey];
        if (!data || !data.active) {
          removeWalletVoucher(wvOrigin);
          createDiv.classList.remove('hidden');
          activeDiv.classList.add('hidden');
        } else {
          expiresAt = data.expires_at || 0;
        }
      }
    } catch {}

    startWalletCountdown(expiresAt);

    const fundLNURL = lnurlEncode(wv.fund_url_prefix + wv.pubkey);
    const qrEl = $('settings-wallet-qr');
    qrEl.innerHTML = '';
    renderQR(qrEl, fundLNURL, 256);
    qrEl.onclick = () => { window.location.href = 'lightning:' + fundLNURL; };

    $('settings-wallet-open-btn').onclick = () => { window.location.href = 'lightning:' + fundLNURL; };
    const lnurlEl = $('settings-wallet-lnurl');
    lnurlEl.onclick = () => copyToClipboard(fundLNURL, lnurlEl);
  }

  // Render wallet vouchers from other servers.
  const othersEl = $('settings-wallet-others');
  if (!othersEl) return;
  const otherEntries = Object.entries(getWalletVouchers()).filter(([origin]) => origin !== currentOrigin);
  if (otherEntries.length === 0) { othersEl.innerHTML = ''; return; }

  const rows = await Promise.all(otherEntries.map(async ([origin, v]) => {
    let sats = '—';
    let balanceMsat = 0;
    try {
      const res = await fetch(`${origin}/status`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pubkeys: [v.pubkey] }),
      });
      if (res.ok) {
        const d = (await res.json())[v.pubkey];
        if (!d || !d.active) { removeWalletVoucher(origin); return null; }
        sats = Math.floor((d.raw_balance_msat || 0) / 1000).toLocaleString();
        balanceMsat = d.balance_msat || d.raw_balance_msat || 0;
      }
    } catch {}
    const host = (() => { try { return new URL(origin).hostname; } catch { return origin; } })();
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-top:1px solid var(--border);">
      <div>
        <div style="font-size:0.8rem;font-weight:600;color:var(--text);">${host}</div>
        <div style="font-size:0.75rem;color:var(--text-muted);">${sats} sats</div>
      </div>
      <button class="btn btn-ghost btn-sm" data-remove-wallet-origin="${origin}" data-remove-wallet-balance="${balanceMsat}">Remove</button>
    </div>`;
  }));

  const validRows = rows.filter(Boolean);
  if (validRows.length === 0) { othersEl.innerHTML = ''; return; }

  othersEl.innerHTML = `<div style="margin-top:16px;font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--orange);margin-bottom:4px;">Other Server Wallets</div>${validRows.join('')}`;
  othersEl.querySelectorAll('[data-remove-wallet-origin]').forEach(btn => {
    btn.addEventListener('click', () => {
      const origin = btn.dataset.removeWalletOrigin;
      const balanceMsat = parseInt(btn.dataset.removeWalletBalance || '0', 10);
      const wv = getWalletVouchers()[origin] || null;
      _pendingDisableWv = wv;
      _pendingDisableBalanceMsat = balanceMsat;
      _pendingRemoveOrigin = origin;
      const msgEl = $('disable-voucher-msg');
      const confirmBtn = $('btn-disable-voucher-confirm');
      const balanceSats = Math.floor(balanceMsat / 1000);
      const refundCode = localStorage.getItem(LS_REFUND);
      if (balanceSats > 0 && refundCode) {
        msgEl.textContent = `This wallet has ${balanceSats.toLocaleString()} sats. They will be sent to ${refundCode} before removing.`;
      } else if (balanceSats > 0) {
        msgEl.textContent = `This wallet has ${balanceSats.toLocaleString()} sats. No Lightning address is set \u2014 balance may be lost. Remove anyway?`;
      } else {
        msgEl.textContent = 'This will remove this wallet voucher.';
      }
      confirmBtn.textContent = 'Remove';
      $('disable-voucher-modal').classList.remove('hidden');
    });
  });
}

async function createWalletVoucher() {
  const btn = $('btn-create-wallet-voucher');
  const errEl = $('settings-wallet-error');
  errEl.classList.remove('visible');

  await _configReady;
  const secret = generateSecretHex(_randomBytesLength);
  const pubKey = await secretToPubKey(secret);
  const refundCode = localStorage.getItem(LS_REFUND) || '';

  btn.disabled = true;
  const orig = btn.textContent;
  btn.textContent = 'Creating…';

  try {
    const vouchers = await createVouchers({
      pub_keys: [pubKey],
      refund_code: refundCode,
      refund_after_seconds: _walletExpiry,
      single_use: false,
    });
    const v = vouchers[0];
    saveWalletVoucher({
      secret,
      pubkey: v.pubkey,
      fund_url_prefix: v.fund_url_prefix,
      withdraw_url_prefix: v.withdraw_url_prefix,
      refund_after_seconds: v.refund_after_seconds,
      refund_code: refundCode,
      created_at: Math.floor(Date.now() / 1000),
      _fv: APP_FV,
    });
    await refreshWalletBalance();
    await renderSettingsWalletSection();
    startSettingsPoller();
  } catch (err) {
    errEl.textContent = err.message || 'Failed to create wallet voucher.';
    errEl.classList.add('visible');
  } finally {
    btn.disabled = false;
    btn.textContent = orig;
  }
}

// ── Wallet transfer (step 2) ───────────────────────────────────────────────────
async function checkWalletForTransfer(voucher) {
  $('wallet-transfer-card').classList.add('hidden');
  $('step2-lightning-section').classList.remove('hidden');
  $('btn-pay-local-instead').classList.add('hidden');

  await _configReady;
  const balanceMsat = await refreshWalletBalance();

  if (balanceMsat >= _minFundAmountMsat) {
    $('step2-lightning-section').classList.add('hidden');
    showWalletTransferCard(voucher, balanceMsat);
  } else {
    startFundingPoll(voucher.pubkey);
  }
}

function showWalletTransferCard(voucher, balanceMsat) {
  const card = $('wallet-transfer-card');
  const infoEl = $('wallet-transfer-info');
  const amtEl = $('wallet-transfer-amount');
  const errEl = $('wallet-transfer-error');

  const balSats = Math.floor(balanceMsat / 1000);
  const minSats = Math.ceil(_minFundAmountMsat / 1000);
  amtEl.value = '';
  errEl.classList.remove('visible');
  const btn = $('btn-wallet-transfer');
  btn.disabled = false;
  btn.textContent = 'Fund Voucher';

  // Favourite amount pills (always 4, defaults when no history)
  const amounts = getWalletAmounts();
  const sugEl = $('wallet-amount-suggestions');
  sugEl.innerHTML = '';
  amounts.forEach(amt => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pill-btn pill-btn-recent';
    btn.textContent = amt.toLocaleString();
    btn.addEventListener('click', () => { amtEl.value = amt; doWalletTransfer(voucher); });
    sugEl.appendChild(btn);
  });

  $('btn-wallet-max').onclick = () => { amtEl.value = Math.floor(balanceMsat / 1000); doWalletTransfer(voucher); };
  $('btn-wallet-transfer').onclick = () => doWalletTransfer(voucher);
  amtEl.onkeydown = e => { if (e.key === 'Enter') doWalletTransfer(voucher); };
  $('btn-wallet-transfer-skip').onclick = () => {
    card.classList.add('hidden');
    $('step2-lightning-section').classList.remove('hidden');
    $('btn-pay-local-instead').classList.remove('hidden');
    startFundingPoll(voucher.pubkey);
  };

  $('btn-pay-local-instead').onclick = () => {
    $('step2-lightning-section').classList.add('hidden');
    $('btn-pay-local-instead').classList.add('hidden');
    stopFundingPoll();
    showWalletTransferCard(voucher, balanceMsat);
  };

  card.classList.remove('hidden');
  amtEl.focus();
}

async function doWalletTransfer(voucher) {
  const wv = getWalletVoucher();
  if (!wv) return;

  const errEl = $('wallet-transfer-error');
  errEl.classList.remove('visible');

  const amountSats = parseInt($('wallet-transfer-amount').value, 10);
  if (isNaN(amountSats) || amountSats < Math.ceil(_minFundAmountMsat / 1000)) {
    errEl.textContent = `Minimum amount is ${Math.ceil(_minFundAmountMsat / 1000)} sats.`;
    errEl.classList.add('visible');
    return;
  }

  const btn = $('btn-wallet-transfer');
  btn.disabled = true;
  btn.textContent = 'Funding…';

  try {
    const res = await fetch(`${_serverURL}/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: wv.secret, pub_key: voucher.pubkey, amount_msat: amountSats * 1000 }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.reason || `Transfer failed (${res.status})`);
    }
    await refreshWalletBalance();
    saveWalletAmount(amountSats);
    stopFundingPoll();
    renderShareStep(voucher);
    showStep(3);
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.add('visible');
    btn.disabled = false;
    btn.textContent = 'Fund Voucher';
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  // Onboarding
  $('btn-onboarding-submit').addEventListener('click', handleOnboardingSubmit);
  $('refund-code-input').addEventListener('keydown', e => { if (e.key === 'Enter') handleOnboardingSubmit(); });
  $('btn-tos-inline').addEventListener('click', function () {
    $('terms-modal').classList.remove('hidden');
  });
  $('btn-paste-refund').addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      $('refund-code-input').value = text.trim();
      $('refund-code-input').focus();
    } catch {
      $('refund-code-input').focus();
    }
  });

  $('btn-paste-phone').addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      $('phone-number').value = text.trim();
      $('phone-number').focus();
    } catch {
      $('phone-number').focus();
    }
  });

  // Single voucher
  $('btn-edit-msg').addEventListener('click', showMsgSheet);
  $('btn-create-single').addEventListener('click', handleCreateSingle);
  $('phone-number').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); $('voucher-note').focus(); }
  });
  $('voucher-note').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); handleCreateSingle(); }
  });

  // ── Burger menu ──────────────────────────────────────────────────────────
  const navMenuBtn = $('nav-menu');
  const navMenuDropdown = $('nav-menu-dropdown');
  navMenuBtn.addEventListener('click', e => {
    e.stopPropagation();
    const rect = navMenuBtn.getBoundingClientRect();
    navMenuDropdown.style.top   = rect.bottom + 4 + 'px';
    navMenuDropdown.style.right = window.innerWidth - rect.right + 'px';
    navMenuDropdown.style.left  = '';
    navMenuDropdown.classList.toggle('hidden');
  });
  document.addEventListener('click', () => navMenuDropdown.classList.add('hidden'));

  const goHistory = async () => {
    navMenuDropdown.classList.add('hidden');
    historyStatusCache.clear();
    renderHistory();
    showScreen('screen-history');
    if (_countdownTimer) clearInterval(_countdownTimer);
    tickCountdowns();
    _countdownTimer = setInterval(tickCountdowns, 1000);
    const history = getHistory();
    if (!history.length) return;
    preloadTerminalStatuses(history);
    const missing = history.flatMap(e => e.vouchers.map(v => v.pubkey))
      .filter(pk => !historyStatusCache.has(pk));
    if (missing.length) await fetchAndCacheStatuses(missing, history);
    updateSectionCounts(history, $('history-list'));
  };

  $('menu-history').addEventListener('click', goHistory);


  $('menu-settings').addEventListener('click', () => {
    navMenuDropdown.classList.add('hidden');
    renderSettingsRefund();
    renderSettingsWalletSection();
    showScreen('screen-settings');
    startSettingsPoller();
  });

  // ── Nav backs ────────────────────────────────────────────────────────────
  $('nav-back-from-history').addEventListener('click', () => {
    if (_countdownTimer) { clearInterval(_countdownTimer); _countdownTimer = null; }
    showScreen(localStorage.getItem(LS_REFUND) ? 'screen-app' : 'screen-onboarding');
  });


  $('nav-back-from-settings').addEventListener('click', () => {
    showScreen(localStorage.getItem(LS_REFUND) ? 'screen-app' : 'screen-onboarding');
  });

  // ── Settings actions ──────────────────────────────────────────────────────
  $('btn-settings-change-refund').addEventListener('click', () => {
    localStorage.removeItem(LS_REFUND);
    $('refund-code-input').value = '';
    showScreen('screen-onboarding');
  });

  $('btn-create-wallet-voucher').addEventListener('click', createWalletVoucher);

  $('btn-disable-wallet-voucher').addEventListener('click', async () => {
    const wv = getWalletVoucher();
    const modal = $('disable-voucher-modal');
    const msgEl = $('disable-voucher-msg');

    let balanceMsat = 0;
    try {
      const wvOrigin = new URL(wv.fund_url_prefix).origin;
      const res = await fetch(`${wvOrigin}/status`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pubkeys: [wv.pubkey] }),
      });
      if (res.ok) { const d = (await res.json())[wv.pubkey]; balanceMsat = (d && d.balance_msat) || 0; }
    } catch {}

    _pendingDisableWv = wv;
    _pendingDisableBalanceMsat = balanceMsat;

    const balanceSats = Math.floor(balanceMsat / 1000);
    const refundCode = localStorage.getItem(LS_REFUND);
    if (balanceSats > 0 && refundCode) {
      msgEl.textContent = `Your local voucher has ${balanceSats.toLocaleString()} sats. They will be sent to ${refundCode} before disabling.`;
    } else if (balanceSats > 0) {
      msgEl.textContent = `Your local voucher has ${balanceSats.toLocaleString()} sats. No Lightning address is set — balance may be lost. Disable anyway?`;
    } else {
      msgEl.textContent = 'This will remove your local voucher. You can create a new one at any time.';
    }

    modal.classList.remove('hidden');
  });

  function _resetDisableModal() {
    _pendingDisableWv = null;
    _pendingDisableBalanceMsat = 0;
    _pendingRemoveOrigin = null;
    $('btn-disable-voucher-confirm').textContent = 'Disable';
  }

  $('btn-disable-voucher-cancel').addEventListener('click', () => {
    $('disable-voucher-modal').classList.add('hidden');
    _resetDisableModal();
  });

  $('btn-disable-voucher-confirm').addEventListener('click', async () => {
    const modal = $('disable-voucher-modal');
    const confirmBtn = $('btn-disable-voucher-confirm');
    const refundCode = localStorage.getItem(LS_REFUND);

    if (_pendingDisableBalanceMsat > 0 && refundCode && _pendingDisableWv) {
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Sending\u2026';
      try {
        const wvOrigin = new URL(_pendingDisableWv.fund_url_prefix).origin;
        await window.redeemToLightningAddress({
          serverURL: wvOrigin,
          secret: _pendingDisableWv.secret,
          balanceMsat: _pendingDisableBalanceMsat,
          lnInput: refundCode,
        });
      } catch (_) { /* proceed with removal even if send fails */ }
      confirmBtn.disabled = false;
    }

    const originToRemove = _pendingRemoveOrigin || new URL(_serverURL).origin;
    modal.classList.add('hidden');
    _resetDisableModal();
    removeWalletVoucher(originToRemove);
    refreshWalletBalance();
    renderSettingsWalletSection();
  });

  $('disable-voucher-modal').addEventListener('click', e => {
    if (e.target === $('disable-voucher-modal')) {
      $('disable-voucher-modal').classList.add('hidden');
      _resetDisableModal();
    }
  });

  // Delete history entry modal
  $('btn-delete-history-cancel').addEventListener('click', () => {
    $('delete-history-modal').classList.add('hidden');
    _pendingDeleteId = null;
  });
  $('btn-delete-history-confirm').addEventListener('click', confirmDeleteHistoryEntry);
  $('delete-history-modal').addEventListener('click', e => {
    if (e.target === $('delete-history-modal')) {
      $('delete-history-modal').classList.add('hidden');
      _pendingDeleteId = null;
    }
  });

  // Wallet expiry pills
  document.querySelectorAll('#wallet-expiry-pills .pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#wallet-expiry-pills .pill-btn')
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _walletExpiry = parseInt(btn.dataset.secs, 10);
    });
  });

  // QR modal close
  $('modal-close-btn').addEventListener('click', () => $('qr-modal').classList.add('hidden'));
  $('qr-modal').addEventListener('click', e => {
    if (e.target === $('qr-modal')) $('qr-modal').classList.add('hidden');
  });

  // Back buttons in single wizard
  $('btn-back-step2').addEventListener('click', () => { stopFundingPoll(); showStep(1); });

  // Detect dial code and populate
  initSingleStep1();

  // Apply server config (branding, feature flags, links)
  await _configReady;
  document.title = _siteName;
  const logoEl = document.getElementById('app-logo');
  if (logoEl) logoEl.innerHTML = '⚡ ' + _siteLogoInner;
  document.querySelectorAll('.js-site-name').forEach(el => { el.textContent = _siteName; });
  if (_githubURL) {
    const ghEl = document.getElementById('footer-github');
    const ghAboutEl = document.getElementById('about-github-link');
    if (ghEl) { ghEl.href = _githubURL; ghEl.style.display = ''; }
    if (ghAboutEl) ghAboutEl.innerHTML = 'View the source on <a href="' + _githubURL + '" target="_blank" rel="noopener">GitHub</a>.';
  }
  window._donateLNURL = _donateLNURL;
  // Server settings section
  const _serverOrigin = new URL(_serverURL).origin;
  addKnownServer(_serverOrigin); // ensure active server is always in list
  const headerHostEl = document.getElementById('header-server-host');
  if (headerHostEl) {
    try { headerHostEl.textContent = new URL(_serverURL).hostname; } catch {}
  }
  renderSettingsServerSection();
  const btnAddServer = document.getElementById('btn-add-server');
  if (btnAddServer) {
    btnAddServer.addEventListener('click', async () => {
      const input = document.getElementById('settings-server-input');
      const errEl = document.getElementById('settings-server-error');
      let raw = (input.value || '').trim().replace(/\/$/, '');
      if (!raw) return;
      errEl.textContent = '';
      btnAddServer.disabled = true;
      const orig = btnAddServer.textContent;
      btnAddServer.textContent = 'Checking…';

      // Build candidate list: if no protocol given, try https then http.
      let candidates;
      if (/^https?:\/\//i.test(raw)) {
        candidates = [raw];
      } else {
        candidates = ['https://' + raw, 'http://' + raw];
      }

      let resolvedURL = null;
      for (const candidate of candidates) {
        try {
          const res = await fetch(candidate + '/config');
          if (res.ok) { resolvedURL = candidate; break; }
        } catch {}
      }

      if (resolvedURL) {
        addKnownServer(resolvedURL);
        localStorage.setItem(LS_SERVER_URL, resolvedURL);
        window.location.reload();
      } else {
        errEl.textContent = 'Could not connect to that server. Check the URL and try again.';
        btnAddServer.disabled = false;
        btnAddServer.textContent = orig;
      }
    });
  }

  // Show correct initial screen
  if (localStorage.getItem(LS_REFUND)) {
    startApp();
  } else {
    showScreen('screen-onboarding');
  }

  // ── Service worker + install banner ──────────────────────────────────────
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  const LS_INSTALL_DISMISSED = 'sn_install_dismissed';
  const INSTALL_SNOOZE_MS = 4 * 24 * 60 * 60 * 1000; // 4 days
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || navigator.standalone === true;

  const dismissedVal = localStorage.getItem(LS_INSTALL_DISMISSED) || '';
  const snoozed = dismissedVal === 'installed'
    || (dismissedVal && (Date.now() - parseInt(dismissedVal, 10)) < INSTALL_SNOOZE_MS);

  if (!isStandalone && !snoozed) {
    const banner  = $('install-banner');
    const textEl  = $('install-banner-text');
    const btn     = $('install-banner-btn');
    const dismiss = $('install-banner-dismiss');

    const hideBanner = (permanent = false) => {
      banner.classList.add('hidden');
      localStorage.setItem(LS_INSTALL_DISMISSED, permanent ? 'installed' : String(Date.now()));
    };
    dismiss.addEventListener('click', hideBanner);

    if (isIOS) {
      // iOS: no programmatic prompt — show manual instructions
      textEl.textContent = 'Install this app:';
      btn.textContent = 'Tap Share then "Add to Home Screen"';
      btn.className = 'btn btn-secondary btn-sm install-banner-btn';
      btn.style.fontSize = '0.75rem';
      btn.addEventListener('click', hideBanner);
      banner.classList.remove('hidden');
    } else {
      // Android / desktop: wait for browser's beforeinstallprompt
      let deferredPrompt = null;
      window.addEventListener('beforeinstallprompt', e => {
        e.preventDefault();
        deferredPrompt = e;
        textEl.textContent = 'Install this app for quick access';
        btn.textContent = 'Install';
        btn.addEventListener('click', () => {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then(choice => {
            if (choice.outcome === 'accepted') hideBanner();
            deferredPrompt = null;
          });
        });
        banner.classList.remove('hidden');
      });
    }

    // Hide automatically once installed
    window.addEventListener('appinstalled', () => hideBanner(true));
  }
}

document.addEventListener('DOMContentLoaded', init);
