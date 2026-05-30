import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: 'make-it-yours',
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  )
}
