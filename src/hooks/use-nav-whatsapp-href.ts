'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  DESIGN_SAVE_EVENT,
  DESIGN_STORAGE_KEY,
  hasDesignElements,
  loadDesign,
} from '../lib/design-storage'
import {
  buildWhatsAppUrl,
  formatDesignQuoteMessage,
  formatQuickQuoteMessage,
} from '../lib/whatsapp'

export function useNavWhatsAppHref() {
  const pathname = usePathname()
  const isEditor =
    pathname === '/disenar' || pathname.startsWith('/disenar/')
  const [designJson, setDesignJson] = useState<string | null>(null)

  useEffect(() => {
    if (!isEditor) return
    const read = () => setDesignJson(loadDesign())
    read()
    const onSave = () => read()
    window.addEventListener(DESIGN_SAVE_EVENT, onSave)
    const onStorage = (e: StorageEvent) => {
      if (e.key === DESIGN_STORAGE_KEY) read()
    }
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(DESIGN_SAVE_EVENT, onSave)
      window.removeEventListener('storage', onStorage)
    }
  }, [isEditor])

  return useMemo(() => {
    if (isEditor && hasDesignElements(designJson)) {
      return buildWhatsAppUrl(
        formatDesignQuoteMessage(
          designJson,
          'Suéter / crewneck personalizado',
        ),
      )
    }
    return buildWhatsAppUrl(formatQuickQuoteMessage())
  }, [isEditor, designJson])
}
