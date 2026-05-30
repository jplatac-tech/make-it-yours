'use client'

import {
  getCrewneckMockupSrc,
  type MockupColorKey,
} from '../../lib/mockup-assets'
import type { ProductColorValue, PrintZoneValue } from '../../lib/products'

type Props = {
  printZone: PrintZoneValue
  productColor: ProductColorValue
  onChange: (zone: PrintZoneValue) => void
  /** Tamaño fijo en px (móvil) */
  fixedSize?: boolean
}

const VIEWS: { zone: PrintZoneValue; label: string }[] = [
  { zone: 'FRONT', label: 'Vista frontal' },
  { zone: 'BACK', label: 'Vista trasera' },
]

export function MockupViewToggle({
  printZone,
  productColor,
  onChange,
  fixedSize = false,
}: Props) {
  const colorKey = productColor as MockupColorKey

  return (
    <div
      className={
        'flex gap-2 rounded-xl border border-neutral-200 bg-white shadow-md ' +
        (fixedSize ? 'p-1' : 'p-1.5')
      }
      role="tablist"
      aria-label="Vista del mockup"
    >
      {VIEWS.map(({ zone, label }) => {
        const active = printZone === zone
        const src = getCrewneckMockupSrc(colorKey, zone)
        return (
          <button
            key={zone}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={label}
            title={label}
            onClick={() => onChange(zone)}
            className={
              'cursor-pointer overflow-hidden rounded-lg transition ' +
              (active
                ? 'ring-2 ring-violet-600 ring-offset-1'
                : 'opacity-75 hover:opacity-100')
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              className={
                'block object-contain object-center bg-[#e8eaed] ' +
                (fixedSize
                  ? 'h-[52px] w-[42px]'
                  : 'h-14 w-11 sm:h-16 sm:w-12 lg:h-[72px] lg:w-[56px]')
              }
              draggable={false}
            />
          </button>
        )
      })}
    </div>
  )
}
