import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProductoDetail } from '../../../components/product/producto-detail'
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
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = PRODUCTS[slug as ProductSlug]

  if (!product) {
    notFound()
  }

  return (
    <main className="container py-10 sm:py-12 md:py-16">
      <Link href="/catalogo" className="text-sm font-medium text-neutral-500">
        ← Catálogo
      </Link>
      <ProductoDetail product={product} />
    </main>
  )
}
