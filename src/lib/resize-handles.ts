/** Identificador del control de redimensionado activo */
export type ResizeHandle =
  | 'corner-nw'
  | 'corner-ne'
  | 'corner-sw'
  | 'corner-se'
  | 'edge-left'
  | 'edge-right'

export function isCornerHandle(h: ResizeHandle): boolean {
  return h.startsWith('corner-')
}

export function isHorizontalEdge(h: ResizeHandle): boolean {
  return h === 'edge-left' || h === 'edge-right'
}

export const MIN_SHAPE_DISPLAY_PX = 24
