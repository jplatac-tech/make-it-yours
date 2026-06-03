import type { DesignShape } from '../types/design'
import type { PrintZoneValue, ProductColorValue, ProductSlug } from './products'
import { EDITOR_DEFAULT_PRODUCT_SLUG } from './products'
import {
  buildEditorSession,
  createEmptyLineItem,
  sessionToStorageJson,
} from './design-line-items'
import { saveDesign } from './design-storage'

const CANVAS = { width: 400, height: 520 }

export function cloneShapesWithNewIds(
  shapes: DesignShape[],
): DesignShape[] {
  return shapes.map((s) => ({
    ...s,
    id: `shape-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  }))
}

export function saveEditorSession(options: {
  shapesByZone: Record<PrintZoneValue, DesignShape[]>
  productColor?: ProductColorValue
  printZone?: PrintZoneValue
  productSlug?: ProductSlug
}) {
  const item = createEmptyLineItem({
    productSlug: options.productSlug ?? EDITOR_DEFAULT_PRODUCT_SLUG,
    productColor: options.productColor ?? 'WHITE',
  })
  item.shapesByZone = {
    FRONT: cloneShapesWithNewIds(options.shapesByZone.FRONT ?? []),
    BACK: cloneShapesWithNewIds(options.shapesByZone.BACK ?? []),
  }
  item.printZone = options.printZone ?? 'FRONT'
  const session = buildEditorSession({ items: [item], activeItemId: item.id })
  saveDesign(sessionToStorageJson(session))
}

export const EDITOR_PATH = '/disenar/editor'
export const PROBAR_DISENO_PATH = '/probar-diseno'
