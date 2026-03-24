# QR Cranker

Easy, private, reliable QR codes — a static front-end app deployed on GitHub Pages.

## Features

- Live preview as you type
- Customise foreground and background colours
- Transparent background option
- Error correction level (low, medium, quartile, high)
- Quiet zone preference (none, minimal, standard, wide)
- Contrast warning when colours may affect scannability
- Export as SVG (copy to clipboard) or PNG (512p×, 1024p×, 2048p×)

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

The built app is served from `/qr-cranker/` (configured in `vite.config.js`).
