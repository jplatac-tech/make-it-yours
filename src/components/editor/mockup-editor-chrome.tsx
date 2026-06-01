'use client'

import type { ReactNode } from 'react'

type Props = {
  propertiesToolbar?: ReactNode
}

/** Solo herramientas del elemento seleccionado; flota sin mover el layout */
export function MockupEditorChrome({ propertiesToolbar }: Props) {
  if (!propertiesToolbar) return null

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-2 z-50 flex justify-center px-2 max-lg:top-2 lg:top-3 lg:px-4"
      aria-live="polite"
    >
      <div className="pointer-events-auto max-w-full overflow-x-auto">
        {propertiesToolbar}
      </div>
    </div>
  )
}
