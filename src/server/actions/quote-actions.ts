'use server'

import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import {
  multiQuoteRequestSchema,
  quoteDeliverySchema,
  quoteLineItemSchema,
  quoteRequestSchema,
} from '../../lib/validations/quote'
import { normalizeQuoteInput } from '../../lib/services/quote-mapper'
import {
  buildAssetCreates,
  resolveQuoteItemRelations,
} from '../../lib/services/build-quote-item'

function generateRequestNumber() {
  return `Q-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(
    Math.random() * 900 + 100,
  )}`
}

async function buildQuoteItemCreate(
  raw: z.infer<typeof quoteLineItemSchema>,
  itemIndex: number,
) {
  const payload = normalizeQuoteInput({ ...raw, quantityDesired: 1 })
  const relations = await resolveQuoteItemRelations(payload)
  if (!relations) return null

  const prefix = itemIndex > 0 ? `prenda${itemIndex + 1}` : ''

  return {
    productVariantId: relations.productVariant.id,
    printZoneId: relations.printZone.id,
    finalWidthIn: payload.finalWidthIn,
    finalHeightIn: payload.finalHeightIn,
    designJson: payload.designJson,
    notes: null as string | null,
    assets: {
      create: buildAssetCreates(payload, prefix),
    },
  }
}

function formField(value: FormDataEntryValue | null) {
  return value === null ? undefined : value
}

export async function submitQuoteRequest(formData: FormData) {
  try {
    const designItemsRaw = formData.get('designItemsJson')
    if (typeof designItemsRaw === 'string' && designItemsRaw.length > 2) {
      const multiParsed = multiQuoteRequestSchema.safeParse({
        quantityDesired: formData.get('quantityDesired'),
        comments: formField(formData.get('comments')),
        designItemsJson: designItemsRaw,
      })

      if (!multiParsed.success) {
        return {
          success: false,
          message: multiParsed.error.issues[0]?.message ?? 'Datos inválidos',
        }
      }

      let lineItems: z.infer<typeof quoteLineItemSchema>[]
      try {
        lineItems = z
          .array(quoteLineItemSchema)
          .min(1, 'Agrega al menos una prenda con diseño')
          .parse(JSON.parse(designItemsRaw))
      } catch (err) {
        const message =
          err instanceof z.ZodError
            ? (err.issues[0]?.message ?? 'Datos de prendas inválidos')
            : 'Datos de prendas inválidos'
        return { success: false, message }
      }

      const itemCreates = (
        await Promise.all(
          lineItems.map((item, index) => buildQuoteItemCreate(item, index)),
        )
      ).filter((item): item is NonNullable<typeof item> => item !== null)

      if (itemCreates.length === 0) {
        return {
          success: false,
          message: 'Configuración de producto inválida',
        }
      }

      const prendasNote = `${lineItems.length} prenda${lineItems.length > 1 ? 's' : ''} personalizada${lineItems.length > 1 ? 's' : ''} (diseños distintos)`
      const mergedComments = [
        multiParsed.data.comments?.trim() || null,
        prendasNote,
      ]
        .filter(Boolean)
        .join('\n\n')

      const quote = await prisma.quoteRequest.create({
        data: {
          requestNumber: generateRequestNumber(),
          customerName: 'Pendiente',
          quantityDesired: Math.max(
            multiParsed.data.quantityDesired,
            lineItems.length,
          ),
          comments: mergedComments || null,
          items: { create: itemCreates },
        },
      })

      return {
        success: true,
        message: 'Pedido registrado correctamente',
        quoteId: quote.id,
      }
    }

    const parsed = quoteRequestSchema.safeParse({
      productSlug: formData.get('productSlug'),
      productColor: formData.get('productColor'),
      productSize: formData.get('productSize'),
      printZone: formData.get('printZone'),
      designJson: formData.get('designJson'),
      finalWidthIn: formData.get('finalWidthIn'),
      finalHeightIn: formData.get('finalHeightIn'),
      quantityDesired: formData.get('quantityDesired'),
      comments: formField(formData.get('comments')),
      mockupDataUrl: formField(formData.get('mockupDataUrl')),
      technicalDataUrl: formField(formData.get('technicalDataUrl')),
      mockupDataUrl_FRONT: formField(formData.get('mockupDataUrl_FRONT')),
      mockupDataUrl_BACK: formField(formData.get('mockupDataUrl_BACK')),
      technicalDataUrl_FRONT: formField(formData.get('technicalDataUrl_FRONT')),
      technicalDataUrl_BACK: formField(formData.get('technicalDataUrl_BACK')),
    })

    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? 'Datos inválidos',
      }
    }

    const itemCreate = await buildQuoteItemCreate(parsed.data, 0)
    if (!itemCreate) {
      return {
        success: false,
        message: 'Configuración de producto inválida',
      }
    }

    itemCreate.notes = parsed.data.comments?.trim() || null

    const payload = normalizeQuoteInput(parsed.data)
    const quote = await prisma.quoteRequest.create({
      data: {
        requestNumber: generateRequestNumber(),
        customerName: 'Pendiente',
        quantityDesired: payload.quantityDesired,
        comments: payload.comments,
        items: { create: itemCreate },
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
      customerEmail: formField(formData.get('customerEmail')),
      customerWhatsapp: formData.get('customerWhatsapp'),
      neededBy: formField(formData.get('neededBy')),
      deliveryNotes: formField(formData.get('deliveryNotes')),
    })

    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? 'Datos inválidos',
      }
    }

    const {
      quoteId,
      customerName,
      customerEmail,
      customerWhatsapp,
      neededBy,
      deliveryNotes,
    } = parsed.data

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
    const mergedComments = [
      existing.comments,
      deliveryComment ? `Entrega: ${deliveryComment}` : null,
    ]
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
