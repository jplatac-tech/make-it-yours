/** ID corto y legible para identificar un diseño en cotizaciones (WhatsApp, comprar, editor). */
export function getDesignRefId(itemId: string): string {
  const compact = itemId.replace(/-/g, '').toUpperCase()
  const short = compact.slice(0, 8)
  return `MIY-${short}`
}

export function getDesignLabel(itemId: string): string {
  return `Diseño ${getDesignRefId(itemId)}`
}
