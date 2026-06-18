'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useAppState } from '../app-state/app-state-provider'
import { EditorEntryTrigger } from '../editor/editor-entry-trigger'
import { trackEvent } from '../../lib/analytics'
import {
  getDefaultCatalogImageForProduct,
} from '../../lib/catalog-looks'
import { PRODUCT_SIZES, type ProductSlug } from '../../lib/products'
import { formatPrice } from '../../lib/utils'

type Product = {
  slug: ProductSlug
  name: string
  description: string
  price: number
  type: string
}

export function ProductoDetail({
  product,
  imageOverride,
  displayName,
}: {
  product: Product
  imageOverride?: string
  displayName?: string
}) {
  const { addToCart } = useAppState()
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState(PRODUCT_SIZES[1])

  const total = useMemo(
    () => product.price * quantity,
    [product.price, quantity],
  )

  const imageSrc =
    imageOverride ?? getDefaultCatalogImageForProduct(product.slug)
  const title = displayName ?? product.name

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 sm:mt-8 sm:gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-[#f5f5f5] shadow-sm sm:rounded-2xl">
        <div className="relative aspect-[4/5] w-full">
          <Image
            src={imageSrc}
            alt={title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center"
            priority
          />
        </div>
      </div>

      <section className="min-w-0 space-y-5 sm:space-y-6">
        <div>
          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-800 sm:px-3 sm:text-xs">
            Unisex
          </span>
          <h1 className="mt-3 text-xl font-semibold text-neutral-950 sm:mt-4 sm:text-2xl md:text-3xl">
            {title}
          </h1>
          <p className="mt-3 text-sm text-neutral-600 sm:mt-4 sm:text-base">{product.description}</p>
          <p className="mt-4 text-2xl font-bold sm:mt-6 sm:text-3xl md:text-4xl">
            {formatPrice(product.price)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <label className="block min-w-0 text-sm font-medium text-neutral-900">
            Talla
            <select
              value={selectedSize}
              onChange={(event) =>
                setSelectedSize(event.target.value as typeof selectedSize)
              }
              className="mt-2 w-full min-w-0 rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm sm:rounded-2xl sm:px-4 sm:py-3"
            >
              {PRODUCT_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <label className="block min-w-0 text-sm font-medium text-neutral-900">
            Cantidad
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(event) =>
                setQuantity(Math.max(1, Number(event.target.value) || 1))
              }
              className="mt-2"
            />
          </label>
        </div>

        <p className="text-sm text-neutral-600">
          Total estimado:{' '}
          <span className="font-semibold text-neutral-900">
            {formatPrice(total)}
          </span>
        </p>

        <div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-2">
          <EditorEntryTrigger
            product={product.slug}
            className="btn btn-primary inline-flex min-h-[44px] w-full items-center justify-center text-sm sm:min-h-[48px]"
          >
            Personalizar ahora
          </EditorEntryTrigger>
          <Button
            type="button"
            variant="secondary"
            className="min-h-[44px] w-full text-sm sm:min-h-[48px]"
            onClick={() => {
              addToCart(
                {
                  slug: product.slug,
                  name: product.name,
                  price: product.price,
                  size: selectedSize,
                },
                quantity,
              )
              trackEvent('add_to_cart', {
                slug: product.slug,
                quantity,
              })
            }}
          >
            Añadir al carrito
          </Button>
        </div>

        <p className="text-xs text-neutral-500 sm:text-sm">
          <strong>Personalizar</strong> abre el editor con esta prenda.{' '}
          <strong>Carrito</strong> es para comprar la prenda base; el estampado se
          cotiza aparte o desde el editor con{' '}
          <Link href="/comprar" className="font-medium text-sky-700 underline">
            Guardar pedido
          </Link>
          .
        </p>

        <ul className="space-y-2 rounded-xl border border-neutral-200 bg-white p-4 text-xs text-neutral-600 sm:rounded-2xl sm:p-5 sm:text-sm">
          <li>Estampado en frente y espalda con medidas máximas en el editor.</li>
          <li>Editor 2D sobre mockup real de crewneck.</li>
          <li>Carrito → confirmación por WhatsApp con resumen del pedido.</li>
        </ul>
      </section>
    </div>
  )
}
