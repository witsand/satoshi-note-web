// Scans an HTML file for data-i18n ids and writes a strings catalog JSON (defaults: redeem.html → l10n/redeem/strings.en.json).
package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"html"
	"io"
	"log/slog"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

var (
	tagStripRE      = regexp.MustCompile(`<[^>]+>`)
	openTagName     = regexp.MustCompile(`(?i)^<\s*([a-z0-9]+)`)
	dataI18nAttrsRE = regexp.MustCompile(`(?i)data-i18n-attrs\s*=\s*"([^"]*)"`)
	closeTagRE      = regexp.MustCompile(`(?i)^</([a-z0-9]+)(?:\s[^>]*)?>`)
	nextOpenTag     = regexp.MustCompile(`(?i)^<\s*([a-z0-9]+)`)
	dataI18nRE      = regexp.MustCompile(`data-i18n="([^"]+)"`)
)

func stripTags(s string) string {
	s = tagStripRE.ReplaceAllString(s, " ")
	s = strings.Join(strings.Fields(s), " ")
	return html.UnescapeString(s)
}

func parseDataI18nAttrs(openTag string) []string {
	m := dataI18nAttrsRE.FindStringSubmatch(openTag)
	if len(m) < 2 {
		return nil
	}
	var names []string
	for _, a := range strings.Fields(m[1]) {
		a = strings.TrimSpace(a)
		if a != "" {
			names = append(names, a)
		}
	}
	return names
}

// attrFromOpenTag reads a double-quoted attribute value from an HTML start tag (case-insensitive name).
func attrFromOpenTag(openTag, attrName string) (string, bool) {
	pat := `(?i)(?:^|[\s/])` + regexp.QuoteMeta(attrName) + `\s*=\s*"([^"]*)"`
	re := regexp.MustCompile(pat)
	m := re.FindStringSubmatch(openTag)
	if len(m) < 2 {
		return "", false
	}
	return html.UnescapeString(m[1]), true
}

func mergeListedAttrs(openTag string, names []string, out map[string]string) {
	for _, n := range names {
		if v, ok := attrFromOpenTag(openTag, n); ok {
			out[n] = v
		}
	}
}

func isVoidTag(tag string) bool {
	switch strings.ToLower(tag) {
	case "meta", "link", "input", "img", "br", "hr":
		return true
	default:
		return false
	}
}

func extractDefault(raw, key string) map[string]string {
	needle := `data-i18n="` + key + `"`
	pos := strings.Index(raw, needle)
	if pos < 0 {
		return map[string]string{"text": ""}
	}
	lt := strings.LastIndex(raw[:pos], "<")
	if lt < 0 {
		return map[string]string{"text": ""}
	}
	gt := strings.Index(raw[pos:], ">")
	if gt < 0 {
		return map[string]string{"text": ""}
	}
	openTag := raw[lt : pos+gt+1]
	m := openTagName.FindStringSubmatch(openTag)
	if len(m) < 2 {
		return map[string]string{"text": ""}
	}
	tag := strings.ToLower(m[1])
	useHTML := strings.Contains(openTag, "data-i18n-html")
	attrsList := parseDataI18nAttrs(openTag)
	out := make(map[string]string)
	mergeListedAttrs(openTag, attrsList, out)

	if isVoidTag(tag) {
		// Fallbacks when data-i18n-attrs omitted but values exist on the tag
		if tag == "meta" {
			if _, ok := out["content"]; !ok {
				if v, ok2 := attrFromOpenTag(openTag, "content"); ok2 {
					out["content"] = v
				}
			}
		}
		if tag == "input" {
			if _, ok := out["placeholder"]; !ok {
				if v, ok2 := attrFromOpenTag(openTag, "placeholder"); ok2 {
					out["placeholder"] = v
				}
			}
		}
		if len(out) == 0 {
			return map[string]string{"text": ""}
		}
		return out
	}

	depth := 1
	i := pos + gt + 1
	start := i
	for i < len(raw) && depth > 0 {
		nextOpen := strings.Index(raw[i:], "<")
		if nextOpen < 0 {
			break
		}
		nextOpen += i
		if nextOpen+1 < len(raw) && raw[nextOpen+1] == '/' {
			slice := raw[nextOpen:]
			cm := closeTagRE.FindStringSubmatch(slice)
			if cm == nil {
				i = nextOpen + 2
				continue
			}
			closeTag := strings.ToLower(cm[1])
			depth--
			if depth == 0 {
				if closeTag != tag {
					return map[string]string{"text": ""}
				}
				inner := raw[start:nextOpen]
				if useHTML {
					out["html"] = strings.TrimSpace(inner)
				} else {
					out["text"] = stripTags(inner)
				}
				if len(out) == 0 {
					return map[string]string{"text": ""}
				}
				return out
			}
			i = nextOpen + len(cm[0])
			continue
		}
		if nextOpen+4 <= len(raw) && strings.EqualFold(raw[nextOpen:nextOpen+4], "<!--") {
			end := strings.Index(raw[nextOpen:], "-->")
			if end < 0 {
				break
			}
			i = nextOpen + end + 3
			continue
		}
		slice := raw[nextOpen:]
		subm := nextOpenTag.FindStringSubmatch(slice)
		if len(subm) > 1 {
			sub := strings.ToLower(subm[1])
			if sub == "br" || sub == "img" || sub == "meta" || sub == "link" || sub == "input" || sub == "hr" {
				closeVoid := strings.Index(slice, ">")
				if closeVoid < 0 {
					break
				}
				i = nextOpen + closeVoid + 1
				continue
			}
			depth++
		}
		i = nextOpen + 1
	}
	return map[string]string{"text": ""}
}

