'use client'

import { useMemo, useState } from 'react'
import {
  CATALOG_FILTERS,
  filterCatalogProducts,
  type CatalogFilterId,
} from '../../lib/product-catalog'
import { getCatalogLooksAsProducts } from '../../lib/catalog-looks'
import { useInView } from '../../hooks/use-in-view'
import { MotionStaggerItem } from '../ui/motion-stagger-item'
import { CatalogLookCard } from './catalog-look-card'

export function ProductCatalogGrid() {
  const [filter, setFilter] = useState<CatalogFilterId>('all')
  const { ref, visible } = useInView<HTMLDivElement>(0.06)

  const allProducts = useMemo(() => getCatalogLooksAsProducts(), [])

  const filtered = useMemo(
    () => filterCatalogProducts(allProducts, filter),
    [allProducts, filter],
  )

  return (
    <div ref={ref} className={'bg-white motion-in-view ' + (visible ? 'is-visible' : '')}>
      <div className="container border-b border-neutral-200 py-8 text-center sm:py-10 md:py-14">
        <h2 className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl md:text-[28px]">
          Catálogo
        </h2>
        <p className="mx-auto mt-2 max-w-xl px-1 text-sm text-neutral-600 md:text-base">
          Elige tu prenda, personaliza al instante y cotiza cuando quieras.
        </p>
      </div>

      <div className="sticky top-[var(--header-height)] z-20 border-b border-neutral-100 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/90">
        <div className="container relative">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-5 bg-gradient-to-r from-white/95 to-transparent sm:hidden"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-white/95 to-transparent sm:hidden"
            aria-hidden
          />
          <div
            className="filter-scroll filter-scroll-bleed"
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
                    'filter-chip min-h-[36px] rounded-full px-3.5 py-1.5 text-xs font-semibold sm:min-h-[40px] sm:px-4 sm:py-2 sm:text-sm ' +
                    (active
                      ? 'bg-neutral-900 text-white shadow-sm'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200')
                  }
                >
                  {f.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="container py-6 sm:py-8 md:py-12">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-600 motion-catalog-enter">
            No hay productos en este filtro.
          </p>
        ) : (
          <div key={filter} className="catalog-product-grid motion-catalog-enter">
            {filtered.map((product) => (
              <MotionStaggerItem
                key={product.catalogId}
                threshold={0.1}
                className="flex min-h-0 min-w-0"
              >
                <CatalogLookCard product={product} detailLabel="Detalle" />
              </MotionStaggerItem>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
