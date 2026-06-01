'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useAppState } from '../app-state/app-state-provider'
import { CrewneckMockup } from './crewneck-mockup'
import {
  PRODUCT_SIZES,
  type ProductSlug,
} from '../../lib/products'
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

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="flex items-center justify-center rounded-2xl border border-neutral-200 bg-[#d8dde3] p-6 shadow-sm">
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
          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800">
            {product.type}
          </span>
          <h1 className="mt-4 text-3xl font-semibold text-neutral-950">
            {product.name}
          </h1>
          <p className="mt-4 text-neutral-600">{product.description}</p>
          <p className="mt-6 text-4xl font-bold">{formatPrice(product.price)}</p>
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

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            className="bg-violet-600 hover:opacity-90"
            onClick={() =>
              addToCart(
                {
                  slug: product.slug,
                  name: product.name,
                  price: product.price,
                  size: selectedSize,
                },
                quantity,
              )
            }
          >
            Añadir al carrito
          </Button>
          <Link
            href="/disenar/editor"
            className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
          >
            Diseñar esta prenda
          </Link>
        </div>
        <p className="text-sm text-neutral-500">
          Para cotizar esta prenda, usa <strong>Cotizar por WhatsApp</strong> en
          la barra superior.
        </p>

        <ul className="space-y-2 rounded-2xl border border-neutral-200 bg-white p-5 text-sm text-neutral-600">
          <li>Estampado en frente y espalda con medidas máximas en el editor.</li>
          <li>Editor 2D tipo Canva sobre mockup de suéter.</li>
          <li>Carrito se envía completo por WhatsApp al comprar.</li>
        </ul>
      </section>
    </div>
  )
}
