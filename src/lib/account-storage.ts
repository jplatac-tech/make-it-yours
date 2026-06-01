const ACCOUNTS_KEY = 'makeityours-accounts'

export type AccountSession = {
  email: string
  name: string
  whatsapp?: string
}

type StoredAccount = {
  email: string
  passwordHash: string
  name: string
  whatsapp?: string
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export async function hashPassword(password: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    return `legacy:${password}`
  }
  const data = new TextEncoder().encode(password)
  const hash = await window.crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function loadAccounts(): StoredAccount[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY)
    return raw ? (JSON.parse(raw) as StoredAccount[]) : []
  } catch {
    return []
  }
}

function saveAccounts(accounts: StoredAccount[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

export type RegisterInput = {
  email: string
  password: string
  name: string
  whatsapp?: string
}

export type LoginInput = {
  email: string
  password: string
}

export async function registerAccount(
  input: RegisterInput,
): Promise<{ ok: true; profile: AccountSession } | { ok: false; message: string }> {
  const email = normalizeEmail(input.email)
  const password = input.password.trim()
  const name = input.name.trim()

  if (!email || !password || password.length < 6) {
    return {
      ok: false,
      message: 'Correo, nombre y contraseña (mín. 6 caracteres) son obligatorios.',
    }
  }

  const accounts = loadAccounts()
  if (accounts.some((a) => a.email === email)) {
    return { ok: false, message: 'Ya existe una cuenta con ese correo.' }
  }

  const passwordHash = await hashPassword(password)
  accounts.push({
    email,
    passwordHash,
    name,
    whatsapp: input.whatsapp?.trim() || undefined,
  })
  saveAccounts(accounts)

  return {
    ok: true,
    profile: { email, name, whatsapp: input.whatsapp?.trim() || undefined },
  }
}

export async function loginAccount(
  input: LoginInput,
): Promise<{ ok: true; profile: AccountSession } | { ok: false; message: string }> {
  const email = normalizeEmail(input.email)
  const password = input.password

  if (!email || !password) {
    return { ok: false, message: 'Ingresa correo y contraseña.' }
  }

  const accounts = loadAccounts()
  const account = accounts.find((a) => a.email === email)
  if (!account) {
    return { ok: false, message: 'Correo o contraseña incorrectos.' }
  }

  const passwordHash = await hashPassword(password)
  if (account.passwordHash !== passwordHash) {
    return { ok: false, message: 'Correo o contraseña incorrectos.' }
  }

  return {
    ok: true,
    profile: {
      email: account.email,
      name: account.name,
      whatsapp: account.whatsapp,
    },
  }
}
