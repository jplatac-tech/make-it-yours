'use client'

import type { PrintZoneValue } from '../../lib/products'
import { MockupZoomControls } from './mockup-zoom-controls'

type Props = {
  printZone: PrintZoneValue
  onPrintZoneChange: (zone: PrintZoneValue) => void
  canvasZoom: number
  onCanvasZoomChange: (z: number) => void
  onFitZoom?: () => void
  minZoom?: number
  maxZoom?: number
}

function PagesStackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5 shrink-0 text-neutral-500"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <rect x="5" y="4" width="11" height="14" rx="1" />
      <path d="M9 7h7a1 1 0 0 1 1 1v11" strokeLinecap="round" />
    </svg>
  )
}

function FitViewIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M16 21h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" strokeLinecap="round" />
    </svg>
  )
}

function ToolbarDivider() {
  return <div className="mx-0.5 h-3.5 w-px shrink-0 bg-neutral-300" aria-hidden />
}

/** Barra tipo Canva: franja fina; controles agrupados, sin ocupar todo el ancho */
export function MockupWorkspaceToolbar({
  printZone,
  onPrintZoneChange,
  canvasZoom,
  onCanvasZoomChange,
  onFitZoom,
  minZoom,
  maxZoom,
}: Props) {
  const pageIndex = printZone === 'FRONT' ? 1 : 2

  const cyclePage = () => {
    onPrintZoneChange(printZone === 'FRONT' ? 'BACK' : 'FRONT')
  }

  return (
    <div
      className={
        'relative z-20 flex h-8 shrink-0 items-center border-t border-neutral-200 bg-[#eef0f2] ' +
        'max-lg:justify-center lg:justify-end lg:pr-3'
      }
    >
      <div className="inline-flex h-8 max-w-[calc(100%-1rem)] items-center gap-0.5 overflow-x-auto px-2">
        <MockupZoomControls
          variant="bar"
          zoom={canvasZoom}
          onZoomChange={onCanvasZoomChange}
          minZoom={minZoom}
          maxZoom={maxZoom}
        />

        <ToolbarDivider />

        <button
          type="button"
          onClick={cyclePage}
          className="inline-flex h-7 shrink-0 cursor-pointer items-center gap-1 rounded px-1.5 text-xs text-neutral-700 transition hover:bg-neutral-200/80"
          aria-label={`Vista ${pageIndex} de 2. Pulsa para cambiar`}
        >
          <PagesStackIcon />
          <span>
            <span className="font-medium text-neutral-700">Vistas</span>{' '}
            <span className="text-neutral-500">{pageIndex} de 2</span>
          </span>
        </button>

        {onFitZoom ? (
          <>
            <ToolbarDivider />
            <button
              type="button"
              onClick={onFitZoom}
              className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded text-neutral-500 transition hover:bg-neutral-200/80 hover:text-neutral-800"
              aria-label="Ajustar zoom al 100%"
              title="Ajustar zoom"
            >
              <FitViewIcon />
            </button>
          </>
        ) : null}
      </div>
    </div>
  )
}
