import { MOCKUP_PRINT_AREAS } from './mockup-assets'

export const PRODUCTS = {
  'camiseta-unisex': {
    slug: 'camiseta-unisex',
    name: 'Camiseta unisex',
    description: 'Prenda ligera para personalización básica con estampado DTF.',
    price: 29,
    type: 'TSHIRT' as const,
  },
  'hoodie-unisex': {
    slug: 'hoodie-unisex',
    name: 'Hoodie unisex',
    description: 'Hoodie clásico para diseños en pecho y espalda.',
    price: 49,
    type: 'HOODIE' as const,
  },
  'crewneck-unisex': {
    slug: 'crewneck-unisex',
    name: 'Crewneck unisex',
    description: 'Suéter tipo crewneck para estilo casual y streetwear.',
    price: 55,
    type: 'CREWNECK' as const,
  },
} as const

export const DEFAULT_PRODUCT_SLUG = 'camiseta-unisex' as const

export const PRODUCT_SLUGS = Object.keys(PRODUCTS) as Array<
  keyof typeof PRODUCTS
>

export const PRODUCT_COLORS = [
  { label: 'Negro', value: 'BLACK', hex: '#000000' },
  { label: 'Blanco', value: 'WHITE', hex: '#ffffff' },
  { label: 'Beige', value: 'BEIGE', hex: '#d9c4a0' },
  { label: 'Gris jaspe', value: 'HEATHER_GRAY', hex: '#8a8f98' },
] as const

export const PRODUCT_SIZES = ['S', 'M', 'L', 'XL'] as const

export const DEFAULT_PRODUCT_SIZE = 'M' as const

export const PRINT_ZONES = [
  {
    label: 'Frente',
    value: 'FRONT',
    widthIn: 11,
    heightIn: 11,
    printArea: MOCKUP_PRINT_AREAS.FRONT,
  },
  {
    label: 'Espalda',
    value: 'BACK',
    widthIn: 12,
    heightIn: 14,
    printArea: MOCKUP_PRINT_AREAS.BACK,
  },
] as const

export type ProductSlug = keyof typeof PRODUCTS
export type ProductColorValue = (typeof PRODUCT_COLORS)[number]['value']
export type ProductSizeValue = (typeof PRODUCT_SIZES)[number]
export type PrintZoneValue = (typeof PRINT_ZONES)[number]['value']

export const getProductColorLabel = (value: ProductColorValue) =>
  PRODUCT_COLORS.find((item) => item.value === value)?.label ?? value

export const getPrintZone = (value: PrintZoneValue) =>
  PRINT_ZONES.find((item) => item.value === value)

export function normalizePrintZone(zone: string | undefined): PrintZoneValue {
  if (zone === 'BACK') return 'BACK'
  return 'FRONT'
}
