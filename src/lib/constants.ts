export const APP_NAME = 'Make It Yours'

/** Número con código de país, sin + (ej. 5215512345678). Configura NEXT_PUBLIC_WHATSAPP_NUMBER en .env */
export const STORE_WHATSAPP =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() || '5210000000000'

export const PRODUCT_COLORS = [
  'negro',
  'blanco',
  'beige',
  'gris jaspe',
] as const
export const PRODUCT_SIZES = ['S', 'M', 'L', 'XL'] as const

export const PRINT_ZONES = {
  FRONT: { label: 'Frente', width: 11, height: 11 },
  BACK: { label: 'Espalda', width: 12, height: 14 },
} as const

export const QUOTE_STATUSES = [
  'PENDIENTE',
  'EN_REVISION',
  'COTIZADO',
  'APROBADO',
  'RECHAZADO',
] as const
