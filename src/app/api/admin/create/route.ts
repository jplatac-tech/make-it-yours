'use server'

import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import { join } from 'path'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, secret } = body as { email?: string; secret?: string }

    if (!email) {
      return NextResponse.json({ error: 'email required' }, { status: 400 })
    }

    const expected = process.env.ADMIN_CREATION_SECRET
    if (!expected || secret !== expected) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const filePath = join(process.cwd(), 'data', 'admins.json')
    let admins: string[] = []
    try {
      const raw = await fs.readFile(filePath, 'utf-8')
      admins = JSON.parse(raw) as string[]
    } catch {
      // file missing -> start with empty list
      admins = []
    }

    if (!admins.includes(email)) {
      admins.push(email)
      await fs.mkdir(join(process.cwd(), 'data'), { recursive: true })
      await fs.writeFile(filePath, JSON.stringify(admins, null, 2), 'utf-8')
    }

    return NextResponse.json({ ok: true, isAdmin: true })
  } catch (err) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }
}
