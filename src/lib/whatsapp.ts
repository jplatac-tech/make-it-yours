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
import { getDesignLabel, getDesignRefId } from './design-ids'
import { formatPrice } from './utils'

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

/** Abre el chat de la tienda (mismo número que navbar, FAB y carrito). */
export function openStoreWhatsApp(message: string) {
  if (typeof window === 'undefined') return
  window.location.assign(buildWhatsAppUrl(message))
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
    lineItems.forEach((item) => {
      const name =
        item.productSlug in PRODUCTS
          ? PRODUCTS[item.productSlug as ProductSlug].name
          : 'Prenda'
      const front = item.shapesByZone.FRONT?.length ?? 0
      const back = item.shapesByZone.BACK?.length ?? 0
      lines.push(
        `${getDesignRefId(item.id)} · ${name} · ${getProductColorLabel(item.productColor)} · Frente: ${front} · Espalda: ${back}`,
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
  const singleItem = lineItems[0]
  if (singleItem) {
    lines.push(`ID diseño: ${getDesignRefId(singleItem.id)}`)
  }
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
      `${index + 1}. ${item.name}${size} — ${item.quantity} u. — ${formatPrice(subtotal)}`,
    )
  })
  lines.push('', `Total estimado (catálogo): ${formatPrice(totalPrice)}`)

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
    lineItems.forEach((item) => {
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
        `${getDesignLabel(item.id)} · ${name} · ${color}`,
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

  const singleItem = lineItems[0]
  const designRefLine = singleItem
    ? `ID diseño: ${getDesignRefId(singleItem.id)}`
    : null

  return [
    '¡Hola! Quiero cotizar un diseño personalizado:',
    '',
    ...(designRefLine ? [designRefLine, ''] : []),
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

export function formatPurchaseQuoteMessage(opts: {
  designJson: string
  productSize: string
  quantityDesired: number
  comments?: string
  quoteId?: string
  productName?: string
}): string {
  const base = formatDesignQuoteMessage(opts.designJson, opts.productName)
  const lines = [
    base,
    '',
    '— Datos del pedido —',
    `Talla: ${opts.productSize}`,
    `Cantidad: ${opts.quantityDesired}`,
  ]
  if (opts.comments?.trim()) {
    lines.push(`Comentarios: ${opts.comments.trim()}`)
  }
  if (opts.quoteId) {
    lines.push(`Referencia web: ${opts.quoteId}`)
  }
  lines.push('', '¿Me confirman precio final y tiempos de entrega?')
  return lines.join('\n')
}

export function formatQuoteDeliveryWhatsAppMessage(opts: {
  quoteId: string
  customerName: string
  customerWhatsapp: string
  customerEmail?: string
  neededBy?: string
  deliveryNotes?: string
}): string {
  const lines = [
    '¡Hola! Completé mi pedido con diseño en Make It Yours:',
    '',
    `Nombre: ${opts.customerName.trim()}`,
    `Mi WhatsApp: ${opts.customerWhatsapp.trim()}`,
  ]
  if (opts.customerEmail?.trim()) {
    lines.push(`Correo: ${opts.customerEmail.trim()}`)
  }
  if (opts.neededBy?.trim()) {
    lines.push(`Fecha deseada: ${opts.neededBy.trim()}`)
  }
  if (opts.deliveryNotes?.trim()) {
    lines.push(`Entrega: ${opts.deliveryNotes.trim()}`)
  }
  lines.push(`Referencia web: ${opts.quoteId}`)
  lines.push('', 'Quedo atento a la cotización. ¡Gracias!')
  return lines.join('\n')
}

export function formatOrderSentWhatsAppMessage(): string {
  return '¡Hola! Acabo de enviar mi diseño desde Make It Yours. ¿Me pueden confirmar la cotización y los siguientes pasos?'
}
