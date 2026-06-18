'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { CREWNECK_UNISEX_MOCKUPS } from '../../lib/mockup-assets'
import { PRODUCT_COLORS, type ProductColorValue } from '../../lib/products'

type Props = {
  open: boolean
  onClose: () => void
  onConfirm: (color: ProductColorValue) => void
}

function ColorSwatchButton({
  color,
  active,
  onSelect,
  compact = false,
}: {
  color: (typeof PRODUCT_COLORS)[number]
  active: boolean
  onSelect: () => void
  compact?: boolean
}) {
  if (compact) {
    return (
      <button
        type="button"
        onClick={onSelect}
        title={color.label}
        className={
          'flex min-w-0 cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 p-2 transition ' +
          (active
            ? 'border-violet-600 bg-violet-50'
            : 'border-neutral-200 bg-white')
        }
      >
        <span
          className={
            'h-11 w-11 rounded-full border-2 shadow-sm ' +
            (active ? 'border-violet-600 ring-2 ring-violet-200' : 'border-neutral-200')
          }
          style={{ backgroundColor: color.hex }}
        />
        <span className="w-full text-center text-[10px] leading-tight font-semibold text-neutral-800">
          {color.label}
        </span>
      </button>
    )
  }

  const mockup = CREWNECK_UNISEX_MOCKUPS[color.value]
  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        'flex cursor-pointer flex-col overflow-hidden rounded-xl border-2 text-left transition ' +
        (active
          ? 'border-violet-600 ring-2 ring-violet-200'
          : 'border-neutral-200 hover:border-violet-300')
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mockup.front}
        alt={mockup.label}
        className="aspect-[4/5] w-full object-cover object-top"
      />
      <span className="flex items-center gap-2 bg-white px-2.5 py-2 text-xs font-semibold text-neutral-800">
        <span
          className="h-3.5 w-3.5 shrink-0 rounded-full border border-neutral-200"
          style={{ backgroundColor: color.hex }}
          aria-hidden
        />
        {color.label}
      </span>
    </button>
  )
}

export function EditorColorModal({ open, onClose, onConfirm }: Props) {
  const [selected, setSelected] = useState<ProductColorValue>('WHITE')
  const [mounted, setMounted] = useState(false)

  const selectedLabel =
    PRODUCT_COLORS.find((c) => c.value === selected)?.label ?? selected

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open || !mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-end justify-center sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-neutral-950/55 backdrop-blur-[2px]"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-color-title"
        className="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-t-[1.25rem] border border-neutral-200 bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl"
      >
        <div className="shrink-0 px-4 pt-4 pb-2 sm:px-6 sm:pt-6">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-neutral-200 sm:hidden" aria-hidden />
          <h2
            id="editor-color-title"
            className="text-base font-semibold text-neutral-950 sm:text-xl"
          >
            ¿De qué color quieres el suéter?
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Elige el color antes de abrir el editor.
          </p>
        </div>

        <div className="px-4 sm:px-6">
          <div className="pb-3 sm:hidden">
            <p className="mb-2 text-xs font-medium text-neutral-500">
              {PRODUCT_COLORS.length} colores disponibles
            </p>
            <div
              className="grid grid-cols-3 gap-2"
              role="listbox"
              aria-label="Color del suéter"
            >
              {PRODUCT_COLORS.map((color) => (
                <ColorSwatchButton
                  key={color.value}
                  color={color}
                  active={selected === color.value}
                  onSelect={() => setSelected(color.value)}
                  compact
                />
              ))}
            </div>
            <p className="mt-3 text-center text-sm text-neutral-600">
              Seleccionado:{' '}
              <span className="font-semibold text-neutral-900">{selectedLabel}</span>
            </p>
          </div>

          <div className="hidden gap-2.5 pb-3 sm:grid sm:grid-cols-3">
            {PRODUCT_COLORS.map((color) => (
              <ColorSwatchButton
                key={color.value}
                color={color}
                active={selected === color.value}
                onSelect={() => setSelected(color.value)}
              />
            ))}
          </div>
        </div>

        <div className="shrink-0 border-t border-neutral-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary min-h-[44px] w-full sm:w-auto"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => onConfirm(selected)}
              className="btn btn-primary min-h-[44px] w-full sm:w-auto"
            >
              Continuar al editor
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
