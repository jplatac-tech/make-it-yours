'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { submitQuoteDelivery } from '../../server/actions/quote-actions'

type Props = {
  quoteId: string
}

export function QuoteDeliveryForm({ quoteId }: Props) {
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setMessage(null)
    formData.set('quoteId', quoteId)

    const result = await submitQuoteDelivery(formData)

    if (result.success) {
      router.push('/pedido/exito')
    } else {
      setMessage(result.message)
    }

    setPending(false)
  }

  return (
    <form action={handleSubmit} className="space-y-5">
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
        {pending ? 'Guardando...' : 'Guardar datos de entrega'}
      </Button>

      {message ? <p className="text-sm text-red-600">{message}</p> : null}
    </form>
  )
}
