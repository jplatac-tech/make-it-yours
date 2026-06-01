'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  CATALOG_SECTIONS,
  formatCatalogPrice,
  toCatalogProduct,
  type CatalogProduct,
} from '../../lib/product-catalog'
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

const MAX_PRODUCTS_PER_ROW = 4

function catalogGridClass(count: number) {
  if (count <= 1) {
    return 'mx-auto grid w-full max-w-[320px] grid-cols-1 justify-items-center gap-6'
  }
  if (count === 2) {
    return 'mx-auto grid w-full max-w-[720px] grid-cols-2 justify-items-center gap-5 sm:gap-6'
  }
  if (count === 3) {
    return 'mx-auto grid w-full max-w-[1020px] grid-cols-1 justify-items-center gap-6 min-[520px]:grid-cols-3'
  }
  return 'mx-auto grid w-full max-w-[1320px] grid-cols-2 justify-items-center gap-5 min-[720px]:grid-cols-4 sm:gap-6'
}

function ProductCard({
  product,
  index,
}: {
  product: CatalogProduct
  index: number
}) {
  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group flex w-full max-w-[300px] flex-col transition duration-300 hover:-translate-y-1"
      style={{ transitionDelay: `${Math.min(index, 4) * 40}ms` }}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-[#f5f5f5]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 260px, 320px"
          className="object-cover object-center transition duration-500 ease-out group-hover:scale-[1.03]"
        />
      </div>
      <div className="mt-3 pr-4">
        {product.badge ? (
          <p className="text-sm font-semibold text-[#ce4800]">{product.badge}</p>
        ) : null}
        <h3 className="mt-1 text-base font-semibold leading-snug text-neutral-900">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-snug text-neutral-600">
          {product.description}
        </p>
        <p className="mt-1 text-sm font-medium text-neutral-700">
          {product.colorCount}{' '}
          {product.colorCount === 1 ? 'color' : 'colores'}
        </p>
        <p className="mt-2 text-base font-medium text-neutral-900">
          {formatCatalogPrice(product.price)}
        </p>
      </div>
    </Link>
  )
}

function CatalogRow({
  title,
  situation,
  products,
  sectionIndex,
}: {
  title: string
  situation: string
  products: CatalogProduct[]
  sectionIndex: number
}) {
  const { ref, visible } = useInView<HTMLElement>(0.08)

  if (products.length === 0) return null

  const rowProducts = products.slice(0, MAX_PRODUCTS_PER_ROW)

  return (
    <section
      ref={ref}
      className={
        'motion-in-view border-b border-neutral-200 py-10 last:border-b-0 md:py-14 ' +
        (visible ? 'is-visible' : '')
      }
      style={{ transitionDelay: `${sectionIndex * 90}ms` }}
    >
      <div className="container mb-8 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 md:text-[28px]">
          {title}
        </h2>
        <p className="mt-1 text-sm text-neutral-600 md:text-base">{situation}</p>
      </div>
      <div className={`container px-4 sm:px-6 ${catalogGridClass(rowProducts.length)}`}>
        {rowProducts.map((product, index) => (
          <ProductCard
            key={`${title}-${product.slug}`}
            product={product}
            index={index}
          />
        ))}
      </div>
    </section>
  )
}

export function ProductCatalogGrid() {
  const [rows, setRows] = useState<ProductRow[]>(() => Object.values(PRODUCTS))

  useEffect(() => {
    fetch('/api/admin/products')
      .then((r) => r.json())
      .then((list: ProductRow[]) => {
        if (Array.isArray(list) && list.length > 0) setRows(list)
      })
      .catch(() => {})
  }, [])

  const bySlug = useMemo(() => {
    const map = new Map<ProductSlug, CatalogProduct>()
    for (const row of rows) {
      const p = toCatalogProduct({
        ...row,
        badge:
          row.badge ??
          (row.slug === 'crewneck-unisex' ? 'Lo más nuevo' : undefined),
      })
      if (p) map.set(p.slug, p)
    }
    return map
  }, [rows])

  const sections = useMemo(
    () =>
      CATALOG_SECTIONS.map((section) => ({
        ...section,
        products: section.productSlugs
          .map((slug) => bySlug.get(slug))
          .filter((p): p is CatalogProduct => Boolean(p)),
      })).filter((s) => s.products.length > 0),
    [bySlug],
  )

  return (
    <div className="bg-white">
      {sections.map((section, sectionIndex) => (
        <CatalogRow
          key={section.id}
          title={section.title}
          situation={section.situation}
          products={section.products}
          sectionIndex={sectionIndex}
        />
      ))}
    </div>
  )
}
