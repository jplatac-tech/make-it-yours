'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { useAppState } from '../../components/app-state/app-state-provider'

export default function LoginPage() {
  const { saveProfile } = useAppState()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const isAdmin = email
      ? await fetch(`/api/admin/check?email=${encodeURIComponent(email)}`)
          .then((res) => res.json())
          .then((data) => data.isAdmin === true)
          .catch(() => false)
      : false
    saveProfile({ name, email, whatsapp, isAdmin })
    setSaved(true)
    setTimeout(() => router.push('/'), 700)
  }

  return (
    <main className="container py-16">
      <h1 className="mb-6 text-2xl font-semibold">Ingresar</h1>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <label className="block text-sm font-medium text-neutral-900">
          Nombre
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-2"
          />
        </label>
        <label className="block text-sm font-medium text-neutral-900">
          Correo electrónico
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-2"
          />
        </label>
        <label className="block text-sm font-medium text-neutral-900">
          WhatsApp
          <Input
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="+56 9 1234 5678"
            className="mt-2"
          />
        </label>
        <Button type="submit">Ingresar</Button>
        {saved ? (
          <p className="text-sm text-sky-700">
            Sesión iniciada. Redirigiendo...
          </p>
        ) : null}
      </form>
    </main>
  )
}
