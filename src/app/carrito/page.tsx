'use client'

import Link from 'next/link'
import { useAppState } from '../../components/app-state/app-state-provider'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import {
  buildWhatsAppUrl,
  formatCartWhatsAppMessage,
} from '../../lib/whatsapp'

const formatPrice = (n: number) => `$${n.toFixed(0)}`

export default function CartPage() {
  const {
    cartItems,
    totalPrice,
    removeFromCart,
    updateCartQuantity,
    profile,
  } = useAppState()

  const checkoutHref =
    cartItems.length > 0
      ? buildWhatsAppUrl(
          formatCartWhatsAppMessage(
            cartItems,
            totalPrice,
            profile?.name,
          ),
        )
      : '#'

  return (
    <main className="container py-12 md:py-16">
      <h1 className="text-3xl font-semibold text-neutral-950">Tu carrito</h1>
      <p className="mt-2 text-neutral-600">
        Revisa cantidades y envía el pedido por WhatsApp. Nosotros te confirmamos
        precio final y tiempos.
      </p>

      {cartItems.length === 0 ? (
        <div className="card mt-10 max-w-lg p-8 text-center">
          <p className="text-neutral-500">Tu carrito está vacío.</p>
          <Link
            href="/catalogo"
            className="btn btn-primary mt-6 inline-flex bg-violet-600"
          >
            Ver catálogo
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
          <ul className="space-y-4">
            {cartItems.map((item) => (
              <li
                key={`${item.slug}-${item.size ?? ''}`}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
              >
                <div>
                  <p className="font-semibold text-neutral-900">{item.name}</p>
                  <p className="text-sm text-neutral-500">
                    {item.size ? `Talla ${item.size} · ` : ''}
                    {formatPrice(item.price)} c/u
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={1}
                    value={String(item.quantity)}
                    onChange={(e) =>
                      updateCartQuantity(item.slug, Number(e.target.value))
                    }
                    className="w-20"
                  />
                  <p className="min-w-[4rem] text-right font-semibold">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                  <Button
                    variant="ghost"
                    className="text-red-600"
                    onClick={() => removeFromCart(item.slug)}
                  >
                    Quitar
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-neutral-500">Total estimado</p>
            <p className="mt-1 text-3xl font-bold text-neutral-950">
              {formatPrice(totalPrice)}
            </p>
            <p className="mt-4 text-sm text-neutral-600">
              Al continuar se abre WhatsApp con el detalle de tu pedido listo
              para enviar.
            </p>
            <a
              href={checkoutHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#20bd5a]"
            >
              Enviar carrito por WhatsApp
            </a>
            <Link
              href="/disenar"
              className="mt-3 block text-center text-sm font-semibold text-violet-700 hover:underline"
            >
              Crear diseño en el editor
            </Link>
          </aside>
        </div>
      )}
    </main>
  )
}
