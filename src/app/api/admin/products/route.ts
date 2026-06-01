import { NextResponse, type NextRequest } from 'next/server'
import { promises as fs } from 'fs'
import { join } from 'path'
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSession,
} from '../../../../lib/admin-session'

async function canMutateProducts(
  request: NextRequest,
  secret?: string,
): Promise<boolean> {
  const expected = process.env.ADMIN_CREATION_SECRET
  if (expected && secret === expected) return true
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  return verifyAdminSession(token)
}

async function productsFilePath() {
  return join(process.cwd(), 'data', 'products.json')
}

export async function GET() {
  try {
    const filePath = await productsFilePath()
    const raw = await fs.readFile(filePath, 'utf-8')
    const products = JSON.parse(raw)
    return NextResponse.json(products)
  } catch (err) {
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { product, secret } = body as { product?: any; secret?: string }
    if (!(await canMutateProducts(request, secret))) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const filePath = await productsFilePath()
    let products: any[] = []
    try {
      const raw = await fs.readFile(filePath, 'utf-8')
      products = JSON.parse(raw)
    } catch {
      products = []
    }

    if (!product || !product.slug) {
      return NextResponse.json({ error: 'invalid_product' }, { status: 400 })
    }

    products = products.filter((p) => p.slug !== product.slug)
    products.push(product)
    await fs.mkdir(join(process.cwd(), 'data'), { recursive: true })
    await fs.writeFile(filePath, JSON.stringify(products, null, 2), 'utf-8')

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { slug, secret } = body as { slug?: string; secret?: string }
    if (!(await canMutateProducts(request, secret))) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    if (!slug)
      return NextResponse.json({ error: 'slug required' }, { status: 400 })

    const filePath = await productsFilePath()
    let products: any[] = []
    try {
      const raw = await fs.readFile(filePath, 'utf-8')
      products = JSON.parse(raw)
    } catch {
      products = []
    }

    products = products.filter((p) => p.slug !== slug)
    await fs.writeFile(filePath, JSON.stringify(products, null, 2), 'utf-8')
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }
}
