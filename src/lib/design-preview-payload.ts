import { ensureShapeLayers } from './shape-layers'
import { getZonesWithDesign, parseDesignPayload } from './export-design'
import {
  getLineItemsWithDesign,
  lineItemToDesignJson,
  parseEditorSession,
} from './design-storage'
import type { DesignLineItem } from './design-line-items'
import type { PrintZoneValue } from './products'
import type { DesignShape } from '../types/design'

/** Normaliza JSON guardado (sesión v2 o legacy) para vista previa / comprar */
export function resolveDesignPreviewPayload(designJson: string | null) {
  if (!designJson) return null

  const session = parseEditorSession(designJson)
  const withDesign = getLineItemsWithDesign(session)
  if (withDesign.length >= 1) {
    return parseDesignPayload(lineItemToDesignJson(withDesign[0]))
  }

  return parseDesignPayload(designJson)
}

export function getPreviewShapesForZone(
  item: DesignLineItem,
  zone: PrintZoneValue,
): DesignShape[] {
  const zoneShapes = item.shapesByZone[zone] ?? []
  return ensureShapeLayers(
    zoneShapes.map((shape) => ({ ...shape })),
  )
}

export function getLineItemZonesWithDesign(item: DesignLineItem): PrintZoneValue[] {
  return getZonesWithDesign(parseDesignPayload(lineItemToDesignJson(item)))
}
