package main

import (
	"strings"
	"testing"
)

func TestRedeemInfoTemplate(t *testing.T) {
	s := RedeemInfoTemplate()
	if !strings.Contains(s, `id="tpl-redeem-info"`) {
		t.Fatal("missing tpl-redeem-info")
	}
	if !strings.Contains(s, `id="details-blink"`) {
		t.Fatal("missing details-blink")
	}
	if !strings.Contains(s, `id="details-spend"`) {
		t.Fatal("missing details-spend")
	}
}
