'use client'

import { useEffect, useState } from 'react'
import { useAppState } from '../../../components/app-state/app-state-provider'

export default function AdminProductsPage() {
  const { profile } = useAppState()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [secret, setSecret] = useState('')
  const [form, setForm] = useState({
    slug: '',
    name: '',
    description: '',
    price: 0,
    type: 'TSHIRT',
  })

  useEffect(() => {
    fetch('/api/admin/products')
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => setProducts([]))
  }, [])

  if (!profile?.isAdmin) {
    return (
      <main className="container py-16">
        <h1 className="text-2xl font-semibold">Admin productos</h1>
        <p className="mt-4 text-neutral-600">
          Acceso restringido. Debes ser admin.
        </p>
        <div className="mt-4 max-w-md">
          <label className="block text-sm font-medium text-neutral-900">
            Admin secret
          </label>
          <input
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="mt-2 w-full rounded-2xl border px-3 py-2"
          />
          <p className="mt-2 text-sm text-neutral-500">
            Si eres el propietario introduce el secreto para usar las
            operaciones.
          </p>
        </div>
      </main>
    )
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: form, secret }),
    })
    const res = await fetch('/api/admin/products')
    setProducts(await res.json())
    setLoading(false)
  }

  async function handleDelete(slug: string) {
    setLoading(true)
    await fetch('/api/admin/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, secret }),
    })
    const res = await fetch('/api/admin/products')
    setProducts(await res.json())
    setLoading(false)
  }

  return (
    <main className="container py-16">
      <h1 className="text-2xl font-semibold">Admin productos</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Lista de productos persistentes.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <form onSubmit={handleAdd} className="space-y-3">
            <label className="block text-sm font-medium text-neutral-900">
              Slug
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="mt-2 w-full rounded-2xl border px-3 py-2"
              />
            </label>
            <label className="block text-sm font-medium text-neutral-900">
              Nombre
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-2 w-full rounded-2xl border px-3 py-2"
              />
            </label>
            <label className="block text-sm font-medium text-neutral-900">
              Descripción
              <input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="mt-2 w-full rounded-2xl border px-3 py-2"
              />
            </label>
            <label className="block text-sm font-medium text-neutral-900">
              Precio
              <input
                type="number"
                value={String(form.price)}
                onChange={(e) =>
                  setForm({ ...form, price: Number(e.target.value) })
                }
                className="mt-2 w-full rounded-2xl border px-3 py-2"
              />
            </label>
            <label className="block text-sm font-medium text-neutral-900">
              Tipo
              <input
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="mt-2 w-full rounded-2xl border px-3 py-2"
              />
            </label>
            <label className="block text-sm font-medium text-neutral-900">
              Secret (required for mutate)
              <input
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="mt-2 w-full rounded-2xl border px-3 py-2"
              />
            </label>
            <button
              disabled={loading}
              className="mt-2 rounded-2xl bg-sky-700 px-4 py-2 text-white"
            >
              Añadir / Actualizar producto
            </button>
          </form>
        </div>

        <div>
          <div className="space-y-3">
            {products.map((p) => (
              <div
                key={p.slug}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-neutral-500">
                    {p.slug} · ${p.price}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="rounded-full bg-red-600 px-3 py-1 text-white"
                    onClick={() => handleDelete(p.slug)}
                    disabled={loading}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
