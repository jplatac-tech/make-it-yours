'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { CrewneckMockup } from '../product/crewneck-mockup'
import { MockupPrintTexture } from '../editor/mockup-print-texture'
import { EDITOR_CANVAS_H, EDITOR_CANVAS_W } from '../../lib/editor-canvas'
import {
  getMockupPrintBlendMode,
  getMockupPrintLayerOpacity,
} from '../../lib/mockup-print-blend'
import { sortShapesByLayer } from '../../lib/shape-layers'
import type { DesignShape } from '../../types/design'
import type { ProductColorValue, PrintZoneValue } from '../../lib/products'
import { DesignPreviewShape } from './design-preview-shape'

type Props = {
  shapes: DesignShape[]
  productColor: ProductColorValue
  printZone: PrintZoneValue
  className?: string
}

/** Vista previa en DOM = mismo mockup y capas que el editor (sin guías ni recuadros) */
export function DesignPreviewMockup({
  shapes,
  productColor,
  printZone,
  className = '',
}: Props) {
  const sorted = sortShapesByLayer(shapes)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      const w = el.clientWidth
      if (w > 0) setScale(w / EDITOR_CANVAS_W)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className={
        'relative w-full overflow-hidden rounded-lg bg-[#e8eaed] shadow-inner ' +
        className
      }
      style={{ aspectRatio: `${EDITOR_CANVAS_W} / ${EDITOR_CANVAS_H}` }}
    >
      {/* Mismo lienzo 400×520 que el editor, escalado al ancho del preview */}
      <div
        className="absolute left-0 top-0 origin-top-left overflow-hidden rounded-lg"
        style={{
          width: EDITOR_CANVAS_W,
          height: EDITOR_CANVAS_H,
          transform: `scale(${scale})`,
        }}
      >
        <CrewneckMockup
          view={printZone}
          color={productColor}
          className="absolute inset-0 h-full w-full"
        />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            mixBlendMode: getMockupPrintBlendMode(productColor),
            opacity: getMockupPrintLayerOpacity(productColor),
          }}
        >
          {sorted.map((shape) => (
            <DesignPreviewShape key={shape.id} shape={shape} />
          ))}
          <MockupPrintTexture />
        </div>
      </div>
    </div>
  )
}
