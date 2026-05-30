'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useEditorDesktopLayout } from '../../hooks/use-media-query'
import { EditorMobileDock, type MobileDockTab } from './editor-mobile-dock'
import { getTemplateById } from '../../lib/design-templates'
import { cloneShapesWithNewIds } from '../../lib/start-editor'
import {
  PRODUCT_COLORS,
  PRINT_ZONES,
  getPrintZone,
  normalizePrintZone,
  type ProductColorValue,
  type PrintZoneValue,
} from '../../lib/products'
import { defaultElementColor } from '../../lib/garment-colors'
import { loadDesign, saveDesign } from '../../lib/design-storage'
import { CrewneckMockup } from '../product/crewneck-mockup'
import { EditorPanel, type EditorPanelId } from './editor-panel'
import { CanvasElement } from './canvas-element'
import { MockupEditPanel } from './mockup-edit-panel'
import { MockupViewToggle } from './mockup-view-toggle'
import { MockupZoomControls } from './mockup-zoom-controls'
import { getDefaultFontFamily } from '../../lib/editor-fonts'
import { type TextPreset } from '../../lib/text-presets'
import type { DesignShape } from '../../types/design'
import {
  buildWhatsAppUrl,
  formatDesignQuoteMessage,
} from '../../lib/whatsapp'
import {
  resolveImageSrc,
  loadImageDimensions,
  fitImageInitialOnCanvas,
} from '../../lib/resolve-image-src'
import {
  addUploadedFile,
  compressImageToDataUrl,
} from '../../lib/uploaded-files-storage'
import {
  computeAlignmentSnap,
  getProximityGuides,
  type GuideLines,
} from '../../lib/alignment-guides'
import { clampScaleForShape } from '../../lib/size-limits'

import { EDITOR_CANVAS_H, EDITOR_CANVAS_W } from '../../lib/editor-canvas'

const CANVAS_W = EDITOR_CANVAS_W
const CANVAS_H = EDITOR_CANVAS_H

// Size limits are handled by `src/lib/size-limits.ts`

const emptyShapesByZone = (): Record<PrintZoneValue, DesignShape[]> => ({
  FRONT: [],
  BACK: [],
})

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

function centerInPrintArea(zone: PrintZoneValue) {
  const area = getPrintZone(zone)?.printArea
  if (!area) return { x: CANVAS_W / 2 - 60, y: CANVAS_H / 2 - 20 }
  return {
    x: area.x + area.width / 2 - 60,
    y: area.y + area.height / 2 - 20,
  }
}

