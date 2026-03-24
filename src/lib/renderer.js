const HEX_RE = /^#(?:[0-9a-fA-F]{3}){1,2}$/

function sanitiseHex(value, fallback) {
  return HEX_RE.test(value) ? value : fallback
}

/**
 * Render a QR matrix as an SVG string.
 * @param {boolean[][]} matrix
 * @param {{ fg?: string, bg?: string, transparent?: boolean, margin?: number }} options
 * @returns {string} SVG markup
 */
export function render(matrix, options = {}) {
  const { transparent = false, margin = 4 } = options
  const fg = sanitiseHex(options.fg, '#000000')
  const bg = sanitiseHex(options.bg, '#ffffff')
  const count = matrix.length
  const size = count + margin * 2
  // Each module is 1 unit; viewBox expands by margin on all sides
  const rects = []

  if (!transparent) {
    rects.push(`<rect x="${-margin}" y="${-margin}" width="${size}" height="${size}" fill="${bg}"/>`)
  }

  for (let row = 0; row < count; row++) {
    let col = 0
    while (col < count) {
      if (matrix[row][col]) {
        const start = col
        while (col < count && matrix[row][col]) col++
        rects.push(`<rect x="${start}" y="${row}" width="${col - start}" height="1" fill="${fg}"/>`)
      } else {
        col++
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-margin} ${-margin} ${size} ${size}" shape-rendering="crispEdges" aria-hidden="true">${rects.join('')}</svg>`
}
