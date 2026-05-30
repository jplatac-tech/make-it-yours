import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_HOSTS = new Set([
  'upload.wikimedia.org',
  'commons.wikimedia.org',
])

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL requerida' }, { status: 400 })
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return NextResponse.json({ error: 'URL inválida' }, { status: 400 })
  }

  if (parsed.protocol !== 'https:' || !ALLOWED_HOSTS.has(parsed.hostname)) {
    return NextResponse.json({ error: 'Origen no permitido' }, { status: 403 })
  }

  try {
    const upstream = await fetch(url, {
      headers: { 'User-Agent': 'MakeItYours/1.0 (design editor)' },
      next: { revalidate: 86400 },
    })

    if (!upstream.ok) {
      return NextResponse.json(
        { error: 'No se pudo descargar la imagen' },
        { status: upstream.status },
      )
    }

    const contentType =
      upstream.headers.get('content-type') ?? 'image/jpeg'
    const buffer = await upstream.arrayBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Error al obtener la imagen' },
      { status: 502 },
    )
  }
}
