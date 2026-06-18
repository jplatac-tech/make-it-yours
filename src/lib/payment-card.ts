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

function luhnCheck(digits: string) {
  if (digits.length < 13) return false
  let sum = 0
  let alt = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number.parseInt(digits[i]!, 10)
    if (alt) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    alt = !alt
  }
  return sum % 10 === 0
}

export function validateCardName(name: string): string | undefined {
  const trimmed = name.trim()
  if (trimmed.length < 2) return 'Indica el nombre como aparece en la tarjeta'
  if (!/^[\p{L}\s'.-]+$/u.test(trimmed)) {
    return 'El nombre solo puede contener letras'
  }
  return undefined
}

export function validateCardNumber(number: string): string | undefined {
  const digits = digitsOnly(number)
  if (digits.length < 15 || digits.length > 16) {
    return 'La tarjeta debe tener 15 o 16 dígitos'
  }
  if (!luhnCheck(digits)) return 'Número de tarjeta inválido'
  return undefined
}

export function validateCardExpiry(expiry: string): string | undefined {
  if (!/^\d{2}\/\d{2}$/.test(expiry.trim())) {
    return 'Usa el formato MM/AA'
  }
  const [mmRaw, yyRaw] = expiry.split('/')
  const month = Number.parseInt(mmRaw!, 10)
  const year = Number.parseInt(yyRaw!, 10)
  if (month < 1 || month > 12) return 'Mes inválido (01–12)'

  const now = new Date()
  const currentYear = now.getFullYear() % 100
  const currentMonth = now.getMonth() + 1

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return 'La tarjeta está vencida'
  }
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
