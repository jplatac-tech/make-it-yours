/**
 * Recursos extra (posters Wikimedia). Los gráficos SVG locales se eliminaron del disco.
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

/** Sin SVG en disco — solo posters externos */
export const GALLERY_PRESETS: GalleryItem[] = []

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

export const DESIGN_GALLERY: GalleryItem[] = [...GALLERY_PRESETS, ...BAND_POSTERS]

export const GALLERY_BAND_POSTERS = BAND_POSTERS

export const GALLERY_LICENSE_NOTE =
  'Posters de Wikimedia Commons: ver licencia en cada obra. Los diseños del catálogo principal están en la pestaña Diseños.'
