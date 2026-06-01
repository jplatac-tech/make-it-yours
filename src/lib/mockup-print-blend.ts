import type { ProductColorValue } from './products'

/**
 * Modo de fusión del diseño sobre la foto del suéter (simula tinta en tela).
 * - Prendas claras: multiply (la tela “absorbe” el color)
 * - Negro: screen (tinta clara sobre tela oscura)
 */
export type MockupPrintBlendMode = 'multiply' | 'screen' | 'soft-light'

export function getMockupPrintBlendMode(
  color: ProductColorValue,
): MockupPrintBlendMode {
  switch (color) {
    case 'BLACK':
      return 'screen'
    case 'HEATHER_GRAY':
      return 'soft-light'
    case 'BEIGE':
    case 'WHITE':
    default:
      return 'multiply'
  }
}

/** Opacidad del diseño sobre la prenda (ligero ajuste por color) */
export function getMockupPrintLayerOpacity(color: ProductColorValue): number {
  if (color === 'HEATHER_GRAY') return 0.94
  if (color === 'BLACK') return 0.92
  return 1
}
