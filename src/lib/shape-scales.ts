import type { DesignShape } from '../types/design'

export function getShapeScales(shape: DesignShape) {
  const s = shape.scale ?? 1
  return {
    scaleX: shape.scaleX ?? s,
    scaleY: shape.scaleY ?? s,
  }
}

export function uniformScales(value: number) {
  return { scale: value, scaleX: value, scaleY: value }
}
