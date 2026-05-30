/**
 * Recursos con licencia apta para merch / uso comercial en esta tienda:
 * - presets/: SVG creados para el proyecto (libre uso en la app)
 * - posters: Wikimedia Commons — dominio público (US) o licencia del archivo
 * - openmoji: OpenMoji (CC BY-SA 4.0) — atribución en UI
 */

export type GalleryItem = {
  id: string
  title: string
  category: 'preset' | 'band-poster' | 'open-graphic'
  src: string
  attribution?: string
  license?: string
  tags?: string[]
}

const PRESET_DESIGNS: GalleryItem[] = [
  { id: 'preset-retro-sun', title: 'Sol retro', category: 'preset', src: '/gallery/presets/retro-sun.svg', license: 'Proyecto', tags: ['vintage'] },
  { id: 'preset-punk-stripes', title: 'Rayas punk', category: 'preset', src: '/gallery/presets/punk-stripes.svg', license: 'Proyecto', tags: ['punk'] },
  { id: 'preset-rock-bolt', title: 'Rayo rock', category: 'preset', src: '/gallery/presets/rock-bolt.svg', license: 'Proyecto', tags: ['rock'] },
  { id: 'preset-minimal-circle', title: 'Círculos minimal', category: 'preset', src: '/gallery/presets/minimal-circles.svg', license: 'Proyecto', tags: ['minimal'] },
  { id: 'preset-flame', title: 'Llama', category: 'preset', src: '/gallery/presets/flame.svg', license: 'Proyecto', tags: ['fuego'] },
  { id: 'preset-star', title: 'Estrella', category: 'preset', src: '/gallery/presets/star-badge.svg', license: 'Proyecto', tags: ['badge'] },
  { id: 'preset-wings', title: 'Alas', category: 'preset', src: '/gallery/presets/wings.svg', license: 'Proyecto', tags: ['street'] },
  { id: 'preset-smile', title: 'Smiley', category: 'preset', src: '/gallery/presets/smile.svg', license: 'Proyecto', tags: ['fun'] },
]

/** Posters históricos — Wikimedia Commons (ver cada archivo) */
const BAND_POSTERS: GalleryItem[] = [
  {
    id: 'woodstock-1969',
    title: 'Woodstock 1969',
    category: 'band-poster',
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Woodstock_poster.jpg/330px-Woodstock_poster.jpg',
    attribution: 'Woodstock Festival poster, 1969',
    license: 'Public domain (US)',
    tags: ['vintage', 'poster'],
  },
  {
    id: 'altamont-1969',
    title: 'Altamont Free Concert',
    category: 'band-poster',
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Altamont_free_concert_poster.jpg/330px-Altamont_free_concert_poster.jpg',
    attribution: 'Rolling Stones at Altamont, 1969',
    license: 'Public domain (US)',
    tags: ['vintage', 'poster'],
  },
  {
    id: 'mantra-rock-1967',
    title: 'Mantra-Rock Dance',
    category: 'band-poster',
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/1967_Mantra-Rock_Dance_Avalon_poster.jpg/330px-1967_Mantra-Rock_Dance_Avalon_poster.jpg',
    attribution: 'Harvey W. Cohen, 1967',
    license: 'Commons — ver archivo',
    tags: ['psychedelic'],
  },
  {
    id: 'monterey-1967',
    title: 'Monterey Pop Festival',
    category: 'band-poster',
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Monterey_Pop_Festival_poster.jpg/330px-Monterey_Pop_Festival_poster.jpg',
    attribution: 'Monterey Pop Festival poster, 1967',
    license: 'Public domain (US)',
    tags: ['vintage', 'poster'],
  },
]

export const DESIGN_GALLERY: GalleryItem[] = [...PRESET_DESIGNS, ...BAND_POSTERS]

export const GALLERY_PRESETS = PRESET_DESIGNS
export const GALLERY_BAND_POSTERS = BAND_POSTERS

export const GALLERY_LICENSE_NOTE =
  'Gráficos del proyecto y dominio público (Wikimedia) pueden usarse en pedidos de esta tienda. Posters de Commons: ver licencia en cada obra.'
