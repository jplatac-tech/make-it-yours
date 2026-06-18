'use client'

import { useCallback, useLayoutEffect, useRef, useState } from 'react'
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

const FALLBACK_SCALE = 280 / EDITOR_CANVAS_W

/** Vista previa en DOM = mismo mockup y capas que el editor (sin guías ni recuadros) */
export function DesignPreviewMockup({
  shapes,
  productColor,
  printZone,
  className = '',
}: Props) {
  const sorted = sortShapesByLayer(shapes)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(FALLBACK_SCALE)

  const measure = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const w = el.getBoundingClientRect().width
    if (w > 0) setScale(w / EDITOR_CANVAS_W)
  }, [])

  useLayoutEffect(() => {
    measure()
    const el = containerRef.current
    if (!el) return

    const ro = new ResizeObserver(() => measure())
    ro.observe(el)

    const timers = [0, 80, 200, 500].map((ms) => window.setTimeout(measure, ms))
    window.addEventListener('resize', measure)
    window.addEventListener('orientationchange', measure)

    return () => {
      ro.disconnect()
      timers.forEach((id) => window.clearTimeout(id))
      window.removeEventListener('resize', measure)
      window.removeEventListener('orientationchange', measure)
    }
  }, [measure, printZone, shapes.length])

  return (
    <div
      ref={containerRef}
      className={
        'relative mx-auto w-full max-w-[280px] overflow-visible rounded-lg bg-[#e8eaed] shadow-inner ' +
        className
      }
      style={{ aspectRatio: `${EDITOR_CANVAS_W} / ${EDITOR_CANVAS_H}` }}
    >
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
