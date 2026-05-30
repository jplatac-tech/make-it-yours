/** Tamaño en pantalla (px) de controles del mockup — no cambian con el zoom del lienzo */

export const MOCKUP_UI = {
  handle: 18,
  handleOffset: 10,
  rotateButton: 36,
  rotateStem: 20,
  rotateOffsetTop: 48,
  actionBarMinHeight: 36,
  actionBarFontSize: 13,
  actionBarPaddingX: 14,
  actionBarGap: 8,
  actionBarOffsetBottom: 48,
  cropEdge: 12,
  selectionBorder: 2,
} as const

/** Móvil: controles siempre del mismo tamaño en pantalla (área táctil amplia) */
export const MOCKUP_UI_MOBILE = {
  handle: 22,
  handleOffset: 12,
  rotateButton: 40,
  rotateStem: 22,
  rotateOffsetTop: 52,
  cropEdge: 14,
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
