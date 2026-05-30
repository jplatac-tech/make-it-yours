import type { DesignShape } from '../types/design'
import type { PrintZoneValue, ProductColorValue } from './products'
import { saveDesignPayload } from './design-storage'

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
}) {
  saveDesignPayload({
    canvas: CANVAS,
    shapesByZone: {
      FRONT: cloneShapesWithNewIds(options.shapesByZone.FRONT ?? []),
      BACK: cloneShapesWithNewIds(options.shapesByZone.BACK ?? []),
    },
    productColor: options.productColor ?? 'WHITE',
    printZone: options.printZone ?? 'FRONT',
  })
}

export const EDITOR_PATH = '/disenar/editor'
