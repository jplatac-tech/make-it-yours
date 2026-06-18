'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { trackEvent } from '../../lib/analytics'
import {
  formatQuoteDeliveryWhatsAppMessage,
  openStoreWhatsApp,
} from '../../lib/whatsapp'

type Props = {
  quoteId?: string
}

export function QuoteDeliveryForm({ quoteId }: Props) {
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setMessage(null)

    const formData = new FormData(event.currentTarget)
    const customerName = String(formData.get('customerName') ?? '').trim()
    const customerWhatsapp = String(formData.get('customerWhatsapp') ?? '').trim()

    if (customerName.length < 2) {
      setMessage('Indica tu nombre')
      setPending(false)
      return
    }
    if (customerWhatsapp.length < 8) {
      setMessage('Indica un WhatsApp válido')
      setPending(false)
      return
    }

    trackEvent('quote_delivery_saved', { quoteId: quoteId ?? 'local' })

    openStoreWhatsApp(
      formatQuoteDeliveryWhatsAppMessage({
        quoteId: quoteId ?? 'pedido-local',
        customerName,
        customerWhatsapp,
        customerEmail: String(formData.get('customerEmail') ?? '') || undefined,
        neededBy: String(formData.get('neededBy') ?? '') || undefined,
        deliveryNotes: String(formData.get('deliveryNotes') ?? '') || undefined,
      }),
    )

    setPending(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        name="customerName"
        placeholder="Nombre completo"
        required
      />
      <Input
        name="customerEmail"
        type="email"
        placeholder="Correo electrónico (opcional)"
      />
      <Input
        name="customerWhatsapp"
        type="tel"
        placeholder="WhatsApp"
        required
      />
      <Input name="neededBy" type="date" placeholder="Fecha deseada de entrega" />
      <Textarea
        name="deliveryNotes"
        placeholder="Dirección y notas de entrega"
        rows={4}
      />

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Abriendo WhatsApp...' : 'Enviar datos por WhatsApp'}
      </Button>

      {message ? <p className="text-sm text-red-600">{message}</p> : null}
    </form>
  )
}
