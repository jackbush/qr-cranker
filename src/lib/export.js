/**
 * Copy an SVG string to the clipboard.
 * @param {string} svgString
 * @returns {Promise<void>}
 */
export async function copySvg(svgString) {
  if (!navigator.clipboard) {
    throw new Error('Clipboard API not available')
  }
  await navigator.clipboard.writeText(svgString)
}

/**
 * Download the QR code as a PNG.
 * @param {string} svgString
 * @param {number} size  output pixel dimension (e.g. 1024 → 1024×1024px)
 * @returns {Promise<void>}
 */
export function downloadPng(svgString, size = 1024) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const img = new Image()

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      // Do NOT fill the canvas — preserves transparency
      ctx.drawImage(img, 0, 0, size, size)
      URL.revokeObjectURL(url)

      canvas.toBlob((pngBlob) => {
        if (!pngBlob) { reject(new Error('Canvas toBlob failed')); return }
        const pngUrl = URL.createObjectURL(pngBlob)
        const a = document.createElement('a')
        a.href = pngUrl
        a.download = 'qr-code.png'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(pngUrl)
        resolve()
      }, 'image/png')
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load SVG as image'))
    }

    img.src = url
  })
}
