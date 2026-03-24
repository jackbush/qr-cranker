import { describe, it, expect } from 'vitest'
import { encode } from '../lib/qr.js'
import { render } from '../lib/renderer.js'

describe('encode()', () => {
  it('returns a 2D boolean array', () => {
    const matrix = encode('hello')
    expect(Array.isArray(matrix)).toBe(true)
    expect(Array.isArray(matrix[0])).toBe(true)
    expect(typeof matrix[0][0]).toBe('boolean')
  })

  it('matrix is square', () => {
    const matrix = encode('hello')
    const size = matrix.length
    expect(size).toBeGreaterThan(0)
    matrix.forEach(row => expect(row.length).toBe(size))
  })

  it('accepts all error correction levels', () => {
    for (const level of ['L', 'M', 'Q', 'H']) {
      const matrix = encode('test', level)
      expect(matrix.length).toBeGreaterThan(0)
    }
  })

  it('higher EC levels produce larger or equal matrices', () => {
    const text = 'test'
    const sizeL = encode(text, 'L').length
    const sizeH = encode(text, 'H').length
    expect(sizeH).toBeGreaterThanOrEqual(sizeL)
  })
})

describe('render()', () => {
  it('returns a string starting with <svg', () => {
    const svg = render(encode('hello'))
    expect(typeof svg).toBe('string')
    expect(svg.startsWith('<svg')).toBe(true)
  })

  it('SVG has a viewBox attribute', () => {
    expect(render(encode('hello'))).toContain('viewBox=')
  })

  it('SVG contains dark module rects with default fg colour', () => {
    expect(render(encode('hello'))).toContain('fill="#000000"')
  })

  it('SVG contains background rect with default bg colour', () => {
    expect(render(encode('hello'))).toContain('fill="#ffffff"')
  })

  it('omits background rect when transparent=true', () => {
    expect(render(encode('hello'), { transparent: true })).not.toContain('fill="#ffffff"')
  })

  it('uses custom fg and bg colours', () => {
    const svg = render(encode('hello'), { fg: '#ff0000', bg: '#0000ff' })
    expect(svg).toContain('fill="#ff0000"')
    expect(svg).toContain('fill="#0000ff"')
  })

  it('has shape-rendering="crispEdges" for sharp pixels', () => {
    expect(render(encode('hello'))).toContain('shape-rendering="crispEdges"')
  })

  it('has aria-hidden="true" so screen readers skip rect enumeration', () => {
    expect(render(encode('hello'))).toContain('aria-hidden="true"')
  })

  it('default margin=4 expands viewBox by 4 modules on each side', () => {
    const matrix = encode('hello')
    const count = matrix.length
    const size = count + 8
    expect(render(matrix)).toContain(`viewBox="-4 -4 ${size} ${size}"`)
  })

  it('margin=0 produces viewBox with no padding', () => {
    const matrix = encode('hello')
    const count = matrix.length
    expect(render(matrix, { margin: 0 })).toContain(`viewBox="0 0 ${count} ${count}"`)
  })

  it('background rect covers the full area including margin', () => {
    const matrix = encode('hello')
    const count = matrix.length
    const size = count + 8
    expect(render(matrix)).toContain(`x="-4" y="-4" width="${size}" height="${size}"`)
  })

  it('falls back to default fg when given an invalid hex', () => {
    const svg = render(encode('hello'), { fg: 'not-a-colour' })
    expect(svg).toContain('fill="#000000"')
  })

  it('falls back to default bg when given an invalid hex', () => {
    const svg = render(encode('hello'), { bg: '"><script>' })
    expect(svg).toContain('fill="#ffffff"')
  })

  it('merges adjacent dark modules into a single wider rect', () => {
    // 5×5 square matrix; row 0 has run-of-3, gap, isolated module
    const matrix = [
      [true, true, true, false, true],
      [false, false, false, false, false],
      [false, false, false, false, false],
      [false, false, false, false, false],
      [false, false, false, false, false],
    ]
    const svg = render(matrix, { margin: 0, transparent: true })
    expect(svg).toContain('x="0" y="0" width="3"')  // merged run of 3
    expect(svg).toContain('x="4" y="0" width="1"')  // isolated module
    // Only 2 fg rects total, not 4
    const fgRects = svg.match(/fill="#000000"/g) ?? []
    expect(fgRects).toHaveLength(2)
  })

  it('produces fewer rects than dark modules for a real QR code', () => {
    const matrix = encode('hello')
    const darkCount = matrix.flat().filter(Boolean).length
    const svg = render(matrix, { margin: 0, transparent: true })
    const rectCount = (svg.match(/<rect/g) ?? []).length
    expect(rectCount).toBeLessThan(darkCount)
  })
})
