/**
 * Parse a hex colour string to { r, g, b } 0–255.
 * @param {string} hex  e.g. "#ff0000" or "#f00"
 */
function hexToRgb(hex) {
  const h = hex.replace('#', '')
  const expanded = h.length === 3
    ? h.split('').map(c => c + c).join('')
    : h
  return {
    r: parseInt(expanded.slice(0, 2), 16),
    g: parseInt(expanded.slice(2, 4), 16),
    b: parseInt(expanded.slice(4, 6), 16),
  }
}

/**
 * Calculate relative luminance per WCAG 2.0.
 * @param {{ r: number, g: number, b: number }} rgb
 */
function relativeLuminance({ r, g, b }) {
  const linearise = (c) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * linearise(r) + 0.7152 * linearise(g) + 0.0722 * linearise(b)
}

/**
 * Calculate WCAG 2.0 contrast ratio between two hex colours.
 * @param {string} color1
 * @param {string} color2
 * @returns {number} contrast ratio (1–21)
 */
export function contrastRatio(color1, color2) {
  const l1 = relativeLuminance(hexToRgb(color1))
  const l2 = relativeLuminance(hexToRgb(color2))
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Check whether fg/bg contrast is sufficient for QR scanning.
 * Minimum ratio: 3:1 (QR codes are more tolerant than text).
 * When transparent bg, check fg against white (#ffffff).
 * @param {string} fg
 * @param {string} bg
 * @param {boolean} transparent
 * @returns {{ ratio: number, pass: boolean }}
 */
export function checkContrast(fg, bg, transparent = false) {
  const effectiveBg = transparent ? '#ffffff' : bg
  const ratio = contrastRatio(fg, effectiveBg)
  return { ratio, pass: ratio >= 3 }
}
