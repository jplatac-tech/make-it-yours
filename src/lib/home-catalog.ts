import { getCatalogLooksAsProducts } from './catalog-looks'
import { type CatalogProduct } from './product-catalog'

/** Destacados en inicio (primeros looks del catálogo) */
export function getTrendingProducts(): CatalogProduct[] {
  return getCatalogLooksAsProducts().slice(0, 3)
}

export function getCatalogProductCount(): number {
  return getCatalogLooksAsProducts().length
}
