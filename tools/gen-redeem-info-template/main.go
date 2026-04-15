// Prints <template id="tpl-redeem-info">…</template> for redeem.html (English + data-i18n).
package main

import (
	"flag"
	"fmt"
	"io"
	"log/slog"
	"os"
	"strings"
)

const (
	faqBlinkAnswer = `<p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:10px;">✅ Great for beginners. Low setup, fast to start. Your phone number is your backup.</p>
            <p class="section-label">Steps to get started</p>
            <ol class="steps-list">
              <li>
                <strong>Download <a class="wallet-link" href="https://blink.sv" target="_blank" rel="noopener">blink.sv</a>
                </strong>
                From the Play Store, GitHub, or App Store.
                <div class="wallet-card-links" style="margin-bottom:10px;">
                  <a class="wallet-link" href="https://play.google.com/store/apps/details?id=com.galoyapp" target="_blank" rel="noopener">Play Store</a>
                  <a class="wallet-link" href="https://github.com/blinkbitcoin/blink-mobile/releases/latest" target="_blank" rel="noopener">APK</a>
                  <a class="wallet-link" href="https://apps.apple.com/us/app/blink-bitcoin-wallet/id1531383905" target="_blank" rel="noopener">App Store</a>
                </div>
              </li>
              <li><strong>Open the app</strong> Tap "Create new account" -&gt; "Accept"</li>
              <li><strong>Enter your phone number (optional)</strong> "SMS" -&gt; "Use SMS" -&gt; Enter number -&gt; Tap "Send via SMS". This is your backup. Confirm the 6 digit code.</li>
              <li><strong>Come back here</strong> Tap the QR code above. This will open Blink and allow you to redeem the bitcoin ⚡</li>
            </ol>`

	faqAdvList = `<ul class="dots-list">
              <li>
                <strong>Misty Breez</strong>
                <div class="wallet-card-links" style="margin-bottom:8px;">
                  <a class="wallet-link" href="https://breez.technology/misty/" target="_blank" rel="noopener">breez.technology/misty</a><br>
                  <a class="wallet-link" href="https://play.google.com/store/apps/details?id=com.breez.misty" target="_blank" rel="noopener">Play Store</a>
                  <a class="wallet-link" href="https://github.com/breez/misty-breez/releases" target="_blank" rel="noopener">APK</a>
                  <a class="wallet-link" href="https://testflight.apple.com/join/nEegHvBX" target="_blank" rel="noopener">App Store</a>
                </div>
              </li>
              <li>
                <strong>Phoenix</strong>
                <div class="wallet-card-links" style="margin-bottom:8px;">
                  <a class="wallet-link" href="https://phoenix.acinq.co/" target="_blank" rel="noopener">phoenix.acinq.co</a>
                  <a class="wallet-link" href="https://play.google.com/store/apps/details?id=fr.acinq.phoenix.mainnet" target="_blank" rel="noopener">Play Store</a>
                  <a class="wallet-link" href="https://github.com/ACINQ/phoenix/releases/latest" target="_blank" rel="noopener">APK</a>
                  <a class="wallet-link" href="https://apps.apple.com/us/app/phoenix-wallet/id1544097028" target="_blank" rel="noopener">App Store</a>
                </div>
              </li>
              <li>
                <strong>Zeus</strong>
                <div class="wallet-card-links" style="margin-bottom:8px;">
                  <a class="wallet-link" href="https://zeusln.com/" target="_blank" rel="noopener">zeusln.com</a>
                  <a class="wallet-link" href="https://play.google.com/store/apps/details?id=app.zeusln.zeus" target="_blank" rel="noopener">Play Store</a>
                  <a class="wallet-link" href="https://github.com/ZeusLN/zeus/releases/latest" target="_blank" rel="noopener">APK</a>
                  <a class="wallet-link" href="https://apps.apple.com/us/app/zeus-ln/id1456038895" target="_blank" rel="noopener">App Store</a>
                </div>
              </li>
              <li>
                <strong>Blitz Wallet</strong>
                <div class="wallet-card-links" style="margin-bottom:8px;">
                  <a class="wallet-link" href="https://blitz-wallet.com/" target="_blank" rel="noopener">blitz-wallet.com</a>
                  <a class="wallet-link" href="https://play.google.com/store/apps/details?id=com.blitzwallet" target="_blank" rel="noopener">Play Store</a>
                  <a class="wallet-link" href="https://apps.apple.com/us/app/blitz-wallet/id6476810582" target="_blank" rel="noopener">App Store</a>
                </div>
              </li>
            </ul>`

	spendBlocks = `
            <div class="spend-item">
              <div class="spend-title" data-i18n="redeem.faq.spend.lead">Use Bitcoin everywhere — local markets, big stores, gift cards, and instant global payments.</div>
            </div>
            <div class="spend-item">
              <span class="spend-icon">🌀</span>
              <div>
                <div class="spend-title" data-i18n="redeem.faq.spend.circlesTitle">Bitcoin circular economies in SA</div>
                <div class="spend-desc" data-i18n="redeem.faq.spend.circlesBody" data-i18n-html>Entire communities where you can live on Bitcoin:
                  <strong>Witsand</strong>,
                  <strong>Mossel Bay</strong> (<a href="https://bitcoinekasi.com" target="_blank" rel="noopener">bitcoinekasi.com</a>),
                  <strong>Plettenberg Bay</strong> (<a href="https://bitcoinplett.cx" target="_blank" rel="noopener">bitcoinplett.cx</a>),
                  <strong>De Rust</strong>,
                  <strong>Sedgefield</strong>,
                  <strong>Stellenbosch</strong>,
                  and <strong>Knysna</strong>.
                  <br>All have regular local meetups.</div>
              </div>
            </div>
            <div class="spend-item">
              <span class="spend-icon">🗺️</span>
              <div>
                <div class="spend-title" data-i18n="redeem.faq.spend.mapTitle">Find nearby merchants</div>
                <div class="spend-desc" data-i18n="redeem.faq.spend.mapBody" data-i18n-html><a href="https://btcmap.org" target="_blank" rel="noopener">BTCMap.org</a> and the
                  <a href="https://goo.gl/maps/tKHJVbVzEuBQd7F8A" target="_blank" rel="noopener">Money Badger map</a>
                  show thousands of Bitcoin-accepting businesses across South Africa.</div>
              </div>
            </div>
            <div class="spend-item">
              <span class="spend-icon">🏪</span>
              <div>
                <div class="spend-title" data-i18n="redeem.faq.spend.zapperTitle">Zapper &amp; Scan to Pay merchants</div>
                <div class="spend-desc" data-i18n="redeem.faq.spend.zapperBody" data-i18n-html>Pay at any store that accepts Zapper or Scan to Pay — including
                  Pick &amp; Pay, Dischem, Clicks, Engen, Shell, Total, Wimpy and many more.</div>
              </div>
            </div>
            <div class="spend-item">
              <span class="spend-icon">🎁</span>
              <div>
                <div class="spend-title" data-i18n="redeem.faq.spend.giftTitle">Gift cards &amp; top-ups</div>
                <div class="spend-desc" data-i18n="redeem.faq.spend.giftBody" data-i18n-html>Buy gift cards for hundreds of global brands at
                  <a href="https://bitrefill.com" target="_blank" rel="noopener">Bitrefill.com</a> —
                  Netflix, Amazon, Uber, Airtime top-ups and more.</div>
              </div>
            </div>
            <div class="spend-item">
              <span class="spend-icon">🤝</span>
              <div>
                <div class="spend-title" data-i18n="redeem.faq.spend.meetupsTitle">Bitcoin meetups</div>
                <div class="spend-desc" data-i18n="redeem.faq.spend.meetupsBody" data-i18n-html>Active communities in Cape Town, Pretoria, and Johannesburg.
                  Find events and dates on Twitter/X — search for local Bitcoin groups in your city.</div>
              </div>
            </div>
            <div class="spend-item">
              <span class="spend-icon">💸</span>
              <div>
                <div class="spend-title" data-i18n="redeem.faq.spend.instantTitle">Send to anyone, instantly</div>
                <div class="spend-desc" data-i18n="redeem.faq.spend.instantBody">Lightning payments settle in under a second, worldwide, for near-zero fees.</div>
              </div>
            </div>`

	faqPrivacyA = `When your Bitcoin is on an exchange, you don’t control it — the exchange does. Accounts can be frozen, restricted, or lost due to hacks or other issues.<br><br>

            Most exchanges also require KYC (identity verification), which links your real identity to your Bitcoin activity. This creates a permanent record of your transactions and reduces your financial privacy.<br><br>

            <strong>"Not your keys, not your coins."</strong> Using your own wallet gives you full control over your money and helps protect your privacy. Treat it like cash — once you own it, keep it with you.`

	faqCryptoA = `<strong>Bitcoin</strong> is decentralized money — no founders, no company, no central control. The rules are fixed and enforced by a global network. It was designed to remove trust and give individuals full control over their money.<br><br>

            <strong>"Crypto"</strong> is everything else — projects with founders, teams, and insiders who can change the rules, influence supply, and benefit early. This makes them easy to manipulate and unsuitable as money.<br><br>

            Most crypto projects don’t solve the core problem of fiat — <strong>control</strong>. They simply move that control from governments to companies or small groups.<br><br>

            The technologies may be interesting, but they are open source and can be built on Bitcoin without needing separate tokens. The tokens themselves are usually unnecessary and exist to enrich insiders.<br><br>

            Money is driven by network effects — people converge on one standard. Our view is simple: <strong>Bitcoin is money. Crypto is not.</strong> To keep our community safe, we focus on Bitcoin only and avoid crypto entirely.`

	faqLightningA = `Lightning is Bitcoin’s payment layer. It allows instant transactions, near-zero fees, and works globally in seconds.<br><br>

            On-chain Bitcoin is slower and more expensive — better suited for saving. Lightning makes Bitcoin practical for everyday payments like sending small amounts or paying in shops.<br><br>

            This platform uses Lightning to make sending Bitcoin simple, fast, and accessible to anyone.`

	faqBuyA = `You can buy Bitcoin using services like <strong>54052.co.za</strong>, which allow you to pay via EFT and receive Bitcoin directly to your wallet.
            Choose a service that is simple, reliable, and lets you withdraw to your own wallet.`

	faqBankA = `You can use <strong>54052.co.za</strong> to convert Bitcoin to rands and send it directly to a South African bank account.
            It’s simple to use, Bitcoin-focused, and designed for fast, low-fee payouts.`
)

