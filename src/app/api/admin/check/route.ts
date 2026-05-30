'use server'

import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import { join } from 'path'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const email = url.searchParams.get('email')
  // Try to read persisted admins list from data/admins.json
  try {
    const filePath = join(process.cwd(), 'data', 'admins.json')
    const raw = await fs.readFile(filePath, 'utf-8')
    const admins = JSON.parse(raw) as string[]
    return NextResponse.json({
      isAdmin: email ? admins.includes(email) : false,
    })
  } catch (err) {
    // Fallback to ADMIN_USERS env var (comma separated)
    const env = process.env.ADMIN_USERS || ''
    const admins = env
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    return NextResponse.json({
      isAdmin: email ? admins.includes(email) : false,
    })
  }
}
