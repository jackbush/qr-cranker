# Architecture

## Tech Stack

- **Vite** — dev server + build tool, outputs static files for GitHub Pages
- **Vanilla JS (ES modules)** — no framework, keeps bundle tiny and simple
- **[qrcode-generator](https://www.npmjs.com/package/qrcode-generator)** — lightweight QR encoding library (~4KB), outputs cell data we render ourselves as SVG
- **CSS** — vanilla, no preprocessor needed at this scale

### Why these choices

- **Vite over zero-build**: gives us npm packages, HMR in dev, and a dead-simple `vite build` for GitHub Pages. No config needed.
- **qrcode-generator over qr-code-styling**: we want full control over SVG rendering for customisation (colours, transparent bg). `qrcode-generator` gives us the raw QR matrix; we render it ourselves. `qr-code-styling` is heavier and opinionated about rendering.
- **No framework**: the UI is a single form + a preview. React/Vue would be overhead for no benefit.

## Project Structure

```
qr-cranker/
├── index.html              # Single page entry point
├── vite.config.js          # Vite config (base path for GitHub Pages)
├── package.json
├── src/
│   ├── main.js             # Entry: wire up DOM events, orchestrate modules
│   ├── qr.js               # QR encoding: text → QR matrix (wraps qrcode-generator)
│   ├── renderer.js         # QR matrix → SVG string, applies colours/styling
│   ├── contrast.js         # WCAG contrast ratio calculation + threshold check
│   ├── export.js           # Copy SVG to clipboard, render to canvas → PNG download
│   └── style.css           # All styles
└── tasks/                  # Implementation plans (this folder)
```

## Data Flow

```
User input (text + options)
        │
        ▼
    qr.js: encode(text, ecLevel) → boolean[][]  (QR matrix)
        │
        ▼
    renderer.js: render(matrix, {fg, bg, size}) → SVG string
        │
        ├──▶ Live preview (innerHTML into preview container)
        │
        ├──▶ export.js: copySvg(svgString) → clipboard
        │
        └──▶ export.js: downloadPng(svgString, resolution) → canvas → blob → download
```

## Key Design Decisions

1. **SVG as the internal format.** We generate SVG from the QR matrix, then derive everything else (preview, clipboard, PNG) from that SVG. One source of truth.

2. **No state management.** Every input change re-generates the full QR → SVG → preview pipeline. With <1ms generation time, there's no reason to cache or diff.

3. **Contrast check runs on every colour change.** It compares the relative luminance of fg/bg colours per WCAG 2.0. Warning appears inline, doesn't block the user.

4. **PNG export uses an offscreen canvas.** SVG → Image → Canvas → toBlob → download link. Resolution multiplier scales the canvas dimensions.

5. **Transparent background.** When enabled, the SVG background rect is omitted. For PNG export, the canvas is not pre-filled, preserving alpha. Contrast warning uses white as the assumed background when transparent is selected.
