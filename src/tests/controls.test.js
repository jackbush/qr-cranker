import { describe, it, expect, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'
import { encode } from '../lib/qr.js'
import { render } from '../lib/renderer.js'

describe('Customisation controls', () => {
  let dom, textInput, qrPreview, fgColour, bgColour, transparentBg, ecLevel

  function setupUpdateListener() {
    function update() {
      const text = textInput.value.trim()
      if (!text) { qrPreview.innerHTML = ''; return }
      qrPreview.innerHTML = render(encode(text, ecLevel.value), {
        fg: fgColour.value,
        bg: bgColour.value,
        transparent: transparentBg.checked,
      })
    }
    transparentBg.addEventListener('change', () => { bgColour.disabled = transparentBg.checked; update() })
    textInput.addEventListener('input', update)
    fgColour.addEventListener('input', update)
    bgColour.addEventListener('input', update)
    ecLevel.addEventListener('change', update)
    return update
  }

  beforeEach(() => {
    dom = new JSDOM(`<!DOCTYPE html><html><body>
      <textarea id="text-input">hello</textarea>
      <div id="qr-preview"></div>
      <input type="color" id="fg-colour" value="#000000" />
      <input type="color" id="bg-colour" value="#ffffff" />
      <input type="checkbox" id="transparent-bg" />
      <select id="ec-level">
        <option value="L">L</option>
        <option value="M" selected>M</option>
        <option value="Q">Q</option>
        <option value="H">H</option>
      </select>
    </body></html>`)
    const doc = dom.window.document
    textInput = doc.getElementById('text-input')
    qrPreview = doc.getElementById('qr-preview')
    fgColour = doc.getElementById('fg-colour')
    bgColour = doc.getElementById('bg-colour')
    transparentBg = doc.getElementById('transparent-bg')
    ecLevel = doc.getElementById('ec-level')
    setupUpdateListener()()
  })

  it('initial render uses default fg and bg colours', () => {
    expect(qrPreview.innerHTML).toContain('fill="#000000"')
    expect(qrPreview.innerHTML).toContain('fill="#ffffff"')
  })

  it('changing fg colour updates the SVG', () => {
    fgColour.value = '#ff0000'
    fgColour.dispatchEvent(new dom.window.Event('input'))
    expect(qrPreview.innerHTML).toContain('fill="#ff0000"')
  })

  it('changing bg colour updates the SVG', () => {
    bgColour.value = '#0000ff'
    bgColour.dispatchEvent(new dom.window.Event('input'))
    expect(qrPreview.innerHTML).toContain('fill="#0000ff"')
  })

  it('checking transparent removes bg rect from SVG', () => {
    transparentBg.checked = true
    transparentBg.dispatchEvent(new dom.window.Event('change'))
    expect(qrPreview.innerHTML).not.toContain('fill="#ffffff"')
  })

  it('checking transparent disables the bg colour picker', () => {
    transparentBg.checked = true
    transparentBg.dispatchEvent(new dom.window.Event('change'))
    expect(bgColour.disabled).toBe(true)
  })

  it('unchecking transparent re-enables the bg colour picker', () => {
    transparentBg.checked = true
    transparentBg.dispatchEvent(new dom.window.Event('change'))
    transparentBg.checked = false
    transparentBg.dispatchEvent(new dom.window.Event('change'))
    expect(bgColour.disabled).toBe(false)
  })

  it('changing EC level produces a different (potentially larger) QR code', () => {
    ecLevel.value = 'L'
    ecLevel.dispatchEvent(new dom.window.Event('change'))
    const sizeL = parseInt(qrPreview.innerHTML.match(/viewBox="-?\d+ -?\d+ (\d+)/)[1])

    ecLevel.value = 'H'
    ecLevel.dispatchEvent(new dom.window.Event('change'))
    const sizeH = parseInt(qrPreview.innerHTML.match(/viewBox="-?\d+ -?\d+ (\d+)/)[1])

    expect(sizeH).toBeGreaterThanOrEqual(sizeL)
  })
})
