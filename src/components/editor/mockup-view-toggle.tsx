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
  /** Compacto: esquina del mockup, no tapa el diseño */
  variant?: 'compact' | 'thumbs'
  /** Más alto y ancho en móvil */
  size?: 'default' | 'large'
}

const VIEWS: { zone: PrintZoneValue; label: string; short: string }[] = [
  { zone: 'FRONT', label: 'Vista frontal', short: 'Frente' },
  { zone: 'BACK', label: 'Vista trasera', short: 'Espalda' },
]

export function MockupViewToggle({
  printZone,
  productColor,
  onChange,
  variant = 'compact',
  size = 'default',
}: Props) {
  const colorKey = productColor as MockupColorKey

  if (variant === 'thumbs') {
    return (
      <div
        className="flex gap-2 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-md"
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
                className="block h-14 w-11 object-contain object-center bg-[#e8eaed] sm:h-16 sm:w-12"
                draggable={false}
              />
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div
      className="flex gap-0.5 rounded-lg border border-neutral-200/90 bg-white/95 p-0.5 shadow-md backdrop-blur-sm"
      role="tablist"
      aria-label="Vista del mockup"
    >
      {VIEWS.map(({ zone, label, short }) => {
        const active = printZone === zone
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
              (size === 'large'
                ? 'min-h-[44px] min-w-[72px] px-3.5 text-sm'
                : 'min-h-[32px] min-w-[52px] px-2.5 text-xs') +
              ' cursor-pointer rounded-md font-bold transition ' +
              (active
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-neutral-600 hover:bg-neutral-100')
            }
          >
            {short}
          </button>
        )
      })}
    </div>
  )
}
