'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { getTemplateById } from '../../lib/design-templates'
import { EDITOR_PATH, saveEditorSession } from '../../lib/start-editor'

type Props = {
  templateId: string
  className?: string
  children: ReactNode
}

export function TemplateLink({ templateId, className, children }: Props) {
  const href = `${EDITOR_PATH}?tpl=${templateId}`

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
        })
      }}
    >
      {children}
    </Link>
  )
}
