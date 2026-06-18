'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState, type ReactNode } from 'react'
import { buildEditorPath } from '../../lib/editor-url'
import type { ProductColorValue, ProductSlug } from '../../lib/products'
import { EditorColorModal } from './editor-color-modal'

type EditorEntryOptions = {
  product?: ProductSlug | string
  tpl?: string
}

type Props = EditorEntryOptions & {
  children: ReactNode
  className?: string
  onNavigate?: () => void
  onOpen?: () => void
}

export function EditorEntryTrigger({
  children,
  className,
  product,
  tpl,
  onNavigate,
  onOpen,
}: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const openModal = useCallback(() => {
    onOpen?.()
    setOpen(true)
  }, [onOpen])

  const handleConfirm = useCallback(
    (color: ProductColorValue) => {
      setOpen(false)
      onNavigate?.()
      router.push(buildEditorPath({ product, tpl, color }))
    },
    [onNavigate, product, router, tpl],
  )

  return (
    <>
      <button type="button" onClick={openModal} className={className}>
        {children}
      </button>
      <EditorColorModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  )
}
