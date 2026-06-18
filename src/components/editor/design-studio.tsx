'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useEditorDesktopLayout } from '../../hooks/use-media-query'
import { EditorMobileDock, type MobileDockTab } from './editor-mobile-dock'
import { getTemplateById } from '../../lib/design-templates'
import { cloneShapesWithNewIds } from '../../lib/start-editor'
import {
  PRODUCT_COLORS,
  PRINT_ZONES,
  PRODUCTS,
  EDITOR_DEFAULT_PRODUCT_SLUG,
  getPrintZone,
  normalizePrintZone,
  parseProductColorParam,
  type ProductColorValue,
  type PrintZoneValue,
  type ProductSlug,
} from '../../lib/products'
import { defaultElementColor } from '../../lib/garment-colors'
import {
  loadDesign,
  parseStoredDesign,
  saveDesign,
} from '../../lib/design-storage'
import {
  buildEditorSession,
  createEmptyLineItem,
  lineItemHasDesign,
  lineItemToStoredDesign,
  newLineItemId,
  parseEditorSession,
  sessionToStorageJson,
  type DesignLineItem,
} from '../../lib/design-line-items'
import { getDesignLabel, getDesignRefId } from '../../lib/design-ids'
import { GarmentSlotStrip } from './garment-slot-strip'
import { CrewneckMockup } from '../product/crewneck-mockup'
import { MockupDesignLayer } from './mockup-design-layer'
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
import { MIN_SHAPE_DISPLAY_PX } from '../../lib/resize-handles'
import { getShapeScales, uniformScales } from '../../lib/shape-scales'
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
  resolveAndPrepareDesignImage,
  removeImageBackground,
} from '../../lib/remove-background'
import { EditorSaveIndicator } from './editor-save-indicator'
import { ConfirmModal } from '../ui/confirm-modal'

import { EDITOR_CANVAS_H, EDITOR_CANVAS_W } from '../../lib/editor-canvas'

const CANVAS_W = EDITOR_CANVAS_W
const CANVAS_H = EDITOR_CANVAS_H

// Size limits are handled by `src/lib/size-limits.ts`

const emptyShapesByZone = (): Record<PrintZoneValue, DesignShape[]> => ({
  FRONT: [],
  BACK: [],
})

