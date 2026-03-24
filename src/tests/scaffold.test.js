// @vitest-environment node
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { describe, it, expect } from 'vitest'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const root = resolve(__dirname, '../..')

describe('Project scaffolding', () => {
  const html = readFileSync(resolve(root, 'index.html'), 'utf-8')

  it('index.html has title "QR Cranker"', () => {
    expect(html).toContain('<title>QR Cranker</title>')
  })

  it('index.html has h1 "QR Cranker"', () => {
    expect(html).toContain('<h1>QR Cranker</h1>')
  })

  it('index.html references main.js entry point', () => {
    expect(html).toContain('src="/src/main.js"')
  })

  it('package.json has required scripts', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8'))
    expect(pkg.scripts.dev).toBe('vite')
    expect(pkg.scripts.build).toBe('vite build')
    expect(pkg.scripts.preview).toBe('vite preview')
  })
})
