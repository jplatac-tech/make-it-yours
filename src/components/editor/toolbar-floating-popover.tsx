'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  open: boolean
  onClose: () => void
  anchorRef: React.RefObject<HTMLElement | null>
  children: React.ReactNode
  className?: string
  /** Abrir hacia arriba (barra flotante sobre el mockup) */
  placement?: 'below' | 'above'
}

export function ToolbarFloatingPopover({
  open,
  onClose,
  anchorRef,
  children,
  className = '',
  placement = 'below',
}: Props) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<React.CSSProperties>({
    visibility: 'hidden',
  })

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return
    const rect = anchorRef.current.getBoundingClientRect()
    const gap = 6
    if (placement === 'above') {
      setStyle({
        position: 'fixed',
        left: rect.left + rect.width / 2,
        bottom: window.innerHeight - rect.top + gap,
        transform: 'translateX(-50%)',
        zIndex: 10000,
        visibility: 'visible',
      })
    } else {
      setStyle({
        position: 'fixed',
        top: rect.bottom + gap,
        left: rect.left + rect.width / 2,
        transform: 'translateX(-50%)',
        zIndex: 10000,
        visibility: 'visible',
      })
    }
  }, [open, anchorRef, placement])

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      const t = e.target as Node
      if (anchorRef.current?.contains(t)) return
      if (popoverRef.current?.contains(t)) return
      onClose()
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open, onClose, anchorRef])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      ref={popoverRef}
      style={style}
      className={
        'rounded-xl border border-neutral-200 bg-white shadow-xl ' + className
      }
      onPointerDown={(e) => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body,
  )
}
