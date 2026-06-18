import { formatPrice } from './utils'

export type CheckoutLine = {
  designId?: string
  productName: string
  color?: string
  size?: string
  quantity: number
  unitPrice: number
}

export type CheckoutDraft = {
  id: string
  source: 'comprar' | 'carrito'
  lines: CheckoutLine[]
  designJson?: string
  comments?: string
  createdAt: string
}

const STORAGE_KEY = 'makeityours-checkout-draft'

export function checkoutLineTotal(line: CheckoutLine) {
  return line.unitPrice * line.quantity
}

export function checkoutDraftTotal(draft: CheckoutDraft) {
  return draft.lines.reduce((sum, line) => sum + checkoutLineTotal(line), 0)
}

export function formatCheckoutTotal(draft: CheckoutDraft) {
  return formatPrice(checkoutDraftTotal(draft))
}

export function saveCheckoutDraft(draft: CheckoutDraft) {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
}

export function loadCheckoutDraft(): CheckoutDraft | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CheckoutDraft
  } catch {
    return null
  }
}

export function clearCheckoutDraft() {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(STORAGE_KEY)
}

export function newCheckoutId() {
  return `ORD-${Date.now().toString(36).toUpperCase()}`
}
