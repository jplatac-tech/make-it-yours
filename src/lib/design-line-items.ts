import type { DesignShape } from '../types/design'
import { ensureShapeLayers } from './shape-layers'
import {
  EDITOR_DEFAULT_PRODUCT_SLUG,
  PRODUCT_COLORS,
  PRODUCTS,
  type PrintZoneValue,
  type ProductColorValue,
  type ProductSizeValue,
  type ProductSlug,
} from './products'
import { EDITOR_CANVAS_H, EDITOR_CANVAS_W } from './editor-canvas'
import type { StoredDesign } from './design-storage'

export const DESIGN_SESSION_VERSION = 2 as const

export type DesignLineItem = {
  id: string
  productSlug: ProductSlug
  productColor: ProductColorValue
  productSize?: ProductSizeValue
  shapesByZone: Record<PrintZoneValue, DesignShape[]>
  printZone?: PrintZoneValue
}

export type EditorDesignSession = {
  version: typeof DESIGN_SESSION_VERSION
  canvas: { width: number; height: number }
  activeItemId: string
  items: DesignLineItem[]
}

export function newLineItemId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function emptyShapesByZone(): Record<PrintZoneValue, DesignShape[]> {
  return { FRONT: [], BACK: [] }
}

export function createEmptyLineItem(options?: {
  productSlug?: ProductSlug
  productColor?: ProductColorValue
}): DesignLineItem {
  return {
    id: newLineItemId(),
    productSlug: options?.productSlug ?? EDITOR_DEFAULT_PRODUCT_SLUG,
    productColor: options?.productColor ?? 'WHITE',
    shapesByZone: emptyShapesByZone(),
    printZone: 'FRONT',
  }
}

export function lineItemHasDesign(item: DesignLineItem): boolean {
  const front = item.shapesByZone.FRONT?.length ?? 0
  const back = item.shapesByZone.BACK?.length ?? 0
  return front + back > 0
}

export function sessionHasDesign(session: EditorDesignSession | null): boolean {
  if (!session?.items?.length) return false
  return session.items.some(lineItemHasDesign)
}

/** Convierte un ítem de línea al JSON que esperan export/preview/cotización */
function cloneShapesByZone(
  shapesByZone: Record<PrintZoneValue, DesignShape[]>,
): Record<PrintZoneValue, DesignShape[]> {
  return {
    FRONT: ensureShapeLayers(
      (shapesByZone.FRONT ?? []).map((s) => ({ ...s })),
    ),
    BACK: ensureShapeLayers(
      (shapesByZone.BACK ?? []).map((s) => ({ ...s })),
    ),
  }
}

export function lineItemToStoredDesign(item: DesignLineItem): StoredDesign {
  return {
    canvas: { width: EDITOR_CANVAS_W, height: EDITOR_CANVAS_H },
    shapesByZone: cloneShapesByZone(item.shapesByZone),
    productColor: item.productColor,
    printZone: item.printZone ?? 'FRONT',
    productSlug: item.productSlug,
    productSize: item.productSize,
  }
}

export function lineItemToDesignJson(item: DesignLineItem): string {
  return JSON.stringify(lineItemToStoredDesign(item))
}

export function pickNextGarmentColor(
  used: ProductColorValue[],
  fallback: ProductColorValue = 'WHITE',
): ProductColorValue {
  const next = PRODUCT_COLORS.find((c) => !used.includes(c.value))
  return next?.value ?? fallback
}

function isSessionPayload(
  parsed: Record<string, unknown>,
): parsed is EditorDesignSession & Record<string, unknown> {
  return (
    parsed.version === DESIGN_SESSION_VERSION &&
    Array.isArray(parsed.items) &&
    typeof parsed.activeItemId === 'string'
  )
}

function legacyToLineItem(
  parsed: StoredDesign,
  productSlug: ProductSlug,
): DesignLineItem {
  const shapesByZone = emptyShapesByZone()
  if (parsed.shapesByZone) {
    shapesByZone.FRONT = (parsed.shapesByZone.FRONT ?? []) as DesignShape[]
    shapesByZone.BACK = (parsed.shapesByZone.BACK ?? []) as DesignShape[]
  } else if (Array.isArray(parsed.shapes) && parsed.shapes.length > 0) {
    const zone: PrintZoneValue =
      parsed.printZone === 'BACK' ? 'BACK' : 'FRONT'
    shapesByZone[zone] = parsed.shapes as DesignShape[]
  }

  return {
    id: newLineItemId(),
    productSlug,
    productColor: (parsed.productColor as ProductColorValue) ?? 'WHITE',
    productSize: parsed.productSize as ProductSizeValue | undefined,
    shapesByZone,
    printZone: (parsed.printZone as PrintZoneValue) ?? 'FRONT',
  }
}

export function parseEditorSession(json: string | null): EditorDesignSession | null {
  if (!json) return null
  try {
    const parsed = JSON.parse(json) as Record<string, unknown>
    if (isSessionPayload(parsed)) {
      const items = (parsed.items as DesignLineItem[]).filter(
        (item) => item?.id && item.productSlug,
      )
      if (items.length === 0) return null
      const activeItemId = items.some((i) => i.id === parsed.activeItemId)
        ? (parsed.activeItemId as string)
        : items[0].id
      return {
        version: DESIGN_SESSION_VERSION,
        canvas: (parsed.canvas as EditorDesignSession['canvas']) ?? {
          width: EDITOR_CANVAS_W,
          height: EDITOR_CANVAS_H,
        },
        activeItemId,
        items,
      }
    }

    const legacy = parsed as StoredDesign
    const slug =
      legacy.productSlug && legacy.productSlug in PRODUCTS
        ? (legacy.productSlug as ProductSlug)
        : EDITOR_DEFAULT_PRODUCT_SLUG
    const item = legacyToLineItem(legacy, slug)
    return {
      version: DESIGN_SESSION_VERSION,
      canvas: legacy.canvas ?? {
        width: EDITOR_CANVAS_W,
        height: EDITOR_CANVAS_H,
      },
      activeItemId: item.id,
      items: [item],
    }
  } catch {
    return null
  }
}

export function buildEditorSession(options: {
  items: DesignLineItem[]
  activeItemId: string
}): EditorDesignSession {
  const items =
    options.items.length > 0 ? options.items : [createEmptyLineItem()]
  const activeItemId = items.some((i) => i.id === options.activeItemId)
    ? options.activeItemId
    : items[0].id
  return {
    version: DESIGN_SESSION_VERSION,
    canvas: { width: EDITOR_CANVAS_W, height: EDITOR_CANVAS_H },
    activeItemId,
    items,
  }
}

export function sessionToStorageJson(session: EditorDesignSession): string {
  return JSON.stringify(session)
}

export function getActiveLineItem(
  session: EditorDesignSession | null,
): DesignLineItem | null {
  if (!session) return null
  return (
    session.items.find((item) => item.id === session.activeItemId) ??
    session.items[0] ??
    null
  )
}

export function getLineItemsWithDesign(
  session: EditorDesignSession | null,
): DesignLineItem[] {
  if (!session) return []
  return session.items.filter(lineItemHasDesign)
}
