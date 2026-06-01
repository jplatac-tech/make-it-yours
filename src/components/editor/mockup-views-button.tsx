'use client'

import type { ProductColorValue, PrintZoneValue } from '../../lib/products'
import { MockupViewToggle } from './mockup-view-toggle'

type Props = {
  printZone: PrintZoneValue
  productColor: ProductColorValue
  onChange: (zone: PrintZoneValue) => void
}

/** Selector directo Frente / Espalda (sin menú «Vistas») */
export function MockupSideToggle({
  printZone,
  productColor,
  onChange,
}: Props) {
  return (
    <MockupViewToggle
      printZone={printZone}
      productColor={productColor}
      onChange={onChange}
      variant="bar"
    />
  )
}

/** @deprecated Usar MockupSideToggle */
export const MockupViewsButton = MockupSideToggle
