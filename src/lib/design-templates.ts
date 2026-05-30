import type { DesignShape } from '../types/design'
import type { PrintZoneValue, ProductColorValue } from './products'

export type DesignTemplate = {
  id: string
  title: string
  description: string
  category: 'blank' | 'merch' | 'vintage' | 'minimal'
  previewClass: string
  productColor?: ProductColorValue
  shapesByZone: Record<PrintZoneValue, DesignShape[]>
}

function textShape(
  id: string,
  content: string,
  opts: Partial<DesignShape> = {},
): DesignShape {
  return {
  id,
  type: 'text',
  x: 125,
  y: 285,
  text: content,
  fontSize: 42,
  fontFamily: 'Bebas Neue',
  fontWeight: 600,
  color: '#111827',
  scale: 1,
  rotation: 0,
  ...opts,
  }
}

export const DESIGN_TEMPLATES: DesignTemplate[] = [
  {
    id: 'blank',
    title: 'Lienzo en blanco',
    description: 'Sin elementos; agrega texto y gráficos en el editor.',
    category: 'blank',
    previewClass: 'from-slate-100 to-slate-200',
    shapesByZone: { FRONT: [], BACK: [] },
  },
  {
    id: 'street-brand',
    title: 'Texto grande centrado',
    description: 'Ideal para nombre de marca o frase principal.',
    category: 'merch',
    previewClass: 'from-violet-200 to-fuchsia-100',
    productColor: 'BLACK',
    shapesByZone: {
      FRONT: [
        textShape('tpl-street-main', 'Tu marca', {
          fontFamily: 'Bebas Neue',
          fontSize: 52,
          color: '#ffffff',
          y: 268,
        }),
        textShape('tpl-street-sub', 'Tu eslogan', {
          fontFamily: 'Roboto Mono',
          fontSize: 14,
          fontWeight: 400,
          color: '#e2e8f0',
          y: 318,
          letterSpacing: 2,
        }),
      ],
      BACK: [],
    },
  },
  {
    id: 'retro-sun',
    title: 'Gráfico retro',
    description: 'Ilustración de sol + texto inferior.',
    category: 'vintage',
    previewClass: 'from-amber-100 to-orange-200',
    productColor: 'BEIGE',
    shapesByZone: {
      FRONT: [
        {
          id: 'tpl-sun-img',
          type: 'image',
          x: 132,
          y: 248,
          src: '/gallery/presets/retro-sun.svg',
          width: 136,
          height: 136,
          scale: 1,
        },
        textShape('tpl-sun-text', 'Tu frase', {
          fontFamily: 'Righteous',
          fontSize: 28,
          color: '#92400e',
          y: 355,
        }),
      ],
      BACK: [],
    },
  },
  {
    id: 'minimal-circle',
    title: 'Estilo minimal',
    description: 'Círculos decorativos y texto corto.',
    category: 'minimal',
    previewClass: 'from-sky-50 to-indigo-100',
    productColor: 'WHITE',
    shapesByZone: {
      FRONT: [
        {
          id: 'tpl-circles',
          type: 'image',
          x: 145,
          y: 258,
          src: '/gallery/presets/minimal-circles.svg',
          width: 110,
          height: 110,
          scale: 1,
        },
        textShape('tpl-min-text', 'Tu frase', {
          fontFamily: 'Montserrat',
          fontSize: 22,
          fontWeight: 600,
          color: '#1e3a5f',
          y: 348,
        }),
      ],
      BACK: [],
    },
  },
  {
    id: 'rock-poster',
    title: 'Estilo rock',
    description: 'Rayo + titular llamativo.',
    category: 'vintage',
    previewClass: 'from-neutral-800 to-neutral-600',
    productColor: 'BLACK',
    shapesByZone: {
      FRONT: [
        {
          id: 'tpl-bolt',
          type: 'image',
          x: 168,
          y: 248,
          src: '/gallery/presets/rock-bolt.svg',
          width: 64,
          height: 96,
          scale: 1.1,
        },
        textShape('tpl-rock-text', 'Tu banda', {
          fontFamily: 'Anton',
          fontSize: 44,
          color: '#fef08a',
          y: 328,
        }),
      ],
      BACK: [],
    },
  },
  {
    id: 'front-back-logo',
    title: 'Frente y espalda',
    description: 'Texto pequeño al frente y grande atrás.',
    category: 'merch',
    previewClass: 'from-emerald-50 to-teal-100',
    productColor: 'HEATHER_GRAY',
    shapesByZone: {
      FRONT: [
        textShape('tpl-fb-front', 'Logo', {
          fontFamily: 'Pacifico',
          fontSize: 36,
          color: '#0f766e',
          x: 168,
          y: 278,
        }),
      ],
      BACK: [
        textShape('tpl-fb-back', 'Tu diseño', {
          fontFamily: 'Archivo Black',
          fontSize: 56,
          color: '#111827',
          x: 108,
          y: 278,
        }),
      ],
    },
  },
]

export function getTemplateById(id: string) {
  return DESIGN_TEMPLATES.find((t) => t.id === id)
}
