import type { ProductSlug } from './products'

export const DESIGN_STORAGE_KEY = 'make-it-yours-design'

export type StoredDesign = {
  canvas: { width: number; height: number }
  shapes?: unknown[]
  shapesByZone?: {
    FRONT?: unknown[]
    BACK?: unknown[]
  }
  productColor?: string
  printZone?: string
  productSlug?: ProductSlug | string
  productSize?: string
}

export function loadDesign(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(DESIGN_STORAGE_KEY)
}

export const DESIGN_SAVE_EVENT = 'make-it-yours-design-save'

export function saveDesign(json: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(DESIGN_STORAGE_KEY, json)
  window.dispatchEvent(new CustomEvent(DESIGN_SAVE_EVENT))
}

export function saveDesignPayload(payload: StoredDesign & Record<string, unknown>) {
  saveDesign(JSON.stringify(payload))
}

export function parseStoredDesign(json: string | null): StoredDesign | null {
  if (!json) return null
  try {
    return JSON.parse(json) as StoredDesign
  } catch {
    return null
  }
}

export function hasDesignElements(json: string | null): boolean {
  const parsed = parseStoredDesign(json)
  if (!parsed) return false
  if (parsed.shapesByZone) {
    const front = parsed.shapesByZone.FRONT?.length ?? 0
    const back = parsed.shapesByZone.BACK?.length ?? 0
    return front + back > 0
  }
  return Array.isArray(parsed.shapes) && parsed.shapes.length > 0
}
