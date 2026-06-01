import Image from 'next/image'
import Link from 'next/link'
import { formatCatalogPrice } from '../../lib/product-catalog'
import {
  getCatalogProductCount,
  getTrendingProducts,
} from '../../lib/home-catalog'
import { buildEditorPath } from '../../lib/editor-url'

export function HomeTrendsSection() {
  const trending = getTrendingProducts()
  const total = getCatalogProductCount()

  return (
    <section className="border-b border-neutral-200 bg-[#fafafa]">
      <div className="container py-12 sm:py-14 md:py-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 md:text-3xl">
            Tendencias
          </h2>
          <p className="text-sm leading-relaxed text-neutral-600 md:text-base">
            Resumen de novedades y esenciales. El catálogo completo con filtros
            está en su propia sección.
          </p>
          <Link
            href="/catalogo"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-neutral-900 bg-neutral-900 px-6 text-sm font-bold text-white transition hover:bg-neutral-800"
          >
            Ver catálogo ({total})
          </Link>
        </div>

        <ul className="mx-auto mt-10 grid w-full max-w-6xl list-none grid-cols-1 gap-6 p-0 md:grid-cols-3 md:gap-8">
          {trending.map((product) => (
            <li key={product.slug} className="flex min-h-0">
              <article className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <Link
                  href={`/productos/${product.slug}`}
                  className="relative block aspect-[4/5] bg-neutral-100"
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-center"
                  />
                  {product.badge ? (
                    <span className="absolute top-3 left-3 rounded-full bg-[#ce4800] px-2.5 py-1 text-[10px] font-bold tracking-wide text-white uppercase">
                      {product.badge}
                    </span>
                  ) : null}
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <Link href={`/productos/${product.slug}`}>
                    <h3 className="text-base font-semibold text-neutral-900 hover:underline">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="mt-2 min-h-[2.75rem] line-clamp-2 text-sm text-neutral-600">
                    {product.highlight}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-neutral-900">
                    {formatCatalogPrice(product.price)}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    <Link
                      href={buildEditorPath({ product: product.slug })}
                      className="inline-flex min-h-[40px] flex-1 items-center justify-center rounded-full bg-neutral-900 px-4 text-xs font-bold text-white transition hover:bg-neutral-800"
                    >
                      Personalizar
                    </Link>
                    <Link
                      href={`/productos/${product.slug}`}
                      className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-neutral-300 px-4 text-xs font-semibold text-neutral-800 transition hover:bg-neutral-50"
                    >
                      Detalle
                    </Link>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
