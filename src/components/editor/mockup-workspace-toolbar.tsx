'use client'

import type { ProductColorValue, PrintZoneValue } from '../../lib/products'
import { MockupSideToggle } from './mockup-views-button'
import { MockupZoomControls } from './mockup-zoom-controls'

type Props = {
  printZone: PrintZoneValue
  productColor: ProductColorValue
  onPrintZoneChange: (zone: PrintZoneValue) => void
  canvasZoom: number
  onCanvasZoomChange: (z: number) => void
}

/** Barra inferior: Frente/Espalda + Zoom (una fila, optimizada en móvil) */
export function MockupWorkspaceToolbar({
  printZone,
  productColor,
  onPrintZoneChange,
  canvasZoom,
  onCanvasZoomChange,
}: Props) {
  return (
    <div className="flex shrink-0 flex-row items-center gap-2 border-t border-neutral-200 bg-white px-2.5 py-2 max-lg:gap-2 max-lg:pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:gap-3 sm:px-4 sm:py-2.5">
      <MockupSideToggle
        printZone={printZone}
        productColor={productColor}
        onChange={onPrintZoneChange}
      />
      <div className="flex min-w-0 flex-1 items-center justify-end">
        <MockupZoomControls
          compact
          fill
          zoom={canvasZoom}
          onZoomChange={onCanvasZoomChange}
        />
      </div>
    </div>
  )
}
