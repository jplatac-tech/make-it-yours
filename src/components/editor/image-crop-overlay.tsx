'use client'

import type { CropInsets } from '../../lib/image-crop'

type Edge = 'top' | 'right' | 'bottom' | 'left'

type Props = {
  insets: CropInsets
  handleSize: number
  onEdgePointerDown: (edge: Edge, e: React.PointerEvent) => void
  onDone: () => void
}

function pct(n: number) {
  return `${n * 100}%`
}

export function ImageCropOverlay({
  insets,
  handleSize,
  onEdgePointerDown,
  onDone,
}: Props) {
  const { top, right, bottom, left } = insets
  const visLeft = left
  const visTop = top
  const visWidth = 1 - left - right
  const visHeight = 1 - top - bottom
  const hit = Math.max(handleSize, 12)

  const handleClass =
    'absolute z-[60] rounded-full border-2 border-white bg-violet-500 shadow-md touch-none'

  const startEdge = (edge: Edge, e: React.PointerEvent) => {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    onEdgePointerDown(edge, e)
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-40">
      {/* Oscurecer zona recortada */}
      <div
        className="absolute right-0 left-0 bg-black/55"
        style={{ top: 0, height: pct(top) }}
      />
      <div
        className="absolute right-0 left-0 bg-black/55"
        style={{ bottom: 0, height: pct(bottom) }}
      />
      <div
        className="absolute bg-black/55"
        style={{
          top: pct(top),
          bottom: pct(bottom),
          left: 0,
          width: pct(left),
        }}
      />
      <div
        className="absolute bg-black/55"
        style={{
          top: pct(top),
          bottom: pct(bottom),
          right: 0,
          width: pct(right),
        }}
      />

      {/* Marco visible */}
      <div
        className="pointer-events-none absolute border-2 border-white shadow-[0_0_0_1px_rgba(124,58,237,0.9)]"
        style={{
          left: pct(visLeft),
          top: pct(visTop),
          width: pct(visWidth),
          height: pct(visHeight),
        }}
      />

      {/* Controles */}
      <div className="pointer-events-auto absolute inset-0">
        <button
          type="button"
          className="absolute -top-10 left-1/2 z-[70] -translate-x-1/2 rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-xs font-semibold text-violet-700 shadow-md hover:bg-violet-50"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onDone()
          }}
        >
          Aplicar recorte
        </button>

        <div
          className={handleClass}
          style={{
            left: `${(visLeft + visWidth / 2) * 100}%`,
            top: `${visTop * 100}%`,
            transform: 'translate(-50%, -50%)',
            width: hit,
            height: hit,
            cursor: 'ns-resize',
          }}
          onPointerDown={(e) => startEdge('top', e)}
        />
        <div
          className={handleClass}
          style={{
            left: `${(visLeft + visWidth / 2) * 100}%`,
            top: `${(visTop + visHeight) * 100}%`,
            transform: 'translate(-50%, -50%)',
            width: hit,
            height: hit,
            cursor: 'ns-resize',
          }}
          onPointerDown={(e) => startEdge('bottom', e)}
        />
        <div
          className={handleClass}
          style={{
            left: `${visLeft * 100}%`,
            top: `${(visTop + visHeight / 2) * 100}%`,
            transform: 'translate(-50%, -50%)',
            width: hit,
            height: hit,
            cursor: 'ew-resize',
          }}
          onPointerDown={(e) => startEdge('left', e)}
        />
        <div
          className={handleClass}
          style={{
            left: `${(visLeft + visWidth) * 100}%`,
            top: `${(visTop + visHeight / 2) * 100}%`,
            transform: 'translate(-50%, -50%)',
            width: hit,
            height: hit,
            cursor: 'ew-resize',
          }}
          onPointerDown={(e) => startEdge('right', e)}
        />
      </div>
    </div>
  )
}
