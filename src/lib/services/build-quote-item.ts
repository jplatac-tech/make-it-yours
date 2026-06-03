import { prisma } from '../prisma'
import { getZonesWithDesign, parseDesignPayload } from '../export-design'
import { PRODUCTS, getPrintZone, type PrintZoneValue } from '../products'
import type { normalizeQuoteInput } from './quote-mapper'

type NormalizedPayload = ReturnType<typeof normalizeQuoteInput>

export function buildAssetCreates(
  payload: NormalizedPayload,
  namePrefix = '',
): {
  kind: 'TECHNICAL_FILE' | 'MOCKUP_PREVIEW'
  url: string
  mimeType: string
  originalName: string
}[] {
  const assetCreates: {
    kind: 'TECHNICAL_FILE' | 'MOCKUP_PREVIEW'
    url: string
    mimeType: string
    originalName: string
  }[] = []

  const designPayload = parseDesignPayload(
    typeof payload.designJson === 'string'
      ? payload.designJson
      : JSON.stringify(payload.designJson),
  )
  const zonesWithDesign = getZonesWithDesign(designPayload)
  const zonesToExport: PrintZoneValue[] =
    zonesWithDesign.length > 0 ? zonesWithDesign : [payload.printZone]

  const prefix = namePrefix ? `${namePrefix}-` : ''

  for (const zoneKey of zonesToExport) {
    const mockupUrl =
      payload.mockupsByZone[zoneKey] ?? payload.mockupDataUrl ?? null
    const technicalUrl =
      payload.technicalsByZone[zoneKey] ?? payload.technicalDataUrl ?? null

    if (mockupUrl) {
      assetCreates.push({
        kind: 'MOCKUP_PREVIEW',
        url: mockupUrl,
        mimeType: 'image/png',
        originalName: `${prefix}mockup-${zoneKey}`,
      })
    }
    if (technicalUrl) {
      assetCreates.push({
        kind: 'TECHNICAL_FILE',
        url: technicalUrl,
        mimeType: 'image/png',
        originalName: `${prefix}technical-${zoneKey}`,
      })
    }
  }

  if (assetCreates.length === 0) {
    assetCreates.push(
      {
        kind: 'TECHNICAL_FILE',
        url: 'internal://technical-file',
        mimeType: 'image/png',
        originalName: `${prefix}technical`,
      },
      {
        kind: 'MOCKUP_PREVIEW',
        url: 'internal://mockup-preview',
        mimeType: 'image/png',
        originalName: `${prefix}mockup`,
      },
    )
  }

  return assetCreates
}

export async function resolveQuoteItemRelations(payload: NormalizedPayload) {
  const designPayload = parseDesignPayload(
    typeof payload.designJson === 'string'
      ? payload.designJson
      : JSON.stringify(payload.designJson),
  )
  const zonesWithDesign = getZonesWithDesign(designPayload)
  const productData = PRODUCTS[payload.productSlug]
  const zone = getPrintZone(zonesWithDesign[0] ?? payload.printZone)

  if (!productData || !zone) {
    return null
  }

  const product = await prisma.product.upsert({
    where: { slug: productData.slug },
    create: {
      slug: productData.slug,
      name: productData.name,
      description: productData.description,
      type: productData.type,
    },
    update: {
      name: productData.name,
      description: productData.description,
      type: productData.type,
    },
  })

  const productVariant = await prisma.productVariant.upsert({
    where: {
      productId_color_size: {
        productId: product.id,
        color: payload.productColor,
        size: payload.productSize,
      },
    },
    create: {
      productId: product.id,
      color: payload.productColor,
      size: payload.productSize,
      sku: `${product.slug}-${payload.productColor}-${payload.productSize}`,
    },
    update: {},
  })

  const printZoneValue = zonesWithDesign[0] ?? payload.printZone

  const printZone = await prisma.productPrintZone.upsert({
    where: {
      productId_zone: {
        productId: product.id,
        zone: printZoneValue,
      },
    },
    create: {
      productId: product.id,
      zone: printZoneValue,
      label: zone.label,
      maxWidthIn: zone.widthIn,
      maxHeightIn: zone.heightIn,
      dpi: 300,
    },
    update: {
      label: zone.label,
      maxWidthIn: zone.widthIn,
      maxHeightIn: zone.heightIn,
    },
  })

  return { productVariant, printZone }
}
