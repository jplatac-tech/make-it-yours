'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useAppState } from '../app-state/app-state-provider'
import { CrewneckMockup } from './crewneck-mockup'
import { buildEditorPath } from '../../lib/editor-url'
import { trackEvent } from '../../lib/analytics'
import { CATALOG_PRODUCT_META } from '../../lib/product-catalog'
import { PRODUCT_SIZES, type ProductSlug } from '../../lib/products'

type Product = {
  slug: ProductSlug
  name: string
  description: string
  price: number
  type: string
}

const formatPrice = (value: number) => `$${value.toFixed(0)}`

export function ProductoDetail({ product }: { product: Product }) {
  const { addToCart } = useAppState()
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState(PRODUCT_SIZES[1])

  const total = useMemo(
    () => product.price * quantity,
    [product.price, quantity],
  )

  const editorHref = buildEditorPath({ product: product.slug })
  const meta = CATALOG_PRODUCT_META[product.slug]

  return (
    <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
      <div className="flex items-center justify-center rounded-2xl border border-neutral-200 bg-[#d8dde3] p-4 shadow-sm sm:p-6">
        <div className="w-full max-w-[320px]">
          <CrewneckMockup
            view="FRONT"
            color="WHITE"
            className="h-auto w-full rounded-lg shadow-md"
          />
        </div>
      </div>

      <section className="space-y-6">
        <div>
          <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-800">
            {product.type}
          </span>
          <h1 className="mt-4 text-2xl font-semibold text-neutral-950 sm:text-3xl">
            {product.name}
          </h1>
          <p className="mt-4 text-neutral-600">{product.description}</p>
          {meta?.highlight ? (
            <p className="mt-3 text-sm font-medium text-neutral-500">
              {meta.highlight}
            </p>
          ) : null}
          <p className="mt-6 text-3xl font-bold sm:text-4xl">
            {formatPrice(product.price)}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-neutral-900">
            Talla
            <select
              value={selectedSize}
              onChange={(event) =>
                setSelectedSize(event.target.value as typeof selectedSize)
              }
              className="mt-2 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
            >
              {PRODUCT_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-neutral-900">
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

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Link
            href={editorHref}
            className="btn btn-primary inline-flex min-h-[48px] w-full items-center justify-center"
          >
            Personalizar ahora
          </Link>
          <Button
            type="button"
            variant="secondary"
            className="min-h-[48px] w-full"
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
            Añadir al carrito (sin diseño)
          </Button>
        </div>

        <p className="text-sm text-neutral-500">
          <strong>Personalizar</strong> abre el editor con esta prenda.{' '}
          <strong>Carrito</strong> es para comprar la prenda base; el estampado se
          cotiza aparte o desde el editor con{' '}
          <Link href="/comprar" className="font-medium text-sky-700 underline">
            Guardar pedido
          </Link>
          .
        </p>

        <ul className="space-y-2 rounded-2xl border border-neutral-200 bg-white p-5 text-sm text-neutral-600">
          <li>Estampado en frente y espalda con medidas máximas en el editor.</li>
          <li>Editor 2D sobre mockup real de crewneck.</li>
          <li>Carrito → confirmación por WhatsApp con resumen del pedido.</li>
        </ul>
      </section>
    </div>
  )
}
