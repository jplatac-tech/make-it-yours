'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AccountForm } from '../../components/account/account-form'

export default function LoginPage() {
  const router = useRouter()

  return (
    <main className="container py-10 sm:py-16">
      <h1 className="mb-2 text-2xl font-semibold">Ingresar</h1>
      <p className="mb-6 text-sm text-neutral-600">
        También puedes usar el icono de cuenta en la barra superior, junto al
        carrito.
      </p>
      <div className="max-w-md">
        <AccountForm mode="login" onSuccess={() => router.push('/')} />
      </div>
      <p className="mt-6 text-sm text-neutral-500">
        ¿No tienes cuenta?{' '}
        <Link href="/registrarse" className="font-medium underline">
          Registrarse
        </Link>
      </p>
    </main>
  )
}