export function DesignStudio() {
  const searchParams = useSearchParams()
  const loadedFromUrl = useRef(false)
  const [editorReady, setEditorReady] = useState(false)
  const [shapesByZone, setShapesByZone] =
    useState<Record<PrintZoneValue, DesignShape[]>>(emptyShapesByZone)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingTextId, setEditingTextId] = useState<string | null>(null)
  const [productColor, setProductColor] = useState<ProductColorValue>('WHITE')
  const [printZone, setPrintZone] = useState<PrintZoneValue>('FRONT')
  const [activePanel, setActivePanel] = useState<EditorPanelId>('designs')
  const [mobileTab, setMobileTab] = useState<MobileDockTab>('designs')
  const isDesktop = useEditorDesktopLayout()
  const mockupFitRef = useRef<HTMLDivElement | null>(null)
  const [mockupFitScale, setMockupFitScale] = useState(1)
  const [uploadsRefresh, setUploadsRefresh] = useState(0)
  const [canvasZoom, setCanvasZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [limitWarning, setLimitWarning] = useState<string | null>(null)
  const [cropModeId, setCropModeId] = useState<string | null>(null)
  const limitTimerRef = useRef<number | null>(null)
  const mockupBackgroundColor = '#d8dde3'
  const [guideLines, setGuideLines] = useState<GuideLines>({
    vertical: [],
    horizontal: [],
  })
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const shapesRef = useRef(shapesByZone)
  const printZoneRef = useRef(printZone)
  const canvasZoomRef = useRef(canvasZoom)
  shapesRef.current = shapesByZone
  printZoneRef.current = printZone
  const effectiveCanvasZoom = isDesktop ? canvasZoom : mockupFitScale
  canvasZoomRef.current = effectiveCanvasZoom
  const dragState = useRef<{
    id: string
    startX: number
    startY: number
    originX: number
    originY: number
    width: number
    height: number
  } | null>(null)
  const resizeState = useRef<{
    id: string
    startX: number
    startY: number
    originScale: number
  } | null>(null)
  const rotateState = useRef<{
    id: string
    startAngle: number
    originRotation: number
    cx: number
    cy: number
  } | null>(null)
  const cropState = useRef<{
    id: string
    edge: 'top' | 'right' | 'bottom' | 'left'
    startX: number
    startY: number
    imgW: number
    imgH: number
    origin: {
      cropTop: number
      cropRight: number
      cropBottom: number
      cropLeft: number
    }
  } | null>(null)

  const MAX_CROP = 0.42

  const shapes = shapesByZone[printZone]

  const setShapes = useCallback(
    (updater: DesignShape[] | ((prev: DesignShape[]) => DesignShape[])) => {
      setShapesByZone((prev) => {
        const current = prev[printZone]
        const next = typeof updater === 'function' ? updater(current) : updater
        return { ...prev, [printZone]: next }
      })
    },
    [printZone],
  )

  const selectedShape = useMemo(
    () => shapes.find((s) => s.id === selectedId) ?? null,
    [selectedId, shapes],
  )

  const canContinue =
    shapesByZone.FRONT.length > 0 || shapesByZone.BACK.length > 0

  const persist = useCallback(
    (
      nextByZone: Record<PrintZoneValue, DesignShape[]>,
      zone: PrintZoneValue,
      color: ProductColorValue,
    ) => {
      const json = JSON.stringify({
        canvas: { width: CANVAS_W, height: CANVAS_H },
        shapesByZone: nextByZone,
        productColor: color,
        printZone: zone,
      })
      saveDesign(json)
    },
    [],
  )

  useEffect(() => {
    if (loadedFromUrl.current) return
    loadedFromUrl.current = true

    const tplId = searchParams.get('tpl')
    const stored = loadDesign()

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as {
          shapes?: DesignShape[]
          shapesByZone?: Record<PrintZoneValue, DesignShape[]>
          productColor?: ProductColorValue
          printZone?: string
        }
        if (parsed.shapesByZone) {
          setShapesByZone({
            FRONT: parsed.shapesByZone.FRONT ?? [],
            BACK: parsed.shapesByZone.BACK ?? [],
          })
        } else if (parsed.shapes?.length) {
          const zone = normalizePrintZone(parsed.printZone)
          setShapesByZone({
            FRONT: zone === 'FRONT' ? parsed.shapes : [],
            BACK: zone === 'BACK' ? parsed.shapes : [],
          })
        }
        if (parsed.productColor) setProductColor(parsed.productColor)
        if (parsed.printZone) setPrintZone(normalizePrintZone(parsed.printZone))
        setEditorReady(true)
        return
      } catch {
        /* fall through */
      }
    }

    if (tplId) {
      const tpl = getTemplateById(tplId)
      const front = cloneShapesWithNewIds(tpl?.shapesByZone.FRONT ?? [])
      const back = cloneShapesWithNewIds(tpl?.shapesByZone.BACK ?? [])
      setShapesByZone({ FRONT: front, BACK: back })
      if (tpl?.productColor) setProductColor(tpl.productColor)
    }

    setEditorReady(true)
  }, [searchParams])

  useEffect(() => {
    if (!editorReady) return
    persist(shapesByZone, printZone, productColor)
  }, [shapesByZone, printZone, productColor, persist, editorReady])

  useEffect(() => {
    if (isDesktop) {
      setMockupFitScale(1)
      return
    }
    const el = mockupFitRef.current
    if (!el) return

    const update = () => {
      const pad = 24
      const w = el.clientWidth - pad
      const h = el.clientHeight - pad
      const scaleW = w / CANVAS_W
      const scaleH = h / CANVAS_H
      setMockupFitScale(Math.max(0.28, Math.min(scaleW, scaleH, 1)))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [isDesktop])

  const stageScale = isDesktop ? canvasZoom : mockupFitScale

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        selectedId &&
        !editingTextId
      ) {
        setShapes((s) => s.filter((sh) => sh.id !== selectedId))
        setSelectedId(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId, editingTextId])

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (cropState.current) {
        const { id, edge, startX, startY, imgW, imgH, origin } =
          cropState.current
        const zoom = canvasZoomRef.current || 1
        const dx = (e.clientX - startX) / zoom / imgW
        const dy = (e.clientY - startY) / zoom / imgH
        setShapes((s) =>
          s.map((sh) => {
            if (sh.id !== id) return sh
            const patch: Partial<DesignShape> = {}
            if (edge === 'top') {
              patch.cropTop = Math.min(
                MAX_CROP,
                Math.max(0, origin.cropTop + dy),
              )
            }
            if (edge === 'bottom') {
              patch.cropBottom = Math.min(
                MAX_CROP,
                Math.max(0, origin.cropBottom - dy),
              )
            }
            if (edge === 'left') {
              patch.cropLeft = Math.min(
                MAX_CROP,
                Math.max(0, origin.cropLeft + dx),
              )
            }
            if (edge === 'right') {
              patch.cropRight = Math.min(
                MAX_CROP,
                Math.max(0, origin.cropRight - dx),
              )
            }
            return { ...sh, ...patch }
          }),
        )
        return
      }
      if (rotateState.current) {
        const { id, startAngle, originRotation, cx, cy } = rotateState.current
        const angle =
          (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI
        const delta = angle - startAngle
        const rotation = Math.round(originRotation + delta)
        setShapes((s) =>
          s.map((sh) => (sh.id === id ? { ...sh, rotation } : sh)),
        )
        return
      }
      if (resizeState.current) {
        setIsDragging(false)
        setGuideLines({ vertical: [], horizontal: [] })
        const { id, startX, originScale } = resizeState.current
        const delta = (e.clientX - startX) / 120
        const shape = shapesRef.current[printZoneRef.current].find(
          (sh) => sh.id === id,
        )
        if (!shape) return
        const scale = clampScaleForShape(
          shape,
          originScale + delta,
          CANVAS_W,
          CANVAS_H,
        )
        setShapes((s) =>
          s.map((sh) => (sh.id === id ? { ...sh, scale } : sh)),
        )
        return
      }
      if (!dragState.current) return
      e.preventDefault()
      setIsDragging(true)

      const zone = printZoneRef.current
      const zoneShapes = shapesRef.current[zone]
      const { id, startX, startY, originX, originY, width, height } =
        dragState.current

      const zoom = canvasZoomRef.current || 1
      const rawX = originX + (e.clientX - startX) / zoom
      const rawY = originY + (e.clientY - startY) / zoom

      const printArea = getPrintZone(zone)?.printArea ?? {
        x: 125,
        y: 238,
        width: 150,
        height: 150,
      }

      const others = zoneShapes
        .filter((sh) => sh.id !== id)
        .map((sh) => {
          const b = getShapeBounds(sh)
          return { x: sh.x, y: sh.y, width: b.width, height: b.height }
        })

      const snapped = computeAlignmentSnap(
        rawX,
        rawY,
        width,
        height,
        printArea,
        { width: CANVAS_W, height: CANVAS_H },
        others,
      )

      const proximity = getProximityGuides(
        snapped.x,
        snapped.y,
        width,
        height,
        printArea,
        { width: CANVAS_W, height: CANVAS_H },
        others,
      )

      const mergedVertical = [
        ...new Set([...snapped.guides.vertical, ...proximity.vertical]),
      ]
      const mergedHorizontal = [
        ...new Set([...snapped.guides.horizontal, ...proximity.horizontal]),
      ]

      setGuideLines({
        vertical: mergedVertical,
        horizontal: mergedHorizontal,
      })

      setShapesByZone((prev) => ({
        ...prev,
        [zone]: prev[zone].map((sh) =>
          sh.id === id ? { ...sh, x: snapped.x, y: snapped.y } : sh,
        ),
      }))
    }
    const onUp = () => {
      dragState.current = null
      resizeState.current = null
      rotateState.current = null
      cropState.current = null
      setIsDragging(false)
      setGuideLines({ vertical: [], horizontal: [] })
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [setShapesByZone])

  const updateShape = (id: string, patch: Partial<DesignShape>) => {
    setShapes((s) => {
      const next = s.map((sh) => (sh.id === id ? { ...sh, ...patch } : sh))
      return next
    })
  }

  const addText = () => {
    const id = `shape-${Date.now()}`
    const pos = centerInPrintArea(printZone)
    setShapes((s) => [
      ...s,
      {
        id,
        type: 'text',
        x: pos.x,
        y: pos.y,
        text: 'Escribe aquí',
        fontSize: 32,
        fontFamily: getDefaultFontFamily(),
        fontWeight: 600,
        color: defaultElementColor(productColor),
        rotation: 0,
      },
    ])
    setSelectedId(id)
    setActivePanel('text')
  }

  const addTextPreset = (preset: TextPreset) => {
    const id = `shape-${Date.now()}`
    const pos = centerInPrintArea(printZone)
    setShapes((s) => [
      ...s,
      {
        id,
        type: 'text',
        x: pos.x,
        y: pos.y,
        text: preset.text,
        fontSize: preset.fontSize,
        fontFamily: preset.fontFamily,
        fontWeight: preset.fontWeight,
        letterSpacing: preset.letterSpacing,
        color: defaultElementColor(productColor),
        rotation: 0,
      },
    ])
    setSelectedId(id)
    setActivePanel('text')
  }

  const addIcon = (icon: string) => {
    const id = `shape-${Date.now()}`
    const pos = centerInPrintArea(printZone)
    setShapes((s) => [
      ...s,
      {
        id,
        type: 'icon',
        x: pos.x + 40,
        y: pos.y,
        text: icon,
        fontSize: 52,
        color: defaultElementColor(productColor),
      },
    ])
    setSelectedId(id)
    setActivePanel('elements')
  }

  const placeImageOnCanvas = useCallback(
    (src: string, w: number, h: number) => {
      const id = `shape-${Date.now()}`
      const zone = printZoneRef.current
      const area = getPrintZone(zone)?.printArea
      const x = area ? area.x + area.width / 2 - w / 2 : CANVAS_W / 2 - w / 2
      const y = area ? area.y + area.height / 2 - h / 2 : CANVAS_H / 2 - h / 2
      const newShape: DesignShape = {
        id,
        type: 'image',
        x,
        y,
        src,
        width: w,
        height: h,
        scale: 1,
      }

      const withoutImages = (list: DesignShape[]) =>
        list.filter((sh) => sh.type !== 'image')

      setShapesByZone((prev) => {
        const hadImage =
          prev.FRONT.some((sh) => sh.type === 'image') ||
          prev.BACK.some((sh) => sh.type === 'image')
        if (hadImage) {
          setLimitWarning('Solo una imagen en el mockup. Se reemplazó la anterior.')
          if (limitTimerRef.current) window.clearTimeout(limitTimerRef.current)
          limitTimerRef.current = window.setTimeout(
            () => setLimitWarning(null),
            2500,
          )
        }
        return {
          FRONT: withoutImages(prev.FRONT),
          BACK: withoutImages(prev.BACK),
          [zone]: [...withoutImages(prev[zone]), newShape],
        }
      })
      setSelectedId(id)
      setActivePanel('designs')
    },
    [],
  )

  const addImageFromSrc = useCallback(
    async (src: string) => {
      try {
        const resolved = await resolveImageSrc(src)
        const dims = await loadImageDimensions(resolved)
        const { width, height } = fitImageInitialOnCanvas(
          dims.width,
          dims.height,
          CANVAS_W,
          CANVAS_H,
        )
        placeImageOnCanvas(resolved, width, height)
      } catch {
        const { width, height } = fitImageInitialOnCanvas(
          200,
          200,
          CANVAS_W,
          CANVAS_H,
        )
        placeImageOnCanvas(src, width, height)
      }
    },
    [placeImageOnCanvas],
  )

  const handleUserUpload = async (file: File) => {
    try {
      const dataUrl = await compressImageToDataUrl(file)
      await addUploadedFile(file.name, dataUrl)
      setUploadsRefresh((k) => k + 1)
      const dims = await loadImageDimensions(dataUrl)
      const { width, height } = fitImageInitialOnCanvas(
        dims.width,
        dims.height,
        CANVAS_W,
        CANVAS_H,
      )
      placeImageOnCanvas(dataUrl, width, height)
    } catch {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          void addImageFromSrc(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const addCatalogDesign = (src: string) => {
    void addImageFromSrc(src)
  }

  const duplicateSelected = () => {
    if (!selectedShape) return
    const id = `shape-${Date.now()}`
    setShapes((s) => [
      ...s,
      {
        ...selectedShape,
        id,
        x: selectedShape.x + 20,
        y: selectedShape.y + 20,
      },
    ])
    setSelectedId(id)
  }

  const removeSelected = () => {
    if (!selectedId) return
    setShapes((s) => s.filter((sh) => sh.id !== selectedId))
    setSelectedId(null)
    setCropModeId(null)
  }

  const startCropEdge = (
    shape: DesignShape,
    edge: 'top' | 'right' | 'bottom' | 'left',
    e: React.PointerEvent,
  ) => {
    cropState.current = {
      id: shape.id,
      edge,
      startX: e.clientX,
      startY: e.clientY,
      imgW: shape.width ?? 140,
      imgH: shape.height ?? 140,
      origin: {
        cropTop: shape.cropTop ?? 0,
        cropRight: shape.cropRight ?? 0,
        cropBottom: shape.cropBottom ?? 0,
        cropLeft: shape.cropLeft ?? 0,
      },
    }
  }

  const startRotate = (shape: DesignShape, e: React.PointerEvent) => {
    const bounds = getShapeBounds(shape)
    const rect = canvasRef.current?.getBoundingClientRect()
    const zoom = canvasZoomRef.current || 1
    const cx =
      (rect?.left ?? 0) + (shape.x + bounds.width / 2) * zoom
    const cy =
      (rect?.top ?? 0) + (shape.y + bounds.height / 2) * zoom
    const startAngle =
      (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI
    rotateState.current = {
      id: shape.id,
      startAngle,
      originRotation: shape.rotation ?? 0,
      cx,
      cy,
    }
  }

  const designJson = useMemo(
    () =>
      JSON.stringify({
        canvas: { width: CANVAS_W, height: CANVAS_H },
        shapesByZone,
        productColor,
        printZone,
      }),
    [shapesByZone, productColor, printZone],
  )

  const whatsappDesignHref = buildWhatsAppUrl(
    formatDesignQuoteMessage(designJson, 'Suéter / crewneck personalizado'),
  )

  return (
    <div className="flex h-[calc(100dvh-53px)] min-h-0 flex-col overflow-hidden bg-[#eef0f4] max-lg:h-[100dvh] max-lg:max-h-[100dvh] lg:flex-row">
      <EditorPanel
        activePanel={activePanel}
        setActivePanel={setActivePanel}
        productColor={productColor}
        setProductColor={setProductColor}
        onClearSelection={() => {
          setSelectedId(null)
          setEditingTextId(null)
        }}
        addText={addText}
        addTextPreset={addTextPreset}
        onDesignSelect={addCatalogDesign}
        onGallerySelect={(src) => void addImageFromSrc(src)}
        addIcon={addIcon}
        onUploadSelect={(src) => void addImageFromSrc(src)}
        onUserUpload={handleUserUpload}
        uploadsRefresh={uploadsRefresh}
        canContinue={canContinue}
        whatsappDesignHref={whatsappDesignHref}
      />

      <section className="relative z-10 flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="hidden shrink-0 border-b border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-600 lg:block">
            <strong className="text-neutral-900">Editor</strong> ·{' '}
            {shapes.length} elemento{shapes.length === 1 ? '' : 's'}
          </div>

          <div className="grid min-h-0 min-w-0 flex-1 grid-rows-[minmax(0,38dvh)_minmax(0,1fr)] overflow-hidden bg-[#e8ebf0] lg:flex lg:flex-row lg:grid-rows-none">
            <div
              ref={mockupFitRef}
              className="relative flex min-h-0 min-w-0 touch-none items-center justify-center overflow-hidden px-3 py-2 lg:min-h-0 lg:flex-1 lg:p-4"
            >
              {limitWarning ? (
                <div className="pointer-events-none absolute top-3 left-1/2 z-30 -translate-x-1/2 rounded-full bg-yellow-50 px-4 py-2 text-sm font-semibold text-yellow-800 shadow">
                  {limitWarning}
                </div>
              ) : null}

              <div className="absolute top-2 left-1/2 z-30 -translate-x-1/2 lg:left-4 lg:translate-x-0">
                <MockupViewToggle
                  printZone={printZone}
                  productColor={productColor}
                  onChange={setPrintZone}
                  fixedSize={!isDesktop}
                />
              </div>

              <div className="absolute bottom-2 left-2 z-20 hidden lg:block">
                <MockupZoomControls
                  zoom={canvasZoom}
                  onZoomChange={setCanvasZoom}
                />
              </div>

              <div
                className="relative shrink-0 overflow-hidden rounded-xl shadow-xl"
                style={
                  isDesktop
                    ? {
                        width: CANVAS_W,
                        height: CANVAS_H,
                        backgroundColor: mockupBackgroundColor,
                      }
                    : {
                        width: CANVAS_W * stageScale,
                        height: CANVAS_H * stageScale,
                        backgroundColor: mockupBackgroundColor,
                      }
                }
              >
                <div
                  ref={canvasRef}
                  className={
                    isDesktop
                      ? 'absolute left-1/2 top-1/2 origin-center'
                      : 'absolute left-0 top-0 origin-top-left'
                  }
                  style={
                    isDesktop
                      ? {
                          width: CANVAS_W,
                          height: CANVAS_H,
                          marginLeft: -CANVAS_W / 2,
                          marginTop: -CANVAS_H / 2,
                          transform: `scale(${canvasZoom})`,
                        }
                      : {
                          width: CANVAS_W,
                          height: CANVAS_H,
                          transform: `scale(${stageScale})`,
                        }
                  }
                  onPointerDown={() => {
                    if (!editingTextId) {
                      setSelectedId(null)
                      setCropModeId(null)
                    }
                  }}
                >
                <CrewneckMockup
                  view={printZone}
                  color={productColor}
                  className="absolute inset-0 h-full w-full"
                />

                {isDragging ? (
                  <div
                    className="pointer-events-none absolute inset-0 z-[25]"
                    aria-hidden
                  >
                    {guideLines.vertical.map((x) => (
                      <div
                        key={`guide-v-${x}`}
                        className="absolute top-0 bottom-0 w-px bg-fuchsia-500 shadow-[0_0_0_1px_rgba(255,255,255,0.8)]"
                        style={{ left: x }}
                      />
                    ))}
                    {guideLines.horizontal.map((y) => (
                      <div
                        key={`guide-h-${y}`}
                        className="absolute right-0 left-0 h-px bg-fuchsia-500 shadow-[0_0_0_1px_rgba(255,255,255,0.8)]"
                        style={{ top: y }}
                      />
                    ))}
                  </div>
                ) : null}

                {shapes.map((shape) => {
                  const isSelected = shape.id === selectedId
                  const isEditing = shape.id === editingTextId
                  const bounds = getShapeBounds(shape)

                  return (
                    <CanvasElement
                      key={shape.id}
                      shape={shape}
                      bounds={bounds}
                      isSelected={isSelected}
                      isEditing={isEditing}
                      cropMode={cropModeId === shape.id}
                      canvasZoom={effectiveCanvasZoom}
                      fixedScreenControls={!isDesktop}
                      onSelect={() => {
                        setSelectedId(shape.id)
                        setActivePanel(
                          shape.type === 'image' ? 'designs' : 'text',
                        )
                      }}
                      onDragStart={(e) => {
                        dragState.current = {
                          id: shape.id,
                          startX: e.clientX,
                          startY: e.clientY,
                          originX: shape.x,
                          originY: shape.y,
                          width: bounds.width,
                          height: bounds.height,
                        }
                      }}
                      onResizeStart={(e) => {
                        resizeState.current = {
                          id: shape.id,
                          startX: e.clientX,
                          startY: e.clientY,
                          originScale: shape.scale ?? 1,
                        }
                      }}
                      onRotateStart={(e) => startRotate(shape, e)}
                      onCropEdgeStart={(edge, e) =>
                        startCropEdge(shape, edge, e)
                      }
                      onDoubleClick={(e) => {
                        e.stopPropagation()
                        if (shape.type === 'text' || shape.type === 'icon') {
                          setEditingTextId(shape.id)
                          setSelectedId(shape.id)
                        }
                      }}
                      onTextBlur={(text) => {
                        updateShape(shape.id, { text })
                        setEditingTextId(null)
                      }}
                    />
                  )
                })}
                </div>
              </div>
            </div>

            <MockupEditPanel
              selectedShape={selectedShape}
              printZone={printZone}
              canvasW={CANVAS_W}
              canvasH={CANVAS_H}
              updateShape={updateShape}
              onDuplicate={duplicateSelected}
              onRemove={removeSelected}
              cropMode={selectedShape ? cropModeId === selectedShape.id : false}
              onToggleCrop={() => {
                if (!selectedShape || selectedShape.type !== 'image') return
                setCropModeId((id) =>
                  id === selectedShape.id ? null : selectedShape.id,
                )
              }}
            />
          </div>

          <EditorMobileDock
            mobileTab={mobileTab}
            setMobileTab={setMobileTab}
            activePanel={activePanel}
            setActivePanel={setActivePanel}
            selectedShape={selectedShape}
            productColor={productColor}
            setProductColor={setProductColor}
            onClearSelection={() => {
              setSelectedId(null)
              setEditingTextId(null)
            }}
            addText={addText}
            addTextPreset={addTextPreset}
            onDesignSelect={addCatalogDesign}
            onGallerySelect={(src) => void addImageFromSrc(src)}
            addIcon={addIcon}
            onUploadSelect={(src) => void addImageFromSrc(src)}
            onUserUpload={handleUserUpload}
            uploadsRefresh={uploadsRefresh}
            canContinue={canContinue}
            whatsappDesignHref={whatsappDesignHref}
            printZone={printZone}
            canvasW={CANVAS_W}
            canvasH={CANVAS_H}
            updateShape={updateShape}
            onDuplicate={duplicateSelected}
            onRemove={removeSelected}
            cropMode={selectedShape ? cropModeId === selectedShape.id : false}
            onToggleCrop={() => {
              if (!selectedShape || selectedShape.type !== 'image') return
              setCropModeId((id) =>
                id === selectedShape.id ? null : selectedShape.id,
              )
            }}
          />
        </div>
      </section>
    </div>
  )
}
