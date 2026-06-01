'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { trackEvent } from '../../lib/analytics'
import { buildEditorPath } from '../../lib/editor-url'
import { submitQuoteRequest } from '../../server/actions/quote-actions'
import {
  buildDesignExports,
  getZonesWithDesign,
  parseDesignPayload,
} from '../../lib/export-design'
import {
  DEFAULT_PRODUCT_SIZE,
  getPrintZone,
  getProductColorLabel,
  PRODUCT_SIZES,
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
  const design = useMemo(() => parseDesignPayload(designJson), [designJson])

  const productColor = (design?.productColor ??
    'WHITE') as ProductColorValue
  const zonesWithDesign = useMemo(
    () => getZonesWithDesign(design),
    [design],
  )
  const primaryPrintZone: PrintZoneValue =
    zonesWithDesign[0] ?? normalizePrintZone(design?.printZone)

  const [productSize, setProductSize] = useState<ProductSizeValue>(
    (design as { productSize?: ProductSizeValue })?.productSize ??
      DEFAULT_PRODUCT_SIZE,
  )
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  const primaryZoneMeta = useMemo(
    () => getPrintZone(primaryPrintZone) ?? getPrintZone('FRONT')!,
    [primaryPrintZone],
  )

  const zoneSummary = zonesWithDesign
    .map((z) => getPrintZone(z)?.label ?? z)
    .join(' y ')

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setMessage(null)

    formData.set('productSlug', productSlug)
    formData.set('productName', productName)
    formData.set('productColor', productColor)
    formData.set('productSize', productSize)
    formData.set('printZone', primaryPrintZone)
    formData.set('designJson', designJson)
    formData.set('finalWidthIn', String(primaryZoneMeta.widthIn))
    formData.set('finalHeightIn', String(primaryZoneMeta.heightIn))

    if (zonesWithDesign.length > 1) {
      const extra = `Zonas con diseño: ${zoneSummary}`
      const existing = String(formData.get('comments') ?? '').trim()
      formData.set(
        'comments',
        existing ? `${existing}\n${extra}` : extra,
      )
    }

    try {
      const exports = await buildDesignExports(designJson)
      if (exports.mockupDataUrl) {
        formData.set('mockupDataUrl', exports.mockupDataUrl)
      }
      if (exports.technicalDataUrl) {
        formData.set('technicalDataUrl', exports.technicalDataUrl)
      }
      for (const zone of exports.zonesWithDesign) {
        const zoneExport = exports.byZone[zone]
        if (zoneExport?.mockupDataUrl) {
          formData.set(`mockupDataUrl_${zone}`, zoneExport.mockupDataUrl)
        }
        if (zoneExport?.technicalDataUrl) {
          formData.set(
            `technicalDataUrl_${zone}`,
            zoneExport.technicalDataUrl,
          )
        }
      }
    } catch {
      /* continúa sin export si falla en cliente */
    }

    const result = await submitQuoteRequest(formData)

    if (result.success && result.quoteId) {
      trackEvent('quote_submitted', { productSlug, quoteId: result.quoteId })
      router.push(`/comprar/entrega?quoteId=${result.quoteId}`)
    } else {
      setMessage(result.message)
    }

    setPending(false)
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
        <p className="font-medium text-neutral-900">Del editor</p>
        <ul className="mt-2 space-y-1">
          <li>
            Color: <span className="text-neutral-900">{getProductColorLabel(productColor)}</span>
          </li>
          {zonesWithDesign.length > 0 ? (
            <li>
              {zonesWithDesign.length > 1 ? 'Zonas' : 'Zona'}:{' '}
              <span className="text-neutral-900">{zoneSummary}</span>
            </li>
          ) : null}
        </ul>
        <p className="mt-2 text-xs text-neutral-500">
          Para cambiar color o diseño,{' '}
          <a
            href={buildEditorPath({ product: productSlug })}
            className="font-medium text-sky-700 underline"
          >
            vuelve al editor
          </a>
          .
        </p>
      </div>

      <input type="hidden" name="productColor" value={productColor} />
      <input type="hidden" name="printZone" value={primaryPrintZone} />

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
        Al enviar se generan mockups y archivos técnicos de cada cara con
        diseño. Los datos de contacto se completan en el siguiente paso.
      </p>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Generando archivos...' : 'Enviar diseño para cotizar'}
      </Button>

      {message ? <p className="text-sm text-red-600">{message}</p> : null}
    </form>
  )
}
