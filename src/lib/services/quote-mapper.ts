import type { QuoteRequestInput } from '../../lib/validations/quote'

export function normalizeQuoteInput(input: QuoteRequestInput) {
  const designJson = JSON.parse(input.designJson) as Record<string, unknown>

  return {
    ...input,
    comments: input.comments?.trim() || null,
    designJson: {
      ...designJson,
      exports: {
        mockupDataUrl: input.mockupDataUrl ?? null,
        technicalDataUrl: input.technicalDataUrl ?? null,
      },
    },
    mockupDataUrl: input.mockupDataUrl ?? null,
    technicalDataUrl: input.technicalDataUrl ?? null,
  }
}
