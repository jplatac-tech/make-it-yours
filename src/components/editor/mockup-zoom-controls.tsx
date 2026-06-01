'use client'

type Props = {
  zoom: number
  onZoomChange: (z: number) => void
  minZoom?: number
  maxZoom?: number
  step?: number
  /** bar = estilo Canva (slider + %); pill = botones ± en cápsula */
  variant?: 'bar' | 'pill'
  className?: string
}

export function MockupZoomControls({
  zoom,
  onZoomChange,
  minZoom = 0.5,
  maxZoom = 1,
  step = 0.05,
  variant = 'bar',
  className = '',
}: Props) {
  const pct = Math.round(zoom * 100)
  const minPct = Math.round(minZoom * 100)
  const maxPct = Math.round(maxZoom * 100)
  const stepPct = Math.max(1, Math.round(step * 100))

  const clamp = (z: number) =>
    Math.max(minZoom, Math.min(maxZoom, Math.round(z / step) * step))

  if (variant === 'pill') {
    const btn =
      'flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-lg font-medium text-neutral-700 hover:bg-neutral-100'
    return (
      <div
        className={
          'flex min-w-0 items-center gap-0.5 rounded-xl border border-neutral-200 bg-neutral-50 px-1 py-0.5 ' +
          className
        }
        role="group"
        aria-label="Zoom"
      >
        <button
          type="button"
          aria-label="Alejar"
          className={btn}
          onClick={() => onZoomChange(clamp(zoom - step))}
        >
          −
        </button>
        <input
          type="range"
          min={minPct}
          max={maxPct}
          step={stepPct}
          value={pct}
          onChange={(e) => onZoomChange(clamp(Number(e.target.value) / 100))}
          onInput={(e) =>
            onZoomChange(clamp(Number(e.currentTarget.value) / 100))
          }
          className="editor-zoom-slider h-1.5 min-h-[28px] min-w-[4rem] flex-1 touch-none"
          aria-label="Zoom del mockup"
        />
        <button
          type="button"
          aria-label="Acercar"
          className={btn}
          onClick={() => onZoomChange(clamp(zoom + step))}
        >
          +
        </button>
        <span className="w-9 shrink-0 text-center text-[11px] font-semibold tabular-nums text-neutral-700">
          {pct}%
        </span>
      </div>
    )
  }

  return (
    <div
      className={'flex shrink-0 items-center gap-1.5 ' + className}
      role="group"
      aria-label="Zoom"
    >
      <input
        type="range"
        min={minPct}
        max={maxPct}
        step={stepPct}
        value={pct}
        onChange={(e) => onZoomChange(clamp(Number(e.target.value) / 100))}
        onInput={(e) =>
          onZoomChange(clamp(Number(e.currentTarget.value) / 100))
        }
        className="editor-zoom-slider editor-zoom-slider--compact w-[4.5rem] touch-none sm:w-[5.5rem]"
        aria-label="Zoom del mockup"
      />
      <span className="w-[2.25rem] shrink-0 text-xs font-medium tabular-nums text-neutral-600">
        {pct}%
      </span>
    </div>
  )
}
