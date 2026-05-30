/** Fuentes Google Fonts — OFL, aptas para estampado (display, sans, serif, script) */

export type EditorFont = {
  name: string
  category: 'sans' | 'serif' | 'display' | 'handwriting' | 'mono'
  weights?: string
}

export const EDITOR_FONTS: EditorFont[] = [
  // Sans — legibles en merch
  { name: 'Inter', category: 'sans', weights: '400;600;800' },
  { name: 'Roboto', category: 'sans', weights: '400;700;900' },
  { name: 'Open Sans', category: 'sans', weights: '400;600;700' },
  { name: 'Lato', category: 'sans', weights: '400;700;900' },
  { name: 'Montserrat', category: 'sans', weights: '400;600;800' },
  { name: 'Poppins', category: 'sans', weights: '400;600;800' },
  { name: 'Nunito', category: 'sans', weights: '400;700;800' },
  { name: 'Work Sans', category: 'sans', weights: '400;600;800' },
  { name: 'DM Sans', category: 'sans', weights: '400;700' },
  { name: 'Outfit', category: 'sans', weights: '400;600;800' },
  { name: 'Manrope', category: 'sans', weights: '400;600;800' },
  { name: 'Rubik', category: 'sans', weights: '400;700;900' },
  { name: 'Ubuntu', category: 'sans', weights: '400;700' },
  { name: 'Raleway', category: 'sans', weights: '400;700' },
  { name: 'Space Grotesk', category: 'sans', weights: '400;600;700' },
  { name: 'Barlow', category: 'sans', weights: '400;600;800' },
  { name: 'Barlow Condensed', category: 'sans', weights: '400;600;700' },
  { name: 'Saira Condensed', category: 'sans', weights: '400;600;800' },
  { name: 'Teko', category: 'sans', weights: '400;500;600;700' },
  { name: 'Oswald', category: 'sans', weights: '400;600;700' },
  // Display — impacto en estampado
  { name: 'Bebas Neue', category: 'display' },
  { name: 'Anton', category: 'display' },
  { name: 'Archivo Black', category: 'display' },
  { name: 'Righteous', category: 'display' },
  { name: 'Bangers', category: 'display' },
  { name: 'Bungee', category: 'display' },
  { name: 'Fredoka', category: 'display', weights: '400;600;700' },
  { name: 'Luckiest Guy', category: 'display' },
  { name: 'Russo One', category: 'display' },
  { name: 'Staatliches', category: 'display' },
  { name: 'Alfa Slab One', category: 'display' },
  { name: 'Black Ops One', category: 'display' },
  { name: 'Passion One', category: 'display', weights: '400;700;900' },
  { name: 'Paytone One', category: 'display' },
  { name: 'Titan One', category: 'display' },
  { name: 'Abril Fatface', category: 'display' },
  { name: 'Lilita One', category: 'display' },
  { name: 'Bowlby One', category: 'display' },
  { name: 'Fugaz One', category: 'display' },
  { name: 'Sonsie One', category: 'display' },
  // Serif
  { name: 'Playfair Display', category: 'serif', weights: '400;700' },
  { name: 'Merriweather', category: 'serif', weights: '400;700' },
  { name: 'Lora', category: 'serif', weights: '400;700' },
  { name: 'Libre Baskerville', category: 'serif', weights: '400;700' },
  { name: 'Bitter', category: 'serif', weights: '400;700' },
  { name: 'Cormorant Garamond', category: 'serif', weights: '400;600;700' },
  { name: 'Cinzel', category: 'serif', weights: '400;700' },
  // Script / handwriting
  { name: 'Pacifico', category: 'handwriting' },
  { name: 'Dancing Script', category: 'handwriting', weights: '400;700' },
  { name: 'Caveat', category: 'handwriting', weights: '400;700' },
  { name: 'Permanent Marker', category: 'handwriting' },
  { name: 'Satisfy', category: 'handwriting' },
  { name: 'Great Vibes', category: 'handwriting' },
  { name: 'Lobster', category: 'handwriting' },
  { name: 'Sacramento', category: 'handwriting' },
  { name: 'Kaushan Script', category: 'handwriting' },
  // Mono
  { name: 'Roboto Mono', category: 'mono', weights: '400;700' },
  { name: 'JetBrains Mono', category: 'mono', weights: '400;700' },
]

const DEFAULT_FONT = EDITOR_FONTS[0]?.name ?? 'Inter'

export function getDefaultFontFamily() {
  return DEFAULT_FONT
}

function buildChunkUrl(fonts: EditorFont[]) {
  const families = fonts.map((f) => {
    const encoded = f.name.replace(/ /g, '+')
    if (f.weights) return `family=${encoded}:wght@${f.weights}`
    return `family=${encoded}`
  })
  return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`
}

const CHUNK_SIZE = 16

export function getGoogleFontsStylesheets(): string[] {
  const sheets: string[] = []
  for (let i = 0; i < EDITOR_FONTS.length; i += CHUNK_SIZE) {
    sheets.push(buildChunkUrl(EDITOR_FONTS.slice(i, i + CHUNK_SIZE)))
  }
  return sheets
}

/** @deprecated Usar getGoogleFontsStylesheets */
export const GOOGLE_FONTS_STYLESHEET = getGoogleFontsStylesheets()[0] ?? ''

export const FONT_CATEGORIES = [
  { id: 'all', label: 'Todas' },
  { id: 'sans', label: 'Sans' },
  { id: 'display', label: 'Display' },
  { id: 'handwriting', label: 'Script' },
  { id: 'serif', label: 'Serif' },
  { id: 'mono', label: 'Mono' },
] as const
