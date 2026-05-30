'use client'

import type { DesignShape } from '../../types/design'
import { SelectionInspector } from './selection-inspector'
import { MockupContextToolbar } from './mockup-context-toolbar'

type Props = {
  mode?: 'desktop' | 'mobile'
  selectedShape: DesignShape | null
  printZone: string
  canvasW: number
  canvasH: number
  updateShape: (id: string, patch: Partial<DesignShape>) => void
  onDuplicate: () => void
  onRemove: () => void
  cropMode: boolean
  onToggleCrop: () => void
}

/** Barra lateral derecha (PC) o pestaña Props (móvil) */
export function MockupEditPanel({
  mode = 'desktop',
  selectedShape,
  printZone,
  canvasW,
  canvasH,
  updateShape,
  onDuplicate,
  onRemove,
  cropMode,
  onToggleCrop,
}: Props) {
  const content = selectedShape ? (
    <div className="space-y-5">
      <SelectionInspector
        variant="panel"
        shape={selectedShape}
        printZone={printZone}
        canvasW={canvasW}
        canvasH={canvasH}
        updateShape={updateShape}
      />

      <div className="rounded-xl border border-neutral-200 bg-white p-3.5 shadow-sm">
        <p className="mb-3 text-sm font-bold tracking-wide text-neutral-600 uppercase">
          Acciones
        </p>
        <MockupContextToolbar
          layout="vertical"
          shape={selectedShape}
          updateShape={updateShape}
          onDuplicate={onDuplicate}
          onRemove={onRemove}
          cropMode={cropMode}
          onToggleCrop={onToggleCrop}
        />
      </div>
    </div>
  ) : (
    <p className="text-sm leading-relaxed text-neutral-500">
      Haz clic en un texto, icono o imagen del mockup para ver fuente, color,
      opacidad y más opciones aquí.
    </p>
  )

  if (mode === 'mobile') {
    return <div className="px-4 py-4">{content}</div>
  }

  return (
    <aside className="relative z-20 hidden h-full w-[300px] shrink-0 flex-col border-l border-neutral-200 bg-[#f8f9fb] shadow-md lg:flex">
      <div className="shrink-0 border-b border-neutral-200 bg-white px-5 py-3">
        <h2 className="text-base font-bold text-neutral-900">Propiedades</h2>
        <p className="mt-0.5 text-sm text-neutral-500">
          Elemento seleccionado en el mockup
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
        {content}
      </div>
    </aside>
  )
}
