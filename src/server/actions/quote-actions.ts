'use server'

import { prisma } from '../../lib/prisma'
import {
  quoteDeliverySchema,
  quoteRequestSchema,
} from '../../lib/validations/quote'
import { normalizeQuoteInput } from '../../lib/services/quote-mapper'
import { PRODUCTS, getPrintZone } from '../../lib/products'

function generateRequestNumber() {
  return `Q-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(
    Math.random() * 900 + 100,
  )}`
}

export async function submitQuoteRequest(formData: FormData) {
  try {
  const parsed = quoteRequestSchema.safeParse({
    productSlug: formData.get('productSlug'),
    productColor: formData.get('productColor'),
    productSize: formData.get('productSize'),
    printZone: formData.get('printZone'),
    designJson: formData.get('designJson'),
    finalWidthIn: formData.get('finalWidthIn'),
    finalHeightIn: formData.get('finalHeightIn'),
    quantityDesired: formData.get('quantityDesired'),
    comments: formData.get('comments'),
    mockupDataUrl: formData.get('mockupDataUrl'),
    technicalDataUrl: formData.get('technicalDataUrl'),
  })

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Datos inválidos',
    }
  }

  const payload = normalizeQuoteInput(parsed.data)
  const productData = PRODUCTS[payload.productSlug]
  const zone = getPrintZone(payload.printZone)

  if (!productData || !zone) {
    return {
      success: false,
      message: 'Configuración de producto inválida',
    }
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

  const printZone = await prisma.productPrintZone.upsert({
    where: {
      productId_zone: {
        productId: product.id,
        zone: payload.printZone,
      },
    },
    create: {
      productId: product.id,
      zone: payload.printZone,
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

  const quote = await prisma.quoteRequest.create({
    data: {
      requestNumber: generateRequestNumber(),
      customerName: 'Pendiente',
      quantityDesired: payload.quantityDesired,
      comments: payload.comments,
      items: {
        create: {
          productVariantId: productVariant.id,
          printZoneId: printZone.id,
          finalWidthIn: payload.finalWidthIn,
          finalHeightIn: payload.finalHeightIn,
          designJson: payload.designJson,
          notes: payload.comments,
          assets: {
            create: [
              {
                kind: 'TECHNICAL_FILE',
                url: payload.technicalDataUrl?.startsWith('data:')
                  ? 'inline://technical-file'
                  : payload.technicalDataUrl ?? 'internal://technical-file',
                mimeType: 'image/png',
              },
              {
                kind: 'MOCKUP_PREVIEW',
                url: payload.mockupDataUrl?.startsWith('data:')
                  ? 'inline://mockup-preview'
                  : payload.mockupDataUrl ?? 'internal://mockup-preview',
                mimeType: 'image/png',
              },
            ],
          },
        },
      },
    },
  })

  return {
    success: true,
    message: 'Pedido registrado correctamente',
    quoteId: quote.id,
  }
  } catch {
    return {
      success: false,
      message:
        'No se pudo guardar el pedido. Verifica que la base de datos esté activa.',
    }
  }
}

export async function submitQuoteDelivery(formData: FormData) {
  try {
  const parsed = quoteDeliverySchema.safeParse({
    quoteId: formData.get('quoteId'),
    customerName: formData.get('customerName'),
    customerEmail: formData.get('customerEmail'),
    customerWhatsapp: formData.get('customerWhatsapp'),
    neededBy: formData.get('neededBy'),
    deliveryNotes: formData.get('deliveryNotes'),
  })

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Datos inválidos',
    }
  }

  const { quoteId, customerName, customerEmail, customerWhatsapp, neededBy, deliveryNotes } =
    parsed.data

  const existing = await prisma.quoteRequest.findUnique({
    where: { id: quoteId },
    select: { id: true, comments: true },
  })

  if (!existing) {
    return {
      success: false,
      message: 'No encontramos el pedido',
    }
  }

  const deliveryComment = deliveryNotes?.trim()
  const mergedComments = [existing.comments, deliveryComment ? `Entrega: ${deliveryComment}` : null]
    .filter(Boolean)
    .join('\n\n')

  await prisma.quoteRequest.update({
    where: { id: quoteId },
    data: {
      customerName,
      customerEmail: customerEmail || null,
      customerWhatsapp,
      neededBy: neededBy ? new Date(neededBy) : null,
      comments: mergedComments || null,
    },
  })

  return {
    success: true,
    message: 'Datos de contacto y entrega guardados',
  }
  } catch {
    return {
      success: false,
      message:
        'No se pudieron guardar los datos. Verifica que la base de datos esté activa.',
    }
  }
}
