#!/usr/bin/env node
/**
 * Copia mockups de `mockup editor/` → public/mockup/unisex/
 * Una imagen por color (blanco, negro, beige, gris) y vista (frontal, espalda).
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const SRC = path.join(ROOT, 'mockup editor')
const DEST = path.join(ROOT, 'public', 'mockup', 'unisex')

/** nombre en carpeta fuente → nombre público */
const FILE_MAP = {
  'blanco frontal.webp': 'white-front.webp',
  'blanco espalda.webp': 'white-back.webp',
  'negro frontal.webp': 'black-front.webp',
  'negro espalda.webp': 'black-back.webp',
  'beige frontal.webp': 'beige-front.webp',
  'beige espalda.webp': 'beige-back.webp',
  'gris frontal.webp': 'gray-front.webp',
  'gris espalda.webp': 'gray-back.webp',
}

function main() {
  if (!fs.existsSync(SRC)) {
    console.error('No existe la carpeta:', SRC)
    process.exit(1)
  }

  fs.mkdirSync(DEST, { recursive: true })

  let copied = 0
  for (const [srcName, destName] of Object.entries(FILE_MAP)) {
    const from = path.join(SRC, srcName)
    const to = path.join(DEST, destName)
    if (!fs.existsSync(from)) {
      console.warn('  omitido (no encontrado):', srcName)
      continue
    }
    fs.copyFileSync(from, to)
    console.log('  ✓', destName)
    copied++
  }

  console.log(`\nListo: ${copied} mockups en public/mockup/unisex/`)
}

main()
