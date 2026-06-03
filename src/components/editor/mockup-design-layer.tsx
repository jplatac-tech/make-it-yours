'use client'

import type { ProductColorValue } from '../../lib/products'
import {
  getMockupPrintBlendMode,
  getMockupPrintLayerOpacity,
} from '../../lib/mockup-print-blend'
import { MockupPrintTexture } from './mockup-print-texture'

type Props = {
  productColor: ProductColorValue
  children: React.ReactNode
}

/** Capa de diseño fusionada con la foto del mockup (estampado en tela) */
export function MockupDesignLayer({ productColor, children }: Props) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10"
      style={{
        mixBlendMode: getMockupPrintBlendMode(productColor),
        opacity: getMockupPrintLayerOpacity(productColor),
      }}
    >
      {children}
      <MockupPrintTexture />
    </div>
  )
}
