import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { JSDOM } from 'jsdom'

const sampleSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21"></svg>'

// Tests for the copy button UI feedback wiring (mirrors the click handler in main.js)
describe('Copy SVG feedback', () => {
  let dom, copySvgBtn, copySvgFeedback, currentSvg

  beforeEach(() => {
    currentSvg = sampleSvg
    dom = new JSDOM(`<!DOCTYPE html><html><body>
      <button id="copy-svg-btn">Copy SVG to clipboard</button>
      <span id="copy-svg-feedback" hidden></span>
    </body></html>`)
    const doc = dom.window.document
    copySvgBtn = doc.getElementById('copy-svg-btn')
    copySvgFeedback = doc.getElementById('copy-svg-feedback')
  })

  afterEach(() => vi.restoreAllMocks())

  function attachHandler(clipboardImpl) {
    dom.window.navigator.clipboard = clipboardImpl
    copySvgBtn.addEventListener('click', async () => {
      if (!dom.window.navigator.clipboard) {
        copySvgFeedback.textContent = 'Copy failed — clipboard unavailable'
        copySvgFeedback.hidden = false
        return
      }
      try {
        await dom.window.navigator.clipboard.writeText(currentSvg)
        copySvgFeedback.hidden = true
        copySvgBtn.textContent = 'Copied!'
        setTimeout(() => { copySvgBtn.textContent = 'Copy SVG to clipboard' }, 1000)
      } catch {
        copySvgFeedback.textContent = 'Copy failed — clipboard unavailable'
        copySvgFeedback.hidden = false
      }
    })
  }

  it('button text changes to "Copied!" on success', async () => {
    attachHandler({ writeText: vi.fn().mockResolvedValue(undefined) })
    copySvgBtn.dispatchEvent(new dom.window.Event('click'))
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(copySvgBtn.textContent).toBe('Copied!')
  })

  it('feedback span stays hidden on success', async () => {
    attachHandler({ writeText: vi.fn().mockResolvedValue(undefined) })
    copySvgBtn.dispatchEvent(new dom.window.Event('click'))
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(copySvgFeedback.hidden).toBe(true)
  })

  it('feedback span shows error message on failure', async () => {
    attachHandler({ writeText: vi.fn().mockRejectedValue(new Error('Permission denied')) })
    copySvgBtn.dispatchEvent(new dom.window.Event('click'))
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(copySvgFeedback.hidden).toBe(false)
    expect(copySvgFeedback.textContent).toBe('Copy failed — clipboard unavailable')
  })

  it('error feedback is cleared on subsequent success', async () => {
    // First click fails
    attachHandler({ writeText: vi.fn().mockRejectedValue(new Error('denied')) })
    copySvgBtn.dispatchEvent(new dom.window.Event('click'))
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(copySvgFeedback.hidden).toBe(false)

    // Swap to working clipboard and click again
    dom.window.navigator.clipboard = { writeText: vi.fn().mockResolvedValue(undefined) }
    copySvgBtn.dispatchEvent(new dom.window.Event('click'))
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(copySvgFeedback.hidden).toBe(true)
  })
})
