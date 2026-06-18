import { NextResponse } from 'next/server'
import { saveOrderPreview, sanitizePreviewId } from '../../../lib/order-preview-store'

const MAX_BYTES = 2_500_000

export async function POST(request: Request) {
  let body: { id?: string; image?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const id = body.id?.trim()
  const image = body.image?.trim()

  if (!id || !image?.startsWith('data:image/')) {
    return NextResponse.json({ error: 'Faltan id o imagen' }, { status: 400 })
  }

  const safeId = sanitizePreviewId(id)
  if (!safeId) {
    return NextResponse.json({ error: 'Id inválido' }, { status: 400 })
  }

  const base64 = image.replace(/^data:image\/\w+;base64,/, '')
  const buffer = Buffer.from(base64, 'base64')

  if (buffer.length === 0 || buffer.length > MAX_BYTES) {
    return NextResponse.json({ error: 'Imagen demasiado grande' }, { status: 413 })
  }

  saveOrderPreview(safeId, buffer)

  const origin = new URL(request.url).origin
  const url = `${origin}/api/order-preview/${safeId}`

  return NextResponse.json({ id: safeId, url })
}
