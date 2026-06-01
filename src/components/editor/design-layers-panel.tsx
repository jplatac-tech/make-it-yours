'use client'

import { sortShapesFrontFirst, type LayerMove } from '../../lib/shape-layers'
import type { DesignShape } from '../../types/design'
import { IconLayerDown, IconLayerUp } from './editor-toolbar-icons'

function layerLabel(shape: DesignShape): string {
  if (shape.type === 'image') return 'Imagen'
  if (shape.type === 'icon') return shape.text?.trim() || 'Icono'
  const text = shape.text?.trim() || 'Texto'
  return text.length > 32 ? `${text.slice(0, 32)}…` : text
}

function layerTypeLabel(shape: DesignShape): string {
  if (shape.type === 'image') return 'Imagen'
  if (shape.type === 'icon') return 'Icono'
  return 'Texto'
}

type Props = {
  shapes: DesignShape[]
  selectedId: string | null
  printZoneLabel: string
  onSelectShape: (id: string) => void
  onMoveLayer: (id: string, move: LayerMove) => void
}

export function DesignLayersPanel({
  shapes,
  selectedId,
  printZoneLabel,
  onSelectShape,
  onMoveLayer,
}: Props) {
  const ordered = sortShapesFrontFirst(shapes)

  if (ordered.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-200 bg-white px-4 py-8 text-center">
        <p className="text-sm font-medium text-neutral-700">
          No hay elementos en {printZoneLabel}
        </p>
        <p className="mt-1 text-xs text-neutral-500">
          Añade texto, imágenes o iconos para ordenarlos aquí.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-neutral-500">
        <span className="font-semibold text-neutral-700">{printZoneLabel}</span>
        {' · '}
        Arriba = más visible (delante). Abajo = detrás del resto.
      </p>

      <ul className="space-y-1.5" role="list" aria-label="Capas del diseño">
        {ordered.map((shape, listIndex) => {
          const selected = shape.id === selectedId
          const isFront = listIndex === 0
          const isBack = listIndex === ordered.length - 1

          return (
            <li key={shape.id}>
              <div
                className={
                  'flex items-center gap-2 rounded-xl border bg-white p-2 transition ' +
                  (selected
                    ? 'border-violet-400 ring-2 ring-violet-200'
                    : 'border-neutral-200 hover:border-violet-200')
                }
              >
                <button
                  type="button"
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-left"
                  onClick={() => onSelectShape(shape.id)}
                >
                  <span
                    className={
                      'flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border text-sm ' +
                      (selected
                        ? 'border-violet-300 bg-violet-50'
                        : 'border-neutral-200 bg-neutral-50')
                    }
                  >
                    {shape.type === 'image' && shape.src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={shape.src}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : shape.type === 'icon' ? (
                      <span className="text-lg">{shape.text}</span>
                    ) : (
                      <span className="px-1 text-[10px] font-bold text-neutral-600">
                        T
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-neutral-900">
                      {layerLabel(shape)}
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {layerTypeLabel(shape)}
                      {isFront ? ' · Delante' : isBack ? ' · Detrás' : ''}
                    </span>
                  </span>
                </button>

                <div className="flex shrink-0 flex-col gap-0.5">
                  <button
                    type="button"
                    title="Traer adelante"
                    aria-label="Traer adelante"
                    disabled={isFront}
                    onClick={() => onMoveLayer(shape.id, 'forward')}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-neutral-600 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <IconLayerUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Enviar atrás"
                    aria-label="Enviar atrás"
                    disabled={isBack}
                    onClick={() => onMoveLayer(shape.id, 'backward')}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-neutral-600 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <IconLayerDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
