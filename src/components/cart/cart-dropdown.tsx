'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { CartItem } from '../app-state/app-state-provider'
import {
  formatCartPrice,
  getCartProductBrand,
  getCartProductImage,
} from '../../lib/cart-display'

type Props = {
  items: CartItem[]
  totalPrice: number
  onClose: () => void
}

function CartLineItem({ item }: { item: CartItem }) {
  const lineTotal = item.price * item.quantity
  const sizeLabel = item.size ? `Talla: ${item.size}` : null

  return (
    <li className="flex gap-3 py-4">
      <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-md bg-neutral-100">
        <Image
          src={getCartProductImage(item.slug)}
          alt=""
          fill
          className="object-cover object-center"
          sizes="72px"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="truncate text-sm font-semibold text-neutral-900">
          {item.name}
          {item.quantity > 1 ? (
            <span className="font-medium text-neutral-500">
              {' '}
              × {item.quantity}
            </span>
          ) : null}
        </p>
        <p className="mt-0.5 text-[11px] font-semibold tracking-wide text-neutral-400 uppercase">
          {getCartProductBrand(item.slug)}
        </p>
        {sizeLabel ? (
          <p className="mt-1 text-xs text-neutral-500">{sizeLabel}</p>
        ) : null}
        <p className="mt-auto pt-2 text-sm font-medium text-neutral-900">
          {formatCartPrice(lineTotal)}
        </p>
      </div>
    </li>
  )
}

export function CartDropdown({ items, totalPrice, onClose }: Props) {
  const isEmpty = items.length === 0

  return (
    <div
      className="w-[min(calc(100vw-1.5rem),380px)] overflow-hidden rounded-lg bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
      role="dialog"
      aria-label="Carrito de compras"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <h2 className="border-b border-neutral-100 px-5 py-4 text-center text-base font-medium text-neutral-900">
        Carrito de compras
      </h2>

      {isEmpty ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-neutral-500">Tu carrito está vacío.</p>
          <Link
            href="/#catalogo"
            onClick={onClose}
            className="mt-4 inline-flex rounded-full border border-neutral-900 px-5 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
          >
            Ver catálogo
          </Link>
        </div>
      ) : (
        <>
          <ul className="max-h-[min(50vh,320px)] divide-y divide-neutral-100 overflow-y-auto overscroll-contain px-5 [-webkit-overflow-scrolling:touch]">
            {items.map((item) => (
              <CartLineItem
                key={`${item.slug}-${item.size ?? ''}`}
                item={item}
              />
            ))}
          </ul>

          <div className="border-t border-neutral-200 px-5 py-4">
            <div className="flex justify-between text-sm text-neutral-700">
              <span>Envío:</span>
              <span className="text-neutral-500">Por calcular</span>
            </div>
            <div className="mt-2 flex justify-between text-sm font-medium text-neutral-900">
              <span>Total:</span>
              <span>{formatCartPrice(totalPrice)}</span>
            </div>
          </div>

          <div className="flex gap-2 border-t border-neutral-100 px-4 py-4">
            <Link
              href="/carrito"
              onClick={onClose}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full border border-neutral-900 bg-white px-3 text-center text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
            >
              Ver carrito
            </Link>
            <Link
              href="/carrito#checkout"
              onClick={onClose}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-neutral-900 px-3 text-center text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Ir al checkout
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
