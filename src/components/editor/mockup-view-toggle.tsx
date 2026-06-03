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
  /** mini = F/E; compact = pestañas; bar = fila inferior; toolbar = barra zoom; thumbs = miniaturas */
  variant?: 'mini' | 'compact' | 'bar' | 'toolbar' | 'thumbs'
  /** Más alto y ancho en móvil (solo compact) */
  size?: 'default' | 'large'
}

const VIEWS: { zone: PrintZoneValue; label: string; short: string }[] = [
  { zone: 'FRONT', label: 'Frente de la prenda', short: 'Frente' },
  { zone: 'BACK', label: 'Espalda de la prenda', short: 'Espalda' },
]

export function MockupViewToggle({
  printZone,
  productColor,
  onChange,
  variant = 'compact',
  size = 'default',
}: Props) {
  const colorKey = productColor as MockupColorKey

  if (variant === 'mini') {
    return (
      <div
        className="flex shrink-0 gap-0.5 rounded-lg border border-neutral-200 bg-neutral-50 p-0.5"
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
                'flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[11px] font-extrabold transition max-lg:h-9 max-lg:w-9 max-lg:text-xs ' +
                (active
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-neutral-600 hover:bg-white')
              }
            >
              <span aria-hidden>{zone === 'FRONT' ? 'F' : 'E'}</span>
            </button>
          )
        })}
      </div>
    )
  }

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

  if (variant === 'toolbar') {
    return (
      <div
        className="flex shrink-0 gap-0.5 rounded-lg border border-neutral-300 bg-white p-0.5 shadow-sm"
        role="tablist"
        aria-label="Lado de la prenda: frente o espalda"
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
                'h-7 min-w-[3.25rem] cursor-pointer rounded-md px-2.5 text-[11px] font-bold transition sm:min-w-[3.5rem] sm:text-xs ' +
                (active
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-neutral-600 hover:bg-neutral-50')
              }
            >
              {short}
            </button>
          )
        })}
      </div>
    )
  }

  if (variant === 'bar') {
    return (
      <div
        className="flex w-[10.25rem] shrink-0 gap-0.5 rounded-xl border border-neutral-200 bg-neutral-50 p-0.5 sm:w-[11rem]"
        role="tablist"
        aria-label="Lado de la prenda: frente o espalda"
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
                'min-h-[36px] flex-1 cursor-pointer rounded-lg px-2 text-xs font-bold transition sm:min-h-[38px] sm:text-sm ' +
                (active
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-neutral-600 hover:bg-white')
              }
            >
              {short}
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
      aria-label="Lado del suéter: frente o espalda"
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
                ? 'min-h-[40px] min-w-[4.5rem] px-3 text-sm'
                : 'min-h-[32px] min-w-[3.75rem] px-2 text-xs') +
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
