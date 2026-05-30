'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="container flex min-h-screen items-center justify-center py-16">
      <div className="card w-full max-w-xl p-8 text-center">
        <p className="text-sm font-medium tracking-[0.2em] text-neutral-500 uppercase">
          Error inesperado
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-neutral-900">
          Algo salió mal
        </h1>
        <p className="mt-3 text-neutral-600">
          Ocurrió un error al cargar esta sección. Intenta nuevamente.
        </p>

        {error.digest ? (
          <p className="mt-2 text-sm text-neutral-400">ID: {error.digest}</p>
        ) : null}

        <div className="mt-6 flex justify-center">
          <button onClick={() => reset()} className="btn btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    </main>
  )
}
