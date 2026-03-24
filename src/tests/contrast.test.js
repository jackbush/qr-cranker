import { describe, it, expect } from 'vitest'
import { contrastRatio, checkContrast } from '../lib/contrast.js'

describe('contrastRatio()', () => {
  it('black on white has maximum contrast ~21:1', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0)
  })

  it('white on white has minimum contrast 1:1', () => {
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5)
  })

  it('is symmetrical (order does not matter)', () => {
    expect(contrastRatio('#ff0000', '#ffffff')).toBeCloseTo(contrastRatio('#ffffff', '#ff0000'), 10)
  })

  it('returns a number between 1 and 21', () => {
    const ratio = contrastRatio('#888888', '#444444')
    expect(ratio).toBeGreaterThanOrEqual(1)
    expect(ratio).toBeLessThanOrEqual(21)
  })

  it('accepts shorthand hex (#fff)', () => {
    expect(contrastRatio('#000', '#fff')).toBeCloseTo(21, 0)
  })
})

describe('checkContrast()', () => {
  it('passes for black on white', () => {
    expect(checkContrast('#000000', '#ffffff').pass).toBe(true)
  })

  it('fails for very similar colours', () => {
    expect(checkContrast('#888888', '#999999').pass).toBe(false)
  })

  it('returns the numeric ratio', () => {
    const { ratio } = checkContrast('#000000', '#ffffff')
    expect(typeof ratio).toBe('number')
    expect(ratio).toBeGreaterThan(1)
  })

  it('uses white as assumed bg when transparent=true', () => {
    expect(checkContrast('#000000', '#000000', true).pass).toBe(true)
    expect(checkContrast('#ffffff', '#000000', true).pass).toBe(false)
  })

  it('minimum threshold is 3:1', () => {
    expect(checkContrast('#888888', '#999999').ratio).toBeLessThan(3)
    expect(checkContrast('#000000', '#ffffff').ratio).toBeGreaterThan(3)
  })
})
