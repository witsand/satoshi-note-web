package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
)

// moduleRoot is the satoshi-note-web directory (parent of tools/).
func moduleRoot(t *testing.T) string {
	t.Helper()
	_, thisFile, _, ok := runtime.Caller(0)
	if !ok {
		t.Fatal("runtime.Caller")
	}
	pkgDir := filepath.Dir(thisFile)
	return filepath.Clean(filepath.Join(pkgDir, "..", ".."))
}

func TestStripTags(t *testing.T) {
	got := stripTags(`  Hello <b>world</b>  `)
	if got != "Hello world" {
		t.Fatalf("stripTags: %q", got)
	}
}

func TestSmokeExtractRedeemHTML(t *testing.T) {
	redeem := filepath.Join(moduleRoot(t), "redeem.html")
	rawBytes, err := os.ReadFile(redeem)
	if err != nil {
		t.Skip("redeem.html not found:", err)
	}
	order, out := extractAll(string(rawBytes))
	if len(order) < 80 {
		t.Fatalf("expected many data-i18n keys, got %d", len(order))
	}
	required := []string{
		"redeem.meta.pageTitle",
		"redeem.meta.description",
		"redeem.modal.lnaddr.title",
		"redeem.sticker.voucher",
		"redeem.info.title",
	}
	for _, k := range required {
		if _, ok := out[k]; !ok {
			t.Errorf("missing key %q", k)
		}
	}
	title := out["redeem.meta.pageTitle"]["text"]
	if !strings.Contains(title, "Claim") {
		t.Fatalf("redeem.meta.pageTitle: %q", title)
	}
	desc, ok := out["redeem.meta.description"]["content"]
	if !ok || !strings.Contains(desc, "Lightning") {
		t.Fatalf("redeem.meta.description must use content attr for applyDomI18n: ok=%v content=%q", ok, desc)
	}
	if _, hasText := out["redeem.meta.description"]["text"]; hasText {
		t.Fatal("redeem.meta.description should not use text for <meta content>; got text key")
	}
	li1 := out["redeem.modal.sats.li1"]
	if li1["html"] == "" || !strings.Contains(li1["html"], "Bitcoin") {
		t.Fatalf("redeem.modal.sats.li1.html: %q", li1["html"])
	}
	if _, hasText := li1["text"]; hasText {
		t.Fatal("redeem.modal.sats.li1 must not set empty text (would clear DOM before html in applyDomI18n)")
	}
	flip := out["redeem.btn.flipBackTitle"]
	if flip["title"] == "" || !strings.Contains(strings.ToLower(flip["title"]), "back") {
		t.Fatalf("redeem.btn.flipBackTitle.title: %q", flip["title"])
	}
	if len(order) != len(out) {
		t.Fatalf("order vs out: %d vs %d", len(order), len(out))
	}
}

func TestSmokeLocaleTestJSON(t *testing.T) {
	p := filepath.Join(moduleRoot(t), "l10n", "redeem", "test.json")
	b, err := os.ReadFile(p)
	if err != nil {
		t.Skip("l10n/redeem/test.json not found:", err)
	}
	var v map[string]map[string]string
	if err := json.Unmarshal(b, &v); err != nil {
		t.Fatal(err)
	}
	pt, ok := v["redeem.meta.pageTitle"]
	if !ok || pt["text"] == "" {
		t.Fatal("expected redeem.meta.pageTitle.text override")
	}
	if !strings.HasPrefix(pt["text"], "[TEST LANG]") {
		t.Fatalf("test.json should use [TEST LANG] prefix for smoke checks, got %q", pt["text"])
	}
}
