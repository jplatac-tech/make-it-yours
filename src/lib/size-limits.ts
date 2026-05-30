import type { DesignShape } from '../types/design'

export const PX_PER_CM = 10
export const SAFE_MAX_CM = { w: 30, h: 50 }
export const PRESS_MAX_CM = { w: 40, h: 60 }

const MIN_SCALE = 0.05
const MAX_SCALE = 50

/** Solo límites de sanidad (mín/máx escala), sin tope por cm ni área de impresión */
export function clampScaleForShape(
  shape: DesignShape,
  desiredScale: number,
  _canvasW: number,
  _canvasH: number,
  _printArea?: { x: number; y: number; width: number; height: number },
): number {
  void shape
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, desiredScale))
}

/** Tamaños de fuente sugeridos (sin tope estricto por cm) */
export function getMaxFontSizeForShape(
  shape: DesignShape,
  printArea?: { x: number; y: number; width: number; height: number },
): number {
  const chars = Math.max(shape.text?.length ?? 4, 1)
  const areaW = printArea?.width ?? 200
  const areaH = printArea?.height ?? 200
  const byHeight = Math.floor(areaH / 1.1)
  const byWidth = Math.floor(areaW / (chars * 0.45))
  return Math.max(12, Math.min(200, byHeight, byWidth))
}
