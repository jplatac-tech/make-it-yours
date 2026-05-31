import {
  isCatalogRasterSrc,
  isSvgSrc,
  resolveCatalogDisplaySrc,
} from './catalog-image-src'
import { resolveImageSrc } from './resolve-image-src'

function isRasterForBgRemoval(src: string): boolean {
  const path = src.split('?')[0].toLowerCase()
  return /\.(png|jpe?g|webp|gif|bmp|avif)$/.test(path) || path.startsWith('data:image/')
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('No se pudo leer la imagen'))
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

async function runRemoval(imageSrc: string): Promise<string> {
  const { removeBackground } = await import('@imgly/background-removal')
  const blob = await removeBackground(imageSrc, {
    model: 'isnet_quint8',
    output: { format: 'image/png' },
  })
  return blobToDataUrl(blob)
}

/** Precarga el modelo en segundo plano (editor / probar diseño) */
export function preloadBackgroundRemoval(): void {
  if (typeof window === 'undefined') return
  void import('@imgly/background-removal')
}

/**
 * Quita el fondo para que el gráfico se vea bien en cualquier color de prenda.
 * Si falla, devuelve la imagen original.
 */
export async function removeImageBackground(imageSrc: string): Promise<string> {
  if (!isRasterForBgRemoval(imageSrc)) return imageSrc
  try {
    return await runRemoval(imageSrc)
  } catch {
    return imageSrc
  }
}

/** Catálogo: PNG sin fondo en /gallery/sin-fondo. Subidas: quitar fondo en el navegador. */
export async function resolveAndPrepareDesignImage(src: string): Promise<string> {
  if (isSvgSrc(src)) return resolveImageSrc(src)
  if (isCatalogRasterSrc(src)) {
    const display = await resolveCatalogDisplaySrc(src)
    return resolveImageSrc(display)
  }
  const resolved = await resolveImageSrc(src)
  if (!isRasterForBgRemoval(src)) return resolved
  return removeImageBackground(resolved)
}
