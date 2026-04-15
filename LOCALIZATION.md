# HTML localization (`data-i18n`)

Copy for HTML-driven pages lives in **markup** (including `<template>` blocks): English defaults are the visible text, `data-i18n="stable.id"` marks translatable nodes, optional `data-i18n-html` allows trusted HTML overrides, and `data-i18n-attrs="title aria-label placeholder …"` lists attributes to patch from the same JSON entry.

Runtime overrides come from **locale JSON** under a **bundle directory** (today: **`/l10n/redeem/<lang>.json`** for the voucher redeem UI). Keys are the same `stable.id` strings as in the HTML. Values are either a string (treated as `{ "text": … }`) or an object with any of `text`, `html`, or attribute names matching `data-i18n-attrs`.

**Trust model:** Bundle files are **trusted content** served from your origin. `applyDomI18n` can set `innerHTML` from `html` fields (including when `data-i18n-html` is set). Treat merges to `l10n/redeem/*.json` like application code: review for malicious markup (e.g. script URLs, inline handlers) before deploy.

## How it works

1. The page reads the **`lang` query parameter** (e.g. `redeem.html?lightning=LNURL1…&lang=af`).
2. The value is **normalized** by [js/i18n-runtime.js](js/i18n-runtime.js): trim, spaces become `-`, only `A–Z`, `a–z`, `0–9`, and `-` are kept, then capped at **32 UTF-8 bytes** on a character boundary. An empty result means English only (no fetch).
3. If a code remains, the app fetches the bundle JSON. On success, the same module’s **`applyDomI18n(document, dict)`** runs over the live DOM (modals, meta, header, hidden string refs). Cloned template fragments are passed through **`applyDomI18n(fragmentRoot, dict)`** again after each clone.
4. **`window.snInitL10n()`** resolves to `{ dict, lang, t }`. **`window.snL10nT`** (same as `t`) is built from **`dict` only** (missing keys fall back to the key string). Shared [js/lnaddr-redeem.js](js/lnaddr-redeem.js) still uses **English phrases as keys** for errors and status lines; locale JSON may override those keys with `{ "text": "…" }` or a plain string.
5. **`#sn-l10n-refs`** holds hidden spans with `data-l10n-ref="…"` so [js/redeem-main.js](js/redeem-main.js) can read post-override wording for dynamic UI (stickers, countdown prefix, copy button labels, etc.) without embedding copy in JS.

## Translator handoff

- Regenerate the English catalog from the HTML (after editing copy or `data-i18n` ids). From the **`satoshi-note-web`** repo root:

  `go run ./tools/extract-html-l10n`

  Optional flags: `-html redeem.html` and `-out l10n/redeem/strings.en.json` (these are the defaults when run from the repo root).

  This writes [l10n/redeem/strings.en.json](l10n/redeem/strings.en.json) with the same shape **`applyDomI18n` expects**: `text` / `html` from element content, and **attribute keys** (e.g. `content`, `placeholder`, `title`) taken from `data-i18n-attrs` on the same tag. Implementation: [tools/extract-html-l10n/main.go](tools/extract-html-l10n/main.go).

- The FAQ “Learn More” card is generated with `go run ./tools/gen-redeem-info-template` (optional `-out path`) when that structure changes; output is pasted into `redeem.html`’s `<template id="tpl-redeem-info">` (or re-run the tool and sync the file).

## Adding or changing strings

1. Edit **English** and `data-i18n` ids in `redeem.html` (or the relevant `<template>`).
2. Re-run **`go run ./tools/extract-html-l10n`** (from `satoshi-note-web/`) if you want `strings.en.json` updated for translators.
3. Add **`l10n/redeem/<normalized-lang>.json`** with only keys you want to override (same ids as `data-i18n` / lnaddr English keys).

## Testing

- **Fixture locale:** [l10n/redeem/test.json](l10n/redeem/test.json) ships in the repo with a few overrides prefixed **`[TEST LANG]`** so you can spot overrides quickly. Open `redeem.html?lightning=…&lang=test` (normalized code `test` loads `test.json`), reload, and confirm those strings change while everything else stays English from HTML.
- **Afrikaans sample:** [l10n/redeem/af.json](l10n/redeem/af.json) covers the page shell, modals, states, main buttons, wallet sheet strings, several FAQ titles, and the shared [lnaddr-redeem.js](js/lnaddr-redeem.js) English lookup keys. Use `redeem.html?lightning=…&lang=af` to try it (FAQ body paragraphs that are still English fall back to HTML defaults until you add more keys).
- Omit `lang` to confirm the no-fetch path: English from HTML, `snL10nT` falls back to the key for lnaddr phrases.
- **Automated smoke** (extractor + fixture JSON): from the **`satoshi-note-web`** repo root, run:

  `go test ./tools/extract-html-l10n/...`

## Notes

- **What is still redeem-scoped today:** the JSON bundle path (`/l10n/redeem/`), the `redeem.*` string ids in HTML, the voucher entrypoint **`snRedeemMain`**, and the FAQ generator under `tools/gen-redeem-info-template/`. The DOM applier and fetch/`t` helpers are generic; point them at another bundle path when you localize another page.
- **[index.html](index.html)** does not load the HTML l10n runtime; [js/wallet-picker.js](js/wallet-picker.js) uses English baked into the overlay markup plus **`SN_WALLET_L10N_FALLBACK`** for `redeem.wallet.*` keys when no override exists.
- **satoshi-print** is not covered here.
