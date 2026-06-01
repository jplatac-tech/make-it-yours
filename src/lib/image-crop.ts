import type { DesignShape } from '../types/design'

export type CropInsets = {
  top: number
  right: number
  bottom: number
  left: number
}

export const MAX_CROP_INSET = 0.48

export function getCropInsets(shape: DesignShape): CropInsets {
  return {
    top: shape.cropTop ?? 0,
    right: shape.cropRight ?? 0,
    bottom: shape.cropBottom ?? 0,
    left: shape.cropLeft ?? 0,
  }
}

export function hasCropInsets(insets: CropInsets): boolean {
  return insets.top > 0 || insets.right > 0 || insets.bottom > 0 || insets.left > 0
}

export function clampCropInsets(insets: CropInsets): CropInsets {
  const top = Math.min(MAX_CROP_INSET, Math.max(0, insets.top))
  const right = Math.min(MAX_CROP_INSET, Math.max(0, insets.right))
  const bottom = Math.min(MAX_CROP_INSET, Math.max(0, insets.bottom))
  const left = Math.min(MAX_CROP_INSET, Math.max(0, insets.left))
  const maxSide = 1 - 0.04
  if (top + bottom > maxSide) {
    const s = maxSide / (top + bottom)
    return { top: top * s, right, bottom: bottom * s, left }
  }
  if (left + right > maxSide) {
    const s = maxSide / (left + right)
    return { top, right: right * s, bottom, left: left * s }
  }
  return { top, right, bottom, left }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('No se pudo cargar la imagen'))
    img.src = src
  })
}

/** Aplica el recorte a píxeles reales (nueva imagen y tamaño en el lienzo). */
export async function bakeImageCrop(
  shape: DesignShape,
): Promise<Partial<DesignShape> | null> {
  if (shape.type !== 'image' || !shape.src) return null
  const insets = getCropInsets(shape)
  if (!hasCropInsets(insets)) return {}

  const displayW = shape.width ?? 140
  const displayH = shape.height ?? 140
  const scale = shape.scale ?? 1

  const img = await loadImage(shape.src)
  const sx = insets.left * img.naturalWidth
  const sy = insets.top * img.naturalHeight
  const sw = img.naturalWidth * (1 - insets.left - insets.right)
  const sh = img.naturalHeight * (1 - insets.top - insets.bottom)
  if (sw < 2 || sh < 2) return null

  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(displayW * (1 - insets.left - insets.right)))
  canvas.height = Math.max(1, Math.round(displayH * (1 - insets.top - insets.bottom)))
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)

  return {
    src: canvas.toDataURL('image/png'),
    width: canvas.width,
    height: canvas.height,
    x: shape.x + insets.left * displayW * scale,
    y: shape.y + insets.top * displayH * scale,
    cropTop: 0,
    cropRight: 0,
    cropBottom: 0,
    cropLeft: 0,
  }
}

export function drawImageWithCrop(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  shape: DesignShape,
  destX: number,
  destY: number,
  destW: number,
  destH: number,
) {
  const insets = getCropInsets(shape)
  if (!hasCropInsets(insets)) {
    ctx.drawImage(img, destX, destY, destW, destH)
    return
  }

  const sx = insets.left * img.naturalWidth
  const sy = insets.top * img.naturalHeight
  const sw = img.naturalWidth * (1 - insets.left - insets.right)
  const sh = img.naturalHeight * (1 - insets.top - insets.bottom)
  ctx.drawImage(img, sx, sy, sw, sh, destX, destY, destW, destH)
}
