'use client'

import { useEffect, useRef, useState } from 'react'
import { GARMENT_COLOR_HEX } from '../../lib/garment-colors'
import {
  PRODUCT_COLORS,
  getProductColorLabel,
  type ProductColorValue,
} from '../../lib/products'

export type GarmentSlotView = {
  id: string
  color: ProductColorValue
  label: string
  /** ID corto visible (ej. MIY-A1B2C3D4) */
  refId?: string
  hasDesign: boolean
}

type Props = {
  items: GarmentSlotView[]
  activeId: string
  onSelect: (id: string) => void
  /** El usuario elige el color de la prenda nueva */
  onAdd: (color: ProductColorValue) => void
  onRemove?: (id: string) => void
  maxItems?: number
}

export function GarmentSlotStrip({
  items,
  activeId,
  onSelect,
  onAdd,
  onRemove,
  maxItems = 6,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pendingColor, setPendingColor] = useState<ProductColorValue>('WHITE')
  const rootRef = useRef<HTMLDivElement>(null)
  const canAdd = items.length < maxItems
  const canRemove = items.length > 1 && onRemove

  useEffect(() => {
    if (!pickerOpen) return
    let close: ((e: MouseEvent) => void) | null = null
    const timer = window.setTimeout(() => {
      close = (e: MouseEvent) => {
        if (!rootRef.current?.contains(e.target as Node)) {
          setPickerOpen(false)
        }
      }
      document.addEventListener('click', close, true)
    }, 0)
    return () => {
      window.clearTimeout(timer)
      if (close) document.removeEventListener('click', close, true)
    }
  }, [pickerOpen])

  function confirmAdd() {
    onAdd(pendingColor)
    setPickerOpen(false)
    setPendingColor('WHITE')
  }

  return (
    <div
      ref={rootRef}
      className="pointer-events-auto absolute inset-x-0 bottom-3 z-30 flex justify-center px-2 sm:bottom-4"
      aria-label="Prendas en este pedido"
    >
      <div className="flex max-w-full flex-col items-center gap-2 rounded-2xl border border-neutral-200/90 bg-white/95 px-3 py-2.5 shadow-lg backdrop-blur-sm sm:px-4">
        <p className="text-[11px] font-semibold tracking-wide text-neutral-500 uppercase">
          Tus prendas ({items.length})
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {items.map((item, index) => {
            const hex = GARMENT_COLOR_HEX[item.color].fill
            const isActive = item.id === activeId
            return (
              <div
                key={item.id}
                className={
                  'group/slot relative flex flex-col items-center ' +
                  (isActive ? 'z-[1]' : '')
                }
              >
                <button
                  type="button"
                  title={`${item.label} · ${getProductColorLabel(item.color)}${item.hasDesign ? ' · con diseño' : ''}`}
                  onClick={() => onSelect(item.id)}
                  className={
                    'relative flex cursor-pointer flex-col items-center gap-1 rounded-xl px-2 py-1.5 transition active:scale-95 ' +
                    (isActive ? 'bg-violet-50 ring-2 ring-violet-400' : 'hover:bg-neutral-50')
                  }
                >
                  <span
                    className={
                      'flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white shadow-sm ' +
                      (isActive
                        ? 'border-violet-600'
                        : 'border-neutral-200 group-hover/slot:border-violet-300')
                    }
                  >
                    <span
                      className="h-7 w-7 rounded-full border border-neutral-200"
                      style={{ backgroundColor: hex }}
                    />
                  </span>
                  <span className="max-w-[4.5rem] truncate text-[9px] font-bold tracking-tight text-violet-800">
                    {item.refId ?? item.label}
                  </span>
                  {item.hasDesign ? (
                    <span
                      className="absolute top-1 right-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white"
                      aria-hidden
                    />
                  ) : null}
                </button>
                {canRemove ? (
                  <button
                    type="button"
                    title="Quitar esta prenda"
                    aria-label={`Quitar ${item.refId ?? item.label}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemove(item.id)
                    }}
                    className="absolute -top-1 -right-0.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 shadow-sm transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 active:scale-95"
                  >
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                    </svg>
                  </button>
                ) : null}
              </div>
            )
          })}

          {canAdd ? (
            <div className="relative">
              <button
                type="button"
                title="Añadir otra prenda"
                onClick={(e) => {
                  e.stopPropagation()
                  setPendingColor('WHITE')
                  setPickerOpen((o) => !o)
                }}
                className={
                  'flex h-[52px] min-w-[52px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-violet-400 px-2 text-violet-600 transition hover:border-violet-600 hover:bg-violet-50 active:scale-95 ' +
                  (pickerOpen ? 'bg-violet-50 ring-2 ring-violet-300' : '')
                }
                aria-expanded={pickerOpen}
                aria-haspopup="dialog"
                aria-label="Añadir otra prenda"
              >
                <span className="text-2xl font-light leading-none">+</span>
                <span className="text-[10px] font-semibold">Nueva</span>
              </button>

              {pickerOpen ? (
                <div
                  role="dialog"
                  aria-label="Elegir color de la nueva prenda"
                  className="absolute bottom-full left-1/2 z-50 mb-2 w-[min(280px,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-neutral-200 bg-white p-3 shadow-xl"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-center text-sm font-semibold text-neutral-900">
                    Color de la nueva prenda
                  </p>
                  <p className="mt-0.5 text-center text-xs text-neutral-500">
                    Elige y confirma para empezar su diseño
                  </p>
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {PRODUCT_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        title={c.label}
                        onClick={() => setPendingColor(c.value)}
                        className={
                          'flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 p-1.5 transition ' +
                          (pendingColor === c.value
                            ? 'border-violet-600 bg-violet-50 ring-1 ring-violet-200'
                            : 'border-neutral-200 hover:border-violet-300')
                        }
                      >
                        <span
                          className="h-8 w-8 rounded-full border border-neutral-200 shadow-inner"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="text-[9px] font-medium text-neutral-700">
                          {c.label.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={confirmAdd}
                    className="mt-3 w-full cursor-pointer rounded-xl bg-violet-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 active:scale-[0.98]"
                  >
                    Añadir · {getProductColorLabel(pendingColor)}
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
