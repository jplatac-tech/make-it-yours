'use client'

import Link from 'next/link'
import {
  getCatalogProductCount,
  getTrendingProducts,
} from '../../lib/home-catalog'
import { MotionSection } from '../ui/motion-section'
import { MotionStaggerItem } from '../ui/motion-stagger-item'
import { CatalogLookCard } from '../catalog/catalog-look-card'

export function HomeTrendsSection() {
  const trending = getTrendingProducts()
  const total = getCatalogProductCount()

  return (
    <MotionSection className="border-b border-neutral-200 bg-[#fafafa]">
      <div className="container py-10 sm:py-14 md:py-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center sm:gap-5">
          <h2 className="text-xl font-semibold tracking-tight text-neutral-950 sm:text-2xl md:text-3xl">
            Tendencias
          </h2>
          <p className="px-1 text-sm leading-relaxed text-neutral-600 md:text-base">
            Novedades y esenciales. El catálogo completo con filtros está en su
            propia sección.
          </p>
          <Link
            href="/catalogo"
            className="btn-interactive inline-flex min-h-[40px] items-center justify-center rounded-full border border-neutral-900 bg-neutral-900 px-5 text-xs font-bold text-white hover:bg-neutral-800 sm:min-h-[44px] sm:px-6 sm:text-sm"
          >
            Ver catálogo ({total})
          </Link>
        </div>

        <ul className="trends-product-grid mx-auto mt-8 w-full max-w-6xl list-none p-0 sm:mt-10">
          {trending.map((product) => (
            <MotionStaggerItem
              key={product.catalogId}
              as="li"
              delay={80}
              threshold={0.08}
              className="flex min-h-0 min-w-0"
            >
              <CatalogLookCard product={product} />
            </MotionStaggerItem>
          ))}
        </ul>
      </div>
    </MotionSection>
  )
}