func marshalValueNoEscapeHTML(v map[string]string) ([]byte, error) {
	var buf bytes.Buffer
	enc := json.NewEncoder(&buf)
	enc.SetEscapeHTML(false)
	if err := enc.Encode(v); err != nil {
		return nil, err
	}
	return bytes.TrimSuffix(buf.Bytes(), []byte("\n")), nil
}

func writeOrderedJSON(w io.Writer, order []string, values map[string]map[string]string) error {
	if _, err := w.Write([]byte("{\n")); err != nil {
		return err
	}
	for i, k := range order {
		if i > 0 {
			if _, err := w.Write([]byte(",\n")); err != nil {
				return err
			}
		}
		kb, err := json.Marshal(k)
		if err != nil {
			return err
		}
		vb, err := marshalValueNoEscapeHTML(values[k])
		if err != nil {
			return err
		}
		var inner bytes.Buffer
		if err := json.Indent(&inner, vb, "  ", "  "); err != nil {
			return err
		}
		if _, err := w.Write([]byte("  ")); err != nil {
			return err
		}
		if _, err := w.Write(kb); err != nil {
			return err
		}
		if _, err := w.Write([]byte(": ")); err != nil {
			return err
		}
		trimmed := bytes.TrimPrefix(inner.Bytes(), []byte("  "))
		if _, err := w.Write(trimmed); err != nil {
			return err
		}
	}
	_, err := w.Write([]byte("\n}\n"))
	return err
}

func extractAll(raw string) (order []string, out map[string]map[string]string) {
	order = make([]string, 0, 96)
	seen := make(map[string]struct{})
	for _, m := range dataI18nRE.FindAllStringSubmatchIndex(raw, -1) {
		if len(m) < 4 {
			continue
		}
		k := raw[m[2]:m[3]]
		if _, ok := seen[k]; !ok {
			seen[k] = struct{}{}
			order = append(order, k)
		}
	}

	out = make(map[string]map[string]string, len(order))
	for _, k := range order {
		out[k] = extractDefault(raw, k)
	}
	return order, out
}

func main() {
	slog.SetDefault(slog.New(slog.NewTextHandler(os.Stderr, &slog.HandlerOptions{Level: slog.LevelInfo})))

	defaultHTML := "redeem.html"
	defaultOut := filepath.Join("l10n", "redeem", "strings.en.json")
	htmlPath := flag.String("html", defaultHTML, "path to HTML file to scan")
	outFlag := flag.String("out", defaultOut, "path to write strings.en.json")
	flag.Parse()

	rawBytes, err := os.ReadFile(*htmlPath)
	if err != nil {
		slog.Error("read html", "path", *htmlPath, "err", err)
		os.Exit(1)
	}
	raw := string(rawBytes)
	order, out := extractAll(raw)

	if err := os.MkdirAll(filepath.Dir(*outFlag), 0o755); err != nil {
		slog.Error("mkdir", "path", filepath.Dir(*outFlag), "err", err)
		os.Exit(1)
	}
	f, err := os.Create(*outFlag)
	if err != nil {
		slog.Error("create output", "path", *outFlag, "err", err)
		os.Exit(1)
	}
	defer f.Close()
	if err := writeOrderedJSON(f, order, out); err != nil {
		slog.Error("write json", "err", err)
		os.Exit(1)
	}
	if err := f.Close(); err != nil {
		slog.Error("close output", "err", err)
		os.Exit(1)
	}
	fmt.Fprintf(os.Stdout, "wrote %s (%d keys)\n", *outFlag, len(out))
}
