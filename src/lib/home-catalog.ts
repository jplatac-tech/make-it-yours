import {
  CATALOG_ORDER,
  CATALOG_PRODUCT_META,
  toCatalogProduct,
  type CatalogProduct,
} from './product-catalog'
import { PRODUCTS, type ProductSlug } from './products'

/** Destacados en inicio (tendencias / novedades) */
export const HOME_TRENDING_SLUGS: ProductSlug[] = [
  'crewneck-unisex',
  'hoodie-unisex',
  'camiseta-unisex',
]

export function getTrendingProducts(): CatalogProduct[] {
  return HOME_TRENDING_SLUGS.map((slug) => {
    const base = PRODUCTS[slug]
    const meta = CATALOG_PRODUCT_META[slug]
    return toCatalogProduct({
      slug,
      name: base.name,
      description: base.description,
      price: base.price,
      type: base.type,
      badge: meta.badge,
    })
  }).filter((p): p is CatalogProduct => Boolean(p))
}

export function getCatalogProductCount(): number {
  return CATALOG_ORDER.length
}
