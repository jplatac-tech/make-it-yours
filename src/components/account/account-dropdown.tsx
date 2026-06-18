'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAppState } from '../app-state/app-state-provider'
import { AccountForm } from './account-form'

type Props = {
  onClose: () => void
  embedded?: boolean
  isDark?: boolean
}

export function AccountDropdown({ onClose, embedded = false, isDark = false }: Props) {
  const { profile, clearProfile } = useAppState()
  const [tab, setTab] = useState<'login' | 'register'>('login')

  const shellClass = embedded
    ? 'flex w-full flex-col overflow-hidden rounded-xl ' +
      (isDark ? 'bg-white/6' : 'bg-neutral-50')
    : 'flex max-h-[inherit] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] md:w-[min(calc(100vw-2rem),380px)] md:rounded-lg'

  const titleClass = embedded
    ? 'border-b px-4 py-3 text-left text-sm font-semibold ' +
      (isDark
        ? 'border-white/10 text-neutral-100'
        : 'border-neutral-200 text-neutral-900')
    : 'border-b border-neutral-100 px-5 py-4 text-center text-base font-medium text-neutral-900'

  return (
    <div
      className={shellClass}
      role="dialog"
      aria-label="Mi cuenta"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {!embedded ? (
        <h2 className={titleClass}>Mi cuenta</h2>
      ) : null}

      {profile ? (
        <div className={embedded ? 'px-3 py-3' : 'px-5 py-5'}>
          <div
            className={
              'rounded-xl px-4 py-4 ' +
              (embedded && isDark ? 'bg-white/8' : 'bg-neutral-50')
            }
          >
            <p className="text-sm font-semibold text-neutral-900">
              {profile.name || profile.email}
            </p>
            {profile.name ? (
              <p className="mt-1 truncate text-sm text-neutral-600">
                {profile.email}
              </p>
            ) : null}
            {profile.whatsapp ? (
              <p className="mt-1 text-xs text-neutral-500">
                WhatsApp: {profile.whatsapp}
              </p>
            ) : null}
          </div>

          {profile.isAdmin ? (
            <Link
              href="/admin/login"
              onClick={onClose}
              className="mt-4 flex min-h-[44px] w-full items-center justify-center rounded-full border border-neutral-300 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
            >
              Entrar al panel admin
            </Link>
          ) : null}

          <Link
            href="/mis-pedidos"
            onClick={onClose}
            className="mt-4 flex min-h-[44px] w-full items-center justify-center rounded-full border border-neutral-300 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
          >
            Mis pedidos guardados
          </Link>

          <button
            type="button"
            onClick={() => {
              clearProfile()
              onClose()
            }}
            className="mt-3 flex min-h-[44px] w-full cursor-pointer items-center justify-center rounded-full border border-neutral-200 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-900"
          >
            Cerrar sesión
          </button>
        </div>
      ) : (
        <>
          <div className="flex border-b border-neutral-100">
            <button
              type="button"
              onClick={() => setTab('login')}
              className={
                'flex-1 cursor-pointer py-3 text-sm font-semibold transition ' +
                (tab === 'login'
                  ? 'border-b-2 border-neutral-900 text-neutral-900'
                  : 'text-neutral-500 hover:text-neutral-800')
              }
            >
              Ingresar
            </button>
            <button
              type="button"
              onClick={() => setTab('register')}
              className={
                'flex-1 cursor-pointer py-3 text-sm font-semibold transition ' +
                (tab === 'register'
                  ? 'border-b-2 border-neutral-900 text-neutral-900'
                  : 'text-neutral-500 hover:text-neutral-800')
              }
            >
              Registrarse
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 [-webkit-overflow-scrolling:touch]">
            <AccountForm key={tab} mode={tab} compact />
          </div>
        </>
      )}
    </div>
  )
}
