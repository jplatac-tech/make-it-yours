'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { buildWhatsAppUrl } from '../../../lib/whatsapp'
import { STORE_WHATSAPP_DISPLAY } from '../../../lib/constants'
import {
  formatCheckoutOrderWhatsAppMessage,
  loadLastOrderFromSession,
} from '../../../lib/order-whatsapp-notify'
import { formatPrice } from '../../../lib/utils'

function PedidoExitoContent() {
  const searchParams = useSearchParams()
  const paid = searchParams.get('paid') === '1'
  const orderId = searchParams.get('order')
  const [whatsappHref, setWhatsappHref] = useState<string | null>(null)
  const [paidTotal, setPaidTotal] = useState<number | null>(null)
  const [previewCount, setPreviewCount] = useState(0)

  useEffect(() => {
    try {
      const order = loadLastOrderFromSession()
      if (!order) return
      setWhatsappHref(
        buildWhatsAppUrl(formatCheckoutOrderWhatsAppMessage(order)),
      )
      if (typeof order.total === 'number') setPaidTotal(order.total)
      setPreviewCount(order.previewLinks?.length ?? 0)
    } catch {
      /* ignore */
    }
  }, [])

  return (
    <main className="container flex min-h-0 flex-1 items-center justify-center py-12 sm:py-16">
      <div className="card motion-fade-in-up w-full max-w-2xl p-8 text-center">
        {paid ? (
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700"
            aria-hidden
          >
            ✓
          </div>
        ) : null}

        <p className="text-sm font-medium tracking-[0.2em] text-neutral-500 uppercase">
          {paid ? 'Pago recibido' : 'Pedido enviado'}
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-neutral-950">
          {paid
            ? '¡Tu pedido fue confirmado!'
            : 'Tu diseño fue enviado correctamente'}
        </h1>

        {paid && orderId ? (
          <p className="mt-3 font-mono text-sm text-violet-700">{orderId}</p>
        ) : null}

        <p className="mt-4 text-neutral-600">
          {paid
            ? `Tu pago fue registrado${paidTotal != null ? ` por ${formatPrice(paidTotal)}` : ''}. El pedido quedó guardado en tu galería. Si quieres avisarnos por WhatsApp (${STORE_WHATSAPP_DISPLAY}), usa el botón de abajo — no es obligatorio.`
            : `Revisaremos tu prenda y te contactaremos con los siguientes pasos. Si quieres escribirnos por WhatsApp (${STORE_WHATSAPP_DISPLAY}), usa el botón de abajo.`}
        </p>

        {previewCount > 0 ? (
          <p className="mt-2 text-sm text-neutral-500">
            Incluye {previewCount} vista{previewCount === 1 ? '' : 's'} previa
            {previewCount === 1 ? '' : 's'} de tu diseño en el mensaje de WhatsApp.
          </p>
        ) : null}

        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary mt-8 inline-flex"
          >
            {paid ? 'Enviar confirmación por WhatsApp' : 'Continuar por WhatsApp'}
          </a>
        ) : null}

        <Link href="/mis-pedidos" className="btn btn-secondary mt-4 inline-flex">
          Ver mis pedidos guardados
        </Link>

        <Link href="/" className="mt-4 inline-block text-sm font-medium text-neutral-600 underline hover:text-neutral-900">
          Volver al inicio
        </Link>
        <p className="mt-4 text-sm text-neutral-600">
          ¿Otro diseño? Usa <strong>Crear</strong> en el menú.
        </p>
      </div>
    </main>
  )
}

export default function PedidoExitoPage() {
  return (
    <Suspense
      fallback={
        <main className="container py-16 text-center text-neutral-600">
          Cargando…
        </main>
      }
    >
      <PedidoExitoContent />
    </Suspense>
  )
}
