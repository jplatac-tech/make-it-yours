'use client'

import { useMemo } from 'react'
import { getZonesWithDesign, getShapesForZone } from '../../lib/export-design'
import { resolveDesignPreviewPayload } from '../../lib/design-preview-payload'
import { getPrintZone, type ProductColorValue } from '../../lib/products'
import { DesignPreviewMockup } from './design-preview-mockup'

type Props = {
  designJson: string
  productName?: string
}

export function DesignOrderPreview({ designJson }: Props) {
  const payload = useMemo(
    () => resolveDesignPreviewPayload(designJson),
    [designJson],
  )

  const productColor = (payload?.productColor ?? 'WHITE') as ProductColorValue
  const zonesWithDesign = useMemo(
    () => getZonesWithDesign(payload),
    [payload],
  )

  return (
    <div className="card mb-6 overflow-visible p-4 sm:p-5">
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
    </div>
  )
}
