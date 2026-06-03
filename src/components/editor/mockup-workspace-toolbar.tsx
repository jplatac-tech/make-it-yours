'use client'

import type { ProductColorValue, PrintZoneValue } from '../../lib/products'
import { MockupViewToggle } from './mockup-view-toggle'
import { MockupZoomControls } from './mockup-zoom-controls'

type Props = {
  printZone: PrintZoneValue
  productColor: ProductColorValue
  onPrintZoneChange: (zone: PrintZoneValue) => void
  canvasZoom: number
  onCanvasZoomChange: (z: number) => void
  onFitZoom?: () => void
  minZoom?: number
  maxZoom?: number
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
  productColor,
  onPrintZoneChange,
  canvasZoom,
  onCanvasZoomChange,
  onFitZoom,
  minZoom,
  maxZoom,
}: Props) {
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

        <MockupViewToggle
          printZone={printZone}
          productColor={productColor}
          onChange={onPrintZoneChange}
          variant="toolbar"
        />

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
