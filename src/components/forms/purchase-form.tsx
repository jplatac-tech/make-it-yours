'use client'

import { useMemo, useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { trackEvent } from '../../lib/analytics'
import { buildEditorPath } from '../../lib/editor-url'
import {
  formatPurchaseQuoteMessage,
  openStoreWhatsApp,
} from '../../lib/whatsapp'
import {
  getZonesWithDesign,
  parseDesignPayload,
} from '../../lib/export-design'
import {
  getLineItemsWithDesign,
  lineItemToDesignJson,
  parseEditorSession,
} from '../../lib/design-storage'
import { getDesignLabel, getDesignRefId } from '../../lib/design-ids'
import {
  DEFAULT_PRODUCT_SIZE,
  getPrintZone,
  getProductColorLabel,
  PRODUCTS,
  PRODUCT_SIZES,
  normalizePrintZone,
  type ProductColorValue,
  type ProductSizeValue,
  type ProductSlug,
} from '../../lib/products'

type Props = {
  /** JSON completo de la sesión del editor (v2) o diseño legacy */
  designJson: string
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

  const editorSummary = useMemo(() => {
    if (isMulti) {
      return lineItems.map((item) => {
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
          title: getDesignLabel(item.id),
          refId: getDesignRefId(item.id),
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

    const active = lineItems[0]
    const designRef = active ? getDesignRefId(active.id) : null

    return [
      {
        key: 'single',
        title: active ? getDesignLabel(active.id) : 'Del editor',
        refId: designRef,
        name: productName,
        color: getProductColorLabel(productColor),
        zones: zoneSummary,
      },
    ]
  }, [isMulti, lineItems, legacyDesign, productName])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setMessage(null)

    const formData = new FormData(event.currentTarget)
    const quantityRaw = formData.get('quantityDesired')
    const quantityDesired = Math.max(
      1,
      Number.parseInt(String(quantityRaw ?? '1'), 10) || 1,
    )

    if (isMulti && quantityDesired < lineItems.length) {
      setMessage(`La cantidad mínima es ${lineItems.length} prendas`)
      setPending(false)
      return
    }

    const comments = String(formData.get('comments') ?? '').trim()

    trackEvent('quote_submitted', {
      productSlug: singleSlug,
      garmentCount: lineItems.length,
    })

    openStoreWhatsApp(
      formatPurchaseQuoteMessage({
        designJson,
        productSize,
        quantityDesired,
        comments: comments || undefined,
        productName,
      }),
    )

    setPending(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
              ) : row.refId ? (
                <p className="text-xs font-semibold tracking-wide text-violet-700 uppercase">
                  {row.refId}
                </p>
              ) : null}
              <p>
                {isMulti ? 'Prenda' : 'Producto'}:{' '}
                <span className="text-neutral-900">{row.name}</span>
              </p>
              <p>
                Color: <span className="text-neutral-900">{row.color}</span>
              </p>
              {isMulti && row.zones ? (
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
        defaultValue={1}
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

      <Button type="submit" className="w-full" disabled={pending}>
        {pending
          ? 'Abriendo WhatsApp...'
          : isMulti
            ? `Cotizar ${lineItems.length} prendas por WhatsApp`
            : 'Cotizar por WhatsApp'}
      </Button>

      {message ? <p className="text-sm text-red-600">{message}</p> : null}
    </form>
  )
}
