import { createHmac, timingSafeEqual } from 'crypto'
import { promises as fs } from 'fs'
import { join } from 'path'

export const ADMIN_SESSION_COOKIE = 'miy_admin_session'
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7

export function getAdminSessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.ADMIN_CREATION_SECRET?.trim() ||
    ''
  )
}

export async function getAdminEmails(): Promise<string[]> {
  try {
    const filePath = join(process.cwd(), 'data', 'admins.json')
    const raw = await fs.readFile(filePath, 'utf-8')
    const admins = JSON.parse(raw) as string[]
    return admins.map((e) => e.trim().toLowerCase()).filter(Boolean)
  } catch {
    const env = process.env.ADMIN_USERS || ''
    return env
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  }
}

export async function isAdminEmail(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase()
  if (!normalized) return false
  const admins = await getAdminEmails()
  return admins.includes(normalized)
}

export function signAdminSession(email: string): string | null {
  const secret = getAdminSessionSecret()
  if (!secret) return null
  const exp = Date.now() + SESSION_MAX_AGE_SEC * 1000
  const payload = `${email.trim().toLowerCase()}|${exp}`
  const sig = createHmac('sha256', secret).update(payload).digest('hex')
  return `${Buffer.from(payload, 'utf8').toString('base64url')}.${sig}`
}

export function verifyAdminSession(token: string | undefined): boolean {
  const secret = getAdminSessionSecret()
  if (!token || !secret) return false
  try {
    const dot = token.lastIndexOf('.')
    if (dot < 1) return false
    const payloadB64 = token.slice(0, dot)
    const sig = token.slice(dot + 1)
    const payload = Buffer.from(payloadB64, 'base64url').toString('utf8')
    const expected = createHmac('sha256', secret).update(payload).digest('hex')
    const a = Buffer.from(sig, 'utf8')
    const b = Buffer.from(expected, 'utf8')
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false
    const parts = payload.split('|')
    const exp = Number(parts[parts.length - 1])
    return Number.isFinite(exp) && Date.now() < exp
  } catch {
    return false
  }
}

export function adminSessionCookieOptions(maxAge = SESSION_MAX_AGE_SEC) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  }
}
