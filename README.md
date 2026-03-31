# Satoshi Note

Satoshi Note is a web-based PWA for creating and sharing Bitcoin Lightning vouchers. You fund a voucher with sats via Lightning, and a shareable claim link is generated that you can send to anyone — no wallet required on the recipient's end. Unclaimed sats automatically return to your Lightning address when the voucher expires, so nothing is lost if the link goes unclaimed.

## Tips

### Crawlers

Crawler requires an absolute URL in `og:image`. Update the meta tag in both `index.html` and `redeem.html` to use your full domain. Also update the `<title>` and `<meta property="og:title">` in `index.html` to match::

```html
<title>Your App Name</title>
<meta property="og:title" content="Your App Name">
<meta property="og:image" content="https://yourdomain.com/icon-512.png">
```

### Changing the app name

When someone adds the app to their home screen, the name shown comes from `manifest.json` — not from any runtime config. To change it, open `manifest.json` and update the `name` and `short_name` fields:

```json
"name": "Your App Name",
"short_name": "Your App Name"
```
