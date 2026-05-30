'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppState } from '../app-state/app-state-provider'
import { buildWhatsAppUrl, formatQuickQuoteMessage } from '../../lib/whatsapp'

const nav = [
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/disenar', label: 'Diseñar' },
] as const

export function SiteHeader() {
  const { totalItems } = useAppState()
  const pathname = usePathname()
  const isEditor =
    pathname === '/disenar' || pathname.startsWith('/disenar/')
  const whatsappHref = buildWhatsAppUrl(formatQuickQuoteMessage())

  return (
    <header
      className={
        isEditor
          ? 'border-b border-neutral-200 bg-[#1e1e2e] text-white'
          : 'border-b border-neutral-200 bg-white/90 backdrop-blur'
      }
    >
      <div className="container flex flex-wrap items-center justify-between gap-4 py-3.5">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className={
              'text-lg font-bold tracking-tight ' +
              (isEditor ? 'text-white' : 'text-neutral-950')
            }
          >
            Make It Yours
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  isEditor
                    ? 'text-violet-200 hover:text-white'
                    : 'text-neutral-600 hover:text-neutral-950'
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className={
              'rounded-full px-4 py-2 text-xs font-semibold transition ' +
              (isEditor
                ? 'bg-[#25D366] text-white hover:bg-[#20bd5a]'
                : 'border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100')
            }
          >
            Cotizar WhatsApp
          </a>
          <Link
            href="/carrito"
            className={
              'rounded-full px-4 py-2 text-xs font-semibold transition ' +
              (isEditor
                ? 'border border-white/20 text-white hover:bg-white/10'
                : 'border border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-100')
            }
          >
            Carrito ({totalItems})
          </Link>
        </div>
      </div>
    </header>
  )
}
