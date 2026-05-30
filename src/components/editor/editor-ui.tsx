'use client'

import { useEffect, useId, useRef, useState } from 'react'

export function DropdownField({
  label,
  valueLabel,
  children,
  className = '',
}: {
  label: string
  valueLabel: string
  children: React.ReactNode
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <span className="mb-1.5 block text-sm font-semibold text-neutral-600">
        {label}
      </span>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-[40px] w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-left text-sm font-medium text-neutral-900 transition hover:border-violet-300 hover:bg-neutral-50"
      >
        <span className="truncate">{valueLabel}</span>
        <span
          className={
            'shrink-0 text-[10px] text-neutral-400 transition ' +
            (open ? 'rotate-180' : '')
          }
        >
          ▼
        </span>
      </button>
      {open ? (
        <div className="absolute top-full right-0 left-0 z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border border-neutral-200 bg-white py-1 shadow-xl">
          <div onClick={() => setOpen(false)}>{children}</div>
        </div>
      ) : null}
    </div>
  )
}

const PRINT_SWATCHES = [
  '#111827',
  '#ffffff',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#78716c',
  '#0ea5e9',
  '#a855f7',
]

export function ColorPickerButton({
  value,
  onChange,
  label = 'Color',
  compact = false,
}: {
  value: string
  onChange: (hex: string) => void
  label?: string
  compact?: boolean
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputId = useId()

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
      {label ? (
        <span className="mb-1.5 block text-sm font-semibold text-neutral-600">
          {label}
        </span>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Color"
        className={
          'flex w-full cursor-pointer items-center rounded-lg border border-neutral-200 bg-white transition hover:border-violet-300 ' +
          (compact
            ? 'min-h-[36px] justify-center gap-1.5 px-2 py-1'
            : 'min-h-[36px] gap-2.5 px-2.5 py-2')
        }
      >
        <span
          className={
            'shrink-0 rounded-lg border-2 border-neutral-200 shadow-inner ' +
            (compact ? 'h-7 w-7' : 'h-8 w-8')
          }
          style={{ backgroundColor: value }}
        />
        {!compact ? (
          <>
            <span className="flex-1 truncate text-left text-sm font-medium text-neutral-800">
              {value.toUpperCase()}
            </span>
            <span className="text-[10px] text-neutral-400">▼</span>
          </>
        ) : (
          <span className="text-[10px] text-neutral-400">▼</span>
        )}
      </button>
      {open ? (
        <div className="absolute top-full right-0 left-0 z-50 mt-1 rounded-xl border border-neutral-200 bg-white p-3 shadow-xl">
          <div className="grid grid-cols-6 gap-2">
            {PRINT_SWATCHES.map((hex) => (
              <button
                key={hex}
                type="button"
                title={hex}
                onClick={() => {
                  onChange(hex)
                  setOpen(false)
                }}
                className={
                  'aspect-square cursor-pointer rounded-lg border-2 transition hover:scale-105 ' +
                  (value.toLowerCase() === hex.toLowerCase()
                    ? 'border-violet-600 ring-2 ring-violet-200'
                    : 'border-neutral-200')
                }
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
          <label
            htmlFor={inputId}
            className="mt-3 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-50"
          >
            <span
              className="h-6 w-6 rounded-md border"
              style={{ backgroundColor: value }}
            />
            Color personalizado
            <input
              id={inputId}
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="ml-auto h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
            />
          </label>
        </div>
      ) : null}
    </div>
  )
}
