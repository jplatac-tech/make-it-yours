'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AccountHeaderTrigger } from '../account/account-header-trigger'
import { CartHeaderTrigger } from '../cart/cart-header-trigger'
import { WhatsAppIcon } from './whatsapp-help-fab'
import { useNavWhatsAppHref } from '../../hooks/use-nav-whatsapp-href'
import { EDITOR_PATH, PROBAR_DISENO_PATH } from '../../lib/start-editor'

const NAV_LINKS = [
  { href: '/catalogo', label: 'Catálogo', icon: 'catalog' },
  { href: PROBAR_DISENO_PATH, label: 'Probar un diseño', icon: 'spark' },
  { href: EDITOR_PATH, label: 'Ir al editor', icon: 'edit' },
] as const

type NavIcon = (typeof NAV_LINKS)[number]['icon']

function NavItemIcon({ name, className }: { name: NavIcon; className?: string }) {
  const cn = className ?? 'h-5 w-5 shrink-0'
  switch (name) {
    case 'catalog':
      return (
        <svg viewBox="0 0 24 24" className={cn} fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
          <rect x="4" y="4" width="7" height="7" rx="1" />
          <rect x="13" y="4" width="7" height="7" rx="1" />
          <rect x="4" y="13" width="7" height="7" rx="1" />
          <rect x="13" y="13" width="7" height="7" rx="1" />
        </svg>
      )
    case 'spark':
      return (
        <svg viewBox="0 0 24 24" className={cn} fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
          <path d="M12 3l1.8 5.5L19 10l-5.2 1.5L12 17l-1.8-5.5L5 10l5.2-1.5L12 3z" strokeLinejoin="round" />
          <path d="M5 19l.9 2.7L8.5 22l-.9-2.7L5 19zM19 5l.6 1.8L21 7l-1.4.4L19 9l-.6-1.8L17 7l1.4-.4L19 5z" strokeLinejoin="round" />
        </svg>
      )
    case 'edit':
      return (
        <svg viewBox="0 0 24 24" className={cn} fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
          <path d="M4 20h4l9.5-9.5a2.12 2.12 0 00-3-3L5 17v3z" strokeLinejoin="round" />
          <path d="M13.5 6.5l3 3" strokeLinecap="round" />
        </svg>
      )
    default:
      return null
  }
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
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
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
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
  if (href === '/catalogo') return pathname === '/catalogo'
  return pathname === href
}

function iconButtonClass(isDark: boolean) {
  return (
    'inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition sm:h-10 sm:w-10 ' +
    (isDark
      ? 'text-white hover:bg-white/10'
      : 'text-neutral-900 hover:bg-neutral-100')
  )
}

