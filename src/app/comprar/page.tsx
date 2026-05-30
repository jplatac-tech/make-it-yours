'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { PurchaseForm } from '../../components/forms/purchase-form'
import { DEFAULT_PRODUCT_SLUG, PRODUCTS } from '../../lib/products'
import { hasDesignElements, loadDesign } from '../../lib/design-storage'

export default function ComprarPage() {
  const product = PRODUCTS[DEFAULT_PRODUCT_SLUG]
  const [designJson, setDesignJson] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setDesignJson(loadDesign())
    setReady(true)
  }, [])

  if (!ready) {
    return (
      <main className="container py-16">
        <p className="text-neutral-600">Cargando tu diseño…</p>
      </main>
    )
  }

  if (!designJson || !hasDesignElements(designJson)) {
    return (
      <main className="container py-16">
        <div className="card mx-auto max-w-lg p-8 text-center">
          <h1 className="text-2xl font-semibold text-neutral-950">
            Aún no tienes un diseño
          </h1>
          <p className="mt-4 text-neutral-600">
            Crea tu diseño en el editor y luego vuelve aquí para confirmar tu
            pedido.
          </p>
          <Link href="/disenar/editor" className="btn btn-primary mt-8 inline-flex">
            Ir al editor
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="container py-12 lg:py-16">
      <div className="mx-auto max-w-xl">
        <p className="text-sm font-medium tracking-[0.2em] text-neutral-500 uppercase">
          Pedido
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-neutral-950">
          Enviar diseño para cotizar
        </h1>
        <p className="mt-3 text-neutral-600">
          Revisa talla, color y zona de tu {product.name.toLowerCase()}. Puedes{' '}
          <Link href="/disenar/editor" className="font-medium text-sky-700 underline">
            volver al editor
          </Link>{' '}
          si quieres cambiar el diseño.
        </p>

        <div className="card mt-8 p-6">
          <PurchaseForm
            productSlug={product.slug}
            productName={product.name}
            designJson={designJson}
          />
        </div>
      </div>
    </main>
  )
}
