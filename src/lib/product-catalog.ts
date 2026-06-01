import { CREWNECK_UNISEX_MOCKUPS } from './mockup-assets'
import { PRODUCT_COLORS, PRODUCTS, type ProductSlug } from './products'

export type CatalogFilterId =
  | 'all'
  | 'novedades'
  | 'casual'
  | 'streetwear'
  | 'esenciales'

export type CatalogProduct = {
  slug: ProductSlug
  name: string
  description: string
  price: number
  type: string
  image: string
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
    highlight: 'Entrada accesible · ideal para eventos y uso diario',
    printTechnique:
      'Estampado DTF (Direct to Film): película que se fusiona con la tela. Colores vivos, buen detalle y resistencia al lavado suave.',
  },
  'hoodie-unisex': {
    tags: ['novedades', 'streetwear'],
    highlight: 'Capucha y bolsillo · estampado clásico en pecho y espalda',
  },
  'crewneck-unisex': {
    tags: ['novedades', 'streetwear', 'esenciales'],
    badge: 'Novedad',
    highlight:
      'Algodón de alto gramaje y corte oversize premium — por eso supera al hoodie en precio',
  },
}

export const CATALOG_ORDER: ProductSlug[] = [
  'crewneck-unisex',
  'hoodie-unisex',
  'camiseta-unisex',
]

function catalogImageForType(type: string | undefined): string {
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
    slug,
    name: row.name || base.name,
    description: row.description || base.description,
    price: row.price ?? base.price,
    type: row.type ?? base.type,
    image: catalogImageForType(row.type ?? base.type),
    colorCount: PRODUCT_COLORS.length,
    badge: row.badge ?? meta.badge,
    highlight: meta.highlight,
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
  return `$ ${value.toLocaleString('es-CO')}`
}

/** @deprecated Catálogo unificado con filtros — ya no se usan filas duplicadas */
export const CATALOG_SECTIONS = [] as const
