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
  const [scale, setScale] = useState<number | null>(null)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return

    const update = () => {
      const w = el.clientWidth
      if (w > 0) {
        setScale(w / EDITOR_CANVAS_W)
      }
    }

    update()

    const ro = new ResizeObserver(() => {
      requestAnimationFrame(update)
    })
    ro.observe(el)

    if (typeof IntersectionObserver !== 'undefined') {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            requestAnimationFrame(update)
          }
        },
        { threshold: 0.01 },
      )
      io.observe(el)
      return () => {
        ro.disconnect()
        io.disconnect()
      }
    }

    return () => ro.disconnect()
  }, [])

  const ready = scale != null && scale > 0

  return (
    <div
      ref={containerRef}
      className={
        'relative mx-auto w-full max-w-[280px] overflow-hidden rounded-lg bg-[#e8eaed] shadow-inner ' +
        className
      }
      style={{ aspectRatio: `${EDITOR_CANVAS_W} / ${EDITOR_CANVAS_H}` }}
    >
      <div
        className={
          'absolute left-0 top-0 origin-top-left overflow-hidden rounded-lg transition-opacity duration-150 ' +
          (ready ? 'opacity-100' : 'opacity-0')
        }
        style={{
          width: EDITOR_CANVAS_W,
          height: EDITOR_CANVAS_H,
          transform: ready ? `scale(${scale})` : undefined,
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
