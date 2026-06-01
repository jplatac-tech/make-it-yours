import { NextResponse } from 'next/server'
import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
  isAdminEmail,
  signAdminSession,
} from '../../../../lib/admin-auth'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string }
    const email = body.email?.trim()
    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    const ok = await isAdminEmail(email)
    if (!ok) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const token = signAdminSession(email)
    if (!token) {
      return NextResponse.json(
        { error: 'ADMIN_SESSION_SECRET no configurado en el servidor' },
        { status: 500 },
      )
    }

    const res = NextResponse.json({ success: true })
    res.cookies.set(ADMIN_SESSION_COOKIE, token, adminSessionCookieOptions())
    return res
  } catch {
    return NextResponse.json({ error: 'Error al iniciar sesión' }, { status: 500 })
  }
}
