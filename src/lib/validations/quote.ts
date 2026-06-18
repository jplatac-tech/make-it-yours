import { z } from 'zod'

const optionalString = z.string().nullish()

export const quoteRequestSchema = z.object({
  productSlug: z.enum(['camiseta-unisex', 'hoodie-unisex', 'crewneck-unisex']),
  productColor: z.enum(['BLACK', 'WHITE', 'BEIGE', 'HEATHER_GRAY', 'BLUE']),
  productSize: z.enum(['S', 'M', 'L', 'XL', 'XXL']),
  printZone: z.enum(['FRONT', 'BACK']),
  designJson: z.string().min(2, 'El diseño es obligatorio'),
  finalWidthIn: z.coerce.number().positive(),
  finalHeightIn: z.coerce.number().positive(),
  quantityDesired: z.coerce
    .number()
    .int()
    .min(1, 'La cantidad debe ser mayor a 0'),
  comments: optionalString,
  mockupDataUrl: optionalString,
  technicalDataUrl: optionalString,
  mockupDataUrl_FRONT: optionalString,
  mockupDataUrl_BACK: optionalString,
  technicalDataUrl_FRONT: optionalString,
  technicalDataUrl_BACK: optionalString,
})

export const quoteDeliverySchema = z.object({
  quoteId: z.string().min(1),
  customerName: z.string().min(2, 'Indica tu nombre'),
  customerEmail: z
    .union([z.string().email('Correo inválido'), z.literal('')])
    .nullish(),
  customerWhatsapp: z.string().min(8, 'Indica un WhatsApp válido'),
  neededBy: optionalString,
  deliveryNotes: optionalString,
})

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>

/** Una prenda dentro de un pedido con varios diseños */
export const quoteLineItemSchema = quoteRequestSchema.omit({
  quantityDesired: true,
  comments: true,
})

export const multiQuoteRequestSchema = z.object({
  quantityDesired: z.coerce
    .number()
    .int()
    .min(1, 'La cantidad debe ser mayor a 0'),
  comments: optionalString,
  designItemsJson: z
    .string()
    .min(2, 'Debe incluir al menos una prenda con diseño'),
})

export type QuoteLineItemInput = z.infer<typeof quoteLineItemSchema>
export type MultiQuoteRequestInput = z.infer<typeof multiQuoteRequestSchema>
export type QuoteDeliveryInput = z.infer<typeof quoteDeliverySchema>
