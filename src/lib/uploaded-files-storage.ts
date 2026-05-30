export const UPLOADS_STORAGE_KEY = 'make-it-yours-uploads'

export type UploadedFile = {
  id: string
  name: string
  src: string
  createdAt: number
}

const MAX_ITEMS = 30
const MAX_DIMENSION = 2400
const JPEG_QUALITY = 0.85

export function loadUploadedFiles(): UploadedFile[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(UPLOADS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as UploadedFile[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveUploadedFiles(files: UploadedFile[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(UPLOADS_STORAGE_KEY, JSON.stringify(files))
}

export function removeUploadedFile(id: string) {
  const next = loadUploadedFiles().filter((f) => f.id !== id)
  saveUploadedFiles(next)
  return next
}

export async function compressImageToDataUrl(file: File): Promise<string> {
  const dataUrl = await readFileAsDataUrl(file)
  const img = await loadImage(dataUrl)

  let { width, height } = img
  const maxSide = Math.max(width, height)
  if (maxSide > MAX_DIMENSION) {
    const ratio = MAX_DIMENSION / maxSide
    width = Math.round(width * ratio)
    height = Math.round(height * ratio)
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return dataUrl
  ctx.drawImage(img, 0, 0, width, height)

  const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
  if (mime === 'image/png') {
    return canvas.toDataURL('image/png')
  }
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY)
}

export async function addUploadedFile(
  name: string,
  dataUrl: string,
): Promise<UploadedFile[]> {
  const entry: UploadedFile = {
    id: `up-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    src: dataUrl,
    createdAt: Date.now(),
  }
  const current = loadUploadedFiles()
  const next = [entry, ...current].slice(0, MAX_ITEMS)
  saveUploadedFiles(next)
  return next
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('invalid file'))
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('image load failed'))
    img.src = src
  })
}
