import type { CheckoutLine } from './checkout-order'
import type { OrderPreviewLink } from './order-whatsapp-notify'

export type SavedOrder = {
  id: string
  paidAt: string
  total: number
  lines: CheckoutLine[]
  previewLinks?: OrderPreviewLink[]
  designJson?: string
  comments?: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  address?: string
  source?: 'comprar' | 'carrito'
}

const STORAGE_KEY = 'makeityours-order-gallery'
const MAX_ORDERS = 40

export function loadOrderGallery(): SavedOrder[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SavedOrder[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveOrderToGallery(order: SavedOrder): void {
  if (typeof window === 'undefined') return
  const existing = loadOrderGallery().filter((row) => row.id !== order.id)
  const next = [order, ...existing].slice(0, MAX_ORDERS)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export function getOrderFromGallery(id: string): SavedOrder | undefined {
  return loadOrderGallery().find((order) => order.id === id)
}

export function removeOrderFromGallery(id: string): void {
  if (typeof window === 'undefined') return
  const next = loadOrderGallery().filter((order) => order.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}
