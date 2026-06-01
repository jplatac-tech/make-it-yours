'use client'

import { useEffect, useRef, useState } from 'react'
import { useAppState } from '../app-state/app-state-provider'
import { CartDropdown } from './cart-dropdown'

function BagIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className ?? 'h-6 w-6'}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M8 7V6a4 4 0 118 0v1" />
      <path d="M5 7h14l-1.2 12H6.2L5 7z" />
    </svg>
  )
}

type Props = {
  iconClassName?: string
  badgeClassName?: string
  isDark?: boolean
}

export function CartHeaderTrigger({
  iconClassName = 'text-neutral-900',
  badgeClassName,
  isDark = false,
}: Props) {
  const { cartItems, totalItems, totalPrice } = useAppState()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const badge =
    badgeClassName ??
    (isDark ? 'bg-white text-neutral-950' : 'bg-neutral-700 text-white')

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={
          totalItems > 0
            ? `Carrito, ${totalItems} artículo${totalItems === 1 ? '' : 's'}`
            : 'Carrito'
        }
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((o) => !o)}
        className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full transition duration-200 hover:opacity-100 ${iconClassName} ${isDark ? 'hover:bg-white/10' : 'hover:bg-neutral-100'}`}
      >
        <BagIcon />
        {totalItems > 0 ? (
          <span
            className={
              'absolute top-0.5 right-0 flex h-4 min-w-4 items-center justify-center rounded-sm px-0.5 text-[10px] font-bold ' +
              badge
            }
          >
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute top-full right-0 z-[60] mt-2">
          <CartDropdown
            items={cartItems}
            totalPrice={totalPrice}
            onClose={() => setOpen(false)}
          />
        </div>
      ) : null}
    </div>
  )
}
