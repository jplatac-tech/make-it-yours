import type { CSSProperties } from 'react'
import type { DesignShape } from '../types/design'

export function getShapeTransform(shape: DesignShape) {
  const scale = shape.scale ?? 1
  const rotation = shape.rotation ?? 0
  return `rotate(${rotation}deg) scale(${scale})`
}

export function getImageBorderRadius(shape: DesignShape) {
  const r = shape.borderRadius ?? 0
  if (r >= 50) return '50%'
  return `${r}%`
}

export function getShapeOpacity(shape: DesignShape) {
  return shape.opacity ?? 1
}

export function getTextStyleProps(shape: DesignShape): CSSProperties {
  return {
    fontSize: shape.fontSize,
    fontFamily: shape.fontFamily ?? 'Inter',
    fontWeight: shape.fontWeight ?? 600,
    fontStyle: shape.fontStyle ?? 'normal',
    textDecoration: shape.textDecoration ?? 'none',
    letterSpacing: shape.letterSpacing ? `${shape.letterSpacing}px` : undefined,
    color: shape.color,
    whiteSpace: 'pre-wrap',
    opacity: getShapeOpacity(shape),
  }
}

export function getImageCropStyle(shape: DesignShape): CSSProperties {
  const top = (shape.cropTop ?? 0) * 100
  const right = (shape.cropRight ?? 0) * 100
  const bottom = (shape.cropBottom ?? 0) * 100
  const left = (shape.cropLeft ?? 0) * 100
  if (!top && !right && !bottom && !left) return {}
  return { clipPath: `inset(${top}% ${right}% ${bottom}% ${left}%)` }
}
