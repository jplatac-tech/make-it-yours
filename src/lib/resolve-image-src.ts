/** Convierte URL externa en data URL vía proxy del servidor */
export async function resolveImageSrc(src: string): Promise<string> {
  if (!src.startsWith('http')) {
    return src
  }

  const res = await fetch(`/api/fetch-image?url=${encodeURIComponent(src)}`)
  if (!res.ok) {
    throw new Error('No se pudo cargar la imagen')
  }

  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('invalid blob'))
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

export function loadImageDimensions(
  src: string,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = () => reject(new Error('image load failed'))
    img.src = src
  })
}

/**
 * Escala proporcional al lado máximo indicado (puede agrandar imágenes pequeñas).
 * Si maxSide es 0 o negativo, devuelve el tamaño natural.
 */
export function fitImageSize(
  width: number,
  height: number,
  maxSide = 0,
): { width: number; height: number } {
  if (maxSide <= 0) {
    return {
      width: Math.max(1, Math.round(width)),
      height: Math.max(1, Math.round(height)),
    }
  }
  const ratio = Math.min(maxSide / width, maxSide / height)
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  }
}

/** Tamaño inicial al insertar: tan grande como quepa en el lienzo (puede agrandar) */
export function fitImageInitialOnCanvas(
  width: number,
  height: number,
  canvasW: number,
  canvasH: number,
): { width: number; height: number } {
  return fitImageSize(width, height, Math.max(canvasW, canvasH) * 0.95)
}
