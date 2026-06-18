'use client'

import { useEffect, useRef, useState } from 'react'
import { useAppState } from '../app-state/app-state-provider'
import { HeaderPopover } from '../layout/header-popover'
import { CartDropdown } from './cart-dropdown'

function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className ?? 'h-6 w-6'}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="9" cy="20" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="17" cy="20" r="1.25" fill="currentColor" stroke="none" />
      <path d="M3 3h2l1.2 10.2a1.5 1.5 0 001.5 1.3h9.1a1.5 1.5 0 001.45-1.1L19 8H6.2" />
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
      if (window.matchMedia('(min-width: 1024px)').matches) {
        if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
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
        className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full transition duration-200 hover:opacity-100 sm:h-10 sm:w-10 ${iconClassName} ${isDark ? 'hover:bg-white/10' : 'hover:bg-neutral-100'}`}
      >
        <CartIcon />
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

      <HeaderPopover open={open} onClose={() => setOpen(false)} zIndex={70}>
        <CartDropdown
          items={cartItems}
          totalPrice={totalPrice}
          onClose={() => setOpen(false)}
        />
      </HeaderPopover>
    </div>
  )
}
