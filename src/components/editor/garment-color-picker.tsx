'use client'

import { useEffect, useRef, useState } from 'react'
import { CREWNECK_UNISEX_MOCKUPS } from '../../lib/mockup-assets'
import { PRODUCT_COLORS, type ProductColorValue } from '../../lib/products'

type Props = {
  value: ProductColorValue
  onChange: (v: ProductColorValue) => void
  /** Fila horizontal para panel móvil que emerge hacia arriba */
  compact?: boolean
}

export function GarmentColorPicker({ value, onChange, compact = false }: Props) {
  if (compact) {
    return (
      <div
        className="flex touch-pan-x gap-2.5 overflow-x-auto overscroll-x-contain px-3 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: 'touch' }}
        aria-label="Color de la prenda"
      >
        {PRODUCT_COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            title={c.label}
            onClick={() => onChange(c.value)}
            className={
              'h-12 w-12 shrink-0 cursor-pointer rounded-full border-2 shadow-sm transition active:scale-95 ' +
              (value === c.value
                ? 'border-violet-600 ring-2 ring-violet-300'
                : 'border-neutral-300 hover:border-violet-400')
            }
            style={{ backgroundColor: c.hex }}
          />
        ))}
      </div>
    )
  }
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const current = PRODUCT_COLORS.find((c) => c.value === value) ?? PRODUCT_COLORS[0]

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <span className="mb-1.5 block text-sm font-semibold text-neutral-600">
        Color del crewneck unisex
      </span>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-[44px] w-full cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 shadow-sm transition hover:border-violet-300"
      >
        <span
          className="h-9 w-9 shrink-0 rounded-full border-2 border-neutral-200 shadow-inner"
          style={{ backgroundColor: current.hex }}
        />
        <span className="flex-1 text-left text-base font-semibold text-neutral-800">
          {current.label}
        </span>
        <span className="text-sm text-neutral-400">▼</span>
      </button>
      {open ? (
        <div className="absolute top-full right-0 left-0 z-50 mt-1 rounded-xl border border-neutral-200 bg-white p-3 shadow-xl">
          <div className="grid grid-cols-2 gap-2">
            {PRODUCT_COLORS.map((c) => {
              const mockup = CREWNECK_UNISEX_MOCKUPS[c.value]
              return (
                <button
                  key={c.value}
                  type="button"
                  title={mockup.label}
                  onClick={() => {
                    onChange(c.value)
                    setOpen(false)
                  }}
                  className={
                    'flex cursor-pointer flex-col overflow-hidden rounded-xl border-2 transition hover:border-violet-400 ' +
                    (value === c.value
                      ? 'border-violet-500 ring-2 ring-violet-200'
                      : 'border-neutral-200')
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mockup.front}
                    alt={mockup.label}
                    className="aspect-[4/5] w-full object-cover object-top"
                  />
                  <span className="bg-white px-2 py-1.5 text-xs font-semibold text-neutral-800">
                    {c.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
