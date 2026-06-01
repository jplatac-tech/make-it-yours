import { CREWNECK_UNISEX_MOCKUPS } from './mockup-assets'
import { PRODUCT_COLORS, PRODUCTS, type ProductSlug } from './products'

export type CatalogProduct = {
  slug: ProductSlug
  name: string
  description: string
  price: number
  type: string
  image: string
  colorCount: number
  badge?: string
}

export type CatalogSection = {
  id: string
  /** Título h2 de la sección (ej. Lo más nuevo) */
  title: string
  /** Contexto / situación de uso */
  situation: string
  productSlugs: ProductSlug[]
}

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
  return {
    slug,
    name: row.name || base.name,
    description: row.description || base.description,
    price: row.price ?? base.price,
    type: row.type ?? base.type,
    image: catalogImageForType(row.type ?? base.type),
    colorCount: PRODUCT_COLORS.length,
    badge: row.badge,
  }
}

export const CATALOG_SECTIONS: CatalogSection[] = [
  {
    id: 'novedades',
    title: 'Lo más nuevo',
    situation: 'Personaliza en minutos',
    productSlugs: ['crewneck-unisex', 'hoodie-unisex'],
  },
  {
    id: 'esenciales',
    title: 'Esenciales para tu marca',
    situation: 'Uso diario y eventos',
    productSlugs: ['camiseta-unisex', 'crewneck-unisex'],
  },
  {
    id: 'streetwear',
    title: 'Streetwear y crewneck',
    situation: 'Estilo urbano y oversize',
    productSlugs: ['crewneck-unisex', 'hoodie-unisex', 'camiseta-unisex'],
  },
]

export function formatCatalogPrice(value: number) {
  return `$ ${value.toLocaleString('es-CO')}`
}
