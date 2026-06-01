import { z } from 'zod'

export const quoteRequestSchema = z.object({
  productSlug: z.enum(['camiseta-unisex', 'hoodie-unisex', 'crewneck-unisex']),
  productColor: z.enum(['BLACK', 'WHITE', 'BEIGE', 'HEATHER_GRAY']),
  productSize: z.enum(['S', 'M', 'L', 'XL']),
  printZone: z.enum(['FRONT', 'BACK']),
  designJson: z.string().min(2, 'El diseño es obligatorio'),
  finalWidthIn: z.coerce.number().positive(),
  finalHeightIn: z.coerce.number().positive(),
  quantityDesired: z.coerce
    .number()
    .int()
    .min(1, 'La cantidad debe ser mayor a 0'),
  comments: z.string().optional(),
  mockupDataUrl: z.string().optional(),
  technicalDataUrl: z.string().optional(),
  mockupDataUrl_FRONT: z.string().optional(),
  mockupDataUrl_BACK: z.string().optional(),
  technicalDataUrl_FRONT: z.string().optional(),
  technicalDataUrl_BACK: z.string().optional(),
})

export const quoteDeliverySchema = z.object({
  quoteId: z.string().min(1),
  customerName: z.string().min(2, 'Indica tu nombre'),
  customerEmail: z
    .string()
    .email('Correo inválido')
    .optional()
    .or(z.literal('')),
  customerWhatsapp: z.string().min(8, 'Indica un WhatsApp válido'),
  neededBy: z.string().optional().or(z.literal('')),
  deliveryNotes: z.string().optional(),
})

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>
export type QuoteDeliveryInput = z.infer<typeof quoteDeliverySchema>
