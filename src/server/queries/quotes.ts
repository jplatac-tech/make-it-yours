import { prisma } from '../../lib/prisma'

export type AdminQuoteSummary = {
  id: string
  requestNumber: string
  customer: string
  product: string
  quantity: number
  neededBy: string | null
  status: string
  createdAt: string
}

export type AdminQuotesResult = {
  quotes: AdminQuoteSummary[]
  dbUnavailable: boolean
}

export async function getAdminQuotes(): Promise<AdminQuotesResult> {
  try {
    const quotes = (await prisma.quoteRequest.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        requestNumber: true,
        customerName: true,
        status: true,
        quantityDesired: true,
        neededBy: true,
        createdAt: true,
        items: {
          select: {
            productVariant: {
              select: {
                product: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          take: 1,
        },
      },
    })) as Array<{
      id: string
      requestNumber: string
      customerName: string
      status: string
      quantityDesired: number
      neededBy: Date | null
      createdAt: Date
      items: Array<{
        productVariant: {
          product: { name: string } | null
        } | null
      }>
    }>

    return {
      dbUnavailable: false,
      quotes: quotes.map((quote) => ({
        id: quote.id,
        requestNumber: quote.requestNumber,
        customer: quote.customerName,
        product:
          quote.items[0]?.productVariant?.product?.name ?? 'Sin producto',
        quantity: quote.quantityDesired,
        neededBy: quote.neededBy?.toISOString().split('T')[0] ?? null,
        status: quote.status,
        createdAt: quote.createdAt.toISOString().split('T')[0],
      })),
    }
  } catch {
    return { quotes: [], dbUnavailable: true }
  }
}

export async function getQuoteRequest(id: string) {
  try {
    return await prisma.quoteRequest.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            productVariant: {
              include: {
                product: true,
              },
            },
            printZone: true,
            assets: true,
          },
        },
        assets: true,
        statusHistory: {
          orderBy: { changedAt: 'desc' },
        },
      },
    })
  } catch {
    return null
  }
}
