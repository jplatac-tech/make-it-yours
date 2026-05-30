'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PRODUCTS, type ProductSlug } from '../../lib/products'
import { buildWhatsAppUrl, formatQuickQuoteMessage } from '../../lib/whatsapp'

type ProductRow = {
  slug: string
  name: string
  description: string
  price: number
  type?: string
}

const formatPrice = (value: number) => `$${value.toFixed(0)}`

export function ProductCatalogGrid({
  showQuoteLink = true,
}: {
  showQuoteLink?: boolean
}) {
  const [products, setProducts] = useState<ProductRow[]>(() =>
    Object.values(PRODUCTS),
  )

  useEffect(() => {
    fetch('/api/admin/products')
      .then((r) => r.json())
      .then((list: ProductRow[]) => {
        if (Array.isArray(list) && list.length > 0) setProducts(list)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <article
          key={product.slug}
          className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:border-violet-200 hover:shadow-md"
        >
          <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-violet-50 to-slate-50">
            <svg
              viewBox="0 0 120 140"
              className="h-32 w-auto text-violet-300/80 transition group-hover:scale-105"
              aria-hidden
            >
              <path
                fill="currentColor"
                d="M30 42 L12 48 L8 78 L14 98 L32 94 L36 62 Z M90 42 L108 48 L112 78 L106 98 L88 94 L84 62 Z M36 42 H84 L88 108 L86 124 H60 L34 124 L32 108 Z"
              />
            </svg>
            <span className="absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold tracking-wide text-violet-700 uppercase">
              {product.type ?? 'PRENDA'}
            </span>
          </div>
          <div className="flex flex-1 flex-col p-5">
            <h3 className="text-lg font-semibold text-neutral-900">
              {product.name}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-600">
              {product.description}
            </p>
            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="text-xl font-bold text-neutral-950">
                {formatPrice(product.price)}
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/productos/${product.slug}`}
                  className="rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800"
                >
                  Ver
                </Link>
                <Link
                  href="/disenar"
                  className="rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-semibold text-violet-800 transition hover:bg-violet-100"
                >
                  Diseñar
                </Link>
              </div>
            </div>
            {showQuoteLink ? (
              <a
                href={buildWhatsAppUrl(
                  formatQuickQuoteMessage(product.name),
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 text-center text-xs font-semibold text-emerald-700 hover:underline"
              >
                Cotizar por WhatsApp
              </a>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  )
}
