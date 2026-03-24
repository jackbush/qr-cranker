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
})
