'use client'

import { EDITOR_FONTS, getDefaultFontFamily } from '../../lib/editor-fonts'
import type { DesignShape } from '../../types/design'
import { DropdownField, FontSizePickerField } from './editor-ui'

type Props = {
  shape: DesignShape
  onChange: (patch: Partial<DesignShape>) => void
  layout?: 'sidebar' | 'compact'
}

export function TextStyleControls({
  shape,
  onChange,
  layout = 'sidebar',
}: Props) {
  const fontFamily = shape.fontFamily ?? getDefaultFontFamily()
  const fontSize = shape.fontSize ?? 28

  if (layout === 'sidebar') {
    return (
      <div className="space-y-4 rounded-2xl border border-violet-200 bg-violet-50/50 p-4">
        <p className="text-sm font-bold text-violet-900">Texto seleccionado</p>
        <DropdownField label="Fuente" valueLabel={fontFamily}>
          {EDITOR_FONTS.map((font) => (
            <button
              key={font.name}
              type="button"
              onClick={() => onChange({ fontFamily: font.name })}
              className={
                'flex w-full cursor-pointer px-4 py-2.5 text-left text-sm hover:bg-violet-50 ' +
                (fontFamily === font.name ? 'bg-violet-100 font-semibold text-violet-900' : '')
              }
              style={{ fontFamily: font.name }}
            >
              {font.name}
            </button>
          ))}
        </DropdownField>
        <FontSizePickerField
          value={fontSize}
          onChange={(size) => onChange({ fontSize: size })}
        />
      </div>
    )
  }

  return null
}
