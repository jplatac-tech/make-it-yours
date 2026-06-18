/**
 * Genera PNG con fondo transparente en public/gallery/sin-fondo/
 * Ejecutar: npm run process-designs
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const ROOT = path.join(process.cwd(), 'public', 'gallery')
const OUT = path.join(ROOT, 'sin-fondo')
const CATALOG_PHOTOS = path.join(process.cwd(), 'imagenes para catalogo')
const MOCKUP_EDITOR = path.join(process.cwd(), 'mockup editor')

/** PNG del editor → nombre de salida en sin-fondo/imagenes */
const MOCKUP_EDITOR_DESIGNS = [
  {
    file: '95CM IVANCHO HIJO PEDIDO VIERNES 15 MAYO.png',
    out: 'design-bad-michael-jackson.png',
  },
  {
    file: '95CM IVANCHO HIJO PEDIDO VIERNES 15 MAYO (1).png',
    out: 'design-bad-tipografia.png',
  },
]

const SKIP_NAMES = new Set([
  'pecho blanco.jpg',
  'espalda blanco.jpg',
  'front.png',
  'back.png',
])

const RASTER = /\.(png|jpe?g|webp)$/i

function baseName(file) {
  return file.replace(/\.[^.]+$/, '')
}

/** Quita fondos blancos o casi blancos (diseños de catálogo / Canva) */
async function stripNearWhite(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { width, height, channels } = info
  if (channels < 4) throw new Error('expected rgba')

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const spread = Math.max(r, g, b) - Math.min(r, g, b)
    const lum = (r + g + b) / 3

    if (lum >= 248 && spread < 18) {
      data[i + 3] = 0
    } else if (lum >= 228 && spread < 35) {
      const fade = Math.round(((248 - lum) / 20) * 255)
      data[i + 3] = Math.min(data[i + 3], Math.max(0, fade))
    }
  }

  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true })
  await sharp(data, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(outputPath)
}

/** Quita fondos negros o casi negros (diseños del mockup editor) */
async function stripNearBlack(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { width, height, channels } = info
  if (channels < 4) throw new Error('expected rgba')

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const spread = Math.max(r, g, b) - Math.min(r, g, b)
    const lum = (r + g + b) / 3

    if (lum <= 18 && spread < 22) {
      data[i + 3] = 0
    } else if (lum <= 42 && spread < 40) {
      const fade = Math.round((lum / 42) * 255)
      data[i + 3] = Math.min(data[i + 3], Math.max(0, fade))
    }
  }

  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true })
  await sharp(data, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(outputPath)
}

async function processFile(inputPath, outputPath, mode = 'auto') {
  const ext = path.extname(inputPath).toLowerCase()
  if (ext === '.svg') return false

  const meta = await sharp(inputPath).metadata()
  if (mode === 'black') {
    await stripNearBlack(inputPath, outputPath)
    return true
  }

  if (meta.hasAlpha && ext === '.png') {
    const stats = await sharp(inputPath).stats()
    const avg =
      (stats.channels[0].mean +
        stats.channels[1].mean +
        stats.channels[2].mean) /
      3
    if (avg > 240) {
      await stripNearWhite(inputPath, outputPath)
      return true
    }
    await fs.promises.mkdir(path.dirname(outputPath), { recursive: true })
    await sharp(inputPath).png({ compressionLevel: 9 }).toFile(outputPath)
    return true
  }

  await stripNearWhite(inputPath, outputPath)
  return true
}

async function walkDir(inputDir, outSubdir) {
  if (!fs.existsSync(inputDir)) return 0
  let count = 0
  const files = fs.readdirSync(inputDir)
  for (const file of files) {
    if (!RASTER.test(file) || SKIP_NAMES.has(file.toLowerCase())) continue
    const inputPath = path.join(inputDir, file)
    const outputPath = path.join(
      OUT,
      outSubdir,
      `${baseName(file)}.png`,
    )
    try {
      await processFile(inputPath, outputPath)
      console.log('✓', path.relative(ROOT, outputPath))
      count++
    } catch (err) {
      console.error('✗', file, err.message)
    }
  }
  return count
}

