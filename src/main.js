import './style.css'
import '@melloware/coloris/dist/coloris.css'
import Coloris from '@melloware/coloris'
import { encode } from './lib/qr.js'
import { render } from './lib/renderer.js'
import { checkContrast } from './lib/contrast.js'
import { copySvg, downloadPng } from './lib/export.js'

const textInput = document.getElementById('text-input')
const qrPreview = document.getElementById('qr-preview')
const fgColour = document.getElementById('fg-colour')
const bgColour = document.getElementById('bg-colour')
const transparentBg = document.getElementById('transparent-bg')
const ecLevel = document.getElementById('ec-level')
const contrastWarning = document.getElementById('contrast-warning')
const copySvgBtn = document.getElementById('copy-svg-btn')
const copySvgFeedback = document.getElementById('copy-svg-feedback')
const downloadPngBtn = document.getElementById('download-png-btn')
const resolutionSelect = document.getElementById('resolution-select')
const quietZone = document.getElementById('quiet-zone')
const resetBtn = document.getElementById('reset-btn')

Coloris.init()
Coloris({ el: '[data-coloris]', format: 'hex', alpha: false })

let currentSvg = ''

// Update colour input value AND sync the Coloris swatch
function setColourValue(input, hex) {
  input.value = hex
  const field = input.closest('.clr-field')
  if (field) field.style.color = hex
}

const DEFAULTS = { fg: '#000000', bg: '#ffffff', transparent: false, ecLevel: 'M', quietZone: '4', resolution: '1024' }

function syncResetVisibility() {
  resetBtn.hidden = (
    fgColour.value === DEFAULTS.fg &&
    bgColour.value === DEFAULTS.bg &&
    transparentBg.checked === DEFAULTS.transparent &&
    ecLevel.value === DEFAULTS.ecLevel &&
    quietZone.value === DEFAULTS.quietZone &&
    resolutionSelect.value === DEFAULTS.resolution
  )
}

function getOptions() {
  return {
    fg: fgColour.value,
    bg: bgColour.value,
    transparent: transparentBg.checked,
    margin: Number(quietZone.value),
  }
}

function setExportEnabled(enabled) {
  const v = enabled ? 'false' : 'true'
  copySvgBtn.setAttribute('aria-disabled', v)
  downloadPngBtn.setAttribute('aria-disabled', v)
}

function update() {
  const text = textInput.value.trim()
  if (!text) {
    qrPreview.innerHTML = ''
    currentSvg = ''
    setExportEnabled(false)
    syncResetVisibility()
    return
  }
  const options = getOptions()
  const matrix = encode(text, ecLevel.value)
  currentSvg = render(matrix, options)
  qrPreview.innerHTML = currentSvg
  setExportEnabled(true)

  const { pass } = checkContrast(options.fg, options.bg, options.transparent)
  contrastWarning.hidden = pass
  syncResetVisibility()
}

transparentBg.addEventListener('change', () => {
  bgColour.disabled = transparentBg.checked
  update()
})

textInput.addEventListener('input', update)
fgColour.addEventListener('input', update)
bgColour.addEventListener('input', update)
ecLevel.addEventListener('change', update)
quietZone.addEventListener('change', update)
resolutionSelect.addEventListener('change', syncResetVisibility)

resetBtn.addEventListener('click', () => {
  setColourValue(fgColour, '#000000')
  setColourValue(bgColour, '#ffffff')
  transparentBg.checked = false
  bgColour.disabled = false
  ecLevel.value = 'M'
  quietZone.value = '4'
  resolutionSelect.value = '1024'
  update()
})

copySvgBtn.addEventListener('click', async () => {
  if (copySvgBtn.getAttribute('aria-disabled') === 'true') return
  try {
    await copySvg(currentSvg)
    copySvgBtn.textContent = 'Copied!'
    setTimeout(() => { copySvgBtn.textContent = 'Copy SVG to clipboard' }, 1000)
  } catch {
    copySvgFeedback.textContent = 'Copy failed — clipboard unavailable'
    copySvgFeedback.hidden = false
  }
})

downloadPngBtn.addEventListener('click', async () => {
  if (downloadPngBtn.getAttribute('aria-disabled') === 'true') return
  try {
    await downloadPng(currentSvg, Number(resolutionSelect.value))
  } catch {
    alert('PNG export failed — try a different browser.')
  }
})

update()
