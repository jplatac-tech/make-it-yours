'use client'

import { EditorEntryTrigger } from '../editor/editor-entry-trigger'

export function HomeHeroEditorCta() {
  return (
    <EditorEntryTrigger className="btn-interactive inline-flex min-h-[44px] items-center justify-center rounded-full bg-white px-6 text-sm font-bold text-neutral-900 shadow-[0_4px_24px_rgba(0,0,0,0.25)] hover:bg-neutral-100 sm:min-h-[46px] sm:px-7">
      Ir al editor
    </EditorEntryTrigger>
  )
}
