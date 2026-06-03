'use client'

import { getShapeZIndex } from '../../lib/shape-layers'
import { getCropInsets } from '../../lib/image-crop'
import {
  getImageBorderRadius,
  getImageCropStyle,
  getTextStyleProps,
} from '../../lib/shape-transform'
import { ImageCropOverlay } from './image-crop-overlay'
import {
  MOCKUP_UI,
  MOCKUP_UI_MOBILE,
  resolveMockupControlPx,
} from '../../lib/mockup-control-sizes'
import type { ResizeHandle } from '../../lib/resize-handles'
import { getShapeScales } from '../../lib/shape-scales'
import type { DesignShape } from '../../types/design'
import type { ShapeBounds } from './canvas-element-types'
import { SelectionFrameActions } from './selection-frame-actions'

export type { ShapeBounds } from './canvas-element-types'

type Props = {
  shape: DesignShape
  bounds: ShapeBounds
  isSelected: boolean
  isEditing: boolean
  cropMode: boolean
  canvasZoom: number
  fixedScreenControls?: boolean
  /** Usa tamaños táctiles (móvil) convertidos con canvasZoom */
  mobileControls?: boolean
  onSelect: () => void
  onDragStart: (e: React.PointerEvent) => void
  onResizeStart: (e: React.PointerEvent, handle: ResizeHandle) => void
  onRotateStart: (e: React.PointerEvent) => void
  onCropEdgeStart: (
    edge: 'top' | 'right' | 'bottom' | 'left',
    e: React.PointerEvent,
  ) => void
  onDoubleClick: (e: React.MouseEvent) => void
  onTextBlur: (text: string) => void
  onToggleCrop?: () => void
  onRemove?: () => void
}

/** Círculo visible del handle (el padre define el área de toque) */
const whiteHandleDot =
  'rounded-full border-[1.5px] border-violet-500 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.18)] touch-none shrink-0'

const whiteSideDot =
  'rounded-full border-[1.5px] border-violet-500 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.18)] touch-none shrink-0'

