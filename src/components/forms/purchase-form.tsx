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
  getLineItemsWithDesign,
  lineItemToDesignJson,
  parseEditorSession,
} from '../../lib/design-storage'
import type { DesignLineItem } from '../../lib/design-line-items'
import {
  DEFAULT_PRODUCT_SIZE,
  getPrintZone,
  getProductColorLabel,
  PRODUCTS,
  PRODUCT_SIZES,
  normalizePrintZone,
  type ProductColorValue,
  type ProductSizeValue,
  type PrintZoneValue,
  type ProductSlug,
} from '../../lib/products'
import type { QuoteLineItemInput } from '../../lib/validations/quote'

type Props = {
  /** JSON completo de la sesión del editor (v2) o diseño legacy */
  designJson: string
}

function appendExportsToLineInput(
  input: QuoteLineItemInput,
  exports: Awaited<ReturnType<typeof buildDesignExports>>,
): QuoteLineItemInput {
  const next = { ...input }
  if (exports.mockupDataUrl) next.mockupDataUrl = exports.mockupDataUrl
  if (exports.technicalDataUrl) next.technicalDataUrl = exports.technicalDataUrl
  for (const zone of exports.zonesWithDesign) {
    const zoneExport = exports.byZone[zone]
    if (zoneExport?.mockupDataUrl) {
      next[`mockupDataUrl_${zone}` as keyof QuoteLineItemInput] =
        zoneExport.mockupDataUrl as never
    }
    if (zoneExport?.technicalDataUrl) {
      next[`technicalDataUrl_${zone}` as keyof QuoteLineItemInput] =
        zoneExport.technicalDataUrl as never
    }
  }
  return next
}

async function buildLineItemInput(
  item: DesignLineItem,
  productSize: ProductSizeValue,
): Promise<QuoteLineItemInput> {
  const json = lineItemToDesignJson(item)
  const design = parseDesignPayload(json)
  const zonesWithDesign = getZonesWithDesign(design)
  const primaryPrintZone: PrintZoneValue =
    zonesWithDesign[0] ?? normalizePrintZone(item.printZone)
  const primaryZoneMeta =
    getPrintZone(primaryPrintZone) ?? getPrintZone('FRONT')!

  let lineInput: QuoteLineItemInput = {
    productSlug: item.productSlug,
    productColor: item.productColor,
    productSize: item.productSize ?? productSize,
    printZone: primaryPrintZone,
    designJson: json,
    finalWidthIn: primaryZoneMeta.widthIn,
    finalHeightIn: primaryZoneMeta.heightIn,
  }

  try {
    const exports = await buildDesignExports(json)
    lineInput = appendExportsToLineInput(lineInput, exports)
  } catch {
    /* continúa sin export si falla en cliente */
  }

  return lineInput
}

