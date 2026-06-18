#!/usr/bin/env node
/**
 * Copia fotos de `imagenes para catalogo/`:
 * - Hero → public/home-hero.* (+ variantes 1280/1920/2560 para pantallas grandes)
 * - Resto → public/catalog/ + src/data/catalog-looks.json
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.resolve(import.meta.dirname, '..')
const SRC = path.join(ROOT, 'imagenes para catalogo')
const CATALOG_DEST = path.join(ROOT, 'public', 'catalog')
const HERO_DEST = path.join(ROOT, 'public', 'home-hero.jpeg')
const MANIFEST = path.join(ROOT, 'src', 'data', 'catalog-looks.json')

const HERO_BASENAME = 'WhatsApp Image 2026-06-17 at 11.39.13 PM.jpeg'
const IMAGE_EXT = /\.(jpe?g|png|webp|avif)$/i

const PRODUCT_ROTATION = ['crewneck-unisex', 'hoodie-unisex', 'camiseta-unisex']

const TAG_ROTATION = [
  ['streetwear', 'novedades'],
  ['streetwear', 'esenciales'],
  ['casual', 'novedades'],
  ['casual', 'esenciales'],
  ['streetwear', 'novedades'],
  ['novedades', 'streetwear'],
  ['streetwear', 'casual'],
  ['esenciales', 'casual'],
]

const TITLE_BY_KEY = {
  a: 'Crewneck street — look A',
  d: 'Hoodie oversize — drop D',
  f: 'Camiseta graphic — serie F',
  g: 'Crewneck golden hour — G',
  s: 'Streetwear crew — S',
  dasda: 'Hoodie casual — edición studio',
}

const DESC_BY_PRODUCT = {
  'crewneck-unisex': 'Suéter crewneck oversize listo para tu estampado.',
  'hoodie-unisex': 'Hoodie con capucha — personaliza frente y espalda.',
  'camiseta-unisex': 'Camiseta ligera ideal para gráficos DTF.',
}

function listImages(dir) {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((name) => IMAGE_EXT.test(name))
    .map((name) => path.join(dir, name))
}

function slugFromFilename(name) {
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 64)
}

function extOf(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  return ext === '.jpg' ? '.jpeg' : ext
}

function titleForFile(filePath) {
  const base = path.basename(filePath, path.extname(filePath))
  const key = base.toLowerCase()
  if (TITLE_BY_KEY[key]) return TITLE_BY_KEY[key]
  if (key.includes('11.16.48')) return 'Hoodie — sesión nocturna'
  if (key.includes('11.39.14')) return 'Crewneck en escalera — street drop'
  if (key.startsWith('whatsapp')) return 'Look urbano — sesión de fotos'
  return `Look ${base.slice(0, 28).trim()}`
}

function isHero(filePath) {
  return path.basename(filePath) === HERO_BASENAME
}

const HERO_UPSCALE_WIDTHS = [1280, 1920, 2560]
const HERO_BLUR_WIDTHS = [1280, 1920, 2560]
const HERO_BLUR_SIGMA = 10
const HERO_FOCUS_SIGMA = 3

async function buildHeroBlurVariants(sourcePath, srcW, srcH) {
  const blurVariants = []
  const focusVariants = []

  for (const targetW of HERO_BLUR_WIDTHS) {
    const resizeW = Math.max(targetW, srcW)
    const targetH = Math.round((srcH / srcW) * resizeW)

    const blurOut = path.join(ROOT, 'public', `home-hero-blur-${targetW}.webp`)
    await sharp(sourcePath)
      .resize(resizeW, targetH, { kernel: sharp.kernel.lanczos3 })
      .blur(HERO_BLUR_SIGMA)
      .webp({ quality: 78, effort: 6 })
      .toFile(blurOut)

    blurVariants.push({
      src: `/home-hero-blur-${targetW}.webp`,
      width: targetW,
      type: 'image/webp',
    })

    const focusOut = path.join(ROOT, 'public', `home-hero-focus-${targetW}.webp`)
    await sharp(sourcePath)
      .resize(resizeW, targetH, { kernel: sharp.kernel.lanczos3 })
      .blur(HERO_FOCUS_SIGMA)
      .modulate({ brightness: 1.03, saturation: 1.06 })
      .webp({ quality: 82, effort: 6 })
      .toFile(focusOut)

    focusVariants.push({
      src: `/home-hero-focus-${targetW}.webp`,
      width: targetW,
      type: 'image/webp',
    })

    console.log(`Hero ${targetW}w → blur + focus (retrato completo)`)
  }

  const blurFallback = path.join(ROOT, 'public', 'home-hero-blur.webp')
  const focusFallback = path.join(ROOT, 'public', 'home-hero-focus.webp')
  fs.copyFileSync(path.join(ROOT, 'public', 'home-hero-blur-1920.webp'), blurFallback)
  fs.copyFileSync(path.join(ROOT, 'public', 'home-hero-focus-1920.webp'), focusFallback)

  return {
    heroBlurImage: '/home-hero-blur.webp',
    heroBlurVariants: blurVariants,
    heroFocusImage: '/home-hero-focus.webp',
    heroFocusVariants: focusVariants,
  }
}

async function buildHeroVariants(sourcePath) {
  const meta = await sharp(sourcePath).metadata()
  const srcW = meta.width ?? 960
  const srcH = meta.height ?? 1280

  fs.copyFileSync(sourcePath, HERO_DEST)
  console.log(`Hero nativo (${srcW}×${srcH}) → public/home-hero.jpeg`)

  const variants = [{ src: '/home-hero.jpeg', width: srcW, type: 'image/jpeg' }]

  for (const targetW of HERO_UPSCALE_WIDTHS) {
    if (targetW <= srcW) continue

    const targetH = Math.round((srcH / srcW) * targetW)
    const base = sharp(sourcePath).resize(targetW, targetH, {
      kernel: sharp.kernel.lanczos3,
    })

    const jpgOut = path.join(ROOT, 'public', `home-hero-${targetW}.jpg`)
    await base
      .clone()
      .sharpen({ sigma: 0.45, m1: 0.5, m2: 0.35 })
      .jpeg({ quality: 92, mozjpeg: true, chromaSubsampling: '4:4:4' })
      .toFile(jpgOut)

    const webpOut = path.join(ROOT, 'public', `home-hero-${targetW}.webp`)
    await base
      .clone()
      .sharpen({ sigma: 0.45, m1: 0.5, m2: 0.35 })
      .webp({ quality: 92, effort: 6, smartSubsample: true })
      .toFile(webpOut)

    variants.push(
      { src: `/home-hero-${targetW}.webp`, width: targetW, type: 'image/webp' },
      { src: `/home-hero-${targetW}.jpg`, width: targetW, type: 'image/jpeg' },
    )

    console.log(`Hero ${targetW}w → public/home-hero-${targetW}.{webp,jpg}`)
  }

  const blur = await buildHeroBlurVariants(sourcePath, srcW, srcH)

  return {
    heroImage: '/home-hero.jpeg',
    heroWidth: srcW,
    heroVariants: variants,
    ...blur,
  }
}

async function main() {
  const images = listImages(SRC)
  if (images.length === 0) {
    console.warn('No hay imágenes en:', SRC)
    process.exit(0)
  }

  const hero = images.find(isHero)
  let heroMeta = { heroImage: '/home-hero.jpeg', heroWidth: 960, heroVariants: [] }

  if (!hero) {
    console.warn('No se encontró la imagen del hero:', HERO_BASENAME)
  } else {
    heroMeta = await buildHeroVariants(hero)
  }

  const catalogImages = images.filter((file) => !isHero(file)).sort((a, b) => {
    return path.basename(a).localeCompare(path.basename(b), 'es')
  })

  fs.mkdirSync(CATALOG_DEST, { recursive: true })

  const looks = []
  let index = 0

  for (const file of catalogImages) {
    const id = `look-${slugFromFilename(path.basename(file))}`
    const destName = `${id}${extOf(file)}`
    fs.copyFileSync(file, path.join(CATALOG_DEST, destName))

    const productSlug = PRODUCT_ROTATION[index % PRODUCT_ROTATION.length]
    const tags = TAG_ROTATION[index % TAG_ROTATION.length]
    const badge = index < 3 ? 'Nuevo look' : undefined

    looks.push({
      id,
      name: titleForFile(file),
      description: DESC_BY_PRODUCT[productSlug],
      image: `/catalog/${destName}`,
      productSlug,
      tags,
      badge,
      highlight: 'Inspiración real de la colección Make It Yours.',
    })

    console.log(`${id} ← ${path.basename(file)} (${productSlug})`)
    index += 1
  }

  fs.mkdirSync(path.dirname(MANIFEST), { recursive: true })
  fs.writeFileSync(
    MANIFEST,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        heroImage: heroMeta.heroImage,
        heroWidth: heroMeta.heroWidth,
        heroVariants: heroMeta.heroVariants,
        heroBlurImage: heroMeta.heroBlurImage,
        heroBlurVariants: heroMeta.heroBlurVariants,
        heroFocusImage: heroMeta.heroFocusImage,
        heroFocusVariants: heroMeta.heroFocusVariants,
        looks,
      },
      null,
      2,
    ),
  )

  console.log(`Listo: ${looks.length} looks en catálogo → ${MANIFEST}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
