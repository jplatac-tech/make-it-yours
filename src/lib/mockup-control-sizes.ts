/** Tamaño en pantalla (px) de controles del mockup — no cambian con el zoom del lienzo */

export const MOCKUP_UI = {
  /** Círculo visible en esquinas */
  corner: 7,
  /** Área de toque (contenedor invisible) en esquinas */
  cornerHit: 28,
  /** Pastilla visible en lados */
  sideW: 3,
  sideH: 14,
  sideHitW: 22,
  sideHitH: 28,
  rotate: 22,
  rotateStem: 14,
  rotateOffsetBottom: 28,
  canvasPadBottom: 72,
  contextBarGap: 6,
  contextBarOffsetTop: 10,
  cropEdge: 6,
  selectionBorder: 1.5,
  /** Botones del marco (mover / eliminar / girar) */
  frameBtn: 28,
  frameIcon: 14,
} as const

/** Móvil: hit area un poco mayor; visual igual de compacto */
export const MOCKUP_UI_MOBILE = {
  corner: 7,
  cornerHit: 34,
  sideW: 3,
  sideH: 14,
  sideHitW: 24,
  sideHitH: 32,
  rotate: 24,
  rotateStem: 14,
  rotateOffsetBottom: 30,
  canvasPadBottom: 80,
  contextBarGap: 6,
  contextBarOffsetTop: 8,
  cropEdge: 7,
  selectionBorder: 1.5,
  frameBtn: 32,
  frameIcon: 15,
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
