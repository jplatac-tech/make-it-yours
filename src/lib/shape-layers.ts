import type { DesignShape } from '../types/design'

export type LayerMove = 'forward' | 'backward' | 'toFront' | 'toBack'

/** Asigna capa 1…n a formas guardadas sin `layer` */
export function ensureShapeLayers(shapes: DesignShape[]): DesignShape[] {
  return shapes.map((shape, index) => ({
    ...shape,
    layer: shape.layer ?? index + 1,
  }))
}

export function sortShapesByLayer(shapes: DesignShape[]): DesignShape[] {
  return [...ensureShapeLayers(shapes)].sort(
    (a, b) =>
      (a.layer ?? 0) - (b.layer ?? 0) || a.id.localeCompare(b.id),
  )
}

/** Delante primero (arriba en el panel de capas) */
export function sortShapesFrontFirst(shapes: DesignShape[]): DesignShape[] {
  return [...sortShapesByLayer(shapes)].reverse()
}

export function renumberShapeLayers(shapes: DesignShape[]): DesignShape[] {
  return sortShapesByLayer(shapes).map((shape, index) => ({
    ...shape,
    layer: index + 1,
  }))
}

export function getShapeLayerIndex(
  shapes: DesignShape[],
  id: string,
): { index: number; total: number; isFront: boolean; isBack: boolean } {
  const sorted = sortShapesByLayer(shapes)
  const index = sorted.findIndex((s) => s.id === id)
  const total = sorted.length
  return {
    index,
    total,
    isFront: index === total - 1,
    isBack: index === 0,
  }
}

export function getNextLayer(shapes: DesignShape[]): number {
  const normalized = ensureShapeLayers(shapes)
  const max = normalized.reduce((m, s) => Math.max(m, s.layer ?? 0), 0)
  return max + 1
}

export function applyLayerMove(
  shapes: DesignShape[],
  id: string,
  move: LayerMove,
): DesignShape[] {
  const sorted = sortShapesByLayer(shapes)
  const idx = sorted.findIndex((s) => s.id === id)
  if (idx === -1) return shapes

  const targetIdx =
    move === 'forward'
      ? Math.min(sorted.length - 1, idx + 1)
      : move === 'backward'
        ? Math.max(0, idx - 1)
        : move === 'toFront'
          ? sorted.length - 1
          : 0

  if (targetIdx === idx) return shapes

  const reordered = [...sorted]
  const [item] = reordered.splice(idx, 1)
  reordered.splice(targetIdx, 0, item)

  return reordered.map((shape, index) => ({ ...shape, layer: index + 1 }))
}

/** z-index en el mockup; la selección queda encima para editar */
export function getShapeZIndex(shape: DesignShape, isSelected: boolean): number {
  const base = shape.layer ?? 1
  return isSelected ? base + 10_000 : base
}
