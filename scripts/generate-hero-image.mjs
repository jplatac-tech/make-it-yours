/**
 * Genera hero horizontal (16:9) desde public/hero-source.jpg
 * Uso: npm run hero-image
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const publicDir = 'public'

function resolveSource() {
  const preferred = path.join(publicDir, 'hero-source.jpg')
  if (fs.existsSync(preferred)) return preferred
  const minecraft = fs
    .readdirSync(publicDir)
    .find((n) => n.startsWith('minecraft'))
  if (minecraft) {
    fs.copyFileSync(path.join(publicDir, minecraft), preferred)
    console.log(`Copiado → ${preferred}`)
    return preferred
  }
  const legacy = path.join(publicDir, 'spider.webp')
  if (fs.existsSync(legacy)) return legacy
  console.error('Falta public/hero-source.jpg o imagen minecraft.*')
  process.exit(1)
}

const src = resolveSource()
const meta = await sharp(src).metadata()
console.log(`Origen: ${meta.width}×${meta.height} (${meta.format})`)

/** Recorte cover 16:9 centrado — convierte vertical en horizontal */
const targets = [
  { w: 1920, h: 1080, out: 'public/home-hero-1920.webp' },
  { w: 2560, h: 1440, out: 'public/home-hero.webp' },
]

/** 90° a la izquierda (antihorario) para orientar bien el JPEG vertical */
const oriented = sharp(src).rotate(-90)

for (const { w, h, out } of targets) {
  await oriented
    .clone()
    .resize(w, h, { fit: 'cover', position: 'centre' })
    .webp({ quality: 92, effort: 6, smartSubsample: true })
    .toFile(out)
  const outMeta = await sharp(out).metadata()
  const kb = Math.round(fs.statSync(out).size / 1024)
  console.log(`${out} → ${outMeta.width}×${outMeta.height}, ${kb} KB`)
}

console.log('Hero horizontal listo.')
