import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProductoDetail } from '../../../components/product/producto-detail'
import { getLookById } from '../../../lib/catalog-looks'
import { PRODUCTS, type ProductSlug } from '../../../lib/products'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = PRODUCTS[slug as ProductSlug]
  if (!product) return { title: 'Producto' }
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
    },
  }
}

export default async function ProductoPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ look?: string }>
}) {
  const { slug } = await params
  const { look: lookId } = await searchParams
  const product = PRODUCTS[slug as ProductSlug]

  if (!product) {
    notFound()
  }

  const look = lookId ? getLookById(lookId) : undefined
  const lookMatchesProduct = look?.productSlug === product.slug

  return (
    <main className="container py-6 sm:py-10 md:py-16">
      <Link href="/catalogo" className="text-sm font-medium text-neutral-500">
        ← Catálogo
      </Link>
      <ProductoDetail
        product={product}
        imageOverride={lookMatchesProduct ? look.image : undefined}
        displayName={lookMatchesProduct ? look.name : undefined}
      />
    </main>
  )
}
