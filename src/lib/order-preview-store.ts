import fs from 'node:fs'
import path from 'node:path'

const globalForPreview = globalThis as unknown as {
  orderPreviewCache?: Map<string, Buffer>
}

const memoryCache =
  globalForPreview.orderPreviewCache ?? new Map<string, Buffer>()
globalForPreview.orderPreviewCache = memoryCache

const PREVIEW_DIR = path.join(process.cwd(), 'public', 'order-previews')

export function sanitizePreviewId(id: string): string {
  return id.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 120)
}

export function saveOrderPreview(id: string, buffer: Buffer): void {
  const safeId = sanitizePreviewId(id)
  memoryCache.set(safeId, buffer)

  try {
    fs.mkdirSync(PREVIEW_DIR, { recursive: true })
    fs.writeFileSync(path.join(PREVIEW_DIR, `${safeId}.png`), buffer)
  } catch {
    /* En serverless el disco puede ser de solo lectura; memoria + GET API bastan */
  }
}

export function loadOrderPreview(id: string): Buffer | null {
  const safeId = sanitizePreviewId(id)
  const fromMemory = memoryCache.get(safeId)
  if (fromMemory) return fromMemory

  try {
    const filePath = path.join(PREVIEW_DIR, `${safeId}.png`)
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath)
    }
  } catch {
    /* ignore */
  }

  return null
}
