'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import {
  buildWhatsAppUrl,
  formatOrderSentWhatsAppMessage,
} from '../../../lib/whatsapp'
import { STORE_WHATSAPP_DISPLAY } from '../../../lib/constants'
import { formatPrice } from '../../../lib/utils'

function PedidoExitoContent() {
  const searchParams = useSearchParams()
  const paid = searchParams.get('paid') === '1'
  const orderId = searchParams.get('order')
  const whatsappHref = buildWhatsAppUrl(formatOrderSentWhatsAppMessage())
  const [paidTotal, setPaidTotal] = useState<number | null>(null)

  useEffect(() => {
    if (!paid) return
    try {
      const raw = sessionStorage.getItem('makeityours-last-order')
      if (!raw) return
      const parsed = JSON.parse(raw) as { total?: number }
      if (typeof parsed.total === 'number') setPaidTotal(parsed.total)
    } catch {
      /* ignore */
    }
  }, [paid])

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
            ? `Pago de demostración registrado${paidTotal != null ? ` por ${formatPrice(paidTotal)}` : ''}. Te contactaremos para coordinar la producción.`
            : `Revisaremos tu prenda y te contactaremos con los siguientes pasos. Si WhatsApp no se abrió solo, usa el botón de abajo (${STORE_WHATSAPP_DISPLAY}).`}
        </p>

        {!paid ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary mt-8 inline-flex"
          >
            Continuar por WhatsApp
          </a>
        ) : null}

        <Link href="/" className="btn btn-secondary mt-4 inline-flex">
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
