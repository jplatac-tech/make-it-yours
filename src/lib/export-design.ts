import type { DesignShape } from '../types/design'
import type { PrintZoneValue, ProductColorValue } from './products'
import { GARMENT_COLOR_HEX } from './garment-colors'
import { getPrintZone } from './products'

const CANVAS_W = 400
const CANVAS_H = 520
const EXPORT_SCALE = 2

type DesignPayload = {
  canvas?: { width: number; height: number }
  shapes?: DesignShape[]
  shapesByZone?: Record<PrintZoneValue, DesignShape[]>
  productColor?: ProductColorValue
  printZone?: PrintZoneValue
}

export function parseDesignPayload(json: string): DesignPayload | null {
  try {
    return JSON.parse(json) as DesignPayload
  } catch {
    return null
  }
}

export function getShapesForZone(
  payload: DesignPayload,
  zone: PrintZoneValue,
): DesignShape[] {
  if (payload.shapesByZone) {
    return payload.shapesByZone[zone] ?? []
  }
  return payload.shapes ?? []
}

function getShapeBounds(shape: DesignShape) {
  const scale = shape.scale ?? 1
  if (shape.type === 'image') {
    return {
      width: (shape.width ?? 140) * scale,
      height: (shape.height ?? 140) * scale,
    }
  }
  const fontSize = shape.fontSize ?? 28
  const chars = shape.text?.length ?? 4
  return {
    width: Math.min(chars * fontSize * 0.55, 220) * scale,
    height: fontSize * 1.25 * scale,
  }
}

/** Renderiza el mockup 2D completo (prenda + diseño) */
export async function renderMockupDataUrl(
  shapes: DesignShape[],
  productColor: ProductColorValue,
  printZone: PrintZoneValue,
): Promise<string | null> {
  if (typeof document === 'undefined') return null

  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_W * EXPORT_SCALE
  canvas.height = CANVAS_H * EXPORT_SCALE
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.scale(EXPORT_SCALE, EXPORT_SCALE)
  const palette = GARMENT_COLOR_HEX[productColor]
  const zone = getPrintZone(printZone)
  const area = zone?.printArea

  ctx.fillStyle = '#dfe2e6'
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

  ctx.fillStyle = palette.fill
  ctx.fillRect(72, 172, 256, 280)
  ctx.strokeStyle = palette.stroke
  ctx.lineWidth = 1.2
  ctx.strokeRect(72, 172, 256, 280)

  if (area) {
    ctx.strokeStyle = '#0ea5e9'
    ctx.setLineDash([6, 4])
    ctx.strokeRect(area.x, area.y, area.width, area.height)
    ctx.setLineDash([])
  }

  for (const shape of shapes) {
    const b = getShapeBounds(shape)
    const scale = shape.scale ?? 1
    if (shape.type === 'image' && shape.src) {
      continue
    }
    ctx.save()
    ctx.translate(shape.x + b.width / 2, shape.y + b.height / 2)
    ctx.scale(scale, scale)
    ctx.font = `${shape.fontSize ?? 28}px ${shape.fontFamily ?? 'Inter'}`
    ctx.fillStyle = shape.color ?? '#111'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(shape.text ?? '', 0, 0)
    ctx.restore()
  }

  const imageShapes = shapes.filter((s) => s.type === 'image' && s.src)
  await Promise.all(
    imageShapes.map(
      (shape) =>
        new Promise<void>((resolve) => {
          const img = new window.Image()
          img.onload = () => {
            const b = getShapeBounds(shape)
            const sc = shape.scale ?? 1
            ctx.drawImage(
              img,
              shape.x,
              shape.y,
              (shape.width ?? b.width) * sc,
              (shape.height ?? b.height) * sc,
            )
            resolve()
          }
          img.onerror = () => resolve()
          img.src = shape.src!
        }),
    ),
  )

  return canvas.toDataURL('image/png')
}

/** Archivo técnico: solo área imprimible a 300 DPI aproximado */
export async function renderTechnicalDataUrl(
  shapes: DesignShape[],
  printZone: PrintZoneValue,
): Promise<string | null> {
  if (typeof document === 'undefined') return null
  const zone = getPrintZone(printZone)
  if (!zone) return null

  const dpi = 300
  const w = Math.round(zone.widthIn * dpi)
  const h = Math.round(zone.heightIn * dpi)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.fillStyle = 'transparent'
  ctx.clearRect(0, 0, w, h)

  const scaleX = w / zone.printArea.width
  const scaleY = h / zone.printArea.height

  const drawTextShape = (shape: DesignShape) => {
    const b = getShapeBounds(shape)
    const relX = (shape.x - zone.printArea.x) * scaleX
    const relY = (shape.y - zone.printArea.y) * scaleY
    const sc = shape.scale ?? 1
    ctx.save()
    ctx.translate(relX + (b.width * scaleX) / 2, relY + (b.height * scaleY) / 2)
    ctx.scale(sc, sc)
    ctx.font = `${(shape.fontSize ?? 28) * scaleY}px ${shape.fontFamily ?? 'Inter'}`
    ctx.fillStyle = shape.color ?? '#111'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(shape.text ?? '', 0, 0)
    ctx.restore()
  }

  for (const shape of shapes) {
    if (shape.type !== 'image') drawTextShape(shape)
  }

  const images = shapes.filter((s) => s.type === 'image' && s.src)
  await Promise.all(
    images.map(
      (shape) =>
        new Promise<void>((resolve) => {
          const img = new window.Image()
          img.onload = () => {
            const b = getShapeBounds(shape)
            const relX = (shape.x - zone.printArea.x) * scaleX
            const relY = (shape.y - zone.printArea.y) * scaleY
            const sc = shape.scale ?? 1
            ctx.drawImage(
              img,
              relX,
              relY,
              (shape.width ?? b.width) * scaleX * sc,
              (shape.height ?? b.height) * scaleY * sc,
            )
            resolve()
          }
          img.onerror = () => resolve()
          img.src = shape.src!
        }),
    ),
  )

  return canvas.toDataURL('image/png')
}

export async function buildDesignExports(designJson: string) {
  const payload = parseDesignPayload(designJson)
  if (!payload) return { mockupDataUrl: null, technicalDataUrl: null }

  const zone = (payload.printZone === 'BACK' ? 'BACK' : 'FRONT') as PrintZoneValue
  const color = payload.productColor ?? 'WHITE'
  const shapes = getShapesForZone(payload, zone)

  const mockup = (await renderMockupDataUrl(shapes, color, zone)) ?? null
  const technical = await renderTechnicalDataUrl(shapes, zone)

  return { mockupDataUrl: mockup, technicalDataUrl: technical }
}
