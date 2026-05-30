'use client'

import { useMemo } from 'react'
import {
  EDITOR_FONTS,
  getDefaultFontFamily,
} from '../../lib/editor-fonts'
import type { DesignShape } from '../../types/design'
import { ColorPickerButton, DropdownField } from './editor-ui'
import { getPrintZone } from '../../lib/products'
import { getMaxFontSizeForShape } from '../../lib/size-limits'

const ALL_FONT_SIZES = [
  12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96, 120,
]

type Props = {
  shape: DesignShape
  printZone: string
  canvasW: number
  canvasH: number
  updateShape: (id: string, patch: Partial<DesignShape>) => void
  variant?: 'sidebar' | 'panel'
}

export function SelectionInspector({
  shape,
  printZone,
  updateShape,
  variant = 'sidebar',
}: Props) {
  const patch = (p: Partial<DesignShape>) => updateShape(shape.id, p)
  const printArea = getPrintZone(printZone as 'FRONT' | 'BACK')?.printArea

  const allowedFontSizes = useMemo(() => {
    if (shape.type !== 'text' && shape.type !== 'icon') return ALL_FONT_SIZES
    const max = getMaxFontSizeForShape(shape, printArea)
    const list = ALL_FONT_SIZES.filter((s) => s <= max)
    const current = shape.fontSize ?? 28
    if (!list.includes(current)) list.push(current)
    return list.sort((a, b) => a - b)
  }, [shape, printArea])

  const typeLabel =
    shape.type === 'image'
      ? 'Imagen'
      : shape.type === 'icon'
        ? 'Icono'
        : 'Texto'

  const wrapperClass =
    variant === 'panel'
      ? 'rounded-xl border border-violet-200/80 bg-white p-3.5 shadow-sm'
      : 'mb-4 shrink-0 rounded-xl border border-violet-200/80 bg-white p-3.5 shadow-sm'

  return (
    <div className={wrapperClass}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-bold tracking-wide text-violet-700 uppercase">
          Editando
        </p>
        <span className="rounded-md bg-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-800">
          {typeLabel}
        </span>
      </div>

      {(shape.type === 'text' || shape.type === 'icon') && (
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-neutral-600">
              Contenido
            </span>
            <textarea
              rows={2}
              value={shape.text ?? ''}
              onChange={(e) => patch({ text: e.target.value })}
              className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2.5 text-base leading-snug"
            />
          </label>

          <DropdownField
            label="Fuente"
            valueLabel={shape.fontFamily ?? getDefaultFontFamily()}
          >
            {EDITOR_FONTS.map((font) => (
              <button
                key={font.name}
                type="button"
                onClick={() => patch({ fontFamily: font.name })}
                className={
                  'flex w-full cursor-pointer flex-col px-3 py-2 text-left hover:bg-violet-50 ' +
                  ((shape.fontFamily ?? getDefaultFontFamily()) === font.name
                    ? 'bg-violet-100'
                    : '')
                }
              >
                <span className="text-xs text-neutral-500">{font.name}</span>
                <span
                  className="text-lg text-neutral-900"
                  style={{ fontFamily: font.name }}
                >
                  Aa Bb 123
                </span>
              </button>
            ))}
          </DropdownField>

          <DropdownField
            label="Tamaño"
            valueLabel={`${shape.fontSize ?? 28} px`}
          >
            {allowedFontSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => patch({ fontSize: size })}
                className={
                  'flex w-full cursor-pointer px-3 py-2 text-left text-sm font-medium hover:bg-violet-50 ' +
                  ((shape.fontSize ?? 28) === size
                    ? 'bg-violet-100 text-violet-900'
                    : 'text-neutral-800')
                }
              >
                {size} px
              </button>
            ))}
          </DropdownField>

          <ColorPickerButton
            value={shape.color ?? '#111827'}
            onChange={(hex) => patch({ color: hex })}
          />

          <p className="text-xs text-neutral-500">
            Arrastra en el mockup para mover; usa las esquinas para escalar.
          </p>
        </div>
      )}

      {shape.type === 'image' && (
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-neutral-500">
            Mueve y escala en el mockup; recorta desde Acciones.
          </p>
          <label className="block">
            <span className="mb-1.5 flex justify-between text-sm font-semibold text-neutral-600">
              <span>Opacidad</span>
              <span>{Math.round((shape.opacity ?? 1) * 100)}%</span>
            </span>
            <input
              type="range"
              min={20}
              max={100}
              value={Math.round((shape.opacity ?? 1) * 100)}
              onChange={(e) =>
                patch({ opacity: Number(e.target.value) / 100 })
              }
              className="w-full accent-violet-600"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 flex justify-between text-sm font-semibold text-neutral-600">
              <span>Esquinas redondeadas</span>
              <span>{shape.borderRadius ?? 0}%</span>
            </span>
            <input
              type="range"
              min={0}
              max={50}
              value={shape.borderRadius ?? 0}
              onChange={(e) =>
                patch({ borderRadius: Number(e.target.value) })
              }
              className="w-full accent-violet-600"
            />
          </label>
        </div>
      )}
    </div>
  )
}
