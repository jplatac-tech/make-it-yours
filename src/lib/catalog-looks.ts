import looksData from '../data/catalog-looks.json'
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
  return CATALOG_LOOKS.find((look) => look.id === id)
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
  return CATALOG_LOOKS.map(lookToCatalogProduct)
}

export function getDefaultCatalogImageForProduct(slug: ProductSlug): string {
  return CATALOG_LOOKS.find((look) => look.productSlug === slug)?.image ?? ''
}
