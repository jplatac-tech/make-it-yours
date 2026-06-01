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
  onResizeStart: (e: React.PointerEvent) => void
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

/** Handle circular blanco con borde violeta (como Canva) */
const whiteHandle =
  'absolute z-[60] cursor-pointer rounded-full border-2 border-violet-500 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.2)] touch-none'

const whiteSideHandle =
  'absolute z-[60] cursor-pointer rounded-full border-2 border-violet-500 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.2)] touch-none'

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
  const ui = mobileControls ? MOCKUP_UI_MOBILE : MOCKUP_UI
  const px = (n: number) => resolveMockupControlPx(n, z, fixedScreenControls)
  const corner = px(ui.corner)
  const sideW = px(ui.sideW)
  const sideH = px(ui.sideH)
  const cropEdge = px(ui.cropEdge)
  const borderW = px(ui.selectionBorder)

  const scale = shape.scale ?? 1
  const rotation = shape.rotation ?? 0
  const minTouch = fixedScreenControls ? 44 : 28
  const hitPad = fixedScreenControls ? Math.max(0, (minTouch - corner) / 2) : 0
  const cornerOut = corner / 2 + hitPad + px(1)

  const baseW =
    shape.type === 'image'
      ? (shape.width ?? 140)
      : bounds.width / Math.max(scale, 0.01)
  const baseH =
    shape.type === 'image'
      ? (shape.height ?? 140)
      : bounds.height / Math.max(scale, 0.01)

  const cornerStyle = (
    cursor: string,
    pos: { left?: number; right?: number; top?: number; bottom?: number },
  ): React.CSSProperties => {
    const style: React.CSSProperties = {
      width: corner + hitPad * 2,
      height: corner + hitPad * 2,
      cursor,
      boxSizing: 'border-box',
      padding: hitPad,
      backgroundClip: 'content-box',
    }
    if (pos.left !== undefined) style.left = -cornerOut
    if (pos.right !== undefined) style.right = -cornerOut
    if (pos.top !== undefined) style.top = -cornerOut
    if (pos.bottom !== undefined) style.bottom = -cornerOut
    return style
  }

  const sideStyle = (
    cursor: string,
    axis: 'left' | 'right' | 'top' | 'bottom',
  ): React.CSSProperties => {
    const pad = fixedScreenControls ? 6 : 0
    const base: React.CSSProperties = {
      width: axis === 'left' || axis === 'right' ? sideW + pad * 2 : sideH + pad * 2,
      height: axis === 'left' || axis === 'right' ? sideH + pad * 2 : sideW + pad * 2,
      cursor,
      padding: pad,
      backgroundClip: 'content-box',
      boxSizing: 'border-box',
    }
    if (axis === 'left') {
      base.left = -sideW / 2 - pad - px(1)
      base.top = '50%'
      base.transform = 'translateY(-50%)'
    }
    if (axis === 'right') {
      base.right = -sideW / 2 - pad - px(1)
      base.top = '50%'
      base.transform = 'translateY(-50%)'
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
      className="touch-none"
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
            transform: `scale(${scale})`,
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
              className={whiteHandle}
              style={cornerStyle('nwse-resize', { left: 0, top: 0 })}
              onPointerDown={(e) => {
                e.stopPropagation()
                onResizeStart(e)
              }}
            />
            <div
              className={whiteHandle}
              style={cornerStyle('nesw-resize', { right: 0, top: 0 })}
              onPointerDown={(e) => {
                e.stopPropagation()
                onResizeStart(e)
              }}
            />
            <div
              className={whiteHandle}
              style={cornerStyle('nesw-resize', { left: 0, bottom: 0 })}
              onPointerDown={(e) => {
                e.stopPropagation()
                onResizeStart(e)
              }}
            />
            <div
              className={whiteHandle}
              style={cornerStyle('nwse-resize', { right: 0, bottom: 0 })}
              onPointerDown={(e) => {
                e.stopPropagation()
                onResizeStart(e)
              }}
            />

            {/* Lados (estirar horizontal) */}
            <div
              className={whiteSideHandle}
              style={sideStyle('ew-resize', 'left')}
              onPointerDown={(e) => {
                e.stopPropagation()
                onResizeStart(e)
              }}
            />
            <div
              className={whiteSideHandle}
              style={sideStyle('ew-resize', 'right')}
              onPointerDown={(e) => {
                e.stopPropagation()
                onResizeStart(e)
              }}
            />

            <div
              className="absolute left-1/2 z-[70] flex -translate-x-1/2 flex-col items-center"
              style={{ top: bounds.height + px(6) }}
            >
              <SelectionFrameActions
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
