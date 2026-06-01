'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  EDITOR_FONTS,
  getDefaultFontFamily,
} from '../../lib/editor-fonts'
import type { DesignShape } from '../../types/design'
import { PRINT_SWATCHES } from './editor-ui'
import { ToolbarFloatingPopover } from './toolbar-floating-popover'
import {
  IconChevronDown,
  IconCorners,
  IconCrop,
  IconDuplicate,
  IconEditText,
  IconFlip,
  IconLayerUp,
  IconOpacity,
  IconTextColor,
  IconTrash,
  ToolbarDivider,
} from './editor-toolbar-icons'

const PRESET_FONT_SIZES = [
  8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96, 120, 160, 200,
]
const MIN_FONT_SIZE = 8
const MAX_FONT_SIZE = 512

function IconToolBtn({
  title,
  active,
  onClick,
  disabled,
  children,
}: {
  title: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={
        'flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-sm font-bold transition active:scale-95 disabled:opacity-40 ' +
        (active
          ? 'bg-violet-100 text-violet-900'
          : 'text-neutral-700 hover:bg-neutral-100')
      }
    >
      {children}
    </button>
  )
}

function ToolbarLabelBtn({
  label,
  title,
  active,
  disabled,
  onClick,
  icon,
}: {
  label: string
  title: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  icon?: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={
        'flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-lg px-2 text-xs font-semibold transition active:scale-[0.98] disabled:opacity-40 ' +
        (active
          ? 'bg-violet-100 text-violet-900'
          : 'text-neutral-800 hover:bg-neutral-100')
      }
    >
      {icon}
      <span className="max-sm:hidden">{label}</span>
    </button>
  )
}

type Props = {
  shape: DesignShape
  printZone: string
  updateShape: (id: string, patch: Partial<DesignShape>) => void
  onCloseMobilePanel?: () => void
  /** En la franja superior del mockup (no flota sobre la prenda) */
  floating?: boolean
  /** Dentro de MockupEditorChrome: ocupa el ancho disponible */
  embedded?: boolean
  cropActive?: boolean
  onToggleCrop?: () => void
  onDuplicate?: () => void
  onRemove?: () => void
  onOpenLayersPanel?: () => void
}

