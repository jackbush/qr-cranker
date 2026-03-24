/**
 * Render a QR matrix as an SVG string.
 * @param {boolean[][]} matrix
 * @param {{ fg?: string, bg?: string, transparent?: boolean }} options
 * @returns {string} SVG markup
 */
export function render(matrix, options = {}) {
  const { fg = '#000000', bg = '#ffffff', transparent = false } = options
  const count = matrix.length
  // Each module is 1 unit; viewBox uses module coordinates directly
  const rects = []

  if (!transparent) {
    rects.push(`<rect width="${count}" height="${count}" fill="${bg}"/>`)
  }

  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (matrix[row][col]) {
        rects.push(`<rect x="${col}" y="${row}" width="1" height="1" fill="${fg}"/>`)
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${count} ${count}" shape-rendering="crispEdges" aria-hidden="true">${rects.join('')}</svg>`
}
