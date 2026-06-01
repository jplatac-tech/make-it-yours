'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function EditorError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[editor]', error)
  }, [error])

  return (
    <div className="editor-shell-height flex flex-col items-center justify-center gap-4 bg-[#eef0f4] px-6 text-center">
      <h1 className="text-lg font-bold text-neutral-900">
        No se pudo cargar el editor
      </h1>
      <p className="max-w-sm text-sm text-neutral-600">
        Puede ser un problema temporal del navegador. Intenta de nuevo o vuelve al
        inicio.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  )
}
