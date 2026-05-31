/**
 * Genera src/data/catalog-manifest.json solo con PNG que existen en sin-fondo/.
 * Ejecutar tras borrar imágenes o tras npm run process-designs
 */
import fs from 'fs'
import path from 'path'

const SIN_FONDO = path.join(process.cwd(), 'public', 'gallery', 'sin-fondo')
const OUT = path.join(process.cwd(), 'src', 'data', 'catalog-manifest.json')

function slugFromFilename(name) {
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 80)
}

function shortTitle(filename) {
  const base = filename.replace(/\.[^.]+$/, '')
  if (/^\d+$/.test(base)) return `Diseño ${base}`
  return base
    .replace(/\s*Hoodies?\s*$/i, '')
    .replace(/\s*T[- ]?shirts?\s*$/i, '')
    .replace(/\s*Album Cover\s*$/i, '')
    .replace(/\s*\(1\)\s*$/, '')
    .trim()
}

function inferDesignCategory(filename) {
  const n = filename.toLowerCase()
  if (/^\d+\.png$/i.test(filename)) return 'otros'
  if (/deporte|capucha deporte|buzo con capucha/.test(n)) return 'deportes'
  if (/anime|japanese|japan|dragon|chinese|waves/.test(n)) return 'anime-japanese'
  if (/retro|groovy|pixel/.test(n)) return 'retro'
  if (/gaming|game|\btech\b|3d tech/.test(n)) return 'gaming-tech'
  if (/coffee|doodle|cute|teddy|magia|dama de honor|flower illustrative/.test(n)) {
    return 'cute-illustration'
  }
  if (/typography|monospaced|campfire/.test(n) && !/streetwear|gaming/.test(n)) {
    return 'minimal-text'
  }
  if (
    /streetwear|futuristic|eternal|angels|aesthetic|modern bold|minimalist streetwear|abstarct|graphic|lion|tiger|house music/.test(
      n,
    )
  ) {
    return 'streetwear'
  }
  return 'otros'
}

function listPng(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.png'))
}

function main() {
  const designs = []
  let legacyIndex = 0

  for (const file of listPng(path.join(SIN_FONDO, 'imagenes'))) {
    designs.push({
      id: `canva-${slugFromFilename(file)}`,
      title: shortTitle(file),
      src: `/gallery/sin-fondo/imagenes/${encodeURIComponent(file)}`,
      category: inferDesignCategory(file),
    })
  }

  for (const file of listPng(path.join(SIN_FONDO, 'presets')).sort()) {
    legacyIndex += 1
    const base = file.replace(/\.[^.]+$/, '')
    designs.push({
      id: `legacy-${base}`,
      title: `Diseño ${legacyIndex}`,
      src: `/gallery/sin-fondo/presets/${file}`,
      category: 'clasico',
    })
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), designs }, null, 2))
  console.log(`Catálogo: ${designs.length} diseños → ${OUT}`)
}

main()
