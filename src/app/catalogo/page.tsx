import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

const ProductCatalogGrid = dynamic(
  () =>
    import('../../components/catalog/product-catalog-grid').then(
      (m) => m.ProductCatalogGrid,
    ),
  {
    loading: () => (
      <div className="bg-white">
        <div className="container border-b border-neutral-200 py-10 text-center">
          <div className="mx-auto h-8 w-40 animate-pulse rounded-lg bg-neutral-200" />
        </div>
        <div className="container py-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse rounded-2xl bg-neutral-100"
                aria-hidden
              />
            ))}
          </div>
        </div>
      </div>
    ),
  },
)

export const metadata: Metadata = {
  title: 'Catálogo',
  description:
    'Todas las prendas personalizables: filtros por estilo, precios y enlace al editor.',
}

export default function CatalogoPage() {
  return <ProductCatalogGrid />
}
