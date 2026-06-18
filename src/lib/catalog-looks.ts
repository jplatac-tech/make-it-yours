import looksData from '../data/catalog-looks.json'
import galleriesData from '../data/catalog-galleries.json'
import {
  CATALOG_PRODUCT_META,
  getCatalogCardCopy,
  type CatalogFilterId,
  type CatalogProduct,
} from './product-catalog'
import { PRODUCT_COLORS, PRODUCTS, type ProductSlug } from './products'

export type CatalogLook = {
  id: string
  name: string
  description: string
  image: string
  productSlug: ProductSlug
  tags: Exclude<CatalogFilterId, 'all'>[]
  badge?: string
  highlight?: string
}

export type CatalogGalleryDef = {
  id: string
  productSlug: ProductSlug
  lookIds: string[]
  tags: Exclude<CatalogFilterId, 'all'>[]
  badge?: string
}

type CatalogLooksFile = {
  heroImage: string
  heroWidth?: number
  heroVariants?: HeroVariant[]
  heroBlurImage?: string
  heroBlurVariants?: HeroVariant[]
  heroFocusImage?: string
  heroFocusVariants?: HeroVariant[]
  looks: CatalogLook[]
}

export type HeroVariant = {
  src: string
  width: number
  type: string
}

const file = looksData as CatalogLooksFile
export const CATALOG_GALLERIES = galleriesData as CatalogGalleryDef[]

const looksById = new Map(
  (file.looks ?? []).map((look) => [look.id, look] as const),
)

const groupedLookIds = new Set(
  CATALOG_GALLERIES.flatMap((gallery) => gallery.lookIds),
)

export const CATALOG_HERO_IMAGE = file.heroImage || '/home-hero.jpeg'
export const CATALOG_HERO_WIDTH = file.heroWidth ?? 960
export const CATALOG_HERO_VARIANTS: HeroVariant[] =
  file.heroVariants?.length
    ? file.heroVariants
    : [{ src: CATALOG_HERO_IMAGE, width: CATALOG_HERO_WIDTH, type: 'image/jpeg' }]

export const CATALOG_HERO_BLUR_IMAGE =
  file.heroBlurImage || '/home-hero-blur.webp'
export const CATALOG_HERO_BLUR_VARIANTS: HeroVariant[] =
  file.heroBlurVariants?.length
    ? file.heroBlurVariants
    : [{ src: CATALOG_HERO_BLUR_IMAGE, width: 1920, type: 'image/webp' }]

export const CATALOG_HERO_FOCUS_IMAGE =
  file.heroFocusImage || '/home-hero-focus.webp'
export const CATALOG_HERO_FOCUS_VARIANTS: HeroVariant[] =
  file.heroFocusVariants?.length
    ? file.heroFocusVariants
    : [{ src: CATALOG_HERO_FOCUS_IMAGE, width: 1920, type: 'image/webp' }]

export function buildHeroSrcSet(
  variants: HeroVariant[],
  format: 'image/webp' | 'image/jpeg',
): string {
  return variants
    .filter((v) => v.type === format)
    .map((v) => `${v.src} ${v.width}w`)
    .join(', ')
}

export const CATALOG_LOOKS: CatalogLook[] = file.looks ?? []

export function getLookById(id: string): CatalogLook | undefined {
  return looksById.get(id) ?? CATALOG_LOOKS.find((look) => look.id === id)
}

export function getGalleryById(id: string): CatalogGalleryDef | undefined {
  return CATALOG_GALLERIES.find((gallery) => gallery.id === id)
}

export function galleryToCatalogProduct(gallery: CatalogGalleryDef): CatalogProduct | null {
  const images = gallery.lookIds
    .map((lookId) => looksById.get(lookId)?.image)
    .filter((src): src is string => Boolean(src))

  if (images.length === 0) return null

  const base = PRODUCTS[gallery.productSlug]
  const meta = CATALOG_PRODUCT_META[gallery.productSlug]
  const card = getCatalogCardCopy(gallery.productSlug)

  return {
    catalogId: gallery.id,
    slug: gallery.productSlug,
    name: card.title,
    description: card.subtitle,
    price: base.price,
    type: base.type,
    image: images[0],
    images,
    colorCount: PRODUCT_COLORS.length,
    badge: gallery.badge ?? meta?.badge,
    highlight: card.subtitle,
    tags: gallery.tags,
    printTechnique: meta?.printTechnique,
  }
}

export function lookToCatalogProduct(look: CatalogLook): CatalogProduct {
  const base = PRODUCTS[look.productSlug]
  const meta = CATALOG_PRODUCT_META[look.productSlug]
  const card = getCatalogCardCopy(look.productSlug)
  return {
    catalogId: look.id,
    slug: look.productSlug,
    name: card.title,
    description: card.subtitle,
    price: base.price,
    type: base.type,
    image: look.image,
    colorCount: PRODUCT_COLORS.length,
    badge: look.badge ?? meta?.badge,
    highlight: card.subtitle,
    tags: look.tags,
    printTechnique: meta?.printTechnique,
  }
}

export function getCatalogLooksAsProducts(): CatalogProduct[] {
  const fromGalleries = CATALOG_GALLERIES.map(galleryToCatalogProduct).filter(
    (product): product is CatalogProduct => product !== null,
  )

  const ungrouped = CATALOG_LOOKS.filter(
    (look) => !groupedLookIds.has(look.id),
  ).map(lookToCatalogProduct)

  return [...fromGalleries, ...ungrouped]
}

export function getDefaultCatalogImageForProduct(slug: ProductSlug): string {
  const gallery = CATALOG_GALLERIES.find((row) => row.productSlug === slug)
  if (gallery) {
    const first = gallery.lookIds
      .map((id) => looksById.get(id)?.image)
      .find(Boolean)
    if (first) return first
  }
  return CATALOG_LOOKS.find((look) => look.productSlug === slug)?.image ?? ''
}

export function resolveCatalogEntry(
  catalogId: string,
): { productSlug: ProductSlug; image?: string; images?: string[] } | null {
  const gallery = getGalleryById(catalogId)
  if (gallery) {
    const images = gallery.lookIds
      .map((id) => looksById.get(id)?.image)
      .filter((src): src is string => Boolean(src))
    return {
      productSlug: gallery.productSlug,
      image: images[0],
      images,
    }
  }

  const look = getLookById(catalogId)
  if (look) {
    return { productSlug: look.productSlug, image: look.image }
  }

  return null
}
