import { promises as fs } from 'fs'
import { join } from 'path'

/** Lista de admins — solo Node (API routes), no usar en middleware. */

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
