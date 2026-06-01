import type { QuoteRequestInput } from '../../lib/validations/quote'
import type { PrintZoneValue } from '../products'

export function normalizeQuoteInput(input: QuoteRequestInput) {
  const designJson = JSON.parse(input.designJson) as Record<string, unknown>

  const mockupsByZone: Partial<Record<PrintZoneValue, string | null>> = {}
  const technicalsByZone: Partial<Record<PrintZoneValue, string | null>> = {}
  for (const zone of ['FRONT', 'BACK'] as PrintZoneValue[]) {
    const mockup = input[`mockupDataUrl_${zone}` as keyof QuoteRequestInput]
    const technical =
      input[`technicalDataUrl_${zone}` as keyof QuoteRequestInput]
    if (typeof mockup === 'string' && mockup) mockupsByZone[zone] = mockup
    if (typeof technical === 'string' && technical) {
      technicalsByZone[zone] = technical
    }
  }

  return {
    ...input,
    comments: input.comments?.trim() || null,
    designJson: {
      ...designJson,
      exports: {
        mockupDataUrl: input.mockupDataUrl ?? null,
        technicalDataUrl: input.technicalDataUrl ?? null,
        mockupsByZone,
        technicalsByZone,
      },
    },
    mockupDataUrl: input.mockupDataUrl ?? null,
    technicalDataUrl: input.technicalDataUrl ?? null,
    mockupsByZone,
    technicalsByZone,
  }
}
