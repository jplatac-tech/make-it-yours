import type { DesignShape } from '../types/design'
import type { PrintZoneValue, ProductColorValue } from './products'
import { getPrintZone } from './products'
import { drawImageWithCrop } from './image-crop'
import { sortShapesByLayer } from './shape-layers'
import {
  getCrewneckMockupSrc,
  type MockupColorKey,
  type MockupViewKey,
} from './mockup-assets'
import { resolveImageSrc } from './resolve-image-src'

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
  if (zone === normalizePayloadPrintZone(payload.printZone)) {
    return payload.shapes ?? []
  }
  return []
}

const ZONE_ORDER: PrintZoneValue[] = ['FRONT', 'BACK']

function normalizePayloadPrintZone(zone: string | undefined): PrintZoneValue {
  return zone === 'BACK' ? 'BACK' : 'FRONT'
}

/** Caras del mockup que tienen al menos un elemento de diseño */
export function getZonesWithDesign(
  payload: DesignPayload | null,
): PrintZoneValue[] {
  if (!payload) return []
  if (payload.shapesByZone) {
    return ZONE_ORDER.filter(
      (zone) => (payload.shapesByZone?.[zone]?.length ?? 0) > 0,
    )
  }
  const legacy = payload.shapes ?? []
  if (legacy.length === 0) return []
  return [normalizePayloadPrintZone(payload.printZone)]
}

function loadHtmlImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const el = new window.Image()
    el.crossOrigin = 'anonymous'
    el.onload = () => resolve(el)
    el.onerror = () => resolve(null)
    el.src = src
  })
}

export function getShapeBounds(shape: DesignShape) {
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

async function drawShapeOnCtx(
  ctx: CanvasRenderingContext2D,
  shape: DesignShape,
) {
  const b = getShapeBounds(shape)
  const scale = shape.scale ?? 1
  const rotation = ((shape.rotation ?? 0) * Math.PI) / 180
  const cx = shape.x + b.width / 2
  const cy = shape.y + b.height / 2

  if (shape.type === 'image' && shape.src) {
    let src = shape.src
    try {
      if (src.startsWith('http')) src = await resolveImageSrc(src)
    } catch {
      return
    }
    const img = await loadHtmlImage(src)
    if (!img) return
    const w = (shape.width ?? 140) * scale
    const h = (shape.height ?? 140) * scale
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rotation)
    if (shape.flipX) {
      ctx.scale(-1, 1)
      drawImageWithCrop(ctx, img, shape, -w / 2, -h / 2, w, h)
    } else {
      drawImageWithCrop(ctx, img, shape, -w / 2, -h / 2, w, h)
    }
    ctx.restore()
    return
  }

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rotation)
  ctx.scale(scale, scale)
  ctx.font = `${shape.fontSize ?? 28}px ${shape.fontFamily ?? 'Inter'}`
  ctx.fillStyle = shape.color ?? '#111'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.globalAlpha = shape.opacity ?? 1
  ctx.fillText(shape.text ?? '', 0, 0)
  ctx.restore()
}

/** Renderiza mockup fotográfico + diseño (sin guías del editor) */
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

  const mockupSrc = getCrewneckMockupSrc(
    productColor as MockupColorKey,
    printZone as MockupViewKey,
  )
  const photo = await loadHtmlImage(mockupSrc)
  if (photo) {
    ctx.drawImage(photo, 0, 0, CANVAS_W, CANVAS_H)
  } else {
    ctx.fillStyle = '#e8eaed'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
  }

  const ordered = sortShapesByLayer(shapes)
  for (const shape of ordered) {
    await drawShapeOnCtx(ctx, shape)
  }

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

  const ordered = sortShapesByLayer(shapes)

  for (const shape of ordered) {
    if (shape.type === 'image' && shape.src) {
      const img = await new Promise<HTMLImageElement | null>((resolve) => {
        const el = new window.Image()
        el.onload = () => resolve(el)
        el.onerror = () => resolve(null)
        el.src = shape.src!
      })
      if (!img) continue
      const b = getShapeBounds(shape)
      const relX = (shape.x - zone.printArea.x) * scaleX
      const relY = (shape.y - zone.printArea.y) * scaleY
      const sc = shape.scale ?? 1
      const iw = (shape.width ?? b.width) * scaleX * sc
      const ih = (shape.height ?? b.height) * scaleY * sc
      if (shape.flipX) {
        ctx.save()
        ctx.translate(relX + iw, relY)
        ctx.scale(-1, 1)
        drawImageWithCrop(ctx, img, shape, 0, 0, iw, ih)
        ctx.restore()
      } else {
        drawImageWithCrop(ctx, img, shape, relX, relY, iw, ih)
      }
    } else {
      drawTextShape(shape)
    }
  }

  return canvas.toDataURL('image/png')
}

export type ZoneExports = {
  mockupDataUrl: string | null
  technicalDataUrl: string | null
}

export async function buildDesignExports(designJson: string) {
  const payload = parseDesignPayload(designJson)
  if (!payload) {
    return {
      zonesWithDesign: [] as PrintZoneValue[],
      byZone: {} as Partial<Record<PrintZoneValue, ZoneExports>>,
      mockupDataUrl: null,
      technicalDataUrl: null,
    }
  }

  const color = payload.productColor ?? 'WHITE'
  const zonesWithDesign = getZonesWithDesign(payload)
  const byZone: Partial<Record<PrintZoneValue, ZoneExports>> = {}

  for (const zone of zonesWithDesign) {
    const shapes = getShapesForZone(payload, zone)
    byZone[zone] = {
      mockupDataUrl: (await renderMockupDataUrl(shapes, color, zone)) ?? null,
      technicalDataUrl: (await renderTechnicalDataUrl(shapes, zone)) ?? null,
    }
  }

  const primary = zonesWithDesign[0] ?? 'FRONT'
  const primaryExports = byZone[primary]

  return {
    zonesWithDesign,
    byZone,
    mockupDataUrl: primaryExports?.mockupDataUrl ?? null,
    technicalDataUrl: primaryExports?.technicalDataUrl ?? null,
  }
}
