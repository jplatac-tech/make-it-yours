/**
 * Genera PNG con fondo transparente en public/gallery/sin-fondo/
 * Ejecutar: npm run process-designs
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const ROOT = path.join(process.cwd(), 'public', 'gallery')
const OUT = path.join(ROOT, 'sin-fondo')

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

async function processFile(inputPath, outputPath) {
  const ext = path.extname(inputPath).toLowerCase()
  if (ext === '.svg') return false

  const meta = await sharp(inputPath).metadata()
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

/** Borra PNG en sin-fondo si ya no existe el original en imagenes/ o presets/ */
function pruneOrphanSinFondo() {
  let removed = 0
  for (const sub of ['imagenes', 'presets']) {
    const outDir = path.join(OUT, sub)
    const inDir = path.join(ROOT, sub)
    if (!fs.existsSync(outDir)) continue
    for (const png of fs.readdirSync(outDir)) {
      if (!png.toLowerCase().endsWith('.png')) continue
      const base = png.replace(/\.[^.]+$/, '')
      const sources = fs.existsSync(inDir)
        ? fs.readdirSync(inDir).filter((f) => f.replace(/\.[^.]+$/, '') === base)
        : []
      if (sources.length === 0) {
        fs.unlinkSync(path.join(outDir, png))
        console.log('− huérfano', path.join('sin-fondo', sub, png))
        removed++
      }
    }
  }
  return removed
}

async function main() {
  console.log('Procesando catálogo → public/gallery/sin-fondo/')
  const removed = pruneOrphanSinFondo()
  const n1 = await walkDir(path.join(ROOT, 'imagenes'), 'imagenes')
  const n2 = await walkDir(path.join(ROOT, 'presets'), 'presets')
  console.log(`Listo: ${n1 + n2} procesadas, ${removed} huérfanos eliminados`)
  const { spawnSync } = await import('child_process')
  spawnSync(process.execPath, ['scripts/sync-catalog-manifest.mjs'], {
    stdio: 'inherit',
    cwd: process.cwd(),
  })
}

main()
