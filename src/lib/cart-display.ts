import type { ProductSlug } from './products'
import { PRODUCTS } from './products'
import { getCrewneckMockupSrc } from './mockup-assets'
import { formatPrice } from './utils'

export function formatCartPrice(value: number): string {
  return formatPrice(value)
}

export function getCartProductBrand(slug: ProductSlug): string {
  const type = PRODUCTS[slug]?.type
  if (type === 'CREWNECK') return 'CREWNECK'
  if (type === 'HOODIE') return 'HOODIE'
  if (type === 'TSHIRT') return 'CAMISETA'
  return 'MAKE IT YOURS'
}

export function getCartProductImage(slug: ProductSlug): string {
  const type = PRODUCTS[slug]?.type
  if (type === 'CREWNECK') {
    return getCrewneckMockupSrc('WHITE', 'FRONT')
  }
  return getCrewneckMockupSrc('WHITE', 'FRONT')
}

export function getCartProductDescription(slug: ProductSlug): string {
  return PRODUCTS[slug]?.description ?? ''
}