const blinkSummary = `Download "Blink (Bitcoin Wallet)" <span style="background:var(--orange);color:#000;font-size:0.68rem;font-weight:700;padding:2px 8px;border-radius:10px;letter-spacing:0.3px;">Recommended</span>`

// RedeemInfoTemplate returns the FAQ card template HTML (no trailing newline).
func RedeemInfoTemplate() string {
	var b strings.Builder
	w := func(s string) {
		b.WriteString(s)
		b.WriteByte('\n')
	}
	w(`<template id="tpl-redeem-info">`)
	w(`  <div class="card" style="margin-bottom:20px;text-align:left;">`)
	w(`    <p class="card-title" data-i18n="redeem.info.title">Learn More</p>`)
	w(`    <p class="faq-section-label" data-i18n="redeem.info.gettingStarted">🟠 Getting Started</p>`)
	w(`    <details id="details-blink" class="faq-item">`)
	w(`      <summary class="faq-question"><span data-i18n="redeem.faq.blink.summary" data-i18n-html>` + blinkSummary + `</span><span style="color:var(--text-muted);">＋</span></summary>`)
	w(`      <div class="faq-answer" style="padding-top:8px;">`)
	w(`        <div data-i18n="redeem.faq.blink.answer" data-i18n-html>` + faqBlinkAnswer + `</div>`)
	w(`      </div>`)
	w(`    </details>`)
	w(`    <details class="faq-item">`)
	w(`      <summary class="faq-question"><span data-i18n="redeem.faq.advancedTitle">Advanced Wallets</span><span style="color:var(--text-muted);">＋</span></summary>`)
	w(`      <div class="faq-answer">`)
	w(`        <div data-i18n="redeem.faq.advancedBody" data-i18n-html>` + faqAdvList + `</div>`)
	w(`      </div>`)
	w(`    </details>`)
	w(`    <p class="faq-section-label" data-i18n="redeem.info.spending">🟠 Spending Bitcoin</p>`)
	w(`    <details id="details-spend" class="faq-item">`)
	w(`      <summary class="faq-question"><span data-i18n="redeem.faq.spend.title">Where can I spend Bitcoin in South Africa?</span><span style="color:var(--text-muted);">＋</span></summary>`)
	w(`      <div class="faq-answer">`)
	b.WriteString(spendBlocks)
	b.WriteString("\n      </div>\n")
	w(`    </details>`)
	w(`    <p class="faq-section-label" data-i18n="redeem.info.buying">🟠 Buying and Selling Rands for Bitcoin</p>`)
	w(`    <details class="faq-item">`)
	w(`      <summary class="faq-question"><span data-i18n="redeem.faq.buyZa.q">Where can I buy Bitcoin in South Africa?</span><span style="color:var(--text-muted);">＋</span></summary>`)
	w(`      <div class="faq-answer" data-i18n="redeem.faq.buyZa.a" data-i18n-html>` + faqBuyA + `</div>`)
	w(`    </details>`)
	w(`    <details class="faq-item">`)
	w(`      <summary class="faq-question"><span data-i18n="redeem.faq.bankZa.q">How do I send Bitcoin to a South African bank account?</span><span style="color:var(--text-muted);">＋</span></summary>`)
	w(`      <div class="faq-answer" data-i18n="redeem.faq.bankZa.a" data-i18n-html>` + faqBankA + `</div>`)
	w(`    </details>`)
	w(`    <p class="faq-section-label" data-i18n="redeem.info.selfCustody">🟠 Self-custody and Privacy</p>`)
	w(`    <details class="faq-item">`)
	w(`      <summary class="faq-question"><span data-i18n="redeem.faq.privacy.q">Why should I use my own wallet and care about privacy?</span><span style="color:var(--text-muted);">＋</span></summary>`)
	w(`      <div class="faq-answer" data-i18n="redeem.faq.privacy.a" data-i18n-html>` + faqPrivacyA + `</div>`)
	w(`    </details>`)
	w(`    <p class="faq-section-label" data-i18n="redeem.info.whyBitcoin">🟠 Why Bitcoin — Not Crypto</p>`)
	w(`    <details class="faq-item">`)
	w(`      <summary class="faq-question"><span data-i18n="redeem.faq.crypto.q">What is the difference between Bitcoin and crypto?</span><span style="color:var(--text-muted);">＋</span></summary>`)
	w(`      <div class="faq-answer" data-i18n="redeem.faq.crypto.a" data-i18n-html>` + faqCryptoA + `</div>`)
	w(`    </details>`)
	w(`    <details class="faq-item">`)
	w(`      <summary class="faq-question"><span data-i18n="redeem.faq.lightning.q">Why does this platform only support Lightning?</span><span style="color:var(--text-muted);">＋</span></summary>`)
	w(`      <div class="faq-answer" data-i18n="redeem.faq.lightning.a" data-i18n-html>` + faqLightningA + `</div>`)
	w(`    </details>`)
	w(`  </div>`)
	w(`</template>`)
	return b.String()
}

func main() {
	slog.SetDefault(slog.New(slog.NewTextHandler(os.Stderr, &slog.HandlerOptions{Level: slog.LevelInfo})))
	outPath := flag.String("out", "", "write to this file instead of stdout")
	flag.Parse()

	s := RedeemInfoTemplate()
	if *outPath == "" {
		if _, err := io.WriteString(os.Stdout, s); err != nil {
			slog.Error("write stdout", "err", err)
			os.Exit(1)
		}
		return
	}
	if err := os.WriteFile(*outPath, []byte(s), 0o644); err != nil {
		slog.Error("write file", "path", *outPath, "err", err)
		os.Exit(1)
	}
	fmt.Fprintf(os.Stderr, "wrote %s\n", *outPath)
}
