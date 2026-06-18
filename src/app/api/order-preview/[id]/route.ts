import { NextResponse } from 'next/server'
import { loadOrderPreview, sanitizePreviewId } from '../../../../lib/order-preview-store'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params
  const safeId = sanitizePreviewId(id)
  const buffer = loadOrderPreview(safeId)

  if (!buffer) {
    return NextResponse.json({ error: 'Vista previa no encontrada' }, { status: 404 })
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=604800, immutable',
    },
  })
}
