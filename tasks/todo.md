# Implementation Plan

Work through these tasks in order. Each task is self-contained and should result in a working (if incomplete) app.

---

## Task 1: Project Scaffolding

Set up the project so it builds and deploys.

- [ ] `npm init`, install `vite` and `qrcode-generator`
- [ ] Create `vite.config.js` with `base: '/qr-cranker/'` for GitHub Pages
- [ ] Create `index.html` with a basic page structure (title, empty containers for input/preview/export)
- [ ] Create `src/main.js` as entry point (import style.css, log "ready")
- [ ] Create `src/style.css` with minimal reset
- [ ] Verify `npm run dev` starts and `npm run build` outputs to `dist/`
- [ ] Add `scripts` to package.json: `"dev": "vite"`, `"build": "vite build"`, `"preview": "vite preview"`

**Done when:** `npm run dev` serves a page that says "QR Cranker" in the browser.

---

## Task 2: QR Encoding + SVG Rendering

Core pipeline: text in → QR code displayed.

- [ ] Create `src/qr.js`: export `encode(text, errorCorrectionLevel)` that returns a 2D boolean array (the QR matrix). Use `qrcode-generator`. Error correction level param accepts `'L'`, `'M'`, `'Q'`, `'H'` (default `'M'`). Use typeNumber `0` for auto-sizing.
- [ ] Create `src/renderer.js`: export `render(matrix, options)` that returns an SVG string. Options: `{ fg: '#000000', bg: '#ffffff', size: 256, transparent: false }`. Each module is a `<rect>`. Background is a full-size `<rect>` (omitted when transparent). SVG should have a `viewBox` and no fixed width/height (scales to container).
- [ ] Wire into `src/main.js`: on page load, encode a hardcoded test string and render the SVG into the preview container.

**Done when:** opening the app shows a scannable QR code rendered as SVG.

---

## Task 3: User Input + Live Preview

Make it interactive.

- [ ] Add to `index.html`: a `<textarea>` for input text, preview `<div>` for the QR code
- [ ] In `src/main.js`: listen to `input` event on the textarea, re-run encode → render → update preview on every keystroke
- [ ] Handle empty input gracefully (clear preview, no errors)
- [ ] Style the layout: input on the left, preview on the right (stack vertically on mobile). Keep it clean and minimal.

**Done when:** typing in the textarea instantly updates the QR code preview.

---

## Task 4: Customisation Controls

Colour and error correction options.

- [ ] Add to `index.html`: colour picker for foreground, colour picker for background, checkbox for transparent background, `<select>` for error correction level (L/M/Q/H with human-readable labels)
- [ ] Wire controls in `main.js`: read current values, pass to `render()`. Re-render on any change.
- [ ] When "transparent background" is checked: disable the background colour picker, pass `transparent: true` to renderer
- [ ] Style controls as a settings panel below the input or in a sidebar

**Done when:** changing colours/EC level instantly updates the preview. Transparent background works.

---

## Task 5: Contrast Warning

Alert users when their colour choices produce an unscannable QR code.

- [ ] Create `src/contrast.js`: export `contrastRatio(color1, color2)` that calculates WCAG 2.0 contrast ratio between two hex colours. Export `checkContrast(fg, bg, transparent)` that returns `{ ratio, pass }`. Minimum ratio for QR readability: 3:1 (lower than WCAG AA text, but QR codes are more tolerant). When transparent, check against white (#ffffff) as assumed background.
- [ ] Show/hide a warning message near the preview when contrast is insufficient
- [ ] Run the check on every colour change

**Done when:** setting fg and bg to similar colours shows a warning. Setting them far apart hides it.

---

## Task 6: SVG Export (Copy to Clipboard)

- [ ] Create `src/export.js`: export `copySvg(svgString)` using `navigator.clipboard.writeText()`
- [ ] Add a "Copy SVG" button to `index.html`
- [ ] Wire the button in `main.js`. Show brief feedback on success ("Copied!") or error
- [ ] Handle the case where clipboard API is unavailable (show error message)

**Done when:** clicking "Copy SVG" puts valid SVG markup on the clipboard that can be pasted into a design tool.

---

## Task 7: PNG Export (Download)

- [ ] In `src/export.js`: export `downloadPng(svgString, resolution)`. Steps: create Image from SVG blob URL → draw to offscreen canvas at `size * resolution` → `canvas.toBlob('image/png')` → create download link → click → revoke URLs.
- [ ] Add to `index.html`: a "Download PNG" button and a resolution selector (`1x`, `2x`, `4x`, with option for custom px value)
- [ ] Wire in `main.js`
- [ ] Ensure transparent background is preserved in PNG output (don't fill canvas white)

**Done when:** clicking "Download PNG" saves a crisp PNG file. 4x produces a visibly larger/sharper image than 1x. Transparent background works.

---

## Task 8: Polish + Deploy

- [ ] Responsive layout: test on mobile widths, fix any overflow or usability issues
- [ ] Add a brief tagline/description on the page ("Private QR codes. Nothing leaves your browser.")
- [ ] Keyboard accessibility: all controls reachable via tab, buttons activatable via enter
- [ ] Add GitHub Pages deploy workflow (`.github/workflows/deploy.yml`) using `actions/deploy-pages`
- [ ] Final check: scan generated QR codes with a phone camera to verify they work across all EC levels and colour combos

**Done when:** the app is deployed to GitHub Pages and fully functional.
