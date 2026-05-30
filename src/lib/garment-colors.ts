import type { ProductColorValue } from './products'

/** Colores reales de prenda para el mockup SVG */
export const GARMENT_COLOR_HEX: Record<
  ProductColorValue,
  { fill: string; stroke: string; ribbing: string; highlight: string }
> = {
  BLACK: {
    fill: '#000000',
    stroke: '#1a1a1a',
    ribbing: '#0a0a0a',
    highlight: 'rgba(255,255,255,0.06)',
  },
  WHITE: {
    fill: '#ffffff',
    stroke: '#d4d4d4',
    ribbing: '#f0f0f0',
    highlight: 'rgba(255,255,255,0.5)',
  },
  BEIGE: {
    fill: '#d9c4a0',
    stroke: '#b9a080',
    ribbing: '#c9b090',
    highlight: 'rgba(255,255,255,0.2)',
  },
  HEATHER_GRAY: {
    fill: '#8a8f98',
    stroke: '#6b7078',
    ribbing: '#7a7f88',
    highlight: 'rgba(255,255,255,0.15)',
  },
}

export function defaultElementColor(garment: ProductColorValue): string {
  return garment === 'BLACK' || garment === 'HEATHER_GRAY' ? '#ffffff' : '#111111'
}
