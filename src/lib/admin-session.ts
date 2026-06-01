/** Sesión admin — compatible con Edge (sin fs ni node:crypto). */

export const ADMIN_SESSION_COOKIE = 'miy_admin_session'
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7

export function getAdminSessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.ADMIN_CREATION_SECRET?.trim() ||
    ''
  )
}

function base64UrlEncode(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(b64: string): string {
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4))
  const base64 = b64.replace(/-/g, '+').replace(/_/g, '/') + pad
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let out = 0
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return out === 0
}

export async function signAdminSession(email: string): Promise<string | null> {
  const secret = getAdminSessionSecret()
  if (!secret) return null
  const exp = Date.now() + SESSION_MAX_AGE_SEC * 1000
  const payload = `${email.trim().toLowerCase()}|${exp}`
  const sig = await hmacSha256Hex(secret, payload)
  return `${base64UrlEncode(payload)}.${sig}`
}

export async function verifyAdminSession(
  token: string | undefined,
): Promise<boolean> {
  const secret = getAdminSessionSecret()
  if (!token || !secret) return false
  try {
    const dot = token.lastIndexOf('.')
    if (dot < 1) return false
    const payloadB64 = token.slice(0, dot)
    const sig = token.slice(dot + 1)
    const payload = base64UrlDecode(payloadB64)
    const expected = await hmacSha256Hex(secret, payload)
    if (!timingSafeEqualHex(sig, expected)) return false
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
