'use client'

import { usePathname } from 'next/navigation'
export function SiteFooter() {
  const pathname = usePathname()
  if (pathname === '/disenar' || pathname.startsWith('/disenar/')) {
    return null
  }

  return (
    <footer className="border-t border-neutral-200 bg-white py-10">
      <div className="container text-sm text-neutral-600">
        <p className="max-w-md text-neutral-900">
          Make It Yours — diseña, estampa y cotiza por WhatsApp.
        </p>
      </div>
    </footer>
  )
}
