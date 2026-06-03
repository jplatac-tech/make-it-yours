import { STORE_WHATSAPP } from './constants'
import type { CartItem } from '../components/app-state/app-state-provider'
import {
  getProductColorLabel,
  getPrintZone,
  PRODUCTS,
  type ProductColorValue,
  type PrintZoneValue,
  type ProductSlug,
} from './products'
import {
  getLineItemsWithDesign,
  hasDesignElements,
  lineItemToDesignJson,
  parseEditorSession,
  parseStoredDesign,
} from './design-storage'
import { getZonesWithDesign, parseDesignPayload } from './export-design'

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

function getProductNameFromDesign(designJson: string | null): string | null {
  const parsed = parseStoredDesign(designJson)
  if (!parsed?.productSlug) return null
  const slug = parsed.productSlug as ProductSlug
  return slug in PRODUCTS ? PRODUCTS[slug].name : null
}

export function formatDesignSummaryLines(designJson: string | null): string[] {
  const session = parseEditorSession(designJson)
  const lineItems = getLineItemsWithDesign(session)

  if (lineItems.length > 1) {
    const lines = ['', `— ${lineItems.length} diseños guardados en la web —`]
    lineItems.forEach((item, index) => {
      const name =
        item.productSlug in PRODUCTS
          ? PRODUCTS[item.productSlug as ProductSlug].name
          : 'Prenda'
      const front = item.shapesByZone.FRONT?.length ?? 0
      const back = item.shapesByZone.BACK?.length ?? 0
      lines.push(
        `${index + 1}. ${name} · ${getProductColorLabel(item.productColor)} · Frente: ${front} · Espalda: ${back}`,
      )
    })
    lines.push('Puedo enviar capturas desde el editor si lo necesitan.')
    return lines
  }

  const parsed = parseStoredDesign(designJson)
  if (!parsed) return []

  let colorLabel = '—'
  let zoneLabel = '—'
  let frontCount = 0
  let backCount = 0
  const productName = getProductNameFromDesign(designJson)

  if (parsed.productColor) {
    colorLabel = getProductColorLabel(parsed.productColor as ProductColorValue)
  }
  if (parsed.printZone) {
    zoneLabel =
      getPrintZone(parsed.printZone as PrintZoneValue)?.label ?? parsed.printZone
  }
  frontCount = parsed.shapesByZone?.FRONT?.length ?? 0
  backCount = parsed.shapesByZone?.BACK?.length ?? 0

  const lines = [
    '',
    '— Diseño guardado en la web —',
  ]
  if (productName) lines.push(`Prenda del diseño: ${productName}`)
  lines.push(
    `Color: ${colorLabel}`,
    `Vista al guardar: ${zoneLabel}`,
    `Elementos — Frente: ${frontCount} · Espalda: ${backCount}`,
    'Puedo enviar capturas desde el editor si lo necesitan.',
  )
  return lines
}

export function formatCartWhatsAppMessage(
  items: CartItem[],
  totalPrice: number,
  customerName?: string,
  designJson?: string | null,
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
  lines.push('', `Total estimado (catálogo): $${totalPrice}`)

  if (designJson && hasDesignElements(designJson)) {
    lines.push(...formatDesignSummaryLines(designJson))
  }

  lines.push(
    '',
    '¿Me pueden confirmar precio final, estampado y tiempos de entrega?',
  )
  return lines.join('\n')
}

export function formatDesignQuoteMessage(
  designJson: string | null,
  productName?: string,
): string {
  const session = parseEditorSession(designJson)
  const lineItems = getLineItemsWithDesign(session)

  if (lineItems.length > 1) {
    const lines = [
      '¡Hola! Quiero cotizar varios diseños personalizados:',
      '',
      `${lineItems.length} prendas distintas en el editor:`,
    ]
    lineItems.forEach((item, index) => {
      const json = lineItemToDesignJson(item)
      const payload = parseDesignPayload(json)
      const name =
        item.productSlug in PRODUCTS
          ? PRODUCTS[item.productSlug as ProductSlug].name
          : productName ?? 'Prenda'
      const color = getProductColorLabel(item.productColor)
      const zones = getZonesWithDesign(payload)
        .map((z) => getPrintZone(z)?.label ?? z)
        .join(', ')
      const front = item.shapesByZone.FRONT?.length ?? 0
      const back = item.shapesByZone.BACK?.length ?? 0
      lines.push(
        '',
        `${index + 1}. ${name} · ${color}`,
        `   Zonas: ${zones || '—'} · Frente: ${front} elem. · Espalda: ${back} elem.`,
      )
    })
    lines.push(
      '',
      'Ya armé los diseños en la web. ¿Me ayudan con cotización y producción?',
    )
    return lines.join('\n')
  }

  const resolvedName =
    productName ?? getProductNameFromDesign(designJson) ?? 'Prenda personalizada'

  const parsed = parseStoredDesign(designJson)
  let colorLabel = '—'
  let zoneLabel = '—'
  let frontCount = 0
  let backCount = 0

  if (parsed) {
    if (parsed.productColor) {
      colorLabel = getProductColorLabel(parsed.productColor as ProductColorValue)
    }
    if (parsed.printZone) {
      zoneLabel =
        getPrintZone(parsed.printZone as PrintZoneValue)?.label ??
        parsed.printZone
    }
    frontCount = parsed.shapesByZone?.FRONT?.length ?? 0
    backCount = parsed.shapesByZone?.BACK?.length ?? 0
  }

  return [
    '¡Hola! Quiero cotizar un diseño personalizado:',
    '',
    `Prenda: ${resolvedName}`,
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
