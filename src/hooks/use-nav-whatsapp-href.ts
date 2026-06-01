'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAppState } from '../components/app-state/app-state-provider'
import {
  DESIGN_SAVE_EVENT,
  DESIGN_STORAGE_KEY,
  hasDesignElements,
  loadDesign,
} from '../lib/design-storage'
import { PRODUCTS } from '../lib/products'
import {
  buildWhatsAppUrl,
  formatCartWhatsAppMessage,
  formatDesignQuoteMessage,
  formatQuickQuoteMessage,
} from '../lib/whatsapp'

export type NavWhatsAppAction = {
  href: string
  label: string
  shortLabel: string
  enabled: boolean
}

export function useNavWhatsAppHref(): NavWhatsAppAction {
  const pathname = usePathname()
  const { cartItems, totalPrice, profile } = useAppState()
  const isEditor =
    pathname === '/disenar' || pathname.startsWith('/disenar/')
  const isCart = pathname === '/carrito'
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
    if (isCart) {
      const enabled = cartItems.length > 0
      return {
        href: enabled
          ? buildWhatsAppUrl(
              formatCartWhatsAppMessage(
                cartItems,
                totalPrice,
                profile?.name,
              ),
            )
          : '#',
        label: 'Enviar carrito por WhatsApp',
        shortLabel: 'Enviar',
        enabled,
      }
    }

    if (isEditor && hasDesignElements(designJson)) {
      return {
        href: buildWhatsAppUrl(
          formatDesignQuoteMessage(
            designJson,
            'Suéter / crewneck personalizado',
          ),
        ),
        label: 'Cotizar por WhatsApp',
        shortLabel: 'Cotizar',
        enabled: true,
      }
    }

    const productSlug = pathname.match(/^\/productos\/([^/]+)/)?.[1]
    const product =
      productSlug && productSlug in PRODUCTS
        ? PRODUCTS[productSlug as keyof typeof PRODUCTS]
        : null

    if (product) {
      return {
        href: buildWhatsAppUrl(formatQuickQuoteMessage(product.name)),
        label: 'Cotizar por WhatsApp',
        shortLabel: 'Cotizar',
        enabled: true,
      }
    }

    return {
      href: buildWhatsAppUrl(formatQuickQuoteMessage()),
      label: 'Cotizar por WhatsApp',
      shortLabel: 'Cotizar',
      enabled: true,
    }
  }, [
    isCart,
    isEditor,
    designJson,
    cartItems,
    totalPrice,
    profile?.name,
    pathname,
  ])
}
