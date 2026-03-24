import { describe, it, expect, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'
import { encode } from '../lib/qr.js'
import { render } from '../lib/renderer.js'

// Note: update() is intentionally duplicated from main.js here.
// These tests exercise encode/render integration via the controls — not main.js wiring.
// If main.js logic changes materially, update this fixture too.

const DEFAULTS = { fg: '#000000', bg: '#ffffff', transparent: false, ecLevel: 'M', quietZone: '4' }

describe('Customisation controls', () => {
  let dom, textInput, qrPreview, fgColour, bgColour, transparentBg, ecLevel, quietZone

  function setupUpdateListener() {
    function update() {
      const text = textInput.value.trim()
      if (!text) { qrPreview.innerHTML = ''; return }
      qrPreview.innerHTML = render(encode(text, ecLevel.value), {
        fg: fgColour.value,
        bg: bgColour.value,
        transparent: transparentBg.checked,
        margin: Number(quietZone.value),
      })
    }
    transparentBg.addEventListener('change', () => { bgColour.disabled = transparentBg.checked; update() })
    textInput.addEventListener('input', update)
    fgColour.addEventListener('input', update)
    bgColour.addEventListener('input', update)
    ecLevel.addEventListener('change', update)
    quietZone.addEventListener('change', update)
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
      <select id="quiet-zone">
        <option value="0">None</option>
        <option value="2">Minimal</option>
        <option value="4" selected>Standard</option>
        <option value="8">Wide</option>
      </select>
    </body></html>`)
    const doc = dom.window.document
    textInput = doc.getElementById('text-input')
    qrPreview = doc.getElementById('qr-preview')
    fgColour = doc.getElementById('fg-colour')
    bgColour = doc.getElementById('bg-colour')
    transparentBg = doc.getElementById('transparent-bg')
    ecLevel = doc.getElementById('ec-level')
    quietZone = doc.getElementById('quiet-zone')
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

describe('Quiet zone control', () => {
  let dom, textInput, qrPreview, fgColour, bgColour, transparentBg, ecLevel, quietZone

  beforeEach(() => {
    dom = new JSDOM(`<!DOCTYPE html><html><body>
      <textarea id="text-input">hello</textarea>
      <div id="qr-preview"></div>
      <input type="color" id="fg-colour" value="#000000" />
      <input type="color" id="bg-colour" value="#ffffff" />
      <input type="checkbox" id="transparent-bg" />
      <select id="ec-level">
        <option value="M" selected>M</option>
      </select>
      <select id="quiet-zone">
        <option value="0">None</option>
        <option value="2">Minimal</option>
        <option value="4" selected>Standard</option>
        <option value="8">Wide</option>
      </select>
    </body></html>`)
    const doc = dom.window.document
    textInput = doc.getElementById('text-input')
    qrPreview = doc.getElementById('qr-preview')
    fgColour = doc.getElementById('fg-colour')
    bgColour = doc.getElementById('bg-colour')
    transparentBg = doc.getElementById('transparent-bg')
    ecLevel = doc.getElementById('ec-level')
    quietZone = doc.getElementById('quiet-zone')

    function update() {
      const text = textInput.value.trim()
      if (!text) { qrPreview.innerHTML = ''; return }
      qrPreview.innerHTML = render(encode(text, ecLevel.value), {
        fg: fgColour.value,
        bg: bgColour.value,
        transparent: transparentBg.checked,
        margin: Number(quietZone.value),
      })
    }
    quietZone.addEventListener('change', update)
    update()
  })

  it('quiet zone 0 produces viewBox starting at "0 0"', () => {
    quietZone.value = '0'
    quietZone.dispatchEvent(new dom.window.Event('change'))
    expect(qrPreview.innerHTML).toContain('viewBox="0 0')
  })

  it('quiet zone 8 produces viewBox starting at "-8 -8"', () => {
    quietZone.value = '8'
    quietZone.dispatchEvent(new dom.window.Event('change'))
    expect(qrPreview.innerHTML).toContain('viewBox="-8 -8')
  })

  it('larger quiet zone produces a larger viewBox total size', () => {
    quietZone.value = '2'
    quietZone.dispatchEvent(new dom.window.Event('change'))
    const sizeSmall = parseInt(qrPreview.innerHTML.match(/viewBox="-?\d+ -?\d+ (\d+)/)[1])

    quietZone.value = '8'
    quietZone.dispatchEvent(new dom.window.Event('change'))
    const sizeLarge = parseInt(qrPreview.innerHTML.match(/viewBox="-?\d+ -?\d+ (\d+)/)[1])

    expect(sizeLarge).toBeGreaterThan(sizeSmall)
  })
})

describe('Reset button', () => {
  let dom, textInput, qrPreview, fgColour, bgColour, transparentBg, ecLevel, quietZone, resetBtn

  function syncResetVisibility() {
    resetBtn.hidden = (
      fgColour.value === DEFAULTS.fg &&
      bgColour.value === DEFAULTS.bg &&
      transparentBg.checked === DEFAULTS.transparent &&
      ecLevel.value === DEFAULTS.ecLevel &&
      quietZone.value === DEFAULTS.quietZone
    )
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
      <select id="quiet-zone">
        <option value="0">None</option>
        <option value="2">Minimal</option>
        <option value="4" selected>Standard</option>
        <option value="8">Wide</option>
      </select>
      <button id="reset-btn" hidden>Reset</button>
    </body></html>`)
    const doc = dom.window.document
    textInput = doc.getElementById('text-input')
    qrPreview = doc.getElementById('qr-preview')
    fgColour = doc.getElementById('fg-colour')
    bgColour = doc.getElementById('bg-colour')
    transparentBg = doc.getElementById('transparent-bg')
    ecLevel = doc.getElementById('ec-level')
    quietZone = doc.getElementById('quiet-zone')
    resetBtn = doc.getElementById('reset-btn')

    function update() {
      const text = textInput.value.trim()
      if (!text) { qrPreview.innerHTML = ''; return }
      qrPreview.innerHTML = render(encode(text, ecLevel.value), {
        fg: fgColour.value,
        bg: bgColour.value,
        transparent: transparentBg.checked,
        margin: Number(quietZone.value),
      })
      syncResetVisibility()
    }

    fgColour.addEventListener('input', update)
    bgColour.addEventListener('input', update)
    transparentBg.addEventListener('change', () => { bgColour.disabled = transparentBg.checked; update() })
    ecLevel.addEventListener('change', update)
    quietZone.addEventListener('change', update)

    resetBtn.addEventListener('click', () => {
      fgColour.value = DEFAULTS.fg
      bgColour.value = DEFAULTS.bg
      transparentBg.checked = DEFAULTS.transparent
      bgColour.disabled = false
      ecLevel.value = DEFAULTS.ecLevel
      quietZone.value = DEFAULTS.quietZone
      update()
    })

    update()
  })

  it('reset button is hidden when all controls are at defaults', () => {
    expect(resetBtn.hidden).toBe(true)
  })

  it('reset button becomes visible when fg is changed', () => {
    fgColour.value = '#ff0000'
    fgColour.dispatchEvent(new dom.window.Event('input'))
    expect(resetBtn.hidden).toBe(false)
  })

  it('reset button becomes visible when ec level is changed', () => {
    ecLevel.value = 'H'
    ecLevel.dispatchEvent(new dom.window.Event('change'))
    expect(resetBtn.hidden).toBe(false)
  })

  it('clicking reset restores all controls to defaults', () => {
    fgColour.value = '#ff0000'
    fgColour.dispatchEvent(new dom.window.Event('input'))
    bgColour.value = '#0000ff'
    bgColour.dispatchEvent(new dom.window.Event('input'))
    ecLevel.value = 'H'
    ecLevel.dispatchEvent(new dom.window.Event('change'))
    quietZone.value = '0'
    quietZone.dispatchEvent(new dom.window.Event('change'))

    resetBtn.dispatchEvent(new dom.window.Event('click'))

    expect(fgColour.value).toBe(DEFAULTS.fg)
    expect(bgColour.value).toBe(DEFAULTS.bg)
    expect(transparentBg.checked).toBe(DEFAULTS.transparent)
    expect(ecLevel.value).toBe(DEFAULTS.ecLevel)
    expect(quietZone.value).toBe(DEFAULTS.quietZone)
  })

  it('reset button hides itself after reset to defaults', () => {
    fgColour.value = '#ff0000'
    fgColour.dispatchEvent(new dom.window.Event('input'))
    expect(resetBtn.hidden).toBe(false)

    resetBtn.dispatchEvent(new dom.window.Event('click'))
    expect(resetBtn.hidden).toBe(true)
  })

  it('reset re-enables bg colour picker when transparent was checked', () => {
    transparentBg.checked = true
    transparentBg.dispatchEvent(new dom.window.Event('change'))
    expect(bgColour.disabled).toBe(true)

    resetBtn.dispatchEvent(new dom.window.Event('click'))
    expect(bgColour.disabled).toBe(false)
  })
})
