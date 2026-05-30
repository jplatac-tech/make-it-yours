'use client'

type Props = {
  zoom: number
  onZoomChange: (z: number) => void
}

export function MockupZoomControls({ zoom, onZoomChange }: Props) {
  const pct = Math.round(zoom * 100)

  return (
    <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white/95 px-1.5 py-1 shadow-md backdrop-blur-sm">
      <button
        type="button"
        aria-label="Alejar"
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-lg font-semibold text-neutral-700 hover:bg-neutral-100"
        onClick={() =>
          onZoomChange(Math.max(0.5, Math.round((zoom - 0.1) * 10) / 10))
        }
      >
        −
      </button>
      <input
        type="range"
        min={50}
        max={100}
        step={5}
        value={pct}
        onChange={(e) => onZoomChange(Number(e.target.value) / 100)}
        className="h-1.5 w-20 cursor-pointer accent-violet-600"
        aria-label="Zoom del mockup"
      />
      <button
        type="button"
        aria-label="Acercar"
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-lg font-semibold text-neutral-700 hover:bg-neutral-100"
        onClick={() =>
          onZoomChange(Math.min(1, Math.round((zoom + 0.1) * 10) / 10))
        }
      >
        +
      </button>
      <span className="min-w-[2.5rem] text-center text-[11px] font-bold tabular-nums text-neutral-700">
        {pct}%
      </span>
      <button
        type="button"
        className="cursor-pointer rounded-md px-1.5 text-[10px] font-semibold text-violet-700 hover:bg-violet-50"
        onClick={() => onZoomChange(1)}
      >
        100%
      </button>
    </div>
  )
}
