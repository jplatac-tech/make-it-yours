/** Catálogo de diseños para la pestaña Diseños (presets + Canva en /gallery/imagenes) */

import { GALLERY_PRESETS } from './design-gallery'

export type DesignCategoryId =
  | 'anime-japanese'
  | 'retro'
  | 'streetwear'
  | 'gaming-tech'
  | 'cute-illustration'
  | 'minimal-text'
  | 'deportes'
  | 'clasico'
  | 'graficos'
  | 'otros'

export type CatalogDesign = {
  id: string
  title: string
  src: string
  category: DesignCategoryId
}

export const DESIGN_CATEGORIES: {
  id: DesignCategoryId
  label: string
}[] = [
  { id: 'anime-japanese', label: 'Anime y japonés' },
  { id: 'retro', label: 'Retro y groovy' },
  { id: 'streetwear', label: 'Streetwear y urbano' },
  { id: 'gaming-tech', label: 'Gaming y tech' },
  { id: 'cute-illustration', label: 'Ilustración cute' },
  { id: 'minimal-text', label: 'Tipografía minimal' },
  { id: 'deportes', label: 'Deportes' },
  { id: 'clasico', label: 'Diseños clásicos' },
  { id: 'graficos', label: 'Gráficos incluidos' },
  { id: 'otros', label: 'Otros' },
]

const LEGACY_JPG_FILES = [
  '1016969159627413447.jpg',
  '1024780090228372923.jpg',
  '1031535489652851076.jpg',
  '1132444268798232991.jpg',
  '540643130285874433.jpg',
  '571886852666029101.jpg',
  '584482857931960525.jpg',
  '622904192219605576.jpg',
  '748582769356751628.jpg',
  '883972233127613505.jpg',
  '950329958875844025.jpg',
  '954974295988788440.jpg',
] as const

/** PNG descargados de Canva en public/gallery/imagenes (sin mockups Front/Back) */
const CANVA_IMAGE_FILES = [
  '1.png',
  '2.png',
  '11.png',
  '22.png',
  'Black and Blue 3D Tech Illustrative Game Hoodie.png',
  'Black and Orange Simple Modern Outline Lion Streetwear Tiger Hoodie.png',
  'Black and Purple Cute 3D Teddy Bear Streetwear Hoodie.png',
  'Black And Red Modern Futuristic Graphic Hoodie.png',
  'Black and White Illustrated Doodle Coffee Hoodies.png',
  'Black And White Modern Graphic Hoodies.png',
  'Black and White Simple Modern Minimal House Music Album Cover.png',
  'Black Modern Eternal Hoodie.png',
  'Black Modern Minimal Typography Monospaced Campfire Hoodie.png',
  'Black Pink and Yellow Cute Groovy Retro Flower Illustrative Hoodie.png',
  'Black White Minimalist Streetwear Hoodie.png',
  'Black White Modern Bold Streetwear Futuristic Hoodie.png',
  'Blue And White Japanese Typography Illustrative T-shirt.png',
  'Buzo con Capucha Deporte  Moderno Blanco y Negro (1).png',
  'Buzo con Capucha Deporte  Moderno Blanco y Negro.png',
  'Dark Black Modern Abstarct Cool Hoodie.png',
  'Gray and Black Angels Motto Hoodie.png',
  'Green Minimalist Illustrated Typography Hoodie.png',
  'Hoodie con Gorro para Dama de honor ilustrado color rosa y blanco.png',
  'Hoodie estilo ilustrado con magia.png',
  'Red White Chinese Dragon T Shirt.png',
  'White and Black Minimalist Coffee Hoodie.png',
  'White and Black Simple Anime Hoodie.png',
  'White and Blue Japanese Anime Hoodie.png',
  'White and Red Aesthetic Streetwear Hoodie.png',
  'White and Red Japanese Waves Hoodie.png',
  'Yellow Orange and White Pixel Retro Illustrative Gaming Hoodie.png',
] as const

function slugFromFilename(name: string) {
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 80)
}

function imagenesSrc(filename: string) {
  return `/gallery/imagenes/${encodeURIComponent(filename)}`
}

function shortTitle(filename: string) {
  const base = filename.replace(/\.[^.]+$/, '')
  if (/^\d+$/.test(base)) return `Diseño ${base}`
  return base
    .replace(/\s*Hoodies?\s*$/i, '')
    .replace(/\s*T[- ]?shirts?\s*$/i, '')
    .replace(/\s*Album Cover\s*$/i, '')
    .replace(/\s*\(1\)\s*$/, '')
    .trim()
}

/** Agrupa por palabras clave del nombre (estilo Canva) */
export function inferDesignCategory(filename: string): DesignCategoryId {
  const n = filename.toLowerCase()

  if (/^\d+\.png$/.test(filename)) return 'otros'
  if (/deporte|capucha deporte|buzo con capucha/.test(n)) return 'deportes'
  if (/anime|japanese|japan|dragon|chinese|waves/.test(n)) return 'anime-japanese'
  if (/retro|groovy|pixel/.test(n)) return 'retro'
  if (/gaming|game|\btech\b|3d tech/.test(n)) return 'gaming-tech'
  if (
    /coffee|doodle|cute|teddy|magia|dama de honor|flower illustrative/.test(n)
  ) {
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

const CANVA_DESIGNS: CatalogDesign[] = CANVA_IMAGE_FILES.map((file) => ({
  id: `canva-${slugFromFilename(file)}`,
  title: shortTitle(file),
  src: imagenesSrc(file),
  category: inferDesignCategory(file),
}))

const LEGACY_DESIGNS: CatalogDesign[] = LEGACY_JPG_FILES.map((file, i) => ({
  id: `legacy-${file.replace(/\.\w+$/, '')}`,
  title: `Diseño ${i + 1}`,
  src: `/gallery/presets/${file}`,
  category: 'clasico' as const,
}))

const PRESET_GRAPHIC_DESIGNS: CatalogDesign[] = GALLERY_PRESETS.map((item) => ({
  id: item.id,
  title: item.title,
  src: item.src,
  category: 'graficos' as const,
}))

export const CATALOG_DESIGNS: CatalogDesign[] = [
  ...CANVA_DESIGNS,
  ...LEGACY_DESIGNS,
  ...PRESET_GRAPHIC_DESIGNS,
]

export type CatalogDesignGroup = {
  id: DesignCategoryId
  label: string
  designs: CatalogDesign[]
}

/** Diseños agrupados por estilo, en orden de DESIGN_CATEGORIES */
export function getCatalogDesignGroups(): CatalogDesignGroup[] {
  const byCategory = new Map<DesignCategoryId, CatalogDesign[]>()

  for (const design of CATALOG_DESIGNS) {
    const list = byCategory.get(design.category) ?? []
    list.push(design)
    byCategory.set(design.category, list)
  }

  return DESIGN_CATEGORIES.filter((cat) => (byCategory.get(cat.id)?.length ?? 0) > 0).map(
    (cat) => ({
      id: cat.id,
      label: cat.label,
      designs: byCategory.get(cat.id)!,
    }),
  )
}
