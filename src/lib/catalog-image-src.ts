/** Rutas del catálogo ya recortadas (public/gallery/sin-fondo) */

const SIN_FONDO = '/gallery/sin-fondo'

export function isCatalogRasterSrc(src: string): boolean {
  const p = src.split('?')[0]
  return (
    p.startsWith(`${SIN_FONDO}/`) ||
    p.startsWith('/gallery/imagenes/') ||
    (p.startsWith('/gallery/presets/') && /\.(png|jpe?g|webp)$/i.test(p))
  )
}

export function isSvgSrc(src: string): boolean {
  return src.split('?')[0].toLowerCase().endsWith('.svg')
}

/** URL pública del PNG sin fondo para un archivo de imagenes/ o presets/ */
export function transparentCatalogSrc(originalSrc: string): string {
  const pathOnly = originalSrc.split('?')[0]
  if (pathOnly.startsWith(`${SIN_FONDO}/`)) return pathOnly

  if (pathOnly.startsWith('/gallery/imagenes/')) {
    const file = decodeURIComponent(pathOnly.slice('/gallery/imagenes/'.length))
    const base = file.replace(/\.[^.]+$/, '')
    return `${SIN_FONDO}/imagenes/${encodeURIComponent(base)}.png`
  }

  if (pathOnly.startsWith('/gallery/presets/')) {
    const file = pathOnly.slice('/gallery/presets/'.length)
    const base = file.replace(/\.[^.]+$/, '')
    return `${SIN_FONDO}/presets/${base}.png`
  }

  return pathOnly
}

export async function catalogAssetExists(src: string): Promise<boolean> {
  try {
    const res = await fetch(src, { method: 'HEAD' })
    return res.ok
  } catch {
    return false
  }
}

/** Preferir PNG del catálogo sin fondo; si no existe, la original */
export async function resolveCatalogDisplaySrc(src: string): Promise<string> {
  if (isSvgSrc(src)) return src
  const transparent = transparentCatalogSrc(src)
  if (transparent !== src && (await catalogAssetExists(transparent))) {
    return transparent
  }
  return src
}
