import type { CheckoutLine } from './checkout-order'
import {
  getLineItemsWithDesign,
  lineItemToDesignJson,
  parseEditorSession,
} from './design-storage'
import { getDesignRefId } from './design-ids'
import { buildDesignExports } from './export-design'
import { getPrintZone } from './products'
import type { PrintZoneValue } from './products'
import { formatPrice } from './utils'
import { openStoreWhatsApp } from './whatsapp'

export type OrderPreviewLink = {
  label: string
  url: string
}

export type OrderWhatsAppPayload = {
  orderId: string
  lines: CheckoutLine[]
  total: number
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  address?: string
  comments?: string
  previewLinks?: OrderPreviewLink[]
}

export const LAST_ORDER_STORAGE_KEY = 'makeityours-last-order'

export function formatCheckoutOrderWhatsAppMessage(
  opts: OrderWhatsAppPayload,
): string {
  const lines: string[] = [
    '¡Hola! Nuevo pedido desde Make It Yours:',
    '',
    `Referencia: ${opts.orderId}`,
  ]

  if (opts.customerName?.trim()) {
    lines.push(`Nombre: ${opts.customerName.trim()}`)
  }
  if (opts.customerPhone?.trim()) {
    lines.push(`Teléfono: ${opts.customerPhone.trim()}`)
  }
  if (opts.customerEmail?.trim()) {
    lines.push(`Correo: ${opts.customerEmail.trim()}`)
  }
  if (opts.address?.trim()) {
    lines.push(`Dirección: ${opts.address.trim()}`)
  }

  lines.push('', '— Productos —')
  opts.lines.forEach((line, index) => {
    const parts = [
      line.designId,
      line.productName,
      line.color,
      line.size ? `Talla ${line.size}` : null,
      `×${line.quantity}`,
      formatPrice(line.unitPrice * line.quantity),
    ].filter(Boolean)
    lines.push(`${index + 1}. ${parts.join(' · ')}`)
  })

  lines.push('', `Total: ${formatPrice(opts.total)}`)

  if (opts.comments?.trim()) {
    lines.push('', `Comentarios: ${opts.comments.trim()}`)
  }

  if (opts.previewLinks?.length) {
    lines.push('', '— Vista previa del suéter con diseño —')
    for (const link of opts.previewLinks) {
      lines.push(`${link.label}: ${link.url}`)
    }
  }

  lines.push('', 'Quedo atento a la confirmación. ¡Gracias!')
  return lines.join('\n')
}

async function uploadPreviewImage(
  previewId: string,
  dataUrl: string,
): Promise<string | null> {
  try {
    const res = await fetch('/api/order-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: previewId, image: dataUrl }),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { url?: string }
    return data.url ?? null
  } catch {
    return null
  }
}

function zoneLabel(zone: PrintZoneValue): string {
  return getPrintZone(zone)?.label ?? zone
}

/** Genera mockups y los sube para enlazarlos en WhatsApp */
export async function uploadDesignPreviewImages(
  orderId: string,
  designJson: string,
): Promise<OrderPreviewLink[]> {
  if (typeof window === 'undefined') return []

  const links: OrderPreviewLink[] = []
  const session = parseEditorSession(designJson)
  const lineItems = getLineItemsWithDesign(session)

  const designSources =
    lineItems.length > 0
      ? lineItems.map((item) => ({
          ref: getDesignRefId(item.id),
          json: lineItemToDesignJson(item),
        }))
      : [{ ref: 'diseno', json: designJson }]

  for (const source of designSources) {
    const exports = await buildDesignExports(source.json)
    for (const zone of exports.zonesWithDesign) {
      const dataUrl = exports.byZone[zone]?.mockupDataUrl
      if (!dataUrl) continue

      const previewId = `${orderId}-${source.ref}-${zone}`
      const url = await uploadPreviewImage(previewId, dataUrl)
      if (!url) continue

      const label =
        designSources.length > 1
          ? `${source.ref} · ${zoneLabel(zone)}`
          : zoneLabel(zone)

      links.push({ label, url })
    }
  }

  return links
}

export async function notifyStoreOrderViaWhatsApp(
  opts: Omit<OrderWhatsAppPayload, 'previewLinks'> & {
    designJson?: string
    previewLinks?: OrderPreviewLink[]
  },
): Promise<void> {
  const previewLinks =
    opts.previewLinks ??
    (opts.designJson
      ? await uploadDesignPreviewImages(opts.orderId, opts.designJson)
      : [])

  const message = formatCheckoutOrderWhatsAppMessage({
    ...opts,
    previewLinks,
  })
  openStoreWhatsApp(message)
}

export function loadLastOrderFromSession(): (OrderWhatsAppPayload & {
  paidAt?: string
  designJson?: string
}) | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(LAST_ORDER_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as OrderWhatsAppPayload & {
      paidAt?: string
      designJson?: string
    }
  } catch {
    return null
  }
}