export function MockupPropertiesBar({
  shape,
  printZone,
  updateShape,
  onCloseMobilePanel,
  floating = false,
  embedded = false,
  cropActive,
  onToggleCrop,
  onDuplicate,
  onRemove,
  onOpenLayersPanel,
}: Props) {
  const [fontOpen, setFontOpen] = useState(false)
  const [colorOpen, setColorOpen] = useState(false)
  const [imageAdjustOpen, setImageAdjustOpen] = useState(false)
  const [textOpen, setTextOpen] = useState(false)
  const fontRef = useRef<HTMLDivElement>(null)
  const colorRef = useRef<HTMLDivElement>(null)
  const imageAdjustRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  const patch = (p: Partial<DesignShape>) => updateShape(shape.id, p)
  void printZone

  const closeAll = () => {
    setFontOpen(false)
    setColorOpen(false)
    setImageAdjustOpen(false)
    setTextOpen(false)
  }

  const interact = () => {
    onCloseMobilePanel?.()
  }

  useEffect(() => {
    closeAll()
  }, [shape.id, shape.type])

  const allowedFontSizes = useMemo(() => {
    const list = [...PRESET_FONT_SIZES]
    const current = Math.round(shape.fontSize ?? 28)
    if (current >= MIN_FONT_SIZE && current <= MAX_FONT_SIZE && !list.includes(current)) {
      list.push(current)
    }
    return list.sort((a, b) => a - b)
  }, [shape.fontSize])

  const isText = shape.type === 'text' || shape.type === 'icon'
  const isImage = shape.type === 'image'
  const fontSize = shape.fontSize ?? 28
  const fontFamily = shape.fontFamily ?? getDefaultFontFamily()
  const color = shape.color ?? '#111827'
  const isBold = (shape.fontWeight ?? 600) >= 700
  const isItalic = shape.fontStyle === 'italic'
  const isUnderline = shape.textDecoration === 'underline'
  const opacityPct = Math.round((shape.opacity ?? 1) * 100)

  const bumpSize = (delta: number) => {
    const idx = allowedFontSizes.findIndex((s) => s >= fontSize)
    const base = idx === -1 ? allowedFontSizes.length - 1 : idx
    const next = Math.max(0, Math.min(allowedFontSizes.length - 1, base + delta))
    patch({ fontSize: allowedFontSizes[next] })
  }

  const commitFontSize = (raw: string) => {
    const n = Math.round(Number(raw))
    if (!Number.isFinite(n)) return
    patch({ fontSize: Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, n)) })
  }

  const popoverPlacement = 'below'

  const shortFont =
    fontFamily.length > 11 ? `${fontFamily.slice(0, 10)}…` : fontFamily

  const toggle = (
    setter: React.Dispatch<React.SetStateAction<boolean>>,
    current: boolean,
  ) => {
    interact()
    closeAll()
    setter(!current)
  }

  const pillClass =
    'inline-flex items-center gap-0.5 overflow-x-auto rounded-full border border-neutral-200 bg-white px-1 py-0.5 shadow-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ' +
    (embedded
      ? 'w-fit max-w-[min(calc(100vw-1.5rem),440px)]'
      : 'max-w-[min(100vw-1rem,520px)] shadow-[0_4px_20px_rgba(0,0,0,0.12)]')

  const toolbar = (
    <div
      role="toolbar"
      aria-label={isImage ? 'Ajustes de imagen' : 'Ajustes de texto'}
      className={pillClass}
    >
      {isText ? (
        <>
          <div ref={fontRef} className="relative shrink-0">
            <button
              type="button"
              title="Fuente"
              aria-expanded={fontOpen}
              onClick={() => toggle(setFontOpen, fontOpen)}
              className="flex h-8 max-w-[6rem] cursor-pointer items-center gap-0.5 rounded-lg px-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-100 sm:max-w-[7rem]"
            >
              <span className="truncate">{shortFont}</span>
              <IconChevronDown className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
            </button>
            <ToolbarFloatingPopover
              open={fontOpen}
              onClose={() => setFontOpen(false)}
              anchorRef={fontRef}
              placement={popoverPlacement}
              className="max-h-52 w-48 overflow-y-auto py-1"
            >
              {EDITOR_FONTS.map((font) => (
                <button
                  key={font.name}
                  type="button"
                  onClick={() => {
                    patch({ fontFamily: font.name })
                    setFontOpen(false)
                  }}
                  className={
                    'flex w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-violet-50 ' +
                    (fontFamily === font.name ? 'bg-violet-100 font-semibold' : '')
                  }
                  style={{ fontFamily: font.name }}
                >
                  {font.name}
                </button>
              ))}
            </ToolbarFloatingPopover>
          </div>

          <div className="flex h-8 shrink-0 items-stretch overflow-hidden rounded-lg border border-neutral-200">
            <button
              type="button"
              title="Reducir tamaño"
              aria-label="Reducir tamaño"
              className="flex w-7 cursor-pointer items-center justify-center text-neutral-600 hover:bg-neutral-50"
              onClick={() => {
                interact()
                bumpSize(-1)
              }}
            >
              −
            </button>
            <input
              type="number"
              min={MIN_FONT_SIZE}
              max={MAX_FONT_SIZE}
              value={fontSize}
              title="Tamaño en píxeles"
              aria-label="Tamaño de texto"
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => commitFontSize(e.target.value)}
              className="w-11 border-x border-neutral-200 bg-white text-center text-xs font-semibold tabular-nums text-neutral-800 outline-none focus:bg-violet-50"
            />
            <button
              type="button"
              title="Aumentar tamaño"
              aria-label="Aumentar tamaño"
              className="flex w-7 cursor-pointer items-center justify-center text-neutral-600 hover:bg-neutral-50"
              onClick={() => {
                interact()
                bumpSize(1)
              }}
            >
              +
            </button>
          </div>

          <ToolbarDivider />

          <div ref={colorRef} className="relative shrink-0">
            <button
              type="button"
              title="Color"
              aria-expanded={colorOpen}
              onClick={() => toggle(setColorOpen, colorOpen)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full hover:bg-neutral-100"
            >
              <IconTextColor color={color} />
            </button>
            <ToolbarFloatingPopover
              open={colorOpen}
              onClose={() => setColorOpen(false)}
              anchorRef={colorRef}
              placement={popoverPlacement}
              className="w-52 p-3"
            >
              <div className="grid grid-cols-6 gap-1.5">
                {PRINT_SWATCHES.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    title={hex}
                    onClick={() => {
                      patch({ color: hex })
                      setColorOpen(false)
                    }}
                    className={
                      'aspect-square cursor-pointer rounded-md border-2 ' +
                      (color.toLowerCase() === hex.toLowerCase()
                        ? 'border-violet-600'
                        : 'border-neutral-200')
                    }
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={color}
                onChange={(e) => patch({ color: e.target.value })}
                className="mt-2 h-9 w-full cursor-pointer rounded border-0"
                aria-label="Color personalizado"
              />
            </ToolbarFloatingPopover>
          </div>

          <ToolbarDivider />

          <IconToolBtn
            title="Negrita"
            active={isBold}
            onClick={() => {
              interact()
              patch({ fontWeight: isBold ? 500 : 800 })
            }}
          >
            <span className="font-bold">B</span>
          </IconToolBtn>
          <IconToolBtn
            title="Cursiva"
            active={isItalic}
            onClick={() => {
              interact()
              patch({ fontStyle: isItalic ? 'normal' : 'italic' })
            }}
          >
            <span className="italic font-serif">I</span>
          </IconToolBtn>
          <IconToolBtn
            title="Subrayado"
            active={isUnderline}
            onClick={() => {
              interact()
              patch({
                textDecoration: isUnderline ? 'none' : 'underline',
              })
            }}
          >
            <span className="underline">U</span>
          </IconToolBtn>

          <ToolbarDivider />

          <div ref={textRef} className="relative shrink-0">
            <ToolbarLabelBtn
              label="Editar"
              title="Editar texto"
              active={textOpen}
              onClick={() => toggle(setTextOpen, textOpen)}
              icon={<IconEditText className="h-4 w-4 sm:hidden" />}
            />
            <ToolbarFloatingPopover
              open={textOpen}
              onClose={() => setTextOpen(false)}
              anchorRef={textRef}
              placement={popoverPlacement}
              className="w-[min(260px,calc(100vw-2rem))] p-2"
            >
              <input
                type="text"
                value={shape.text ?? ''}
                onChange={(e) => patch({ text: e.target.value })}
                placeholder="Escribe aquí…"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                autoFocus
              />
            </ToolbarFloatingPopover>
          </div>
        </>
      ) : null}

      {isImage ? (
        <>
          <div ref={imageAdjustRef} className="relative shrink-0">
            <ToolbarLabelBtn
              label="Editar"
              title="Opacidad y esquinas"
              active={imageAdjustOpen}
              onClick={() => toggle(setImageAdjustOpen, imageAdjustOpen)}
            />
            <ToolbarFloatingPopover
              open={imageAdjustOpen}
              onClose={() => setImageAdjustOpen(false)}
              anchorRef={imageAdjustRef}
              placement={popoverPlacement}
              className="w-52 p-3"
            >
              <label className="flex items-center gap-2">
                <IconOpacity className="h-4 w-4 shrink-0 text-neutral-500" />
                <input
                  type="range"
                  min={20}
                  max={100}
                  value={opacityPct}
                  onChange={(e) =>
                    patch({ opacity: Number(e.target.value) / 100 })
                  }
                  className="min-w-0 flex-1 accent-violet-600"
                  aria-label="Opacidad"
                />
                <span className="w-8 text-right text-[11px] font-semibold tabular-nums">
                  {opacityPct}%
                </span>
              </label>
              <label className="mt-2.5 flex items-center gap-2">
                <IconCorners className="h-4 w-4 shrink-0 text-neutral-500" />
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={shape.borderRadius ?? 0}
                  onChange={(e) =>
                    patch({ borderRadius: Number(e.target.value) })
                  }
                  className="min-w-0 flex-1 accent-violet-600"
                  aria-label="Esquinas"
                />
                <span className="w-8 text-right text-[11px] font-semibold tabular-nums">
                  {shape.borderRadius ?? 0}%
                </span>
              </label>
            </ToolbarFloatingPopover>
          </div>

          <ToolbarDivider />

          {onToggleCrop ? (
            <ToolbarLabelBtn
              label={cropActive ? 'Aplicar' : 'Recortar'}
              title={cropActive ? 'Aplicar recorte' : 'Recortar imagen'}
              active={cropActive}
              onClick={() => {
                interact()
                closeAll()
                onToggleCrop()
              }}
              icon={<IconCrop className="h-4 w-4 sm:hidden" />}
            />
          ) : null}

          <ToolbarLabelBtn
            label="Voltear"
            title="Voltear horizontalmente"
            active={!!shape.flipX}
            onClick={() => {
              interact()
              patch({ flipX: !shape.flipX })
            }}
            icon={<IconFlip className="h-4 w-4 sm:hidden" />}
          />

          <IconToolBtn
            title="Opacidad"
            onClick={() => toggle(setImageAdjustOpen, imageAdjustOpen)}
          >
            <IconOpacity className="h-4 w-4" />
          </IconToolBtn>
        </>
      ) : null}

      {onOpenLayersPanel ? (
        <>
          <ToolbarDivider />
          <IconToolBtn
            title="Ver y ordenar capas"
            onClick={() => {
              interact()
              closeAll()
              onOpenLayersPanel()
            }}
          >
            <IconLayerUp />
          </IconToolBtn>
        </>
      ) : null}

      {onDuplicate || onRemove ? (
        <>
          <ToolbarDivider />
          {onDuplicate ? (
            <IconToolBtn title="Duplicar" onClick={() => { interact(); onDuplicate() }}>
              <IconDuplicate />
            </IconToolBtn>
          ) : null}
          {onRemove ? (
            <button
              type="button"
              title="Eliminar"
              aria-label="Eliminar"
              onClick={() => {
                interact()
                onRemove()
              }}
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-neutral-700 transition hover:bg-red-50 hover:text-red-600 active:scale-95"
            >
              <IconTrash />
            </button>
          ) : null}
        </>
      ) : null}
    </div>
  )

  if (floating || embedded) {
    return (
      <div
        onPointerDown={(e) => e.stopPropagation()}
        className={
          embedded ? 'flex justify-center' : 'pointer-events-auto'
        }
      >
        {toolbar}
      </div>
    )
  }

  return (
    <div
      className="flex shrink-0 justify-center px-2 pt-2 pb-1 max-lg:pt-2.5 lg:pt-1.5 lg:pb-0"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {toolbar}
    </div>
  )
}
