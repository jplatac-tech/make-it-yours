'use client'

import { useEffect, useState } from 'react'
import { DESIGN_SAVE_EVENT } from '../../lib/design-storage'

export function EditorSaveIndicator() {
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const mark = () => {
      setSavedAt(Date.now())
      setVisible(true)
      const t = window.setTimeout(() => setVisible(false), 2500)
      return t
    }
    let hideTimer: number | undefined
    const onSave = () => {
      queueMicrotask(() => {
        if (hideTimer !== undefined) window.clearTimeout(hideTimer)
        hideTimer = mark()
      })
    }
    window.addEventListener(DESIGN_SAVE_EVENT, onSave)
    return () => {
      window.removeEventListener(DESIGN_SAVE_EVENT, onSave)
      if (hideTimer !== undefined) window.clearTimeout(hideTimer)
    }
  }, [])

  if (!visible || savedAt === null) return null

  return (
    <div
      className="pointer-events-none absolute top-2 right-2 z-30 rounded-full bg-neutral-900/90 px-3 py-1.5 text-[11px] font-semibold text-white shadow-md"
      role="status"
      aria-live="polite"
    >
      Borrador guardado en este dispositivo
    </div>
  )
}
