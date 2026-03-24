/**
 * Render a QR matrix as an SVG string.
 * @param {boolean[][]} matrix
 * @param {{ fg?: string, bg?: string, transparent?: boolean, margin?: number }} options
 * @returns {string} SVG markup
 */
export function render(matrix, options = {}) {
  const { fg = '#000000', bg = '#ffffff', transparent = false, margin = 4 } = options
  const count = matrix.length
  const size = count + margin * 2
  // Each module is 1 unit; viewBox expands by margin on all sides
  const rects = []

  if (!transparent) {
    rects.push(`<rect x="${-margin}" y="${-margin}" width="${size}" height="${size}" fill="${bg}"/>`)
  }

  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (matrix[row][col]) {
        rects.push(`<rect x="${col}" y="${row}" width="1" height="1" fill="${fg}"/>`)
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-margin} ${-margin} ${size} ${size}" shape-rendering="crispEdges" aria-hidden="true">${rects.join('')}</svg>`
}
