'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
export function SiteFooter() {
  const pathname = usePathname()
  if (pathname === '/disenar' || pathname.startsWith('/disenar/')) {
    return null
  }

  return (
    <footer className="border-t border-neutral-200 bg-white py-10">
      <div className="container flex flex-col gap-6 text-sm text-neutral-600 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="max-w-md text-neutral-900">
          Make It Yours — diseña, estampa y cotiza por WhatsApp.
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-2 font-semibold text-neutral-900">
          <Link href="/" className="link-hover">
            Inicio
          </Link>
          <Link href="/catalogo" className="link-hover">
            Catálogo
          </Link>
          <Link href="/carrito" className="link-hover">
            Carrito
          </Link>
        </div>
      </div>
    </footer>
  )
}
