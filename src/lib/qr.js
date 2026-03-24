import qrcode from 'qrcode-generator'

/**
 * Encode text into a QR matrix.
 * @param {string} text
 * @param {'L'|'M'|'Q'|'H'} errorCorrectionLevel
 * @returns {boolean[][]} 2D array where true = dark module
 */
export function encode(text, errorCorrectionLevel = 'M') {
  const qr = qrcode(0, errorCorrectionLevel)
  qr.addData(text)
  qr.make()

  const size = qr.getModuleCount()
  const matrix = []
  for (let row = 0; row < size; row++) {
    matrix[row] = []
    for (let col = 0; col < size; col++) {
      matrix[row][col] = qr.isDark(row, col)
    }
  }
  return matrix
}
