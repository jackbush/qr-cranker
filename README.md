# QR Cranker

Easy, private, reliable QR codes — a static front-end app deployed on GitHub Pages.

## Features

- Live preview as you type
- Customise foreground and background colours
- Transparent background option
- Error correction level (L / M / Q / H)
- Contrast warning when colours may affect scannability
- Export as SVG (copy to clipboard) or PNG (1×, 2×, 4×)

## Privacy

Everything runs in the browser. No data is sent anywhere, stored, or put in URL params.

## Development

```sh
npm install
npm run dev      # dev server at http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the production build locally
npm test         # run all tests
```

## Deployment

The app deploys automatically to GitHub Pages on push to `main` via `.github/workflows/deploy.yml`.

**First-time setup:** go to Settings → Pages → Source and select **GitHub Actions**.

The built app is served from `/qr-cranker/` (configured in `vite.config.js`).

## To do branding

- add a customisation parameter to control the ampunt of safe space
- the tagline is too small, bump the size up while 
- The tagline and labels are in a tiny all-caps style. it looks good but isn't legible enough, make it more legible while keeping the character of the design
- The inputs in customise section are misaligned, give them all the same left-alignement so they line up nicely
- 


## To do features

- resolution: change from 1x, 2x, 4x to pixel sizes (64px, 128px, 256px)
- pair the download/copy buttons with the preview add an empty state with instructions to add some text on the left to get a preview
- on colour input, allow full rbg space -- currently greyscale
- on error correction, add some explainer on what this does and what's recommended
- add a safe area slider with recommended default set to relevant ISO standard