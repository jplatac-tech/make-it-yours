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
import { MockupEditorChrome } from './mockup-editor-chrome'
import { MockupWorkspaceToolbar } from './mockup-workspace-toolbar'
import { MockupPropertiesBar } from './mockup-properties-bar'
import { getDefaultFontFamily } from '../../lib/editor-fonts'
import { type TextPreset } from '../../lib/text-presets'
import type { DesignShape } from '../../types/design'
import {
  resolveImageSrc,
  loadImageDimensions,
  fitImageInitialInPrintArea,
} from '../../lib/resolve-image-src'
import { isCatalogRasterSrc } from '../../lib/catalog-image-src'
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
import {
  applyLayerMove,
  ensureShapeLayers,
  getNextLayer,
  renumberShapeLayers,
  sortShapesByLayer,
  type LayerMove,
} from '../../lib/shape-layers'
import {
  bakeImageCrop,
  clampCropInsets,
  getCropInsets,
} from '../../lib/image-crop'
import {
  preloadBackgroundRemoval,
  resolveAndPrepareDesignImage,
  removeImageBackground,
} from '../../lib/remove-background'

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
  const [mobileTab, setMobileTab] = useState<MobileDockTab>(null)
  const isDesktop = useEditorDesktopLayout()
  const mockupFitRef = useRef<HTMLDivElement | null>(null)
  const [mockupFitScale, setMockupFitScale] = useState(1)
  const [uploadsRefresh, setUploadsRefresh] = useState(0)
  const [canvasZoom, setCanvasZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [cropModeId, setCropModeId] = useState<string | null>(null)
  const [imageProcessing, setImageProcessing] = useState<string | null>(null)
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
    scale: number
    origin: {
      cropTop: number
      cropRight: number
      cropBottom: number
      cropLeft: number
    }
  } | null>(null)


  const shapes = shapesByZone[printZone]
  const sortedShapes = useMemo(() => sortShapesByLayer(shapes), [shapes])

  useEffect(() => {
    setSelectedId((id) => {
      if (!id) return null
      return shapesByZone[printZone].some((s) => s.id === id) ? id : null
    })
    setEditingTextId((id) => {
      if (!id) return null
      return shapesByZone[printZone].some((s) => s.id === id) ? id : null
    })
    setCropModeId((id) => {
      if (!id) return null
      return shapesByZone[printZone].some((s) => s.id === id) ? id : null
    })
  }, [printZone, shapesByZone])

  const setShapes = useCallback(
    (updater: DesignShape[] | ((prev: DesignShape[]) => DesignShape[])) => {
      setShapesByZone((prev) => {
        const zone = printZoneRef.current
        const current = prev[zone]
        const next = typeof updater === 'function' ? updater(current) : updater
        return { ...prev, [zone]: next }
      })
    },
    [],
  )

  const selectedShape = useMemo(
    () => shapes.find((s) => s.id === selectedId) ?? null,
    [selectedId, shapes],
  )

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
            FRONT: ensureShapeLayers(parsed.shapesByZone.FRONT ?? []),
            BACK: ensureShapeLayers(parsed.shapesByZone.BACK ?? []),
          })
        } else if (parsed.shapes?.length) {
          const zone = normalizePrintZone(parsed.printZone)
          const normalized = ensureShapeLayers(parsed.shapes)
          setShapesByZone({
            FRONT: zone === 'FRONT' ? normalized : [],
            BACK: zone === 'BACK' ? normalized : [],
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
      const front = ensureShapeLayers(
        cloneShapesWithNewIds(tpl?.shapesByZone.FRONT ?? []),
      )
      const back = ensureShapeLayers(
        cloneShapesWithNewIds(tpl?.shapesByZone.BACK ?? []),
      )
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
    preloadBackgroundRemoval()
  }, [])

  useEffect(() => {
    if (isDesktop) {
      setMockupFitScale(1)
      return
    }
    const el = mockupFitRef.current
    if (!el) return

    const update = () => {
      const pad = 16
      const w = Math.max(0, el.clientWidth - pad)
      const h = Math.max(0, el.clientHeight - pad)
      const scaleW = w / CANVAS_W
      const scaleH = h / CANVAS_H
      const fit = Math.min(scaleW, scaleH)
      setMockupFitScale(Math.max(0.52, Math.min(fit, 1.2)))
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
        const { id, edge, startX, startY, imgW, imgH, scale, origin } =
          cropState.current
        const zoom = canvasZoomRef.current || 1
        const dx = (e.clientX - startX) / zoom / (imgW * scale)
        const dy = (e.clientY - startY) / zoom / (imgH * scale)
        setShapes((s) =>
          s.map((sh) => {
            if (sh.id !== id) return sh
            const next = { ...getCropInsets(sh) }
            if (edge === 'top') next.top = origin.cropTop + dy
            if (edge === 'bottom') next.bottom = origin.cropBottom - dy
            if (edge === 'left') next.left = origin.cropLeft + dx
            if (edge === 'right') next.right = origin.cropRight - dx
            const clamped = clampCropInsets(next)
            return {
              ...sh,
              cropTop: clamped.top,
              cropRight: clamped.right,
              cropBottom: clamped.bottom,
              cropLeft: clamped.left,
            }
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
        const zoom = canvasZoomRef.current || 1
        const delta = (e.clientX - startX) / zoom / 100
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
        layer: getNextLayer(s),
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
        layer: getNextLayer(s),
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
        layer: getNextLayer(s),
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
      setShapesByZone((prev) => {
        const zoneShapes = prev[zone]
        const newShape: DesignShape = {
          id,
          type: 'image',
          x,
          y,
          src,
          width: w,
          height: h,
          scale: 1,
          layer: getNextLayer(zoneShapes),
        }
        return {
          ...prev,
          [zone]: [...zoneShapes, newShape],
        }
      })
      setSelectedId(id)
      setActivePanel('designs')
      if (!isDesktop) setMobileTab(null)
    },
    [isDesktop],
  )

  const addImageFromSrc = useCallback(
    async (src: string) => {
      const needsRuntimeBg =
        !isCatalogRasterSrc(src) && !src.split('?')[0].endsWith('.svg')
      if (needsRuntimeBg) setImageProcessing('Quitando fondo…')
      try {
        const area =
          getPrintZone(printZoneRef.current)?.printArea ??
          getPrintZone('FRONT')!.printArea
        const prepared = await resolveAndPrepareDesignImage(src)
        const dims = await loadImageDimensions(prepared)
        const { width, height } = fitImageInitialInPrintArea(
          dims.width,
          dims.height,
          area,
          0.55,
        )
        placeImageOnCanvas(prepared, width, height)
      } catch {
        try {
          const resolved = await resolveImageSrc(src)
          const area =
            getPrintZone(printZoneRef.current)?.printArea ??
            getPrintZone('FRONT')!.printArea
          const dims = await loadImageDimensions(resolved)
          const { width, height } = fitImageInitialInPrintArea(
            dims.width,
            dims.height,
            area,
            0.55,
          )
          placeImageOnCanvas(resolved, width, height)
        } catch {
          const area = getPrintZone('FRONT')!.printArea
          const { width, height } = fitImageInitialInPrintArea(120, 120, area, 0.55)
          placeImageOnCanvas(src, width, height)
        }
      } finally {
        setImageProcessing(null)
      }
    },
    [placeImageOnCanvas],
  )

  const handleUserUpload = async (file: File) => {
    try {
      const dataUrl = await compressImageToDataUrl(file)
      await addUploadedFile(file.name, dataUrl)
      setUploadsRefresh((k) => k + 1)
      setImageProcessing('Quitando fondo…')
      const prepared = await removeImageBackground(dataUrl)
      const area =
        getPrintZone(printZoneRef.current)?.printArea ??
        getPrintZone('FRONT')!.printArea
      const dims = await loadImageDimensions(prepared)
      const { width, height } = fitImageInitialInPrintArea(
        dims.width,
        dims.height,
        area,
        0.55,
      )
      placeImageOnCanvas(prepared, width, height)
    } catch {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          void addImageFromSrc(reader.result)
        }
      }
      reader.readAsDataURL(file)
    } finally {
      setImageProcessing(null)
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
        layer: getNextLayer(s),
      },
    ])
    setSelectedId(id)
  }

  const moveShapeLayer = (id: string, move: LayerMove) => {
    setShapes((s) => applyLayerMove(s, id, move))
  }

  const selectCanvasShape = (id: string) => {
    setSelectedId(id)
    setEditingTextId(null)
    setCropModeId(null)
    setMobileTab(null)
    setActivePanel('layers')
  }

  const openLayersPanel = () => {
    setActivePanel('layers')
    setMobileTab('layers')
  }

  const removeSelected = () => {
    if (!selectedId) return
    setShapes((s) => renumberShapeLayers(s.filter((sh) => sh.id !== selectedId)))
    setSelectedId(null)
    setCropModeId(null)
  }

  const startCropEdge = (
    shape: DesignShape,
    edge: 'top' | 'right' | 'bottom' | 'left',
    e: React.PointerEvent,
  ) => {
    const insets = getCropInsets(shape)
    cropState.current = {
      id: shape.id,
      edge,
      startX: e.clientX,
      startY: e.clientY,
      imgW: shape.width ?? 140,
      imgH: shape.height ?? 140,
      scale: shape.scale ?? 1,
      origin: {
        cropTop: insets.top,
        cropRight: insets.right,
        cropBottom: insets.bottom,
        cropLeft: insets.left,
      },
    }
  }

  const finishCrop = async (shapeId: string) => {
    const shape = shapesRef.current[printZoneRef.current].find(
      (s) => s.id === shapeId,
    )
    if (!shape || shape.type !== 'image') {
      setCropModeId(null)
      return
    }
    const insets = getCropInsets(shape)
    if (!insets.top && !insets.right && !insets.bottom && !insets.left) {
      setCropModeId(null)
      return
    }
    setImageProcessing('Aplicando recorte…')
    try {
      const patch = await bakeImageCrop(shape)
      if (patch) updateShape(shapeId, patch)
    } finally {
      setImageProcessing(null)
      setCropModeId(null)
    }
  }

  const toggleCropMode = () => {
    if (!selectedShape || selectedShape.type !== 'image') return
    if (cropModeId === selectedShape.id) {
      void finishCrop(selectedShape.id)
    } else {
      setCropModeId(selectedShape.id)
    }
  }

  const startRotate = (shape: DesignShape, e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
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

  const propertiesToolbar = selectedShape ? (
    <MockupPropertiesBar
      embedded
      shape={selectedShape}
      printZone={printZone}
      updateShape={updateShape}
      onCloseMobilePanel={() => setMobileTab(null)}
      cropActive={cropModeId === selectedShape.id}
      onToggleCrop={
        selectedShape.type === 'image' ? toggleCropMode : undefined
      }
      onDuplicate={duplicateSelected}
      onRemove={removeSelected}
      onOpenLayersPanel={openLayersPanel}
    />
  ) : undefined

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#eef0f4] max-lg:h-[calc(100dvh-52px)] max-lg:max-h-[calc(100dvh-52px)] lg:h-[calc(100dvh-60px)] lg:max-h-[calc(100dvh-60px)] lg:flex-row lg:overflow-hidden">
      <div className="flex h-full min-h-0 max-h-full shrink-0 overflow-hidden">
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
        selectedTextShape={
          selectedShape &&
          (selectedShape.type === 'text' || selectedShape.type === 'icon')
            ? selectedShape
            : null
        }
        onTextShapeChange={
          selectedShape &&
          (selectedShape.type === 'text' || selectedShape.type === 'icon')
            ? (patch) => updateShape(selectedShape.id, patch)
            : undefined
        }
        canvasShapes={shapes}
        selectedShapeId={selectedId}
        printZone={printZone}
        onSelectCanvasShape={selectCanvasShape}
        onMoveShapeLayer={moveShapeLayer}
      />
      </div>

      <section className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:h-full lg:max-h-full">
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#e8ebf0]">
          <div
            ref={mockupFitRef}
            className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-2 py-2 max-lg:min-h-0 lg:px-6 lg:py-4"
          >
            <MockupEditorChrome propertiesToolbar={propertiesToolbar} />
              {imageProcessing ? (
                <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center bg-black/25">
                  <div className="rounded-2xl bg-white px-6 py-4 text-center shadow-lg">
                    <p className="text-sm font-semibold text-neutral-900">
                      {imageProcessing}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      Primera vez puede tardar unos segundos
                    </p>
                  </div>
                </div>
              ) : null}

              <div
                className={
                  'relative shrink-0 rounded-xl shadow-xl ' +
                  (isDesktop ? 'overflow-visible' : 'mx-auto overflow-visible')
                }
                style={
                  isDesktop
                    ? {
                        width: CANVAS_W,
                        height: CANVAS_H,
                      }
                    : {
                        width: CANVAS_W * stageScale,
                        height: CANVAS_H * stageScale,
                      }
                }
              >
                <div
                  ref={canvasRef}
                  className={
                    'overflow-visible rounded-xl ' +
                    (isDesktop
                      ? 'absolute left-1/2 top-1/2 origin-center'
                      : 'absolute left-0 top-0 origin-top-left')
                  }
                  style={
                    isDesktop
                      ? {
                          width: CANVAS_W,
                          height: CANVAS_H,
                          marginLeft: -CANVAS_W / 2,
                          marginTop: -CANVAS_H / 2,
                          transform: `scale(${canvasZoom})`,
                          backgroundColor: mockupBackgroundColor,
                        }
                      : {
                          width: CANVAS_W,
                          height: CANVAS_H,
                          transform: `scale(${stageScale})`,
                          transformOrigin: 'top left',
                          backgroundColor: mockupBackgroundColor,
                        }
                  }
                  onPointerDown={(e) => {
                    if (e.target !== e.currentTarget) return
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

                {sortedShapes.map((shape) => {
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
                      fixedScreenControls={false}
                      mobileControls={!isDesktop}
                      onSelect={() => {
                        setSelectedId(shape.id)
                        setMobileTab(null)
                        if (shape.type !== 'image') {
                          setActivePanel('text')
                        }
                      }}
                      onDragStart={(e) => {
                        e.currentTarget.setPointerCapture(e.pointerId)
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
                        e.currentTarget.setPointerCapture(e.pointerId)
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
                      onToggleCrop={
                        isSelected && shape.type === 'image'
                          ? () => {
                              if (cropModeId === shape.id) {
                                void finishCrop(shape.id)
                              } else {
                                setCropModeId(shape.id)
                              }
                            }
                          : undefined
                      }
                      onRemove={
                        isSelected ? removeSelected : undefined
                      }
                    />
                  )
                })}
                </div>
              </div>
          </div>

          <MockupWorkspaceToolbar
            printZone={printZone}
            productColor={productColor}
            onPrintZoneChange={setPrintZone}
            canvasZoom={canvasZoom}
            onCanvasZoomChange={setCanvasZoom}
          />
        </div>

        <EditorMobileDock
            mobileTab={mobileTab}
            setMobileTab={setMobileTab}
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
            canvasShapes={shapes}
            selectedShapeId={selectedId}
            printZone={printZone}
            onSelectCanvasShape={selectCanvasShape}
            onMoveShapeLayer={moveShapeLayer}
            selectedTextShape={
              selectedShape &&
              (selectedShape.type === 'text' || selectedShape.type === 'icon')
                ? selectedShape
                : null
            }
            onTextShapeChange={
              selectedShape &&
              (selectedShape.type === 'text' || selectedShape.type === 'icon')
                ? (patch) => updateShape(selectedShape.id, patch)
                : undefined
            }
          />
      </section>
    </div>
  )
}
