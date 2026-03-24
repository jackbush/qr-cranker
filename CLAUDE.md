# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See README.md for features, dev commands, and deployment setup.

## Commands

```sh
npm run dev      # Vite dev server
npm run build    # production build → dist/
npm test         # Vitest (run once)
```

## Architecture

Vanilla JS + Vite, no framework. Single page, all state in-memory — nothing persisted or URL-encoded. See README § Privacy.

**Module responsibilities:**

| File | Role |
|------|------|
| `src/qr.js` | Wraps `qrcode-generator` — `encode(text, ecLevel)` → `boolean[][]` |
| `src/renderer.js` | `render(matrix, {fg, bg, transparent})` → SVG string |
| `src/contrast.js` | WCAG 2.0 contrast ratio; `checkContrast(fg, bg, transparent)` → `{ratio, pass}` |
| `src/export.js` | `copySvg(svg)` → clipboard; `downloadPng(svg, resolution, baseSize)` → canvas → file download |
| `src/main.js` | Wires DOM events, calls above modules, holds `currentSvg` as the only mutable state |

**Data flow:** `textarea input` → `encode()` → `render()` → `innerHTML` + `checkContrast()` → show/hide warning. Export buttons consume `currentSvg`.

## Key design decisions

- **SVG is the single source of truth.** Preview, clipboard copy, and PNG download all derive from the same SVG string.
- **No state management.** Every input event re-runs the full encode → render pipeline (~<1ms).
- **PNG export via offscreen canvas.** Canvas is never pre-filled — preserves alpha for transparent backgrounds. When `transparent: true`, contrast check uses white (`#ffffff`) as the assumed background.
- **Contrast threshold is 3:1** (not WCAG AA 4.5:1 — QR codes are more tolerant than body text).
- **`qrcode-generator` over heavier libs** — gives us the raw QR matrix so we render SVG ourselves, enabling full colour/transparency control.

## Tests

| File | What it tests |
|------|--------------|
| `scaffold.test.js` | `index.html` structure, `package.json` scripts |
| `qr.test.js` | `encode()` and `render()` |
| `contrast.test.js` | `contrastRatio()` and `checkContrast()` |
| `preview.test.js` | Live preview DOM behaviour |
| `controls.test.js` | Colour/EC/transparency controls DOM behaviour |
| `export.test.js` | `copySvg()` and `downloadPng()` |

`scaffold.test.js` runs in Node (`// @vitest-environment node`) because it reads files from disk. DOM tests (`preview`, `controls`) construct a `JSDOM` instance directly rather than relying on the global jsdom environment.
