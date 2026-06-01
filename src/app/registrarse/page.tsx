'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AccountForm } from '../../components/account/account-form'

export default function RegisterPage() {
  const router = useRouter()

  return (
    <main className="container py-10 sm:py-16">
      <h1 className="mb-2 text-2xl font-semibold">Registrarse</h1>
      <p className="mb-6 text-sm text-neutral-600">
        También puedes usar el icono de cuenta en la barra superior, junto al
        carrito.
      </p>
      <div className="max-w-md">
        <AccountForm mode="register" onSuccess={() => router.push('/')} />
      </div>
      <p className="mt-6 text-sm text-neutral-500">
        ¿Ya tienes cuenta?{' '}
        <Link href="/ingresar" className="font-medium underline">
          Ingresar
        </Link>
      </p>
    </main>
  )
}
