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
      <div className="container flex flex-wrap items-center justify-between gap-6 text-sm text-neutral-600">
        <p className="text-neutral-900">Make It Yours — diseña, estampa y cotiza por WhatsApp.</p>
        <div className="flex flex-wrap gap-4 font-semibold text-neutral-900">
          <Link href="/">Inicio</Link>
          <Link href="/carrito">Carrito</Link>
        </div>
      </div>
    </footer>
  )
}
