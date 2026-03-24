# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QR Cranker is a privacy-first, front-end-only QR code generator deployed via GitHub Pages. Key constraints:
- **No backend**: pure client-side, no server, no database, no URL params for data
- **No tracking**: no identifying analytics, no data storage
- **Static hosting**: must work as a static site on GitHub Pages

## Architecture

This is a front-end-only static web app. When source code is added, expect:
- Input → QR encode → SVG/bitmap render pipeline
- All state kept in-memory (never persisted or URL-encoded)
- Export as SVG or bitmap without server round-trips

## Planned Features (from README)

- QR code generation with appearance customisation
- Safe area options aligned to QR spec
- Contrast ratio validation (alert if customisation breaks spec)
- SVG copy and bitmap download
- Transparent background and foreground colour support
- Encoding optimisation for input text
- Analytics (traffic only, nothing identifying)
