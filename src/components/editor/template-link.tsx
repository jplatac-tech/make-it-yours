'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { getTemplateById } from '../../lib/design-templates'
import { buildEditorPath } from '../../lib/editor-url'
import { EDITOR_DEFAULT_PRODUCT_SLUG } from '../../lib/products'
import { saveEditorSession } from '../../lib/start-editor'

type Props = {
  templateId: string
  className?: string
  children: ReactNode
}

export function TemplateLink({ templateId, className, children }: Props) {
  const href = buildEditorPath({ tpl: templateId })

  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        const tpl = getTemplateById(templateId)
        if (!tpl) return
        saveEditorSession({
          shapesByZone: tpl.shapesByZone,
          productColor: tpl.productColor,
          productSlug: EDITOR_DEFAULT_PRODUCT_SLUG,
        })
      }}
    >
      {children}
    </Link>
  )
}