export function CanvasElement({
  shape,
  bounds,
  isSelected,
  isEditing,
  cropMode,
  canvasZoom,
  fixedScreenControls = false,
  mobileControls = false,
  onSelect,
  onDragStart,
  onResizeStart,
  onRotateStart,
  onCropEdgeStart,
  onDoubleClick,
  onTextBlur,
  onToggleCrop,
  onRemove,
}: Props) {
  const z = canvasZoom
  const useFixedScreen = fixedScreenControls || mobileControls
  const ui = mobileControls ? MOCKUP_UI_MOBILE : MOCKUP_UI
  const px = (n: number) => resolveMockupControlPx(n, z, useFixedScreen)
  const corner = px(ui.corner)
  const cornerHit = px(ui.cornerHit)
  const sideW = px(ui.sideW)
  const sideH = px(ui.sideH)
  const sideHitW = px(ui.sideHitW)
  const sideHitH = px(ui.sideHitH)
  const cropEdge = px(ui.cropEdge)
  const borderW = px(ui.selectionBorder)

  const { scaleX, scaleY } = getShapeScales(shape)
  const rotation = shape.rotation ?? 0
  const cornerOut = cornerHit / 2 + px(1)

  const baseW =
    shape.type === 'image'
      ? (shape.width ?? 140)
      : bounds.width / Math.max(scaleX, 0.01)
  const baseH =
    shape.type === 'image'
      ? (shape.height ?? 140)
      : bounds.height / Math.max(scaleY, 0.01)

  const cornerHitStyle = (
    cursor: string,
    pos: { left?: number; right?: number; top?: number; bottom?: number },
  ): React.CSSProperties => {
    const style: React.CSSProperties = {
      position: 'absolute',
      zIndex: 60,
      width: cornerHit,
      height: cornerHit,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor,
    }
    if (pos.left !== undefined) style.left = -cornerOut
    if (pos.right !== undefined) style.right = -cornerOut
    if (pos.top !== undefined) style.top = -cornerOut
    if (pos.bottom !== undefined) style.bottom = -cornerOut
    return style
  }

  const sideHitStyle = (
    cursor: string,
    axis: 'left' | 'right',
  ): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      zIndex: 60,
      width: sideHitW,
      height: sideHitH,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor,
      top: '50%',
      transform: 'translateY(-50%)',
    }
    if (axis === 'left') {
      base.left = -(sideHitW / 2) - px(1)
    } else {
      base.right = -(sideHitW / 2) - px(1)
    }
    return base
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: shape.x,
        top: shape.y,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center center',
        zIndex: getShapeZIndex(shape),
        opacity: shape.opacity ?? 1,
      }}
      className="pointer-events-auto touch-none"
      data-canvas-element
      onPointerDown={(e) => {
        e.stopPropagation()
        onSelect()
        if (!cropMode) onDragStart(e)
      }}
      onDoubleClick={onDoubleClick}
    >
      <div
        className="relative"
        style={{ width: bounds.width, height: bounds.height }}
      >
        {isSelected && !cropMode ? (
          <div
            className="pointer-events-none absolute inset-0 z-[55] rounded-[2px] border-violet-500"
            style={{ borderWidth: borderW }}
            aria-hidden
          />
        ) : null}

        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: baseW,
            height: baseH,
            transform: `scale(${scaleX}, ${scaleY})`,
          }}
        >
          {shape.type === 'image' && shape.src ? (
            <div
              className="relative inline-block leading-none"
              style={shape.flipX ? { transform: 'scaleX(-1)' } : undefined}
            >
              <img
                src={shape.src}
                alt=""
                draggable={false}
                className="block select-none"
                style={{
                  width: shape.width,
                  height: shape.height,
                  borderRadius: getImageBorderRadius(shape),
                  ...(cropMode ? {} : getImageCropStyle(shape)),
                }}
              />
              {isSelected && cropMode && onToggleCrop ? (
                <ImageCropOverlay
                  insets={getCropInsets(shape)}
                  handleSize={Math.max(cropEdge, mobileControls ? 14 : 10)}
                  onEdgePointerDown={onCropEdgeStart}
                  onDone={onToggleCrop}
                />
              ) : null}
            </div>
          ) : isEditing ? (
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onTextBlur(e.currentTarget.textContent ?? '')}
              className="inline-block min-w-[40px] outline-none"
              style={getTextStyleProps(shape)}
            >
              {shape.text}
            </span>
          ) : (
            <span
              className="inline-block cursor-grab select-none active:cursor-grabbing"
              style={getTextStyleProps(shape)}
            >
              {shape.text}
            </span>
          )}
        </div>

        {isSelected && !cropMode ? (
          <>
            <div
              className="touch-manipulation"
              style={cornerHitStyle('nwse-resize', { left: 0, top: 0 })}
              onPointerDown={(e) => {
                e.stopPropagation()
                e.currentTarget.setPointerCapture(e.pointerId)
                onResizeStart(e, 'corner-nw')
              }}
            >
              <div
                className={whiteHandleDot}
                style={{ width: corner, height: corner }}
              />
            </div>
            <div
              className="touch-manipulation"
              style={cornerHitStyle('nesw-resize', { right: 0, top: 0 })}
              onPointerDown={(e) => {
                e.stopPropagation()
                e.currentTarget.setPointerCapture(e.pointerId)
                onResizeStart(e, 'corner-ne')
              }}
            >
              <div
                className={whiteHandleDot}
                style={{ width: corner, height: corner }}
              />
            </div>
            <div
              className="touch-manipulation"
              style={cornerHitStyle('nesw-resize', { left: 0, bottom: 0 })}
              onPointerDown={(e) => {
                e.stopPropagation()
                e.currentTarget.setPointerCapture(e.pointerId)
                onResizeStart(e, 'corner-sw')
              }}
            >
              <div
                className={whiteHandleDot}
                style={{ width: corner, height: corner }}
              />
            </div>
            <div
              className="touch-manipulation"
              style={cornerHitStyle('nwse-resize', { right: 0, bottom: 0 })}
              onPointerDown={(e) => {
                e.stopPropagation()
                e.currentTarget.setPointerCapture(e.pointerId)
                onResizeStart(e, 'corner-se')
              }}
            >
              <div
                className={whiteHandleDot}
                style={{ width: corner, height: corner }}
              />
            </div>

            {/* Lados: solo ancho (izq / der) */}
            <div
              className="touch-manipulation"
              style={sideHitStyle('ew-resize', 'left')}
              onPointerDown={(e) => {
                e.stopPropagation()
                e.currentTarget.setPointerCapture(e.pointerId)
                onResizeStart(e, 'edge-left')
              }}
            >
              <div
                className={whiteSideDot}
                style={{ width: sideW, height: sideH }}
              />
            </div>
            <div
              className="touch-manipulation"
              style={sideHitStyle('ew-resize', 'right')}
              onPointerDown={(e) => {
                e.stopPropagation()
                e.currentTarget.setPointerCapture(e.pointerId)
                onResizeStart(e, 'edge-right')
              }}
            >
              <div
                className={whiteSideDot}
                style={{ width: sideW, height: sideH }}
              />
            </div>

            <div
              className="pointer-events-auto absolute left-1/2 z-[70] flex -translate-x-1/2 flex-col items-center"
              style={{ top: bounds.height + px(ui.contextBarGap) }}
            >
              <SelectionFrameActions
                btnPx={px(ui.frameBtn)}
                iconPx={px(ui.frameIcon)}
                onMoveStart={onDragStart}
                onRemove={onRemove}
                onRotateStart={onRotateStart}
              />
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
