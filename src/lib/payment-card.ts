export type PaymentFieldErrors = {
  cardName?: string
  cardNumber?: string
  cardExpiry?: string
  cardCvc?: string
}

export function digitsOnly(value: string) {
  return value.replace(/\D/g, '')
}

/** Formato visual: grupos de 4 dígitos (máx. 16) */
export function formatCardNumberInput(value: string) {
  const digits = digitsOnly(value).slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

/** Formato MM/AA mientras escribe */
export function formatCardExpiryInput(value: string) {
  const digits = digitsOnly(value).slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

export function formatCardCvcInput(value: string) {
  return digitsOnly(value).slice(0, 4)
}

export function validateCardName(name: string): string | undefined {
  if (name.trim().length < 2) return 'Indica el nombre en la tarjeta'
  return undefined
}

/** Solo formato: 16 dígitos (válido para pruebas con números ficticios) */
export function validateCardNumber(number: string): string | undefined {
  const digits = digitsOnly(number)
  if (digits.length !== 16) return 'Ingresa 16 dígitos'
  return undefined
}

export function validateCardExpiry(expiry: string): string | undefined {
  if (!/^\d{2}\/\d{2}$/.test(expiry.trim())) {
    return 'Usa el formato MM/AA'
  }
  const month = Number.parseInt(expiry.slice(0, 2), 10)
  if (month < 1 || month > 12) return 'Mes inválido (01–12)'
  return undefined
}

export function validateCardCvc(cvc: string): string | undefined {
  const digits = digitsOnly(cvc)
  if (digits.length < 3 || digits.length > 4) {
    return 'El CVC debe tener 3 o 4 dígitos'
  }
  return undefined
}

export function validatePaymentFields(fields: {
  cardName: string
  cardNumber: string
  cardExpiry: string
  cardCvc: string
}): PaymentFieldErrors {
  return {
    cardName: validateCardName(fields.cardName),
    cardNumber: validateCardNumber(fields.cardNumber),
    cardExpiry: validateCardExpiry(fields.cardExpiry),
    cardCvc: validateCardCvc(fields.cardCvc),
  }
}

export function hasPaymentErrors(errors: PaymentFieldErrors) {
  return Object.values(errors).some(Boolean)
}
