'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAppState } from '../app-state/app-state-provider'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { loginAccount, registerAccount } from '../../lib/account-storage'

async function checkIsAdmin(email: string): Promise<boolean> {
  if (!email) return false
  try {
    const res = await fetch(
      `/api/admin/check?email=${encodeURIComponent(email)}`,
    )
    const data = (await res.json()) as { isAdmin?: boolean }
    return data.isAdmin === true
  } catch {
    return false
  }
}

type Props = {
  mode?: 'login' | 'register'
  onSuccess?: () => void
  compact?: boolean
}

export function AccountForm({
  mode = 'login',
  onSuccess,
  compact = false,
}: Props) {
  const { saveProfile } = useAppState()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)

    const result = await loginAccount({ email, password })
    if (!result.ok) {
      setError(result.message)
      setPending(false)
      return
    }

    const admin = await checkIsAdmin(result.profile!.email)
    saveProfile({ ...result.profile!, isAdmin: admin })
    setIsAdmin(admin)
    setPending(false)
    setSaved(true)
    window.setTimeout(() => onSuccess?.(), 0)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)

    const result = await registerAccount({
      email,
      password,
      name,
      whatsapp,
    })
    if (!result.ok) {
      setError(result.message)
      setPending(false)
      return
    }

    const admin = await checkIsAdmin(result.profile!.email)
    saveProfile({ ...result.profile!, isAdmin: admin })
    setIsAdmin(admin)
    setPending(false)
    setSaved(true)
    window.setTimeout(() => onSuccess?.(), 0)
  }

  const fieldGap = compact ? 'space-y-3' : 'space-y-4'
  const labelClass = 'block text-xs font-medium text-neutral-700'

  if (mode === 'login') {
    return (
      <form onSubmit={handleLogin} className={fieldGap}>
        <label className={labelClass}>
          Correo electrónico
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1.5"
          />
        </label>
        <label className={labelClass}>
          Contraseña
          <Input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="mt-1.5"
          />
        </label>
        {error ? (
          <p className="text-center text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Ingresando…' : 'Ingresar'}
        </Button>
        {saved ? (
          <p className="text-center text-sm text-sky-700">Sesión iniciada.</p>
        ) : null}
        {isAdmin ? (
          <p className="text-center text-xs text-neutral-600">
            Eres administrador.{' '}
            <Link
              href="/admin/login"
              className="font-semibold text-neutral-900 underline"
              onClick={onSuccess}
            >
              Panel admin
            </Link>
          </p>
        ) : null}
        <p className="text-center text-xs text-neutral-500">
          ¿No tienes cuenta?{' '}
          <Link
            href="/registrarse"
            className="font-semibold text-neutral-800 underline"
            onClick={onSuccess}
          >
            Registrarse
          </Link>
        </p>
      </form>
    )
  }

  return (
    <form onSubmit={handleRegister} className={fieldGap}>
      <label className={labelClass}>
        Nombre
        <Input
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1.5"
        />
      </label>
      <label className={labelClass}>
        Correo electrónico
        <Input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1.5"
        />
      </label>
      <label className={labelClass}>
        Contraseña
        <Input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          placeholder="Mínimo 6 caracteres"
          className="mt-1.5"
        />
      </label>
      <label className={labelClass}>
        WhatsApp <span className="font-normal text-neutral-400">(opcional)</span>
        <Input
          autoComplete="tel"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="+56 9 1234 5678"
          className="mt-1.5"
        />
      </label>
      {error ? (
        <p className="text-center text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Creando cuenta…' : 'Crear cuenta'}
      </Button>
      {saved ? (
        <p className="text-center text-sm text-sky-700">Cuenta creada. Bienvenido.</p>
      ) : null}
      {isAdmin ? (
        <p className="text-center text-xs text-neutral-600">
          Eres administrador.{' '}
          <Link
            href="/admin/login"
            className="font-semibold text-neutral-900 underline"
            onClick={onSuccess}
          >
            Panel admin
          </Link>
        </p>
      ) : null}
      <p className="text-center text-xs text-neutral-500">
        ¿Ya tienes cuenta?{' '}
        <Link
          href="/ingresar"
          className="font-semibold text-neutral-800 underline"
          onClick={onSuccess}
        >
          Ingresar
        </Link>
      </p>
    </form>
  )
}
