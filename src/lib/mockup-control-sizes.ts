/** Tamaño en pantalla (px) de controles del mockup — no cambian con el zoom del lienzo */

export const MOCKUP_UI = {
  /** Círculo blanco en esquinas (estilo Canva) */
  corner: 11,
  /** Pastilla blanca en lados */
  sideW: 5,
  sideH: 22,
  rotate: 26,
  rotateStem: 18,
  rotateOffsetBottom: 34,
  canvasPadBottom: 72,
  contextBarGap: 8,
  contextBarOffsetTop: 12,
  cropEdge: 7,
  selectionBorder: 1.5,
} as const

/** Móvil: mismos px de pantalla; se convierten con uiCanvasPx(stageScale) */
export const MOCKUP_UI_MOBILE = {
  corner: 12,
  sideW: 5,
  sideH: 24,
  rotate: 28,
  rotateStem: 16,
  rotateOffsetBottom: 34,
  canvasPadBottom: 80,
  contextBarGap: 8,
  contextBarOffsetTop: 10,
  cropEdge: 8,
  selectionBorder: 1.5,
} as const

/** Convierte px de pantalla a px en el lienzo (el padre aplica scale(zoom)) */
export function uiCanvasPx(screenPx: number, canvasZoom: number): number {
  const z = Math.max(canvasZoom, 0.25)
  return screenPx / z
}

export function resolveMockupControlPx(
  screenPx: number,
  canvasZoom: number,
  fixedScreen: boolean,
): number {
  return fixedScreen ? screenPx : uiCanvasPx(screenPx, canvasZoom)
}
