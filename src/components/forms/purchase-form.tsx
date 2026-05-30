'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { submitQuoteRequest } from '../../server/actions/quote-actions'
import { buildDesignExports } from '../../lib/export-design'
import {
  DEFAULT_PRODUCT_SIZE,
  PRODUCT_COLORS,
  PRODUCT_SIZES,
  PRINT_ZONES,
  normalizePrintZone,
  type ProductColorValue,
  type ProductSizeValue,
  type PrintZoneValue,
} from '../../lib/products'

type Props = {
  productSlug: string
  productName: string
  designJson: string
}

export function PurchaseForm({
  productSlug,
  productName,
  designJson,
}: Props) {
  const stored = useMemo(() => {
    try {
      return JSON.parse(designJson) as {
        productColor?: ProductColorValue
        printZone?: PrintZoneValue
        productSize?: ProductSizeValue
      }
    } catch {
      return {}
    }
  }, [designJson])

  const [productColor, setProductColor] = useState<ProductColorValue>(
    stored.productColor ?? PRODUCT_COLORS[0]?.value ?? 'BLACK',
  )
  const [productSize, setProductSize] = useState<ProductSizeValue>(
    stored.productSize ?? DEFAULT_PRODUCT_SIZE,
  )
  const [printZone, setPrintZone] = useState<PrintZoneValue>(
    normalizePrintZone(stored.printZone) ?? PRINT_ZONES[0]?.value ?? 'FRONT',
  )
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  const activeZone = useMemo(
    () => PRINT_ZONES.find((zone) => zone.value === printZone) ?? PRINT_ZONES[0],
    [printZone],
  )

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setMessage(null)

    formData.set('productSlug', productSlug)
    formData.set('productName', productName)
    formData.set('productColor', productColor)
    formData.set('productSize', productSize)
    formData.set('printZone', printZone)
    formData.set('designJson', designJson)
    formData.set('finalWidthIn', String(activeZone.widthIn))
    formData.set('finalHeightIn', String(activeZone.heightIn))

    try {
      const exports = await buildDesignExports(designJson)
      if (exports.mockupDataUrl) {
        formData.set('mockupDataUrl', exports.mockupDataUrl)
      }
      if (exports.technicalDataUrl) {
        formData.set('technicalDataUrl', exports.technicalDataUrl)
      }
    } catch {
      /* continúa sin export si falla en cliente */
    }

    const result = await submitQuoteRequest(formData)

    if (result.success && result.quoteId) {
      router.push(`/comprar/entrega?quoteId=${result.quoteId}`)
    } else {
      setMessage(result.message)
    }

    setPending(false)
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-neutral-900">
          Color de prenda
          <select
            name="productColor"
            value={productColor}
            onChange={(event) =>
              setProductColor(event.target.value as ProductColorValue)
            }
            className="mt-2 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none"
          >
            {PRODUCT_COLORS.map((color) => (
              <option key={color.value} value={color.value}>
                {color.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-neutral-900">
          Talla
          <select
            name="productSize"
            value={productSize}
            onChange={(event) =>
              setProductSize(event.target.value as ProductSizeValue)
            }
            className="mt-2 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none"
          >
            {PRODUCT_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm font-medium text-neutral-900">
        Zona de impresión
        <select
          name="printZone"
          value={printZone}
          onChange={(event) =>
            setPrintZone(event.target.value as PrintZoneValue)
          }
          className="mt-2 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none"
        >
          {PRINT_ZONES.map((zone) => (
            <option key={zone.value} value={zone.value}>
              {zone.label}
            </option>
          ))}
        </select>
      </label>

      <Input
        name="quantityDesired"
        type="number"
        min={1}
        placeholder="Cantidad deseada"
        required
      />
      <Textarea
        name="comments"
        placeholder="Comentarios para la cotización (opcional)"
      />

      <p className="text-xs text-neutral-500">
        Al enviar se generan el mockup y el archivo técnico para revisión
        comercial. Los datos de contacto se completan en el siguiente paso.
      </p>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Generando archivos...' : 'Enviar diseño para cotizar'}
      </Button>

      {message ? <p className="text-sm text-red-600">{message}</p> : null}
    </form>
  )
}
