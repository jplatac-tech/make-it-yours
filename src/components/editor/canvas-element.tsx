'use client'

import {
  getImageBorderRadius,
  getImageCropStyle,
  getShapeTransform,
  getTextStyleProps,
} from '../../lib/shape-transform'
import {
  MOCKUP_UI,
  MOCKUP_UI_MOBILE,
  resolveMockupControlPx,
} from '../../lib/mockup-control-sizes'
import type { DesignShape } from '../../types/design'

export type ShapeBounds = { width: number; height: number }

type Props = {
  shape: DesignShape
  bounds: ShapeBounds
  isSelected: boolean
  isEditing: boolean
  cropMode: boolean
  canvasZoom: number
  fixedScreenControls?: boolean
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
}

const handleClass =
  'absolute z-30 cursor-pointer rounded-full border-2 border-white bg-violet-600 shadow-md'

export function CanvasElement({
  shape,
  isSelected,
  isEditing,
  cropMode,
  canvasZoom,
  fixedScreenControls = false,
  onSelect,
  onDragStart,
  onResizeStart,
  onRotateStart,
  onCropEdgeStart,
  onDoubleClick,
  onTextBlur,
}: Props) {
  const z = canvasZoom
  const ui = fixedScreenControls ? MOCKUP_UI_MOBILE : MOCKUP_UI
  const px = (n: number) => resolveMockupControlPx(n, z, fixedScreenControls)
  const handle = px(ui.handle)
  const handleOff = px(ui.handleOffset)
  const rotateBtn = px(ui.rotateButton)
  const rotateStem = px(ui.rotateStem)
  const rotateTop = px(ui.rotateOffsetTop)
  const cropEdge = px(ui.cropEdge)
  const selInset = px(ui.handleOffset)

  const cornerHandle = (
    cursor: string,
    pos: { left?: number; right?: number; top?: number; bottom?: number },
  ): React.CSSProperties => {
    const style: React.CSSProperties = {
      width: handle,
      height: handle,
      cursor,
    }
    if (pos.left !== undefined) style.left = -pos.left
    if (pos.right !== undefined) style.right = -pos.right
    if (pos.top !== undefined) style.top = -pos.top
    if (pos.bottom !== undefined) style.bottom = -pos.bottom
    return style
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: shape.x,
        top: shape.y,
        transform: getShapeTransform(shape),
        transformOrigin: 'center center',
        zIndex: isSelected ? 20 : 10,
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
      <div className="relative inline-block">
        {isSelected && !cropMode ? (
          <div
            className="pointer-events-none absolute rounded-sm border-2 border-violet-500"
            style={{
              inset: -selInset,
            }}
            aria-hidden
          />
        ) : null}

        {shape.type === 'image' && shape.src ? (
          <div className="relative inline-block leading-none">
            <img
              src={shape.src}
              alt=""
              draggable={false}
              className="block select-none"
              style={{
                width: shape.width,
                height: shape.height,
                borderRadius: getImageBorderRadius(shape),
                ...getImageCropStyle(shape),
              }}
            />
            {isSelected && cropMode ? (
              <div className="absolute inset-0 z-40 border-2 border-dashed border-amber-400 bg-amber-400/15">
                {(['top', 'right', 'bottom', 'left'] as const).map((edge) => (
                  <div
                    key={edge}
                    className="absolute z-50 bg-amber-500 hover:bg-amber-600"
                    style={
                      edge === 'top' || edge === 'bottom'
                        ? {
                            left: 0,
                            right: 0,
                            height: cropEdge,
                            cursor: 'ns-resize',
                            ...(edge === 'top' ? { top: 0 } : { bottom: 0 }),
                          }
                        : {
                            top: 0,
                            bottom: 0,
                            width: cropEdge,
                            cursor: 'ew-resize',
                            ...(edge === 'left' ? { left: 0 } : { right: 0 }),
                          }
                    }
                    onPointerDown={(e) => {
                      e.stopPropagation()
                      onCropEdgeStart(edge, e)
                    }}
                  />
                ))}
              </div>
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

        {isSelected && !cropMode ? (
          <>
            <div
              className="absolute left-1/2 z-30 flex -translate-x-1/2 flex-col items-center"
              style={{ top: -rotateTop }}
            >
              <div
                className="bg-violet-500"
                style={{ width: 2 / z, height: rotateStem }}
              />
              <button
                type="button"
                title="Girar"
                className="flex cursor-grab items-center justify-center rounded-full border-2 border-white bg-violet-600 font-bold text-white shadow-md"
                style={{
                  width: rotateBtn,
                  height: rotateBtn,
                  fontSize: px(16),
                }}
                onPointerDown={(e) => {
                  e.stopPropagation()
                  onRotateStart(e)
                }}
              >
                ↻
              </button>
            </div>

            <div
              className={handleClass}
              style={cornerHandle('nwse-resize', {
                left: handleOff,
                top: handleOff,
              })}
              onPointerDown={(e) => {
                e.stopPropagation()
                onResizeStart(e)
              }}
            />
            <div
              className={handleClass}
              style={cornerHandle('nesw-resize', {
                right: handleOff,
                top: handleOff,
              })}
              onPointerDown={(e) => {
                e.stopPropagation()
                onResizeStart(e)
              }}
            />
            <div
              className={handleClass}
              style={cornerHandle('nesw-resize', {
                left: handleOff,
                bottom: handleOff,
              })}
              onPointerDown={(e) => {
                e.stopPropagation()
                onResizeStart(e)
              }}
            />
            <div
              className={handleClass}
              style={cornerHandle('nwse-resize', {
                right: handleOff,
                bottom: handleOff,
              })}
              onPointerDown={(e) => {
                e.stopPropagation()
                onResizeStart(e)
              }}
            />
          </>
        ) : null}
      </div>
    </div>
  )
}
