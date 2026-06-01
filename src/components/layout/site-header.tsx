'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CartHeaderTrigger } from '../cart/cart-header-trigger'
import { useNavWhatsAppHref } from '../../hooks/use-nav-whatsapp-href'
import { EDITOR_PATH, PROBAR_DISENO_PATH } from '../../lib/start-editor'

const MAIN_NAV = [
  { href: '/#catalogo', label: 'Catálogo' },
  { href: PROBAR_DISENO_PATH, label: 'Probar diseño' },
  { href: EDITOR_PATH, label: 'Ir al editor' },
  { href: '/ingresar', label: 'Mi cuenta' },
] as const

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0 text-neutral-900"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  )
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      {open ? (
        <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
      )}
    </svg>
  )
}

function isNavActive(pathname: string, href: string) {
  if (href === EDITOR_PATH) return pathname === EDITOR_PATH
  if (href === PROBAR_DISENO_PATH) return pathname === PROBAR_DISENO_PATH
  if (href === '/ingresar')
    return pathname === '/ingresar' || pathname === '/registrarse'
  if (href.startsWith('/#')) return pathname === '/'
  return pathname === href
}

function NikeStyleHeader({
  variant,
  wa,
  pathname,
}: {
  variant: 'light' | 'dark'
  wa: ReturnType<typeof useNavWhatsAppHref>
  pathname: string
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const isDark = variant === 'dark'
  const isEditor = pathname === EDITOR_PATH

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const linkClass = isDark
    ? 'block rounded-lg px-3 py-2.5 text-sm font-semibold text-neutral-200 transition hover:bg-white/10 hover:text-white md:inline-block md:rounded-none md:px-0 md:py-0 md:hover:bg-transparent'
    : 'block rounded-lg px-3 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100 md:inline-block md:rounded-none md:px-0 md:py-0 md:hover:bg-transparent md:hover:text-neutral-600'
  const linkActiveClass = isDark
    ? 'bg-white/10 text-white md:bg-transparent md:underline md:decoration-2 md:underline-offset-4'
    : 'bg-neutral-100 text-neutral-900 md:bg-transparent md:underline md:decoration-2 md:underline-offset-4'
  const logoClass = isDark
    ? 'truncate text-base font-bold tracking-tight text-white sm:text-lg md:text-xl'
    : 'truncate text-base font-bold tracking-tight text-neutral-900 sm:text-lg md:text-xl'
  const searchClass = isDark
    ? 'hidden items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-neutral-200 lg:flex'
    : 'hidden items-center gap-2 rounded-full bg-neutral-100 px-4 py-2.5 lg:flex min-w-[140px]'
  const iconClass = isDark ? 'text-white' : 'text-neutral-900'
  const menuBtnClass = isDark
    ? 'inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-white transition hover:bg-white/10 md:hidden'
    : 'inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-neutral-900 transition hover:bg-neutral-100 md:hidden'

  const showMainNav = !isEditor

  return (
    <header
      className={
        'sticky top-0 z-50 border-b pt-[env(safe-area-inset-top,0px)] transition-shadow duration-300 ' +
        (isDark
          ? 'border-neutral-700/50 bg-[#1e1e2e] text-white'
          : 'border-neutral-200 bg-white text-neutral-900 shadow-sm')
      }
    >
      <div className="relative mx-auto max-w-[1920px] px-3 sm:px-6 lg:px-10">
        <div className="flex h-14 min-h-[52px] items-center justify-between gap-2 sm:h-[60px] md:grid md:grid-cols-[minmax(0,auto)_1fr_auto] md:items-center md:gap-4">
          <Link
            href="/"
            className={`min-w-0 max-w-[46%] shrink-0 sm:max-w-none ${logoClass}`}
          >
            Make It Yours
          </Link>

          <nav
            className={
              'hidden min-w-0 items-center justify-center gap-6 md:flex ' +
              (isEditor ? 'lg:gap-8' : '')
            }
            aria-label="Principal"
          >
            {showMainNav
              ? MAIN_NAV.map((item) => {
                  const active = isNavActive(pathname, item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={
                        (active ? linkActiveClass : linkClass) +
                        ' whitespace-nowrap'
                      }
                    >
                      {item.label}
                    </Link>
                  )
                })
              : null}
          </nav>

          <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-2 md:gap-3">
            {!isEditor ? (
              <Link
                href="/#catalogo"
                className={searchClass}
                aria-label="Ir al catálogo"
              >
                <SearchIcon />
                <span
                  className={
                    'text-sm font-medium ' +
                    (isDark ? 'text-neutral-300' : 'text-neutral-600')
                  }
                >
                  Buscar
                </span>
              </Link>
            ) : null}

            {isEditor ? (
              <Link
                href="/comprar"
                className={
                  'inline-flex min-h-[36px] max-w-[9.5rem] items-center justify-center truncate rounded-full px-2.5 text-[11px] font-bold text-neutral-900 transition sm:max-w-none sm:px-4 sm:text-sm ' +
                  'border border-white/40 bg-white shadow-sm hover:bg-neutral-100'
                }
              >
                Guardar pedido
              </Link>
            ) : (
              <a
                href={wa.enabled ? wa.href : undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={!wa.enabled}
                className={
                  'hidden min-h-[40px] items-center justify-center rounded-full px-4 text-sm font-bold transition duration-200 md:inline-flex ' +
                  (isDark
                    ? 'border border-white/40 bg-white text-neutral-900 hover:bg-neutral-100'
                    : 'border border-neutral-400 bg-neutral-700 text-white hover:bg-neutral-600') +
                  (wa.enabled ? '' : ' pointer-events-none opacity-40')
                }
                title={wa.label}
              >
                Cotizar
              </a>
            )}

            <CartHeaderTrigger iconClassName={iconClass} isDark={isDark} />

            {showMainNav ? (
              <button
                type="button"
                className={menuBtnClass}
                aria-expanded={menuOpen}
                aria-controls="site-mobile-nav"
                aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                onClick={() => setMenuOpen((o) => !o)}
              >
                <MenuIcon open={menuOpen} />
              </button>
            ) : null}
          </div>
        </div>

        {menuOpen && showMainNav ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 bg-black/30 md:hidden"
              aria-label="Cerrar menú"
              onClick={() => setMenuOpen(false)}
            />
            <nav
              id="site-mobile-nav"
              className={
                'absolute top-full right-0 left-0 z-50 flex flex-col gap-1 border-b px-3 py-3 shadow-lg md:hidden ' +
                (isDark
                  ? 'border-neutral-700 bg-[#1e1e2e]'
                  : 'border-neutral-200 bg-white')
              }
              aria-label="Menú móvil"
            >
              {MAIN_NAV.map((item) => {
                const active = isNavActive(pathname, item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={active ? linkActiveClass : linkClass}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )
              })}
              {!isEditor && wa.enabled ? (
                <a
                  href={wa.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    'mt-1 inline-flex min-h-[44px] items-center justify-center rounded-full px-4 text-sm font-bold ' +
                    (isDark
                      ? 'bg-white text-neutral-900'
                      : 'bg-neutral-800 text-white')
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  Cotizar por WhatsApp
                </a>
              ) : null}
            </nav>
          </>
        ) : null}
      </div>
    </header>
  )
}

export function SiteHeader() {
  const pathname = usePathname()
  const wa = useNavWhatsAppHref()
  const isEditor =
    pathname === '/disenar' || pathname.startsWith('/disenar/')

  return (
    <NikeStyleHeader
      variant={isEditor ? 'dark' : 'light'}
      wa={wa}
      pathname={pathname}
    />
  )
}
