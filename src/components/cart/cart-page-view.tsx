'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAppState, type CartItem } from '../app-state/app-state-provider'
import { useNavWhatsAppHref } from '../../hooks/use-nav-whatsapp-href'
import {
  formatCartPrice,
  getCartProductDescription,
  getCartProductImage,
} from '../../lib/cart-display'
import {
  hasDesignElements,
  loadDesign,
  DESIGN_SAVE_EVENT,
  DESIGN_STORAGE_KEY,
} from '../../lib/design-storage'
import { buildEditorPath } from '../../lib/editor-url'

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
  const imageAlt = `${item.name}${item.size ? ` talla ${item.size}` : ''}`

  return (
    <li className="border-b border-neutral-200 py-6 first:pt-0 sm:py-8">
      <div className="flex flex-col gap-4">
        <div className="flex gap-4 sm:gap-6">
          <div className="w-24 shrink-0 sm:w-32">
            <div className="relative aspect-square overflow-hidden rounded-sm bg-neutral-100">
              <Image
                src={getCartProductImage(item.slug)}
                alt={imageAlt}
                fill
                className="object-cover object-center"
                sizes="(max-width: 640px) 96px, 128px"
              />
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 sm:flex-row sm:gap-6">
            <div className="min-w-0">
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
            <p className="shrink-0 text-base font-medium text-neutral-900 sm:text-right">
              {formatCartPrice(lineTotal)}
            </p>
          </div>
        </div>

        <div className="inline-flex w-full max-w-[11.5rem] items-center rounded-full border border-neutral-300 bg-white">
          <button
            type="button"
            title="Eliminar"
            aria-label="Eliminar del carrito"
            onClick={onRemove}
            className="flex h-10 w-11 cursor-pointer items-center justify-center text-neutral-700 transition hover:bg-neutral-50"
          >
            <IconTrash />
          </button>
          <button
            type="button"
            title="Disminuir cantidad"
            aria-label="Disminuir cantidad"
            disabled={item.quantity <= 1}
            onClick={() => onQuantityChange(item.quantity - 1)}
            className="flex h-10 w-11 cursor-pointer items-center justify-center text-lg font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-30"
          >
            −
          </button>
          <span className="flex h-10 min-w-[2.25rem] flex-1 items-center justify-center border-x border-neutral-300 px-1 text-sm font-medium tabular-nums text-neutral-900">
            {item.quantity}
          </span>
          <button
            type="button"
            title="Aumentar cantidad"
            aria-label="Aumentar cantidad"
            onClick={() => onQuantityChange(item.quantity + 1)}
            className="flex h-10 w-11 cursor-pointer items-center justify-center text-lg font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            +
          </button>
        </div>
      </div>
    </li>
  )
}

function DesignDraftBanner() {
  return (
    <div className="mb-8 rounded-2xl border border-violet-200 bg-violet-50 p-5 text-sm text-violet-950">
      <p className="font-semibold">Tienes un diseño guardado en este dispositivo</p>
      <p className="mt-2 text-violet-900/90">
        El carrito es para prendas del catálogo. Para cotizar tu estampado
        personalizado, envía el diseño desde el editor.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href="/comprar"
          className="inline-flex min-h-[40px] items-center justify-center rounded-full bg-violet-700 px-5 text-sm font-semibold text-white hover:bg-violet-800"
        >
          Enviar diseño para cotizar
        </Link>
        <Link
          href={buildEditorPath()}
          className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-violet-300 bg-white px-5 text-sm font-semibold text-violet-900 hover:bg-violet-100"
        >
          Abrir editor
        </Link>
      </div>
    </div>
  )
}

export function CartPageView() {
  const { cartItems, totalPrice, removeFromCart, updateCartQuantity, profile } =
    useAppState()
  const wa = useNavWhatsAppHref()
  const [hasDraft, setHasDraft] = useState(false)

  useEffect(() => {
    const read = () => setHasDraft(hasDesignElements(loadDesign()))
    read()
    window.addEventListener(DESIGN_SAVE_EVENT, read)
    const onStorage = (e: StorageEvent) => {
      if (e.key === DESIGN_STORAGE_KEY) read()
    }
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(DESIGN_SAVE_EVENT, read)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

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
        {hasDraft ? <div className="mt-8"><DesignDraftBanner /></div> : null}
        <Link
          href="/catalogo"
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

      {hasDraft ? (
        <div className="mt-8">
          <DesignDraftBanner />
        </div>
      ) : null}

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_minmax(280px,380px)] lg:gap-16 xl:gap-24">
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
          <div className="border-b border-neutral-200 py-6">
            <h2 className="text-base font-semibold text-neutral-900">Entrega</h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              El envío y el precio final del estampado se confirman por WhatsApp
              según tu ciudad y el diseño (si aplica).
            </p>
          </div>

          <div className="space-y-2 py-6 text-sm text-neutral-900">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCartPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span>Total estimado</span>
              <span>{formatCartPrice(totalPrice)}</span>
            </div>
          </div>

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
            Confirmar por WhatsApp
          </a>

          <Link
            href="/catalogo"
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
