'use client'

import { useMemo } from 'react'
import {
  getLineItemsWithDesign,
  parseEditorSession,
} from '../../lib/design-storage'
import {
  getLineItemZonesWithDesign,
  getPreviewShapesForZone,
} from '../../lib/design-preview-payload'
import {
  getProductColorLabel,
  getPrintZone,
  PRODUCTS,
} from '../../lib/products'
import { DesignPreviewMockup } from './design-preview-mockup'

type Props = {
  designJson: string
}

export function MultiDesignOrderPreview({ designJson }: Props) {
  const items = useMemo(() => {
    const session = parseEditorSession(designJson)
    return getLineItemsWithDesign(session)
  }, [designJson])

  if (items.length === 0) return null

  return (
    <div className="card mb-6 space-y-6 overflow-hidden p-4 sm:p-5">
      <div>
        <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
          Vista previa
        </p>
        <p className="mt-1 text-sm text-neutral-600">
          {items.length} prenda{items.length > 1 ? 's' : ''} con diseño distinto
        </p>
      </div>

      {items.map((item, index) => {
        const zonesWithDesign = getLineItemZonesWithDesign(item)
        const productName =
          item.productSlug in PRODUCTS
            ? PRODUCTS[item.productSlug].name
            : 'Prenda'

        return (
          <div
            key={item.id}
            className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4"
          >
            <p className="text-sm font-semibold text-neutral-900">
              Prenda {index + 1} · {productName}
            </p>
            <p className="mt-0.5 text-xs text-neutral-600">
              Color: {getProductColorLabel(item.productColor)}
            </p>

            {zonesWithDesign.length > 0 ? (
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {zonesWithDesign.map((zone) => {
                  const shapes = getPreviewShapesForZone(item, zone)
                  const label = getPrintZone(zone)?.label ?? zone
                  return (
                    <div key={`${item.id}-${zone}`} className="min-w-0">
                      <p className="mb-2 text-center text-xs font-medium text-neutral-600">
                        {label}
                      </p>
                      <DesignPreviewMockup
                        shapes={shapes}
                        productColor={item.productColor}
                        printZone={zone}
                      />
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="mt-3">
                <DesignPreviewMockup
                  shapes={[]}
                  productColor={item.productColor}
                  printZone="FRONT"
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
