'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import {
  checkoutDraftTotal,
  clearCheckoutDraft,
  formatCheckoutTotal,
  loadCheckoutDraft,
  type CheckoutDraft,
} from '../../lib/checkout-order'
import {
  LAST_ORDER_STORAGE_KEY,
  uploadDesignPreviewImages,
} from '../../lib/order-whatsapp-notify'
import { saveOrderToGallery } from '../../lib/order-gallery-storage'
import { formatPrice } from '../../lib/utils'
import {
  formatCardCvcInput,
  formatCardExpiryInput,
  formatCardNumberInput,
  hasPaymentErrors,
  validatePaymentFields,
  type PaymentFieldErrors,
} from '../../lib/payment-card'

type Step = 'invoice' | 'details' | 'payment' | 'processing'

function StepIndicator({ step }: { step: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: 'invoice', label: 'Resumen' },
    { id: 'details', label: 'Datos' },
    { id: 'payment', label: 'Pago' },
  ]
  const order: Step[] = ['invoice', 'details', 'payment', 'processing']
  const current = order.indexOf(step)

  return (
    <ol className="mb-8 flex items-center justify-between gap-2">
      {steps.map((item, index) => {
        const done = current > index
        const active = item.id === step || (step === 'processing' && index === 2)
        return (
          <li key={item.id} className="flex flex-1 flex-col items-center gap-2">
            <span
              className={
                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ' +
                (done
                  ? 'bg-emerald-600 text-white'
                  : active
                    ? 'bg-neutral-900 text-white ring-4 ring-neutral-200'
                    : 'bg-neutral-200 text-neutral-500')
              }
            >
              {done ? '✓' : index + 1}
            </span>
            <span
              className={
                'text-[10px] font-semibold tracking-wide uppercase ' +
                (active || done ? 'text-neutral-900' : 'text-neutral-400')
              }
            >
              {item.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export function CheckoutPaymentFlow() {
  const router = useRouter()
  const [draft, setDraft] = useState<CheckoutDraft | null>(null)
  const [step, setStep] = useState<Step>('invoice')
  const [error, setError] = useState<string | null>(null)
  const [animateKey, setAnimateKey] = useState(0)

  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [address, setAddress] = useState('')

  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [cardName, setCardName] = useState('')
  const [fieldErrors, setFieldErrors] = useState<PaymentFieldErrors>({})

  useEffect(() => {
    const loaded = loadCheckoutDraft()
    if (!loaded || loaded.lines.length === 0) {
      router.replace('/catalogo')
      return
    }
    setDraft(loaded)
  }, [router])

  function goTo(next: Step) {
    setAnimateKey((k) => k + 1)
    setStep(next)
    setError(null)
    setFieldErrors({})
  }

  async function handlePay(event: React.FormEvent) {
    event.preventDefault()
    if (!draft) return

    const errors = validatePaymentFields({
      cardName,
      cardNumber,
      cardExpiry,
      cardCvc,
    })
    setFieldErrors(errors)

    if (hasPaymentErrors(errors)) {
      setError('Revisa los datos de la tarjeta')
      return
    }

    setError(null)
    setFieldErrors({})
    setAnimateKey((k) => k + 1)
    setStep('processing')
    await new Promise((r) => setTimeout(r, 1200))

    const previewLinks = draft.designJson
      ? await uploadDesignPreviewImages(draft.id, draft.designJson)
      : []

    if (typeof window !== 'undefined') {
      const orderRecord = {
        orderId: draft.id,
        lines: draft.lines,
        total: checkoutDraftTotal(draft),
        comments: draft.comments,
        designJson: draft.designJson,
        previewLinks,
        paidAt: new Date().toISOString(),
        customerName,
        customerEmail,
        customerPhone,
        address,
      }
      sessionStorage.setItem(
        LAST_ORDER_STORAGE_KEY,
        JSON.stringify(orderRecord),
      )
      saveOrderToGallery({
        id: draft.id,
        paidAt: orderRecord.paidAt,
        total: orderRecord.total,
        lines: draft.lines,
        previewLinks,
        designJson: draft.designJson,
        comments: draft.comments,
        customerName,
        customerEmail,
        customerPhone,
        address,
        source: draft.source ?? 'carrito',
      })
    }

    clearCheckoutDraft()

    router.push(`/pedido/exito?order=${encodeURIComponent(draft.id)}&paid=1`)
  }

  if (!draft) {
    return (
      <div className="py-16 text-center text-neutral-600">
        Cargando tu pedido…
      </div>
    )
  }

  const total = checkoutDraftTotal(draft)

  return (
    <div className="mx-auto max-w-lg">
      <StepIndicator step={step} />

      <div
        key={animateKey}
        className="motion-fade-in-up card overflow-hidden p-6 sm:p-8"
      >
        {step === 'invoice' ? (
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-neutral-500 uppercase">
              Factura
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-neutral-950">
              Resumen del pedido
            </h1>
            <p className="mt-1 font-mono text-sm text-violet-700">{draft.id}</p>

            <ul className="mt-6 space-y-4 border-t border-neutral-200 pt-6">
              {draft.lines.map((line, index) => (
                <li
                  key={`${line.designId ?? line.productName}-${index}`}
                  className="motion-fade-in-up flex justify-between gap-4 text-sm"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="min-w-0">
                    {line.designId ? (
                      <p className="font-mono text-xs font-semibold text-violet-700">
                        {line.designId}
                      </p>
                    ) : null}
                    <p className="font-medium text-neutral-900">
                      {line.productName}
                    </p>
                    <p className="text-neutral-500">
                      {[line.color, line.size ? `Talla ${line.size}` : null]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                    <p className="text-neutral-500">Cant. {line.quantity}</p>
                  </div>
                  <p className="shrink-0 font-medium text-neutral-900">
                    {formatPrice(line.unitPrice * line.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center justify-between border-t border-neutral-200 pt-4 text-base font-semibold">
              <span>Total</span>
              <span>{formatCheckoutTotal(draft)}</span>
            </div>

            <Button
              type="button"
              className="mt-6 w-full"
              onClick={() => goTo('details')}
            >
              Continuar
            </Button>
          </div>
        ) : null}

        {step === 'details' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (customerName.trim().length < 2) {
                setError('Indica tu nombre')
                return
              }
              if (customerPhone.trim().length < 8) {
                setError('Indica un teléfono válido')
                return
              }
              goTo('payment')
            }}
            className="space-y-4"
          >
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-neutral-500 uppercase">
                Paso 2
              </p>
              <h2 className="mt-2 text-xl font-semibold text-neutral-950">
                Datos de entrega
              </h2>
            </div>

            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nombre completo"
              required
            />
            <Input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="Correo electrónico"
            />
            <Input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Teléfono / WhatsApp"
              required
            />
            <Textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Dirección de entrega"
              rows={3}
            />

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => goTo('invoice')}
              >
                Atrás
              </Button>
              <Button type="submit" className="flex-1">
                Ir al pago
              </Button>
            </div>
          </form>
        ) : null}

        {step === 'payment' ? (
          <form onSubmit={handlePay} className="space-y-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-neutral-500 uppercase">
                Paso 3
              </p>
              <h2 className="mt-2 text-xl font-semibold text-neutral-950">
                Método de pago
              </h2>
              <p className="mt-1 text-sm text-neutral-600">
                Total a pagar:{' '}
                <span className="font-semibold text-neutral-900">
                  {formatPrice(total)}
                </span>
              </p>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-950 p-5 text-white shadow-lg">
              <p className="text-[10px] font-semibold tracking-widest text-white/60 uppercase">
                Tarjeta de crédito o débito
              </p>
              <p className="mt-4 font-mono text-lg tracking-widest">
                {cardNumber || '•••• •••• •••• ••••'}
              </p>
              <div className="mt-4 flex justify-between text-sm">
                <span>{cardName || 'NOMBRE'}</span>
                <span>{cardExpiry || 'MM/AA'}</span>
              </div>
            </div>

            <div>
              <Input
                value={cardName}
                onChange={(e) => {
                  setCardName(e.target.value)
                  if (fieldErrors.cardName) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      cardName: validatePaymentFields({
                        cardName: e.target.value,
                        cardNumber,
                        cardExpiry,
                        cardCvc,
                      }).cardName,
                    }))
                  }
                }}
                placeholder="Nombre en la tarjeta"
                autoComplete="cc-name"
                aria-invalid={Boolean(fieldErrors.cardName)}
                required
              />
              {fieldErrors.cardName ? (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.cardName}</p>
              ) : null}
            </div>

            <div>
              <Input
                value={cardNumber}
                onChange={(e) => {
                  const formatted = formatCardNumberInput(e.target.value)
                  setCardNumber(formatted)
                  if (fieldErrors.cardNumber) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      cardNumber: validatePaymentFields({
                        cardName,
                        cardNumber: formatted,
                        cardExpiry,
                        cardCvc,
                      }).cardNumber,
                    }))
                  }
                }}
                placeholder="Número de tarjeta (16 dígitos)"
                inputMode="numeric"
                autoComplete="cc-number"
                maxLength={19}
                aria-invalid={Boolean(fieldErrors.cardNumber)}
                required
              />
              {fieldErrors.cardNumber ? (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.cardNumber}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  value={cardExpiry}
                  onChange={(e) => {
                    const formatted = formatCardExpiryInput(e.target.value)
                    setCardExpiry(formatted)
                    if (fieldErrors.cardExpiry) {
                      setFieldErrors((prev) => ({
                        ...prev,
                        cardExpiry: validatePaymentFields({
                          cardName,
                          cardNumber,
                          cardExpiry: formatted,
                          cardCvc,
                        }).cardExpiry,
                      }))
                    }
                  }}
                  placeholder="MM/AA"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  maxLength={5}
                  aria-invalid={Boolean(fieldErrors.cardExpiry)}
                  required
                />
                {fieldErrors.cardExpiry ? (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.cardExpiry}</p>
                ) : null}
              </div>
              <div>
                <Input
                  value={cardCvc}
                  onChange={(e) => {
                    const formatted = formatCardCvcInput(e.target.value)
                    setCardCvc(formatted)
                    if (fieldErrors.cardCvc) {
                      setFieldErrors((prev) => ({
                        ...prev,
                        cardCvc: validatePaymentFields({
                          cardName,
                          cardNumber,
                          cardExpiry,
                          cardCvc: formatted,
                        }).cardCvc,
                      }))
                    }
                  }}
                  placeholder="CVC"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  maxLength={4}
                  aria-invalid={Boolean(fieldErrors.cardCvc)}
                  required
                />
                {fieldErrors.cardCvc ? (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.cardCvc}</p>
                ) : null}
              </div>
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => goTo('details')}
              >
                Atrás
              </Button>
              <Button type="submit" className="flex-1">
                Pagar {formatPrice(total)}
              </Button>
            </div>
          </form>
        ) : null}

        {step === 'processing' ? (
          <div className="py-10 text-center">
            <div
              className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-900"
              aria-hidden
            />
            <p className="mt-6 text-lg font-semibold text-neutral-950">
              Procesando pago…
            </p>
            <p className="mt-2 text-sm text-neutral-600">
              Guardando tu pedido y generando vista previa del diseño…
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
