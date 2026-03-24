import './style.css'
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

let currentSvg = ''

function getOptions() {
  return {
    fg: fgColour.value,
    bg: bgColour.value,
    transparent: transparentBg.checked,
  }
}

function setExportEnabled(enabled) {
  copySvgBtn.disabled = !enabled
  downloadPngBtn.disabled = !enabled
}

function update() {
  const text = textInput.value.trim()
  if (!text) {
    qrPreview.innerHTML = ''
    currentSvg = ''
    setExportEnabled(false)
    return
  }
  const options = getOptions()
  const matrix = encode(text, ecLevel.value)
  currentSvg = render(matrix, options)
  qrPreview.innerHTML = currentSvg
  setExportEnabled(true)

  const { pass } = checkContrast(options.fg, options.bg, options.transparent)
  contrastWarning.hidden = pass
}

transparentBg.addEventListener('change', () => {
  bgColour.disabled = transparentBg.checked
  update()
})

textInput.addEventListener('input', update)
fgColour.addEventListener('input', update)
bgColour.addEventListener('input', update)
ecLevel.addEventListener('change', update)

copySvgBtn.addEventListener('click', async () => {
  if (!currentSvg) return
  try {
    await copySvg(currentSvg)
    copySvgFeedback.textContent = 'Copied!'
    copySvgFeedback.hidden = false
    setTimeout(() => { copySvgFeedback.hidden = true }, 2000)
  } catch {
    copySvgFeedback.textContent = 'Copy failed — clipboard unavailable'
    copySvgFeedback.hidden = false
  }
})

downloadPngBtn.addEventListener('click', async () => {
  if (!currentSvg) return
  try {
    await downloadPng(currentSvg, Number(resolutionSelect.value))
  } catch {
    alert('PNG export failed — try a different browser.')
  }
})

update()
