'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
export function SiteFooter() {
  const pathname = usePathname()
  if (pathname === '/disenar' || pathname.startsWith('/disenar/')) {
    return null
  }

  return (
    <footer className="border-t border-neutral-200 py-10">
      <div className="container flex flex-wrap items-center justify-between gap-6 text-sm text-neutral-500">
        <p>Make It Yours — diseña, estampa y cotiza por WhatsApp.</p>
        <div className="flex flex-wrap gap-4 font-semibold text-neutral-700">
          <Link href="/probar-diseno">Probar diseño</Link>
          <Link href="/disenar/editor">Editor</Link>
          <Link href="/carrito">Carrito</Link>
        </div>
      </div>
    </footer>
  )
}
