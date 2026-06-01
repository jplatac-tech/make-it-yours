'use client'

type Props = {
  zoom: number
  onZoomChange: (z: number) => void
  /** Barra inferior: estilo compacto */
  compact?: boolean
  /** Ocupa el ancho disponible (móvil) */
  fill?: boolean
}

export function MockupZoomControls({
  zoom,
  onZoomChange,
  compact = false,
  fill = false,
}: Props) {
  const pct = Math.round(zoom * 100)

  const shell = compact
    ? 'flex min-w-0 items-center gap-0.5 rounded-xl border border-neutral-200 bg-neutral-50 px-1 py-0.5 ' +
      (fill ? 'w-full max-w-none' : 'w-full max-w-[13rem]')
    : 'flex items-center gap-0.5 rounded-full border border-neutral-200 bg-white px-1 py-0.5 shadow-md'

  const btn = compact
    ? 'flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-lg font-medium text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200'
    : 'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-lg font-medium text-neutral-700 hover:bg-neutral-100'

  const slider = compact
    ? 'h-1.5 min-w-0 flex-1 cursor-pointer accent-violet-600'
    : 'h-1 w-16 cursor-pointer accent-violet-600 sm:w-20'

  return (
    <div className={shell} role="group" aria-label="Zoom">
      <button
        type="button"
        aria-label="Alejar"
        className={btn}
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
        className={slider}
        aria-label="Zoom del mockup"
      />
      <button
        type="button"
        aria-label="Acercar"
        className={btn}
        onClick={() =>
          onZoomChange(Math.min(1, Math.round((zoom + 0.1) * 10) / 10))
        }
      >
        +
      </button>
      <span
        className={
          compact
            ? 'w-9 shrink-0 text-center text-[10px] font-bold tabular-nums text-neutral-700 sm:text-[11px]'
            : 'min-w-[2.25rem] pr-1 text-center text-[11px] font-bold tabular-nums text-neutral-800'
        }
      >
        {pct}%
      </span>
    </div>
  )
}
