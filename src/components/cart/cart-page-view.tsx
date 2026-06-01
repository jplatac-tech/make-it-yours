'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useAppState, type CartItem } from '../app-state/app-state-provider'
import { useNavWhatsAppHref } from '../../hooks/use-nav-whatsapp-href'
import {
  formatCartPrice,
  getCartProductDescription,
  getCartProductImage,
} from '../../lib/cart-display'

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className ?? 'h-4 w-4'}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconTrash() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        d="M4 7h16M9 7V5h6v2M10 11v6M14 11v6M6 7l1 12h10l1-12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CartLineRow({
  item,
  onRemove,
  onQuantityChange,
}: {
  item: CartItem
  onRemove: () => void
  onQuantityChange: (qty: number) => void
}) {
  const lineTotal = item.price * item.quantity

  return (
    <li className="border-b border-neutral-200 py-8 first:pt-0">
      <div className="flex gap-5 sm:gap-8">
        <div className="w-[100px] shrink-0 sm:w-[140px]">
          <div className="relative aspect-square overflow-hidden rounded-sm bg-neutral-100">
            <Image
              src={getCartProductImage(item.slug)}
              alt=""
              fill
              className="object-cover object-center"
              sizes="140px"
            />
          </div>
          <div className="mt-3 inline-flex items-center rounded-full border border-neutral-300 bg-white">
            <button
              type="button"
              title="Eliminar"
              aria-label="Eliminar del carrito"
              onClick={onRemove}
              className="flex h-9 w-10 cursor-pointer items-center justify-center text-neutral-700 transition hover:bg-neutral-50"
            >
              <IconTrash />
            </button>
            <span className="flex h-9 min-w-[2rem] items-center justify-center border-x border-neutral-300 px-1 text-sm font-medium tabular-nums text-neutral-900">
              {item.quantity}
            </span>
            <button
              type="button"
              title="Aumentar cantidad"
              aria-label="Aumentar cantidad"
              onClick={() => onQuantityChange(item.quantity + 1)}
              className="flex h-9 w-10 cursor-pointer items-center justify-center text-lg font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:justify-between sm:gap-6">
          <div className="min-w-0 pr-2">
            <h2 className="text-base font-semibold text-neutral-900 sm:text-lg">
              {item.name}
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              {getCartProductDescription(item.slug)}
            </p>
            {item.size ? (
              <p className="mt-2 text-sm text-neutral-800">
                Talla:{' '}
                <span className="underline decoration-neutral-400 underline-offset-2">
                  {item.size}
                </span>
              </p>
            ) : null}
          </div>
          <p className="mt-3 shrink-0 text-base font-medium text-neutral-900 sm:mt-0 sm:text-right">
            {formatCartPrice(lineTotal)}
          </p>
        </div>
      </div>
    </li>
  )
}

export function CartPageView() {
  const { cartItems, totalPrice, removeFromCart, updateCartQuantity, profile } =
    useAppState()
  const wa = useNavWhatsAppHref()
  const [promoOpen, setPromoOpen] = useState(false)
  const [promoCode, setPromoCode] = useState('')

  const isEmpty = cartItems.length === 0
  if (isEmpty) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-8 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-neutral-900 hover:underline"
        >
          <ChevronLeft />
          Volver
        </Link>
        <h1 className="mt-10 text-2xl font-semibold text-neutral-900">
          Carrito de compras
        </h1>
        <p className="mt-4 text-neutral-600">Tu carrito está vacío.</p>
        <Link
          href="/#catalogo"
          className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-full bg-neutral-900 px-8 text-sm font-semibold text-white transition hover:bg-neutral-800"
        >
          Seguir comprando
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-8 sm:py-10 lg:py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm font-medium text-neutral-900 transition hover:underline"
      >
        <ChevronLeft />
        Volver
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_minmax(280px,380px)] lg:gap-16 xl:gap-24">
        <section>
          <ul>
            {cartItems.map((item) => (
              <CartLineRow
                key={`${item.slug}-${item.size ?? ''}`}
                item={item}
                onRemove={() => removeFromCart(item.slug)}
                onQuantityChange={(qty) =>
                  updateCartQuantity(item.slug, Math.max(1, qty))
                }
              />
            ))}
          </ul>
        </section>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <details
            className="group border-b border-neutral-200 pb-4"
            open={promoOpen}
            onToggle={(e) => setPromoOpen(e.currentTarget.open)}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-neutral-900 [&::-webkit-details-marker]:hidden">
              ¿Tienes un código promocional?
              <ChevronLeft className="h-4 w-4 rotate-[-90deg] transition group-open:rotate-90" />
            </summary>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Código"
                className="min-h-[40px] flex-1 rounded-full border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-900"
              />
              <button
                type="button"
                className="shrink-0 rounded-full border border-neutral-300 px-4 text-sm font-semibold text-neutral-900 transition hover:border-neutral-900"
              >
                Aplicar
              </button>
            </div>
          </details>

          <div className="border-b border-neutral-200 py-6">
            <h2 className="text-base font-semibold text-neutral-900">Entrega</h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              El envío se confirma por WhatsApp según tu ciudad. Te damos opciones
              y tiempos al cerrar el pedido.
            </p>
            <button
              type="button"
              className="mt-4 min-h-[40px] rounded-full border border-neutral-300 px-6 text-sm font-semibold text-neutral-900 transition hover:border-neutral-900"
            >
              Calcular
            </button>
          </div>

          <div className="space-y-2 py-6 text-sm text-neutral-900">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCartPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatCartPrice(totalPrice)}</span>
            </div>
          </div>

          <p className="mb-6 text-sm text-neutral-600">
            Envío por calcular. Te confirmamos opciones y tiempos por WhatsApp.
          </p>

          <a
            id="checkout"
            href={wa.enabled ? wa.href : undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!wa.enabled}
            className={
              'flex min-h-[52px] w-full items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white transition hover:bg-neutral-800 ' +
              (wa.enabled ? '' : ' pointer-events-none opacity-40')
            }
          >
            Ir al checkout
          </a>

          <Link
            href="/#catalogo"
            className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-neutral-900 hover:underline"
          >
            <ChevronLeft />
            Seguir comprando
          </Link>

          {profile?.name ? (
            <p className="mt-4 text-xs text-neutral-500">
              Pedido a nombre de {profile.name}
            </p>
          ) : null}
        </aside>
      </div>
    </main>
  )
}
