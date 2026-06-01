'use client'

import { useEffect, type ReactNode } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  children: ReactNode
  /** z-index por encima del menú hamburguesa (45) */
  zIndex?: number
}

/**
 * Panel desplegable del header: en móvil ocupa el ancho útil bajo la barra;
 * en escritorio se ancla al icono (padre relative).
 */
export function HeaderPopover({ open, onClose, children, zIndex = 60 }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const mq = window.matchMedia('(max-width: 1023px)')
    const lock = () => {
      if (mq.matches) document.body.style.overflow = 'hidden'
    }
    lock()
    document.addEventListener('keydown', onKey)
    mq.addEventListener('change', lock)
    return () => {
      document.removeEventListener('keydown', onKey)
      mq.removeEventListener('change', lock)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[55] bg-neutral-950/35 lg:hidden"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div
        className={
          'fixed max-lg:inset-x-2 max-lg:top-[calc(3.25rem+env(safe-area-inset-top,0px))] ' +
          'max-lg:max-h-[min(calc(100dvh-4.5rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)),520px)] ' +
          'lg:absolute lg:inset-x-auto lg:right-0 lg:top-full lg:mt-2 lg:max-h-none'
        }
        style={{ zIndex }}
      >
        <div className="max-lg:mx-auto max-lg:w-full max-lg:max-w-[400px] lg:w-auto">
          {children}
        </div>
      </div>
    </>
  )
}
