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
  const titleOverrides = {
    'design-bad-michael-jackson': 'BAD · Michael Jackson',
    'design-bad-tipografia': 'BAD · Tipografía',
    'diseño1': 'Diseño 1',
    'diseño 2': 'Diseño 2',
  }
  if (titleOverrides[base]) return titleOverrides[base]
  if (/^\d+$/.test(base)) return `Diseño ${base}`
  return base
    .replace(/\s*Hoodies?\s*$/i, '')
    .replace(/\s*T[- ]?shirts?\s*$/i, '')
    .replace(/\s*Album Cover\s*$/i, '')
    .replace(/\s*\(1\)\s*$/, '')
    .trim()
}

function isFeaturedDesign(filename) {
  const base = filename.replace(/\.[^.]+$/, '').toLowerCase()
  return (
    base.startsWith('diseño') ||
    base.startsWith('diseno') ||
    base.startsWith('design-')
  )
}

const FEATURED_ORDER = [
  'design-bad-michael-jackson.png',
  'design-bad-tipografia.png',
]

function featuredSortRank(src) {
  const index = FEATURED_ORDER.findIndex(
    (name) => src.includes(name) || src.includes(encodeURIComponent(name)),
  )
  return index === -1 ? 999 : index
}

function inferDesignCategory(filename) {
  const n = filename.toLowerCase()
  if (/^\d+\.png$/i.test(filename)) return 'otros'
  if (/deporte|capucha deporte|buzo con capucha/.test(n)) return 'deportes'
  if (/michael|jackson|\bbad\b|ivancho/.test(n)) return 'streetwear'
  if (/anime|japanese|japan|dragon|chinese|waves/.test(n)) {
    return 'anime-japanese'
  }
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
    const entry = {
      id: `canva-${slugFromFilename(file)}`,
      title: shortTitle(file),
      src: `/gallery/sin-fondo/imagenes/${encodeURIComponent(file)}`,
      category: inferDesignCategory(file),
    }
    if (isFeaturedDesign(file)) entry.featured = true
    designs.push(entry)
  }

  designs.sort((a, b) => {
    if (a.featured && !b.featured) return -1
    if (!a.featured && b.featured) return 1
    if (a.featured && b.featured) {
      return featuredSortRank(a.src) - featuredSortRank(b.src)
    }
    return 0
  })

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
