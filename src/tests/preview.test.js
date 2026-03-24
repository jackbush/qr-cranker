import { describe, it, expect, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'
import { encode } from '../lib/qr.js'
import { render } from '../lib/renderer.js'

describe('Live preview', () => {
  let dom, textInput, qrPreview

  beforeEach(() => {
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html><body>
        <textarea id="text-input"></textarea>
        <div id="qr-preview"></div>
      </body></html>
    `)
    textInput = dom.window.document.getElementById('text-input')
    qrPreview = dom.window.document.getElementById('qr-preview')

    function update() {
      const text = textInput.value.trim()
      qrPreview.innerHTML = text ? render(encode(text)) : ''
    }
    textInput.addEventListener('input', update)
  })

  it('preview is empty on load with no input', () => {
    expect(qrPreview.innerHTML).toBe('')
  })

  it('typing text renders an SVG into the preview', () => {
    textInput.value = 'https://example.com'
    textInput.dispatchEvent(new dom.window.Event('input'))
    expect(qrPreview.innerHTML).toContain('<svg')
  })

  it('clearing input removes the SVG', () => {
    textInput.value = 'hello'
    textInput.dispatchEvent(new dom.window.Event('input'))
    textInput.value = ''
    textInput.dispatchEvent(new dom.window.Event('input'))
    expect(qrPreview.innerHTML).toBe('')
  })

  it('changing text updates the SVG', () => {
    textInput.value = 'hello'
    textInput.dispatchEvent(new dom.window.Event('input'))
    const first = qrPreview.innerHTML

    textInput.value = 'a very different and longer string that will produce a different qr code'
    textInput.dispatchEvent(new dom.window.Event('input'))

    expect(qrPreview.innerHTML).not.toBe(first)
  })

  it('whitespace-only input clears the preview', () => {
    textInput.value = '   '
    textInput.dispatchEvent(new dom.window.Event('input'))
    expect(qrPreview.innerHTML).toBe('')
  })
})
