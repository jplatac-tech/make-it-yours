import { CREWNECK_UNISEX_MOCKUPS } from './mockup-assets'
import { PRODUCT_COLORS, PRODUCTS, type ProductSlug } from './products'
import { formatPrice } from './utils'

/** Fotos por defecto si no hay looks sincronizados */
export const CATALOG_PRODUCT_IMAGES: Record<ProductSlug, string> = {
  'crewneck-unisex': '/catalog/look-a.jpeg',
  'hoodie-unisex': '/catalog/look-d.jpeg',
  'camiseta-unisex': '/catalog/look-s.jpeg',
}

export type CatalogFilterId =
  | 'all'
  | 'novedades'
  | 'casual'
  | 'streetwear'
  | 'esenciales'

export type CatalogProduct = {
  /** Identificador único en la grilla (slug del producto o id del look) */
  catalogId: string
  slug: ProductSlug
  name: string
  description: string
  price: number
  type: string
  image: string
  /** Varias fotos en una misma card (carrusel) */
  images?: string[]
  colorCount: number
  badge?: string
  highlight?: string
  tags: CatalogFilterId[]
  printTechnique?: string
}

export const CATALOG_FILTERS: { id: CatalogFilterId; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'novedades', label: 'Novedades' },
  { id: 'casual', label: 'Casual' },
  { id: 'streetwear', label: 'Streetwear' },
  { id: 'esenciales', label: 'Esenciales' },
]

/** Texto corto en cards del catálogo (sin nombres de modelo ni marketing) */
export const CATALOG_CARD_COPY: Record<
  ProductSlug,
  { title: string; subtitle: string }
> = {
  'camiseta-unisex': {
    title: 'Camiseta básica',
    subtitle: 'Unisex · personalizable',
  },
  'hoodie-unisex': {
    title: 'Suéter básico',
    subtitle: 'Unisex · personalizable',
  },
  'crewneck-unisex': {
    title: 'Suéter básico',
    subtitle: 'Unisex · personalizable',
  },
}

export function getCatalogCardCopy(slug: ProductSlug) {
  return CATALOG_CARD_COPY[slug]
}

/** Metadatos de merchandising (sin duplicar productos en secciones) */
export const CATALOG_PRODUCT_META: Record<
  ProductSlug,
  {
    tags: Exclude<CatalogFilterId, 'all'>[]
    badge?: string
    highlight: string
    printTechnique?: string
  }
> = {
  'camiseta-unisex': {
    tags: ['casual', 'esenciales'],
    highlight: 'Camiseta básica unisex',
    printTechnique:
      'Estampado DTF (Direct to Film): película que se fusiona con la tela. Colores vivos, buen detalle y resistencia al lavado suave.',
  },
  'hoodie-unisex': {
    tags: ['novedades', 'streetwear'],
    highlight: 'Suéter básico unisex',
  },
  'crewneck-unisex': {
    tags: ['novedades', 'streetwear', 'esenciales'],
    badge: 'Novedad',
    highlight: 'Suéter básico unisex',
  },
}

export const CATALOG_ORDER: ProductSlug[] = [
  'crewneck-unisex',
  'hoodie-unisex',
  'camiseta-unisex',
]

function catalogImageForSlug(slug: ProductSlug, type: string | undefined): string {
  if (slug in CATALOG_PRODUCT_IMAGES) {
    return CATALOG_PRODUCT_IMAGES[slug]
  }
  switch (type) {
    case 'CREWNECK':
      return CREWNECK_UNISEX_MOCKUPS.WHITE.front
    case 'HOODIE':
      return CREWNECK_UNISEX_MOCKUPS.HEATHER_GRAY.front
    case 'TSHIRT':
    default:
      return CREWNECK_UNISEX_MOCKUPS.BEIGE.front
  }
}

export function toCatalogProduct(
  row: {
    slug: string
    name: string
    description: string
    price: number
    type?: string
    badge?: string
  },
): CatalogProduct | null {
  if (!(row.slug in PRODUCTS)) return null
  const slug = row.slug as ProductSlug
  const base = PRODUCTS[slug]
  const meta = CATALOG_PRODUCT_META[slug]
  return {
    catalogId: slug,
    slug,
    name: getCatalogCardCopy(slug).title,
    description: getCatalogCardCopy(slug).subtitle,
    price: row.price ?? base.price,
    type: row.type ?? base.type,
    image: catalogImageForSlug(slug, row.type ?? base.type),
    colorCount: PRODUCT_COLORS.length,
    badge: row.badge ?? meta.badge,
    highlight: getCatalogCardCopy(slug).subtitle,
    tags: meta.tags,
    printTechnique: meta.printTechnique,
  }
}

export function filterCatalogProducts(
  products: CatalogProduct[],
  filter: CatalogFilterId,
): CatalogProduct[] {
  if (filter === 'all') return products
  return products.filter((p) => p.tags.includes(filter))
}

export function formatCatalogPrice(value: number) {
  return formatPrice(value)
}

/** @deprecated Catálogo unificado con filtros — ya no se usan filas duplicadas */
export const CATALOG_SECTIONS = [] as const