/** Borra PNG en sin-fondo si ya no existe ningún original conocido */
function pruneOrphanSinFondo() {
  let removed = 0
  const mockupOutputs = new Set(MOCKUP_EDITOR_DESIGNS.map((row) => row.out))

  for (const sub of ['imagenes', 'presets']) {
    const outDir = path.join(OUT, sub)
    const inDir = path.join(ROOT, sub)
    if (!fs.existsSync(outDir)) continue
    for (const png of fs.readdirSync(outDir)) {
      if (!png.toLowerCase().endsWith('.png')) continue
      if (mockupOutputs.has(png)) continue
      const base = png.replace(/\.[^.]+$/, '')
      const sources = fs.existsSync(inDir)
        ? fs.readdirSync(inDir).filter((f) => f.replace(/\.[^.]+$/, '') === base)
        : []
      const inCatalogPhotos =
        fs.existsSync(CATALOG_PHOTOS) &&
        fs.readdirSync(CATALOG_PHOTOS).some((f) => f.replace(/\.[^.]+$/, '') === base)
      if (sources.length === 0 && !inCatalogPhotos) {
        fs.unlinkSync(path.join(outDir, png))
        console.log('− huérfano', path.join('sin-fondo', sub, png))
        removed++
      }
    }
  }
  return removed
}

function isEditorDesignFile(name) {
  const base = baseName(name).toLowerCase()
  return (
    base.startsWith('diseño') ||
    base.startsWith('diseno') ||
    base.startsWith('design-')
  )
}

async function walkCatalogDesignUploads() {
  if (!fs.existsSync(CATALOG_PHOTOS)) return 0
  let count = 0
  for (const file of fs.readdirSync(CATALOG_PHOTOS)) {
    if (!RASTER.test(file) || !isEditorDesignFile(file)) continue
    const inputPath = path.join(CATALOG_PHOTOS, file)
    const outputPath = path.join(OUT, 'imagenes', `${baseName(file)}.png`)
    try {
      await processFile(inputPath, outputPath)
      console.log('✓ (catálogo)', path.relative(process.cwd(), outputPath))
      count++
    } catch (err) {
      console.error('✗', file, err.message)
    }
  }
  return count
}

async function walkMockupEditorDesigns() {
  if (!fs.existsSync(MOCKUP_EDITOR)) return 0
  let count = 0
  for (const row of MOCKUP_EDITOR_DESIGNS) {
    const inputPath = path.join(MOCKUP_EDITOR, row.file)
    if (!fs.existsSync(inputPath)) {
      console.warn('⚠ No encontrado:', row.file)
      continue
    }
    const outputPath = path.join(OUT, 'imagenes', row.out)
    try {
      await processFile(inputPath, outputPath, 'black')
      console.log('✓ (mockup editor)', path.relative(process.cwd(), outputPath))
      count++
    } catch (err) {
      console.error('✗', row.file, err.message)
    }
  }
  return count
}

async function main() {
  console.log('Procesando catálogo → public/gallery/sin-fondo/')
  const removed = pruneOrphanSinFondo()
  const nMockup = await walkMockupEditorDesigns()
  const n0 = await walkCatalogDesignUploads()
  const n1 = await walkDir(path.join(ROOT, 'imagenes'), 'imagenes')
  const n2 = await walkDir(path.join(ROOT, 'presets'), 'presets')
  console.log(
    `Listo: ${nMockup + n0 + n1 + n2} procesadas, ${removed} huérfanos eliminados`,
  )
  const { spawnSync } = await import('child_process')
  spawnSync(process.execPath, ['scripts/sync-catalog-manifest.mjs'], {
    stdio: 'inherit',
    cwd: process.cwd(),
  })
}

main()