function WhatsAppNavButton({
  wa,
  isDark,
  className,
}: {
  wa: ReturnType<typeof useNavWhatsAppHref>
  isDark: boolean
  className?: string
}) {
  return (
    <a
      href={wa.enabled ? wa.href : undefined}
      target="_blank"
      rel="noopener noreferrer"
      aria-disabled={!wa.enabled}
      aria-label={wa.label}
      title={wa.label}
      className={
        (className ?? iconButtonClass(isDark)) +
        ' bg-[#25D366] text-white hover:bg-[#20bd5a] ' +
        (wa.enabled ? '' : ' pointer-events-none opacity-40')
      }
    >
      <WhatsAppIcon className="h-5 w-5" />
    </a>
  )
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
  const showDesktopNav = !isEditor
  const showMobileMenu = true

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const logoClass = isDark
    ? 'block truncate text-sm font-bold tracking-tight text-white sm:text-lg'
    : 'block truncate text-sm font-bold tracking-tight text-neutral-900 sm:text-lg'

  const desktopLinkClass = isDark
    ? 'whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-neutral-200 transition hover:bg-white/10 hover:text-white'
    : 'whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-100 hover:text-neutral-950'

  const desktopLinkActive = isDark
    ? 'bg-white/15 text-white'
    : 'bg-neutral-100 text-neutral-950'

  return (
    <header
      className={
        'sticky top-0 z-50 border-b pt-[env(safe-area-inset-top,0px)] ' +
        (isDark
          ? 'border-neutral-700/50 bg-[#1e1e2e] text-white'
          : 'border-neutral-200 bg-white text-neutral-900 shadow-sm')
      }
    >
      <div className="relative mx-auto max-w-[1920px] px-3 sm:px-6 lg:px-10">
        <div className="flex h-14 min-h-[52px] items-center justify-between gap-2 sm:h-[60px] sm:gap-3">
          <Link
            href="/"
            className={`min-w-0 max-w-[11rem] shrink sm:max-w-none ${logoClass}`}
          >
            Make It Yours
          </Link>

          <div className="flex shrink-0 items-center justify-end gap-0 sm:gap-1 md:gap-2">
            {showDesktopNav ? (
              <nav
                className="hidden items-center gap-0.5 lg:flex"
                aria-label="Principal"
              >
                {NAV_LINKS.map((item) => {
                  const active = isNavActive(pathname, item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={
                        item.href === EDITOR_PATH ||
                        item.href === PROBAR_DISENO_PATH
                          ? false
                          : undefined
                      }
                      aria-current={active ? 'page' : undefined}
                      className={active ? desktopLinkActive : desktopLinkClass}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            ) : null}

            {!isEditor ? (
              <Link
                href="/catalogo"
                className={
                  'hidden items-center gap-2 rounded-full px-3 py-2 lg:flex ' +
                  (isDark
                    ? 'bg-white/10 text-neutral-200 hover:bg-white/15'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80')
                }
                aria-label="Ir al catálogo"
              >
                <SearchIcon />
                <span className="text-sm font-medium">Buscar</span>
              </Link>
            ) : null}

            {isEditor ? (
              <Link
                href="/comprar"
                className={
                  'inline-flex min-h-[36px] max-w-[9.5rem] items-center justify-center truncate rounded-full px-2.5 text-[11px] font-bold text-neutral-900 sm:max-w-none sm:px-4 sm:text-sm ' +
                  'border border-white/40 bg-white shadow-sm hover:bg-neutral-100'
                }
              >
                Guardar pedido
              </Link>
            ) : null}

            {isEditor ? (
              <WhatsAppNavButton wa={wa} isDark={isDark} />
            ) : (
              <div className="lg:hidden">
                <WhatsAppNavButton wa={wa} isDark={isDark} />
              </div>
            )}

            <AccountHeaderTrigger isDark={isDark} />

            <CartHeaderTrigger
              iconClassName={isDark ? 'text-white' : 'text-neutral-900'}
              isDark={isDark}
            />

            {showMobileMenu ? (
              <button
                type="button"
                className={iconButtonClass(isDark) + ' lg:hidden'}
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
      </div>

      {menuOpen && showMobileMenu ? (
        <div className="fixed inset-0 z-[45] lg:hidden" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-neutral-950/45 backdrop-blur-[3px]"
            aria-label="Cerrar menú"
            onClick={() => setMenuOpen(false)}
          />
          <nav
            id="site-mobile-nav"
            className={
              'absolute right-0 bottom-0 left-0 z-50 flex max-h-[min(88dvh,640px)] flex-col overflow-hidden rounded-t-[1.35rem] border-t shadow-[0_-12px_40px_rgba(0,0,0,0.2)] ' +
              (isDark
                ? 'border-neutral-600/80 bg-[#252536]'
                : 'border-neutral-200 bg-white')
            }
            style={{
              paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
            }}
            aria-label="Menú móvil"
          >
            <div className="flex justify-center pt-3 pb-1" aria-hidden>
              <div
                className={
                  'h-1 w-10 rounded-full ' +
                  (isDark ? 'bg-white/25' : 'bg-neutral-300')
                }
              />
            </div>
            <div
              className={
                'border-b px-4 py-3 ' +
                (isDark ? 'border-neutral-600/60' : 'border-neutral-100')
              }
            >
              <p
                className={
                  'text-xs font-semibold tracking-wide uppercase ' +
                  (isDark ? 'text-neutral-400' : 'text-neutral-500')
                }
              >
                Navegación
              </p>
            </div>

            <ul
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 [-webkit-overflow-scrolling:touch]"
              role="list"
            >
              {NAV_LINKS.map((item) => {
                const active = isNavActive(pathname, item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      prefetch={
                        item.href === EDITOR_PATH ||
                        item.href === PROBAR_DISENO_PATH
                          ? false
                          : undefined
                      }
                      aria-current={active ? 'page' : undefined}
                      onClick={() => setMenuOpen(false)}
                      className={
                        'flex min-h-[52px] items-center gap-3 rounded-xl px-3 transition ' +
                        (active
                          ? isDark
                            ? 'bg-white/12 text-white'
                            : 'bg-neutral-100 text-neutral-950'
                          : isDark
                            ? 'text-neutral-100 hover:bg-white/8'
                            : 'text-neutral-900 hover:bg-neutral-50')
                      }
                    >
                      <span
                        className={
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ' +
                          (active
                            ? isDark
                              ? 'bg-white/15 text-white'
                              : 'bg-neutral-900 text-white'
                            : isDark
                              ? 'bg-white/8 text-neutral-200'
                              : 'bg-neutral-100 text-neutral-700')
                        }
                      >
                        <NavItemIcon name={item.icon} />
                      </span>
                      <span className="min-w-0 flex-1 text-left">
                        <span className="block text-sm font-semibold">
                          {item.label}
                        </span>
                      </span>
                      <svg
                        viewBox="0 0 24 24"
                        className={
                          'h-4 w-4 shrink-0 opacity-40 ' +
                          (isDark ? 'text-white' : 'text-neutral-900')
                        }
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden
                      >
                        <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  </li>
                )
              })}
            </ul>

            {isEditor ? (
              <div
                className={
                  'border-t p-3 ' +
                  (isDark ? 'border-neutral-600/60' : 'border-neutral-100')
                }
              >
                <Link
                  href="/comprar"
                  className={
                    'flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition ' +
                    (isDark
                      ? 'bg-white text-neutral-900 hover:bg-neutral-100'
                      : 'bg-neutral-900 text-white hover:bg-neutral-800')
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  Guardar pedido
                </Link>
              </div>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  )
}

export function SiteHeader() {
  const pathname = usePathname()
  const wa = useNavWhatsAppHref()
  const isEditor =
    pathname === '/disenar' || pathname.startsWith('/disenar/')

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    return null
  }

  return (
    <NikeStyleHeader
      variant={isEditor ? 'dark' : 'light'}
      wa={wa}
      pathname={pathname}
    />
  )
}
