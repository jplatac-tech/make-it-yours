'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { DesignOrderPreview } from '../../components/comprar/design-order-preview'
import { MultiDesignOrderPreview } from '../../components/comprar/multi-design-order-preview'
import { PurchaseForm } from '../../components/forms/purchase-form'
import {
  DEFAULT_PRODUCT_SLUG,
  PRODUCTS,
  type ProductSlug,
} from '../../lib/products'
import {
  getLineItemsWithDesign,
  hasDesignElements,
  loadDesign,
  parseEditorSession,
  parseStoredDesign,
} from '../../lib/design-storage'
import { buildEditorPath } from '../../lib/editor-url'

export default function ComprarPage() {
  const [designJson, setDesignJson] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setDesignJson(loadDesign())
    setReady(true)
  }, [])

  const session = useMemo(
    () => parseEditorSession(designJson),
    [designJson],
  )
  const lineItemsWithDesign = useMemo(
    () => getLineItemsWithDesign(session),
    [session],
  )
  const isMulti = lineItemsWithDesign.length > 1

  const product = useMemo(() => {
    const fromSession = lineItemsWithDesign[0]?.productSlug
    const parsed = parseStoredDesign(designJson)
    const slug =
      (fromSession as ProductSlug | undefined) ??
      (parsed?.productSlug as ProductSlug | undefined) ??
      DEFAULT_PRODUCT_SLUG
    return PRODUCTS[slug in PRODUCTS ? slug : DEFAULT_PRODUCT_SLUG]
  }, [designJson, lineItemsWithDesign])

  if (!ready) {
    return (
      <main className="container py-10 sm:py-16">
        <p className="text-neutral-600">Cargando tu diseño…</p>
      </main>
    )
  }

  if (!designJson || !hasDesignElements(designJson)) {
    return (
      <main className="container py-10 sm:py-16">
        <div className="card mx-auto max-w-lg p-8 text-center">
          <h1 className="text-2xl font-semibold text-neutral-950">
            Aún no tienes un diseño
          </h1>
          <p className="mt-4 text-neutral-600">
            Crea tu diseño en el editor y luego vuelve aquí para confirmar tu
            pedido.
          </p>
          <Link
            href={buildEditorPath()}
            className="btn btn-primary mt-8 inline-flex"
          >
            Ir al editor
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="container py-10 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm font-medium tracking-[0.2em] text-neutral-500 uppercase">
          Pedido con diseño
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-neutral-950 sm:text-3xl">
          Enviar diseño para cotizar
        </h1>

        <div className="mt-8 sm:mt-10">
          {isMulti ? (
            <MultiDesignOrderPreview designJson={designJson} />
          ) : (
            <DesignOrderPreview
              designJson={designJson}
              productName={product.name}
            />
          )}
        </div>

        <div className="card mt-8 p-6 sm:mt-10">
          <PurchaseForm designJson={designJson} />
        </div>
      </div>
    </main>
  )
}
