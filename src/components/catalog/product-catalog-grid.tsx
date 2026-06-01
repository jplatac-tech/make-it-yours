'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  CATALOG_FILTERS,
  CATALOG_ORDER,
  filterCatalogProducts,
  formatCatalogPrice,
  toCatalogProduct,
  type CatalogFilterId,
  type CatalogProduct,
} from '../../lib/product-catalog'
import { buildEditorPath } from '../../lib/editor-url'
import { useInView } from '../../hooks/use-in-view'
import { PRODUCTS, type ProductSlug } from '../../lib/products'

type ProductRow = {
  slug: string
  name: string
  description: string
  price: number
  type?: string
  badge?: string
}

function catalogGridClass(count: number) {
  if (count <= 1) {
    return 'mx-auto grid w-full max-w-[320px] grid-cols-1 justify-items-stretch gap-8'
  }
  if (count === 2) {
    return 'mx-auto grid w-full max-w-[720px] grid-cols-1 justify-items-stretch gap-8 sm:grid-cols-2'
  }
  return 'mx-auto grid w-full max-w-[1320px] grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'
}

function ProductCard({
  product,
  index,
}: {
  product: CatalogProduct
  index: number
}) {
  const editorHref = buildEditorPath({ product: product.slug })

  return (
    <article
      className="group flex w-full max-w-[360px] flex-col justify-self-center sm:max-w-none"
      style={{ transitionDelay: `${Math.min(index, 4) * 40}ms` }}
    >
      <Link
        href={`/productos/${product.slug}`}
        className="block overflow-hidden rounded-sm bg-[#f5f5f5]"
      >
        <div className="relative aspect-[4/5]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 260px, 320px"
            className="object-cover object-center transition duration-500 ease-out group-hover:scale-[1.03]"
          />
        </div>
      </Link>

      <div className="mt-3 flex flex-1 flex-col pr-1">
        {product.badge ? (
          <p className="text-xs font-bold tracking-wide text-[#ce4800] uppercase">
            {product.badge}
          </p>
        ) : null}
        <Link href={`/productos/${product.slug}`}>
          <h3 className="mt-1 text-base font-semibold leading-snug text-neutral-900 hover:underline">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-sm leading-snug text-neutral-600">
          {product.description}
        </p>
        {product.highlight ? (
          <p className="mt-2 text-xs font-medium leading-snug text-neutral-500">
            {product.highlight}
          </p>
        ) : null}
        <p className="mt-2 text-sm font-medium text-neutral-700">
          {product.colorCount}{' '}
          {product.colorCount === 1 ? 'color' : 'colores'}
        </p>
        <p className="mt-2 text-lg font-semibold text-neutral-900">
          {formatCatalogPrice(product.price)}
        </p>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Link
            href={editorHref}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-neutral-900 px-5 text-sm font-bold text-white transition hover:bg-neutral-800"
          >
            Personalizar ahora
          </Link>
          <Link
            href={`/productos/${product.slug}`}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-neutral-300 px-5 text-sm font-semibold text-neutral-800 transition hover:border-neutral-900"
          >
            Ver detalle
          </Link>
        </div>
      </div>
    </article>
  )
}

export function ProductCatalogGrid() {
  const [rows, setRows] = useState<ProductRow[]>(() => Object.values(PRODUCTS))
  const [filter, setFilter] = useState<CatalogFilterId>('all')
  const { ref, visible } = useInView<HTMLDivElement>(0.06)

  useEffect(() => {
    fetch('/api/admin/products')
      .then((r) => r.json())
      .then((list: ProductRow[]) => {
        if (Array.isArray(list) && list.length > 0) setRows(list)
      })
      .catch(() => {})
  }, [])

  const allProducts = useMemo(() => {
    const map = new Map<ProductSlug, CatalogProduct>()
    for (const row of rows) {
      const p = toCatalogProduct(row)
      if (p) map.set(p.slug, p)
    }
    return CATALOG_ORDER.map((slug) => map.get(slug)).filter(
      (p): p is CatalogProduct => Boolean(p),
    )
  }, [rows])

  const filtered = useMemo(
    () => filterCatalogProducts(allProducts, filter),
    [allProducts, filter],
  )

  return (
    <div ref={ref} className={'bg-white motion-in-view ' + (visible ? 'is-visible' : '')}>
      <div className="container border-b border-neutral-200 py-10 text-center md:py-14">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 md:text-[28px]">
          Catálogo
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-neutral-600 md:text-base">
          Elige tu prenda, personaliza al instante y cotiza cuando quieras.
        </p>
      </div>

      <div className="container sticky top-[52px] z-20 border-b border-neutral-100 bg-white/95 py-3 backdrop-blur-sm sm:top-[60px]">
        <div
          className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Filtrar catálogo"
        >
          {CATALOG_FILTERS.map((f) => {
            const active = filter === f.id
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f.id)}
                className={
                  'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ' +
                  (active
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200')
                }
              >
                {f.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="container py-8 md:py-12">
        {filtered.length === 0 ? (
          <p className="text-center text-neutral-600">
            No hay productos en este filtro.
          </p>
        ) : (
          <div className={`px-2 sm:px-4 ${catalogGridClass(filtered.length)}`}>
            {filtered.map((product, index) => (
              <ProductCard
                key={product.slug}
                product={product}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
