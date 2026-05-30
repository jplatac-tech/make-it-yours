/** Combinaciones de texto estilo Canva — un clic para añadir al mockup */

export type TextPreset = {
  id: string
  label: string
  preview: string
  text: string
  fontFamily: string
  fontSize: number
  fontWeight: number
  letterSpacing?: number
}

export const TEXT_PRESETS: TextPreset[] = [
  {
    id: 'title-bold',
    label: 'Título impacto',
    preview: 'TÍTULO',
    text: 'Título',
    fontFamily: 'Bebas Neue',
    fontSize: 56,
    fontWeight: 400,
  },
  {
    id: 'brand',
    label: 'Marca',
    preview: 'Tu marca',
    text: 'Tu marca',
    fontFamily: 'Archivo Black',
    fontSize: 42,
    fontWeight: 400,
  },
  {
    id: 'subtitle',
    label: 'Subtítulo',
    preview: 'Subtítulo',
    text: 'Subtítulo',
    fontFamily: 'Montserrat',
    fontSize: 22,
    fontWeight: 600,
  },
  {
    id: 'script',
    label: 'Manuscrita',
    preview: 'Firma',
    text: 'Firma',
    fontFamily: 'Pacifico',
    fontSize: 36,
    fontWeight: 400,
  },
  {
    id: 'quote',
    label: 'Cita',
    preview: 'Tu frase aquí',
    text: 'Tu frase aquí',
    fontFamily: 'Playfair Display',
    fontSize: 28,
    fontWeight: 700,
  },
  {
    id: 'street',
    label: 'Street',
    preview: 'STREET',
    text: 'STREET',
    fontFamily: 'Anton',
    fontSize: 48,
    fontWeight: 400,
    letterSpacing: 2,
  },
  {
    id: 'minimal',
    label: 'Minimal',
    preview: 'minimal',
    text: 'minimal',
    fontFamily: 'Space Grotesk',
    fontSize: 32,
    fontWeight: 600,
  },
  {
    id: 'mono-tag',
    label: 'Etiqueta',
    preview: 'EST. 2026',
    text: 'EST. 2026',
    fontFamily: 'Roboto Mono',
    fontSize: 14,
    fontWeight: 400,
    letterSpacing: 4,
  },
]