export function PurchaseForm({ designJson }: Props) {
  const session = useMemo(() => parseEditorSession(designJson), [designJson])
  const lineItems = useMemo(
    () => getLineItemsWithDesign(session),
    [session],
  )
  const isMulti = lineItems.length > 1

  const legacyDesign = useMemo(
    () => parseDesignPayload(designJson),
    [designJson],
  )
  const singleSlug = (lineItems[0]?.productSlug ??
    (legacyDesign as { productSlug?: string })?.productSlug ??
    'crewneck-unisex') as ProductSlug
  const productName =
    singleSlug in PRODUCTS ? PRODUCTS[singleSlug].name : 'Prenda'

  const [productSize, setProductSize] = useState<ProductSizeValue>(
    lineItems[0]?.productSize ??
      (legacyDesign as { productSize?: ProductSizeValue })?.productSize ??
      DEFAULT_PRODUCT_SIZE,
  )
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  const editorSummary = useMemo(() => {
    if (isMulti) {
      return lineItems.map((item, index) => {
        const zones = getZonesWithDesign(parseDesignPayload(lineItemToDesignJson(item)))
        const zoneSummary = zones
          .map((z) => getPrintZone(z)?.label ?? z)
          .join(' y ')
        const name =
          item.productSlug in PRODUCTS
            ? PRODUCTS[item.productSlug].name
            : productName
        return {
          key: item.id,
          title: `Prenda ${index + 1}`,
          name,
          color: getProductColorLabel(item.productColor),
          zones: zoneSummary,
        }
      })
    }

    const design = legacyDesign ?? parseDesignPayload(lineItemToDesignJson(lineItems[0]!))
    const productColor = (design?.productColor ?? 'WHITE') as ProductColorValue
    const zonesWithDesign = getZonesWithDesign(design)
    const zoneSummary = zonesWithDesign
      .map((z) => getPrintZone(z)?.label ?? z)
      .join(' y ')

    return [
      {
        key: 'single',
        title: 'Del editor',
        name: productName,
        color: getProductColorLabel(productColor),
        zones: zoneSummary,
      },
    ]
  }, [isMulti, lineItems, legacyDesign, productName])

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setMessage(null)

    try {
      if (isMulti) {
        const built = await Promise.all(
          lineItems.map((item) => buildLineItemInput(item, productSize)),
        )
        formData.set('designItemsJson', JSON.stringify(built))

        const extra = `${lineItems.length} prendas con diseños distintos`
        const existing = String(formData.get('comments') ?? '').trim()
        formData.set(
          'comments',
          existing ? `${existing}\n${extra}` : extra,
        )
      } else {
        const item = lineItems[0]
        if (!item) {
          setMessage('No hay diseño para enviar')
          setPending(false)
          return
        }

        const lineInput = await buildLineItemInput(item, productSize)
        const design = parseDesignPayload(lineInput.designJson)
        const zonesWithDesign = getZonesWithDesign(design)
        const zoneSummary = zonesWithDesign
          .map((z) => getPrintZone(z)?.label ?? z)
          .join(' y ')

        formData.set('productSlug', lineInput.productSlug)
        formData.set('productColor', lineInput.productColor)
        formData.set('productSize', lineInput.productSize)
        formData.set('printZone', lineInput.printZone)
        formData.set('designJson', lineInput.designJson)
        formData.set('finalWidthIn', String(lineInput.finalWidthIn))
        formData.set('finalHeightIn', String(lineInput.finalHeightIn))

        if (lineInput.mockupDataUrl) {
          formData.set('mockupDataUrl', lineInput.mockupDataUrl)
        }
        if (lineInput.technicalDataUrl) {
          formData.set('technicalDataUrl', lineInput.technicalDataUrl)
        }
        for (const key of Object.keys(lineInput) as Array<keyof QuoteLineItemInput>) {
          if (key.startsWith('mockupDataUrl_') || key.startsWith('technicalDataUrl_')) {
            const val = lineInput[key]
            if (typeof val === 'string' && val) {
              formData.set(key, val)
            }
          }
        }

        if (zonesWithDesign.length > 1) {
          const extra = `Zonas con diseño: ${zoneSummary}`
          const existing = String(formData.get('comments') ?? '').trim()
          formData.set(
            'comments',
            existing ? `${existing}\n${extra}` : extra,
          )
        }
      }
    } catch {
      setMessage('No se pudieron generar los archivos del diseño')
      setPending(false)
      return
    }

    const result = await submitQuoteRequest(formData)

    if (result.success && result.quoteId) {
      trackEvent('quote_submitted', {
        productSlug: singleSlug,
        quoteId: result.quoteId,
        garmentCount: lineItems.length,
      })
      router.push(`/comprar/entrega?quoteId=${result.quoteId}`)
    } else {
      setMessage(result.message)
    }

    setPending(false)
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
        <p className="font-medium text-neutral-900">
          {isMulti
            ? `${lineItems.length} prendas en tu pedido`
            : 'Del editor'}
        </p>
        <ul className="mt-2 space-y-3">
          {editorSummary.map((row) => (
            <li key={row.key} className="border-t border-neutral-200/80 pt-2 first:border-0 first:pt-0">
              {isMulti ? (
                <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                  {row.title}
                </p>
              ) : null}
              <p>
                {isMulti ? 'Prenda' : 'Producto'}:{' '}
                <span className="text-neutral-900">{row.name}</span>
              </p>
              <p>
                Color: <span className="text-neutral-900">{row.color}</span>
              </p>
              {row.zones ? (
                <p>
                  Zona{row.zones.includes(' y ') ? 's' : ''}:{' '}
                  <span className="text-neutral-900">{row.zones || '—'}</span>
                </p>
              ) : null}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-neutral-500">
          Para cambiar color o diseño,{' '}
          <a
            href={buildEditorPath({ product: singleSlug })}
            className="font-medium text-sky-700 underline"
          >
            vuelve al editor
          </a>
          {isMulti ? ' y elige la prenda con los círculos al lado del mockup' : ''}.
        </p>
      </div>

      {!isMulti && lineItems[0] ? (
        <>
          <input
            type="hidden"
            name="productColor"
            value={lineItems[0].productColor}
          />
          <input
            type="hidden"
            name="printZone"
            value={normalizePrintZone(lineItems[0].printZone)}
          />
        </>
      ) : null}

      <label className="block text-sm font-medium text-neutral-900">
        Talla{isMulti ? ' (aplica a todas las prendas)' : ''}
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
        min={isMulti ? lineItems.length : 1}
        placeholder={
          isMulti
            ? `Cantidad total (mín. ${lineItems.length})`
            : 'Cantidad deseada'
        }
        required
      />
      <Textarea
        name="comments"
        placeholder="Comentarios para la cotización (opcional)"
      />

      <p className="text-xs text-neutral-500">
        {isMulti
          ? `Se registrarán ${lineItems.length} prendas, cada una con su color y diseño. Los datos de contacto se completan en el siguiente paso.`
          : 'Al enviar se generan mockups y archivos técnicos de cada cara con diseño. Los datos de contacto se completan en el siguiente paso.'}
      </p>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending
          ? 'Generando archivos...'
          : isMulti
            ? `Enviar ${lineItems.length} prendas para cotizar`
            : 'Enviar diseño para cotizar'}
      </Button>

      {message ? <p className="text-sm text-red-600">{message}</p> : null}
    </form>
  )
}
