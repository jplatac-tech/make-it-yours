'use client'

import { useMemo } from 'react'
import {
  getZonesWithDesign,
  parseDesignPayload,
  getShapesForZone,
} from '../../lib/export-design'
import {
  getProductColorLabel,
  getPrintZone,
  PRODUCTS,
  type ProductColorValue,
  type PrintZoneValue,
  type ProductSlug,
} from '../../lib/products'
import { DesignPreviewMockup } from './design-preview-mockup'

type Props = {
  designJson: string
  productName: string
}

export function DesignOrderPreview({ designJson, productName }: Props) {
  const payload = useMemo(
    () => parseDesignPayload(designJson),
    [designJson],
  )

  const productColor = (payload?.productColor ?? 'WHITE') as ProductColorValue
  const zonesWithDesign = useMemo(
    () => getZonesWithDesign(payload),
    [payload],
  )
  const slug = (payload as { productSlug?: string })?.productSlug as
    | ProductSlug
    | undefined
  const catalogName =
    slug && slug in PRODUCTS ? PRODUCTS[slug].name : productName

  const zoneLabels = zonesWithDesign
    .map((z) => getPrintZone(z)?.label ?? z)
    .join(' · ')

  return (
    <div className="card mb-6 overflow-hidden p-4 sm:p-5">
      <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
        Vista previa
      </p>
      <p className="mt-1 text-sm text-neutral-600">
        {zonesWithDesign.length > 1
          ? 'Mockup real · frente y espalda con diseño'
          : zonesWithDesign.length === 1
            ? `Mockup real · ${getPrintZone(zonesWithDesign[0])?.label?.toLowerCase() ?? zonesWithDesign[0]}`
            : 'Sin elementos en el diseño'}
      </p>

      {zonesWithDesign.length > 0 ? (
        <div
          className={
            'mt-4 grid gap-4 ' +
            (zonesWithDesign.length > 1
              ? 'grid-cols-1 sm:grid-cols-2'
              : 'grid-cols-1')
          }
        >
          {zonesWithDesign.map((zone) => {
            const shapes = getShapesForZone(payload!, zone)
            const label = getPrintZone(zone)?.label ?? zone
            return (
              <div key={zone} className="min-w-0">
                <p className="mb-2 text-center text-xs font-medium text-neutral-600">
                  {label}
                </p>
                <DesignPreviewMockup
                  shapes={shapes}
                  productColor={productColor}
                  printZone={zone}
                />
              </div>
            )
          })}
        </div>
      ) : (
        <div className="mx-auto mt-4 max-w-[240px]">
          <DesignPreviewMockup
            shapes={[]}
            productColor={productColor}
            printZone="FRONT"
          />
        </div>
      )}

      <dl className="mt-5 grid gap-3 text-sm text-neutral-700 sm:grid-cols-2">
        <div>
          <dt className="font-medium text-neutral-900">Prenda</dt>
          <dd>{catalogName}</dd>
        </div>
        <div>
          <dt className="font-medium text-neutral-900">Color</dt>
          <dd>{getProductColorLabel(productColor)}</dd>
        </div>
        {zonesWithDesign.length > 0 ? (
          <div className="sm:col-span-2">
            <dt className="font-medium text-neutral-900">Zonas con diseño</dt>
            <dd>{zoneLabels}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  )
}
