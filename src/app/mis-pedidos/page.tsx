'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { formatCheckoutOrderWhatsAppMessage } from '../../lib/order-whatsapp-notify'
import {
  loadOrderGallery,
  removeOrderFromGallery,
  type SavedOrder,
} from '../../lib/order-gallery-storage'
import { formatPrice } from '../../lib/utils'
import { buildWhatsAppUrl } from '../../lib/whatsapp'

function formatOrderDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export default function MisPedidosPage() {
  const [orders, setOrders] = useState<SavedOrder[]>([])
  const [ready, setReady] = useState(false)

  const refresh = useCallback(() => {
    setOrders(loadOrderGallery())
  }, [])

  useEffect(() => {
    refresh()
    setReady(true)
  }, [refresh])

  function handleRemove(id: string) {
    removeOrderFromGallery(id)
    refresh()
  }

  return (
    <main className="container py-8 sm:py-12 md:py-16">
      <Link href="/" className="text-sm font-medium text-neutral-500">
        ← Inicio
      </Link>

      <header className="mt-4 max-w-3xl">
        <h1 className="text-2xl font-semibold text-neutral-950 sm:text-3xl">
          Mis pedidos
        </h1>
        <p className="mt-2 text-sm text-neutral-600 sm:text-base">
          Cada compra queda guardada en este dispositivo para que puedas
          consultarla o reenviar la confirmación por WhatsApp cuando quieras.
        </p>
      </header>

      {!ready ? (
        <p className="mt-10 text-neutral-600">Cargando pedidos…</p>
      ) : orders.length === 0 ? (
        <div className="card mt-10 max-w-3xl p-8 text-center">
          <p className="text-neutral-600">
            Aún no tienes pedidos guardados en este navegador.
          </p>
          <Link href="/catalogo" className="btn btn-primary mt-6 inline-flex">
            Ir al catálogo
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid max-w-3xl gap-4">
          {orders.map((order) => {
            const whatsappHref = buildWhatsAppUrl(
              formatCheckoutOrderWhatsAppMessage({
                orderId: order.id,
                lines: order.lines,
                total: order.total,
                comments: order.comments,
                previewLinks: order.previewLinks,
                customerName: order.customerName,
                customerEmail: order.customerEmail,
                customerPhone: order.customerPhone,
                address: order.address,
              }),
            )

            return (
              <li key={order.id} className="card overflow-hidden p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-semibold text-violet-700">
                      {order.id}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {formatOrderDate(order.paidAt)}
                      {order.source ? ` · ${order.source}` : ''}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-neutral-950">
                    {formatPrice(order.total)}
                  </p>
                </div>

                <ul className="mt-4 space-y-2 border-t border-neutral-100 pt-4 text-sm text-neutral-700">
                  {order.lines.map((line, index) => (
                    <li key={`${line.designId ?? line.productName}-${index}`}>
                      {line.designId ? (
                        <span className="font-mono text-xs text-violet-700">
                          {line.designId}
                          {' · '}
                        </span>
                      ) : null}
                      {line.productName}
                      {line.color ? ` · ${line.color}` : ''}
                      {line.size ? ` · Talla ${line.size}` : ''}
                      {' · '}×{line.quantity}
                    </li>
                  ))}
                </ul>

                {order.previewLinks && order.previewLinks.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {order.previewLinks.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                ) : null}

                <div className="mt-5 flex flex-wrap gap-2">
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary inline-flex min-h-[40px] text-sm"
                  >
                    WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={() => handleRemove(order.id)}
                    className="btn btn-secondary inline-flex min-h-[40px] cursor-pointer text-sm"
                  >
                    Quitar de la galería
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
