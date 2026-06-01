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

/** Límite alto solo por sanidad; el usuario elige el tamaño en el editor */
export function getMaxFontSizeForShape(
  _shape: DesignShape,
  _printArea?: { x: number; y: number; width: number; height: number },
): number {
  return 512
}
