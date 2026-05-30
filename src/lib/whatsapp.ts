import { STORE_WHATSAPP } from './constants'
import type { CartItem } from '../components/app-state/app-state-provider'
import {
  getProductColorLabel,
  getPrintZone,
  type ProductColorValue,
  type PrintZoneValue,
} from './products'
import type { StoredDesign } from './design-storage'

function digitsOnly(phone: string) {
  return phone.replace(/\D/g, '')
}

export function getStoreWhatsAppDigits() {
  return digitsOnly(STORE_WHATSAPP)
}

export function buildWhatsAppUrl(message: string, phone = getStoreWhatsAppDigits()) {
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${phone}?text=${encoded}`
}

export function formatCartWhatsAppMessage(
  items: CartItem[],
  totalPrice: number,
  customerName?: string,
): string {
  const lines = [
    '¡Hola! Quiero cotizar / comprar en Make It Yours:',
    '',
  ]
  if (customerName?.trim()) {
    lines.push(`Nombre: ${customerName.trim()}`, '')
  }
  items.forEach((item, index) => {
    const size = item.size ? ` · Talla ${item.size}` : ''
    const subtotal = item.price * item.quantity
    lines.push(
      `${index + 1}. ${item.name}${size} — ${item.quantity} u. — $${subtotal}`,
    )
  })
  lines.push('', `Total estimado: $${totalPrice}`, '', '¿Me pueden confirmar precio y tiempos de entrega?')
  return lines.join('\n')
}

export function formatDesignQuoteMessage(
  designJson: string | null,
  productName = 'Suéter / prenda personalizada',
): string {
  let colorLabel = '—'
  let zoneLabel = '—'
  let frontCount = 0
  let backCount = 0

  if (designJson) {
    try {
      const parsed = JSON.parse(designJson) as StoredDesign & {
        shapesByZone?: { FRONT?: unknown[]; BACK?: unknown[] }
        productColor?: ProductColorValue
        printZone?: PrintZoneValue
      }
      if (parsed.productColor) {
        colorLabel = getProductColorLabel(parsed.productColor)
      }
      if (parsed.printZone) {
        zoneLabel = getPrintZone(parsed.printZone as PrintZoneValue)?.label ?? parsed.printZone
      }
      frontCount = parsed.shapesByZone?.FRONT?.length ?? 0
      backCount = parsed.shapesByZone?.BACK?.length ?? 0
    } catch {
      /* ignore */
    }
  }

  return [
    '¡Hola! Quiero cotizar un diseño personalizado:',
    '',
    `Prenda: ${productName}`,
    `Color: ${colorLabel}`,
    `Vista activa al guardar: ${zoneLabel}`,
    `Elementos — Frente: ${frontCount} · Espalda: ${backCount}`,
    '',
    'Ya armé el diseño en la web. ¿Me ayudan con cotización y producción?',
  ].join('\n')
}

export function formatQuickQuoteMessage(productName?: string): string {
  if (productName) {
    return `¡Hola! Me interesa cotizar: ${productName}. ¿Tienen disponibilidad y tiempos de entrega?`
  }
  return '¡Hola! Me interesa personalizar una prenda con estampado. ¿Me pueden cotizar?'
}
