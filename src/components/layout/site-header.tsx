'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppState } from '../app-state/app-state-provider'
import { useNavWhatsAppHref } from '../../hooks/use-nav-whatsapp-href'
import { EDITOR_PATH } from '../../lib/start-editor'

const nav = [{ href: EDITOR_PATH, label: 'Diseñar' }] as const

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className ?? 'h-4 w-4 fill-current'}
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export function SiteHeader() {
  const { totalItems } = useAppState()
  const pathname = usePathname()
  const wa = useNavWhatsAppHref()
  const isEditor =
    pathname === '/disenar' || pathname.startsWith('/disenar/')

  const waButtonClass =
    'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full font-semibold text-white transition ' +
    'bg-[#25D366] hover:bg-[#20bd5a] active:scale-[0.98] ' +
    'h-9 px-2.5 text-[11px] sm:h-10 sm:px-4 sm:text-xs'

  return (
    <header
      className={
        'sticky top-0 z-50 border-b pt-[env(safe-area-inset-top,0px)] ' +
        (isEditor
          ? 'border-neutral-700/50 bg-[#1e1e2e] text-white'
          : 'border-neutral-200 bg-white/95 backdrop-blur-md')
      }
    >
      <div className="container flex h-12 min-w-0 items-center justify-between gap-2 sm:h-[53px] sm:gap-4">
        <div className="flex min-w-0 items-center gap-3 sm:gap-6">
          <Link
            href="/"
            className={
              'truncate text-[15px] font-bold tracking-tight sm:text-lg ' +
              (isEditor ? 'text-white' : 'text-neutral-950')
            }
          >
            Make It Yours
          </Link>
          <nav className="hidden items-center gap-4 text-sm min-[420px]:flex">
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

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <a
            href={wa.enabled ? wa.href : undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!wa.enabled}
            className={
              waButtonClass +
              (wa.enabled ? '' : ' pointer-events-none opacity-45')
            }
            title={wa.label}
          >
            <WhatsAppIcon className="h-4 w-4 shrink-0 fill-current sm:h-[18px] sm:w-[18px]" />
            <span className="max-[380px]:hidden sm:inline">{wa.label}</span>
            <span className="hidden max-[380px]:inline">{wa.shortLabel}</span>
          </a>
          <Link
            href="/carrito"
            aria-label={
              totalItems > 0
                ? `Carrito, ${totalItems} artículo${totalItems === 1 ? '' : 's'}`
                : 'Carrito vacío'
            }
            className={
              'relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition sm:h-10 sm:w-10 ' +
              (isEditor
                ? 'border border-white/20 text-white hover:bg-white/10'
                : 'border border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-100')
            }
          >
            <svg
              viewBox="0 0 24 24"
              className="h-[18px] w-[18px] sm:h-5 sm:w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {totalItems > 0 ? (
              <span
                className={
                  'absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ' +
                  (isEditor
                    ? 'bg-violet-500 text-white'
                    : 'bg-violet-600 text-white')
                }
              >
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
    </header>
  )
}
