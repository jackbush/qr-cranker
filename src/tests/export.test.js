import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { copySvg, downloadPng } from '../lib/export.js'

const sampleSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21"><rect width="21" height="21" fill="#000000"/></svg>'

describe('copySvg()', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  afterEach(() => vi.unstubAllGlobals())

  it('calls clipboard.writeText with the SVG string', async () => {
    await copySvg(sampleSvg)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(sampleSvg)
  })

  it('calls clipboard.writeText exactly once', async () => {
    await copySvg(sampleSvg)
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1)
  })

  it('resolves without error on success', async () => {
    await expect(copySvg(sampleSvg)).resolves.toBeUndefined()
  })

  it('throws when clipboard API is unavailable', async () => {
    vi.stubGlobal('navigator', {})
    await expect(copySvg(sampleSvg)).rejects.toThrow('Clipboard API not available')
  })

  it('propagates clipboard write failures', async () => {
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('Permission denied')) },
    })
    await expect(copySvg(sampleSvg)).rejects.toThrow('Permission denied')
  })
})

describe('downloadPng()', () => {
  let canvasWidth, canvasHeight, anchorClicked, anchorDownloadAttr

  beforeEach(() => {
    anchorClicked = false

    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    })

    const mockCanvas = {
      get width() { return canvasWidth },
      set width(v) { canvasWidth = v },
      get height() { return canvasHeight },
      set height(v) { canvasHeight = v },
      getContext: vi.fn(() => ({
        drawImage: vi.fn(),
      })),
      toBlob: vi.fn((cb) => cb(new Blob(['png'], { type: 'image/png' }))),
    }

    vi.stubGlobal('document', {
      createElement: vi.fn((tag) => {
        if (tag === 'canvas') return mockCanvas
        if (tag === 'a') {
          const a = { href: '', download: '', click: vi.fn(() => { anchorClicked = true; anchorDownloadAttr = a.download }) }
          return a
        }
        return {}
      }),
    })

    vi.stubGlobal('Image', class {
      set src(_url) { setTimeout(() => this.onload && this.onload(), 0) }
    })
  })

  afterEach(() => vi.unstubAllGlobals())

  it('triggers a download (anchor click)', async () => {
    await downloadPng(sampleSvg, 1)
    expect(anchorClicked).toBe(true)
  })

  it('sets download filename to qr-code.png', async () => {
    await downloadPng(sampleSvg, 1)
    expect(anchorDownloadAttr).toBe('qr-code.png')
  })

  it('canvas size is baseSize × resolution', async () => {
    await downloadPng(sampleSvg, 2, 512)
    expect(canvasWidth).toBe(1024)
    expect(canvasHeight).toBe(1024)
  })

  it('4× resolution produces a larger canvas than 1×', async () => {
    await downloadPng(sampleSvg, 1, 512)
    const size1x = canvasWidth
    await downloadPng(sampleSvg, 4, 512)
    expect(canvasWidth).toBeGreaterThan(size1x)
  })

  it('does NOT fill canvas background (preserves transparency)', async () => {
    await downloadPng(sampleSvg, 1)
    const ctx = document.createElement('canvas').getContext()
    expect(ctx.fillRect).toBeUndefined()
  })

  it('revokes the SVG object URL after use', async () => {
    await downloadPng(sampleSvg, 1)
    expect(URL.revokeObjectURL).toHaveBeenCalled()
  })
})