function getShapeBounds(shape: DesignShape) {
  const { scaleX, scaleY } = getShapeScales(shape)
  if (shape.type === 'image') {
    return {
      width: (shape.width ?? 140) * scaleX,
      height: (shape.height ?? 140) * scaleY,
    }
  }
  const fontSize = shape.fontSize ?? 28
  const chars = shape.text?.length ?? 4
  return {
    width: Math.min(chars * fontSize * 0.55, 220) * scaleX,
    height: fontSize * 1.25 * scaleY,
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

type DesignStudioProps = {
  searchParams: { get: (key: string) => string | null }
}

function resolveProductSlug(
  param: string | null,
  stored?: string | null,
): ProductSlug {
  if (param && param in PRODUCTS) return param as ProductSlug
  if (stored && stored in PRODUCTS) return stored as ProductSlug
  return EDITOR_DEFAULT_PRODUCT_SLUG
}

export function DesignStudio({ searchParams }: DesignStudioProps) {
  const loadedFromUrl = useRef(false)
  const initialItem = createEmptyLineItem()
  const [lineItems, setLineItems] = useState<DesignLineItem[]>([initialItem])
  const [activeItemId, setActiveItemId] = useState(initialItem.id)
  const lineItemsRef = useRef(lineItems)
  const activeItemIdRef = useRef(activeItemId)
  lineItemsRef.current = lineItems
  activeItemIdRef.current = activeItemId

  const [productSlug, setProductSlug] = useState<ProductSlug>(
    EDITOR_DEFAULT_PRODUCT_SLUG,
  )
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
  /** Escala para encajar el mockup en el viewport (solo móvil, ResizeObserver) */
  const [autoFitScale, setAutoFitScale] = useState(1)
  /** Multiplicador de zoom del usuario en móvil (1 = encaje automático) */
  const [mobileZoom, setMobileZoom] = useState(1)
  const [uploadsRefresh, setUploadsRefresh] = useState(0)
  const [canvasZoom, setCanvasZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [cropModeId, setCropModeId] = useState<string | null>(null)
  const [imageProcessing, setImageProcessing] = useState<string | null>(null)
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
  const stageScale = isDesktop ? canvasZoom : autoFitScale * mobileZoom
  const effectiveCanvasZoom = stageScale
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
  const resizeState = useRef<
    | {
        kind: 'uniform'
        id: string
        startX: number
        originScale: number
      }
    | {
        kind: 'image-width'
        id: string
        startX: number
        anchor: 'left' | 'right'
        originX: number
        originDisplayW: number
        originScale: number
      }
    | {
        kind: 'stretch-x'
        id: string
        startX: number
        anchor: 'left' | 'right'
        originX: number
        originDisplayW: number
        originScaleX: number
        originScaleY: number
      }
    | null
  >(null)
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

  const snapshotActiveLineItem = useCallback(
    (
      nextByZone: Record<PrintZoneValue, DesignShape[]>,
      zone: PrintZoneValue,
      color: ProductColorValue,
      slug: ProductSlug,
    ): DesignLineItem => ({
      id: activeItemIdRef.current,
      productSlug: slug,
      productColor: color,
      shapesByZone: nextByZone,
      printZone: zone,
    }),
    [],
  )

  const saveSessionItems = useCallback(
    (items: DesignLineItem[], activeId: string) => {
      lineItemsRef.current = items
      saveDesign(
        sessionToStorageJson(
          buildEditorSession({ items, activeItemId: activeId }),
        ),
      )
    },
    [],
  )

  const persist = useCallback(
    (
      nextByZone: Record<PrintZoneValue, DesignShape[]>,
      zone: PrintZoneValue,
      color: ProductColorValue,
      slug: ProductSlug = productSlug,
    ) => {
      const active = snapshotActiveLineItem(nextByZone, zone, color, slug)
      setLineItems((prev) => {
        const items = prev.map((item) =>
          item.id === active.id ? active : item,
        )
        lineItemsRef.current = items
        return items
      })
      queueMicrotask(() => {
        saveSessionItems(
          lineItemsRef.current,
          activeItemIdRef.current,
        )
      })
    },
    [productSlug, snapshotActiveLineItem, saveSessionItems],
  )

  const applyLineItemToEditor = useCallback((item: DesignLineItem) => {
    setShapesByZone({
      FRONT: ensureShapeLayers(item.shapesByZone.FRONT ?? []),
      BACK: ensureShapeLayers(item.shapesByZone.BACK ?? []),
    })
    setProductColor(item.productColor)
    setPrintZone(normalizePrintZone(item.printZone))
    setProductSlug(item.productSlug)
    setSelectedId(null)
    setEditingTextId(null)
    setCropModeId(null)
  }, [])

  const switchGarment = useCallback(
    (targetId: string) => {
      if (targetId === activeItemIdRef.current) return
      const active = snapshotActiveLineItem(
        shapesRef.current,
        printZoneRef.current,
        productColor,
        productSlug,
      )
      const updated = lineItemsRef.current.map((item) =>
        item.id === active.id ? active : item,
      )
      const target = updated.find((item) => item.id === targetId)
      if (!target) return
      setLineItems(updated)
      setActiveItemId(targetId)
      activeItemIdRef.current = targetId
      saveSessionItems(updated, targetId)
      applyLineItemToEditor(target)
      setGarmentNotice(null)
    },
    [
      applyLineItemToEditor,
      productColor,
      productSlug,
      saveSessionItems,
      snapshotActiveLineItem,
    ],
  )

  const [garmentNotice, setGarmentNotice] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [garmentRemoveId, setGarmentRemoveId] = useState<string | null>(null)

  const removeGarment = useCallback(
    (targetId: string) => {
      if (lineItemsRef.current.length <= 1) return

      const active = snapshotActiveLineItem(
        shapesRef.current,
        printZoneRef.current,
        productColor,
        productSlug,
      )
      const synced = lineItemsRef.current.map((item) =>
        item.id === active.id ? active : item,
      )
      const removeIndex = synced.findIndex((item) => item.id === targetId)
      if (removeIndex < 0) return

      const nextItems = synced.filter((item) => item.id !== targetId)
      const removingActive = targetId === activeItemIdRef.current
      let nextActiveId = activeItemIdRef.current

      if (removingActive) {
        const fallback =
          nextItems[Math.min(removeIndex, nextItems.length - 1)] ?? nextItems[0]
        nextActiveId = fallback.id
        setActiveItemId(nextActiveId)
        activeItemIdRef.current = nextActiveId
        applyLineItemToEditor(fallback)
      }

      setLineItems(nextItems)
      saveSessionItems(nextItems, nextActiveId)
      setGarmentNotice('Prenda eliminada del pedido.')
      window.setTimeout(() => setGarmentNotice(null), 3500)
    },
    [
      applyLineItemToEditor,
      productColor,
      productSlug,
      saveSessionItems,
      snapshotActiveLineItem,
    ],
  )

  const requestRemoveGarment = useCallback(
    (targetId: string) => {
      if (lineItemsRef.current.length <= 1) return
      const item = lineItemsRef.current.find((row) => row.id === targetId)
      if (!item) return
      if (lineItemHasDesign(item)) {
        setGarmentRemoveId(targetId)
        return
      }
      removeGarment(targetId)
    },
    [removeGarment],
  )

  const addGarment = useCallback(
    (color: ProductColorValue = 'WHITE') => {
      if (lineItemsRef.current.length >= 6) return
      const active = snapshotActiveLineItem(
        shapesRef.current,
        printZoneRef.current,
        productColor,
        productSlug,
      )
      const updated = lineItemsRef.current.map((item) =>
        item.id === active.id ? active : item,
      )
      const newItem = createEmptyLineItem({
        productSlug,
        productColor: color,
      })
      const nextItems = [...updated, newItem]
      setLineItems(nextItems)
      setActiveItemId(newItem.id)
      activeItemIdRef.current = newItem.id
      saveSessionItems(nextItems, newItem.id)
      applyLineItemToEditor(newItem)
      const label = PRODUCT_COLORS.find((c) => c.value === color)?.label ?? color
      setGarmentNotice(
        `${getDesignLabel(newItem.id)} añadido · ${label}. Diseña en el mockup.`,
      )
      window.setTimeout(() => setGarmentNotice(null), 4000)
    },
    [
      applyLineItemToEditor,
      productColor,
      productSlug,
      saveSessionItems,
      snapshotActiveLineItem,
    ],
  )

  const garmentSlots = useMemo(
    () =>
      lineItems.map((item) => ({
        id: item.id,
        color: item.productColor,
        label: getDesignLabel(item.id),
        refId: getDesignRefId(item.id),
        hasDesign: lineItemHasDesign(item),
      })),
    [lineItems],
  )

  const handleProductColorChange = useCallback(
    (color: ProductColorValue) => {
      setProductColor(color)
    },
    [],
  )

  useEffect(() => {
    if (loadedFromUrl.current) return
    loadedFromUrl.current = true

    const tplId = searchParams.get('tpl')
    const productParam = searchParams.get('product')
    const colorParam = parseProductColorParam(searchParams.get('color'))
    const stored = loadDesign()
    const session = parseEditorSession(stored)
    const parsedStored = parseStoredDesign(stored)

    const withChosenColor = (item: DesignLineItem): DesignLineItem =>
      colorParam ? { ...item, productColor: colorParam } : item

    const resolvedSlug = resolveProductSlug(
      productParam,
      session?.items.find((i) => i.id === session.activeItemId)?.productSlug ??
        parsedStored?.productSlug ??
        null,
    )
    setProductSlug(resolvedSlug)

    let initialized = false

    if (session?.items.length) {
      const active =
        session.items.find((i) => i.id === session.activeItemId) ??
        session.items[0]
      const resolvedActive = withChosenColor({
        ...active,
        productSlug: resolveProductSlug(productParam, active.productSlug),
      })
      const items = session.items.map((item) =>
        item.id === resolvedActive.id ? resolvedActive : item,
      )
      setLineItems(items)
      setActiveItemId(resolvedActive.id)
      activeItemIdRef.current = resolvedActive.id
      applyLineItemToEditor(resolvedActive)
      setEditorReady(true)
      initialized = true
    }

    if (!initialized && stored && parsedStored) {
      try {
        const parsed = parsedStored as {
          shapes?: DesignShape[]
          shapesByZone?: Record<PrintZoneValue, DesignShape[]>
          productColor?: ProductColorValue
          printZone?: string
        }
        const legacyItem = withChosenColor({
          id: newLineItemId(),
          productSlug: resolvedSlug,
          productColor: parsed.productColor ?? 'WHITE',
          shapesByZone: emptyShapesByZone(),
          printZone: normalizePrintZone(parsed.printZone),
        })
        if (parsed.shapesByZone) {
          legacyItem.shapesByZone = {
            FRONT: ensureShapeLayers(parsed.shapesByZone.FRONT ?? []),
            BACK: ensureShapeLayers(parsed.shapesByZone.BACK ?? []),
          }
        } else if (parsed.shapes?.length) {
          const zone = normalizePrintZone(parsed.printZone)
          const normalized = ensureShapeLayers(parsed.shapes)
          legacyItem.shapesByZone = {
            FRONT: zone === 'FRONT' ? normalized : [],
            BACK: zone === 'BACK' ? normalized : [],
          }
        }
        setLineItems([legacyItem])
        setActiveItemId(legacyItem.id)
        activeItemIdRef.current = legacyItem.id
        applyLineItemToEditor(legacyItem)
        setEditorReady(true)
        initialized = true
      } catch {
        /* fall through */
      }
    }

    if (!initialized && tplId) {
      const tpl = getTemplateById(tplId)
      const front = ensureShapeLayers(
        cloneShapesWithNewIds(tpl?.shapesByZone.FRONT ?? []),
      )
      const back = ensureShapeLayers(
        cloneShapesWithNewIds(tpl?.shapesByZone.BACK ?? []),
      )
      const tplItem = withChosenColor({
        id: newLineItemId(),
        productSlug: resolvedSlug,
        productColor: tpl?.productColor ?? 'WHITE',
        shapesByZone: { FRONT: front, BACK: back },
        printZone: 'FRONT',
      })
      setLineItems([tplItem])
      setActiveItemId(tplItem.id)
      activeItemIdRef.current = tplItem.id
      applyLineItemToEditor(tplItem)
      initialized = true
    }

    if (!initialized) {
      const emptyItem = withChosenColor(
        createEmptyLineItem({
          productSlug: resolvedSlug,
          productColor: colorParam ?? 'WHITE',
        }),
      )
      setLineItems([emptyItem])
      setActiveItemId(emptyItem.id)
      activeItemIdRef.current = emptyItem.id
      applyLineItemToEditor(emptyItem)
    }

    setEditorReady(true)
  }, [searchParams, applyLineItemToEditor])

  useEffect(() => {
    if (!editorReady) return
    persist(shapesByZone, printZone, productColor)
  }, [shapesByZone, printZone, productColor, persist, editorReady])

  useEffect(() => {
    if (isDesktop) {
      setAutoFitScale(1)
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
      setAutoFitScale(Math.max(0.35, Math.min(fit, 1.25)))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [isDesktop])

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
        const rs = resizeState.current
        const zoom = canvasZoomRef.current || 1
        const dx = (e.clientX - rs.startX) / zoom
        const shape = shapesRef.current[printZoneRef.current].find(
          (sh) => sh.id === rs.id,
        )
        if (!shape) return

        if (rs.kind === 'uniform') {
          const delta = dx / 100
          const next = clampScaleForShape(
            shape,
            rs.originScale + delta,
            CANVAS_W,
            CANVAS_H,
          )
          setShapes((s) =>
            s.map((sh) =>
              sh.id === rs.id ? { ...sh, ...uniformScales(next) } : sh,
            ),
          )
          return
        }

        if (rs.kind === 'image-width') {
          const deltaW = rs.anchor === 'right' ? dx : -dx
          const newDisplayW = Math.max(
            MIN_SHAPE_DISPLAY_PX,
            rs.originDisplayW + deltaW,
          )
          const newW = newDisplayW / Math.max(rs.originScale, 0.05)
          setShapes((s) =>
            s.map((sh) => {
              if (sh.id !== rs.id) return sh
              return {
                ...sh,
                width: newW,
                ...(rs.anchor === 'left' ? { x: rs.originX + dx } : {}),
              }
            }),
          )
          return
        }

        if (rs.kind === 'stretch-x') {
          const deltaW = rs.anchor === 'right' ? dx : -dx
          const newDisplayW = Math.max(
            MIN_SHAPE_DISPLAY_PX,
            rs.originDisplayW + deltaW,
          )
          const ratio = newDisplayW / rs.originDisplayW
          const newScaleX = clampScaleForShape(
            shape,
            rs.originScaleX * ratio,
            CANVAS_W,
            CANVAS_H,
          )
          setShapes((s) =>
            s.map((sh) => {
              if (sh.id !== rs.id) return sh
              return {
                ...sh,
                scaleX: newScaleX,
                scaleY: rs.originScaleY,
                scale: newScaleX,
                ...(rs.anchor === 'left' ? { x: rs.originX + dx } : {}),
              }
            }),
          )
        }
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

  const removeSelected = useCallback(() => {
    if (!selectedId) return
    window.setTimeout(() => setDeleteConfirmOpen(true), 0)
  }, [selectedId])

  const confirmRemoveSelected = () => {
    if (!selectedId) {
      setDeleteConfirmOpen(false)
      return
    }
    const id = selectedId
    setShapes((s) => renumberShapeLayers(s.filter((sh) => sh.id !== id)))
    setSelectedId(null)
    setCropModeId(null)
    setDeleteConfirmOpen(false)
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
      canvasShapes={shapes}
      onMoveLayer={moveShapeLayer}
    />
  ) : undefined

  return (
    <>
    <ConfirmModal
      open={deleteConfirmOpen}
      title="Eliminar elemento"
      description="¿Quitar este elemento del diseño? Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      cancelLabel="Cancelar"
      tone="danger"
      onConfirm={confirmRemoveSelected}
      onCancel={() => setDeleteConfirmOpen(false)}
    />
    <ConfirmModal
      open={garmentRemoveId !== null}
      title="Quitar prenda"
      description="Esta prenda tiene diseño. ¿Eliminarla del pedido? Se perderá su diseño."
      confirmLabel="Quitar prenda"
      cancelLabel="Cancelar"
      tone="danger"
      onConfirm={() => {
        if (garmentRemoveId) removeGarment(garmentRemoveId)
        setGarmentRemoveId(null)
      }}
      onCancel={() => setGarmentRemoveId(null)}
    />
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-[#eef0f4] lg:h-full lg:min-h-0 lg:flex-row">
      <div className="hidden h-full min-h-0 shrink-0 overflow-hidden lg:flex">
      <EditorPanel
        activePanel={activePanel}
        setActivePanel={setActivePanel}
        productColor={productColor}
        setProductColor={handleProductColorChange}
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

      <section className="relative z-10 grid h-full min-h-0 min-w-0 flex-1 grid-rows-[minmax(0,1fr)_auto] overflow-hidden">
        <div className="relative min-h-0 overflow-hidden bg-[#e8ebf0]">
          <EditorSaveIndicator />
          <div
            ref={mockupFitRef}
            className="relative flex h-full min-h-0 items-center justify-center overflow-hidden px-2 pt-2 pb-24 max-lg:items-end max-lg:justify-center max-lg:pt-2 lg:px-6 lg:py-4 lg:pb-28"
            onPointerDown={(e) => {
              if (editingTextId) return
              const el = e.target as HTMLElement
              if (el.closest('[data-canvas-element]')) return
              if (el.closest('[data-canvas-root]')) return
              setSelectedId(null)
              setCropModeId(null)
              setMobileTab(null)
            }}
          >
            <GarmentSlotStrip
              items={garmentSlots}
              activeId={activeItemId}
              onSelect={switchGarment}
              onAdd={addGarment}
              onRemove={requestRemoveGarment}
            />
            {garmentNotice ? (
              <div
                className="pointer-events-none absolute top-3 left-1/2 z-40 max-w-[min(320px,92vw)] -translate-x-1/2 rounded-xl bg-neutral-900 px-4 py-2.5 text-center text-sm font-medium text-white shadow-lg"
                role="status"
              >
                {garmentNotice}
              </div>
            ) : null}
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
                  data-canvas-root
                  className={
                    'isolate overflow-visible rounded-xl bg-transparent ' +
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
                        }
                      : {
                          width: CANVAS_W,
                          height: CANVAS_H,
                          transform: `scale(${stageScale})`,
                          transformOrigin: 'top left',
                        }
                  }
                  onPointerDown={(e) => {
                    if (editingTextId) return
                    const el = e.target as HTMLElement
                    if (el.closest('[data-canvas-element]')) return
                    setSelectedId(null)
                    setCropModeId(null)
                    setMobileTab(null)
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

                <MockupDesignLayer productColor={productColor}>
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
                      fixedScreenControls={!isDesktop}
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
                      onResizeStart={(e, handle) => {
                        e.currentTarget.setPointerCapture(e.pointerId)
                        const bounds = getShapeBounds(shape)
                        const sc = shape.scale ?? 1
                        const { scaleX, scaleY } = getShapeScales(shape)

                        if (
                          handle === 'edge-left' ||
                          handle === 'edge-right'
                        ) {
                          const anchor =
                            handle === 'edge-left' ? 'left' : 'right'
                          if (shape.type === 'image') {
                            resizeState.current = {
                              kind: 'image-width',
                              id: shape.id,
                              startX: e.clientX,
                              anchor,
                              originX: shape.x,
                              originDisplayW: bounds.width,
                              originScale: sc,
                            }
                          } else {
                            resizeState.current = {
                              kind: 'stretch-x',
                              id: shape.id,
                              startX: e.clientX,
                              anchor,
                              originX: shape.x,
                              originDisplayW: bounds.width,
                              originScaleX: scaleX,
                              originScaleY: scaleY,
                            }
                          }
                          return
                        }

                        resizeState.current = {
                          kind: 'uniform',
                          id: shape.id,
                          startX: e.clientX,
                          originScale: sc,
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
                </MockupDesignLayer>
                </div>
              </div>
          </div>
        </div>

        <div className="shrink-0">
          <MockupWorkspaceToolbar
            printZone={printZone}
            productColor={productColor}
            onPrintZoneChange={setPrintZone}
            canvasZoom={isDesktop ? canvasZoom : mobileZoom}
            onCanvasZoomChange={isDesktop ? setCanvasZoom : setMobileZoom}
            onFitZoom={() =>
              isDesktop ? setCanvasZoom(1) : setMobileZoom(1)
            }
            minZoom={0.5}
            maxZoom={isDesktop ? 1 : 1.5}
          />
          <EditorMobileDock
            mobileTab={mobileTab}
            setMobileTab={setMobileTab}
            activePanel={activePanel}
            setActivePanel={setActivePanel}
            productColor={productColor}
            setProductColor={handleProductColorChange}
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
        </div>
      </section>
    </div>
    </>
  )
}
