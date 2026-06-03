'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './button'
import { cn } from '../../lib/utils'

/** Evita que el mismo gesto que abrió el modal lo cierre o confirme */
const BACKDROP_GUARD_MS = 400

type Props = {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'default'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'default',
  onConfirm,
  onCancel,
}: Props) {
  const titleId = useId()
  const descId = useId()
  const openedAtRef = useRef(0)
  const [interactionsReady, setInteractionsReady] = useState(false)

  useEffect(() => {
    if (!open) {
      setInteractionsReady(false)
      return
    }
    openedAtRef.current = performance.now()
    const t = window.setTimeout(
      () => setInteractionsReady(true),
      BACKDROP_GUARD_MS,
    )
    return () => window.clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && interactionsReady) onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onCancel, interactionsReady])

  const handleBackdropClick = useCallback(() => {
    if (!interactionsReady) return
    if (performance.now() - openedAtRef.current < BACKDROP_GUARD_MS) return
    onCancel()
  }, [interactionsReady, onCancel])

  const handleConfirm = useCallback(() => {
    if (!interactionsReady) return
    onConfirm()
  }, [interactionsReady, onConfirm])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Cerrar"
        className={
          'absolute inset-0 cursor-default border-0 bg-black/45 backdrop-blur-[2px] ' +
          (interactionsReady ? 'pointer-events-auto' : 'pointer-events-none')
        }
        onClick={handleBackdropClick}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative z-10 w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="text-lg font-semibold text-neutral-950">
          {title}
        </h2>
        <p id={descId} className="mt-2 text-sm text-neutral-600">
          {description}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={!interactionsReady}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!interactionsReady}
            className={cn(
              tone === 'danger' &&
                'bg-red-600 hover:bg-red-700 focus-visible:outline-red-600',
            )}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
