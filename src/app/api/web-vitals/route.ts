'use server'

import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const metric = (await request.json()) as {
      name: string
      value: number
      delta: number
      id: string
      label: string
    }

    console.info('[Web Vitals]', metric)

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'invalid_metric' }, { status: 400 })
  }
}
