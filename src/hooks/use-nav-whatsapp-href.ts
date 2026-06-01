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
import { PRODUCTS, type ProductSlug } from '../lib/products'
import { parseStoredDesign } from '../lib/design-storage'
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
  const needsDesign = isEditor || isCart
  const [designJson, setDesignJson] = useState<string | null>(null)

  useEffect(() => {
    if (!needsDesign) return
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
  }, [needsDesign])

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
                designJson,
              ),
            )
          : '#',
        label: 'Confirmar por WhatsApp',
        shortLabel: 'WhatsApp',
        enabled,
      }
    }

    if (isEditor && hasDesignElements(designJson)) {
      const slug = parseStoredDesign(designJson)?.productSlug as
        | ProductSlug
        | undefined
      const productName =
        slug && slug in PRODUCTS ? PRODUCTS[slug].name : undefined
      return {
        href: buildWhatsAppUrl(
          formatDesignQuoteMessage(designJson, productName),
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
    needsDesign,
    isEditor,
    designJson,
    cartItems,
    totalPrice,
    profile?.name,
    pathname,
  ])
}
