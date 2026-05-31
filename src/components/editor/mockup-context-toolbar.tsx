'use client'

import type { DesignShape } from '../../types/design'
type Props = {
  shape: DesignShape
  updateShape: (id: string, patch: Partial<DesignShape>) => void
  onDuplicate: () => void
  onRemove: () => void
  cropMode: boolean
  onToggleCrop: () => void
  onRemoveBackground?: () => void
  removingBackground?: boolean
  layout?: 'horizontal' | 'vertical'
}

function ToolbarBtn({
  active,
  title,
  onClick,
  children,
  className = '',
  disabled,
  fullWidth,
}: {
  active?: boolean
  title: string
  onClick: () => void
  children: React.ReactNode
  className?: string
  disabled?: boolean
  fullWidth?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={
        'flex cursor-pointer items-center justify-center rounded-lg text-sm font-bold transition ' +
        (fullWidth ? 'min-h-10 w-full px-3 ' : 'h-10 min-w-10 px-2.5 ') +
        (active
          ? 'bg-violet-600 text-white shadow-sm'
          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200') +
        ' ' +
        className
      }
    >
      {children}
    </button>
  )
}

export function MockupContextToolbar({
  shape,
  updateShape,
  onDuplicate,
  onRemove,
  cropMode,
  onToggleCrop,
  onRemoveBackground,
  removingBackground = false,
  layout = 'horizontal',
}: Props) {
  const isText = shape.type === 'text' || shape.type === 'icon'
  const isImage = shape.type === 'image'
  const patch = (p: Partial<DesignShape>) => updateShape(shape.id, p)
  const vertical = layout === 'vertical'

  const textRowClass = vertical
    ? 'grid w-full grid-cols-4 gap-2'
    : 'flex flex-wrap items-center gap-1.5'

  return (
    <div
      className={vertical ? 'w-full' : 'w-full max-w-2xl'}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {isText ? (
        <div className={textRowClass}>
          <ToolbarBtn
            title="Negrita"
            active={(shape.fontWeight ?? 600) >= 700}
            fullWidth={vertical}
            onClick={() =>
              patch({
                fontWeight: (shape.fontWeight ?? 600) >= 700 ? 400 : 700,
              })
            }
          >
            B
          </ToolbarBtn>
          <ToolbarBtn
            title="Cursiva"
            active={shape.fontStyle === 'italic'}
            fullWidth={vertical}
            onClick={() =>
              patch({
                fontStyle:
                  shape.fontStyle === 'italic' ? 'normal' : 'italic',
              })
            }
            className="italic"
          >
            I
          </ToolbarBtn>
          <ToolbarBtn
            title="Subrayado"
            active={shape.textDecoration === 'underline'}
            fullWidth={vertical}
            onClick={() =>
              patch({
                textDecoration:
                  shape.textDecoration === 'underline' ? 'none' : 'underline',
              })
            }
            className="underline"
          >
            U
          </ToolbarBtn>
          <ToolbarBtn
            title="Tachado"
            active={shape.textDecoration === 'line-through'}
            fullWidth={vertical}
            onClick={() =>
              patch({
                textDecoration:
                  shape.textDecoration === 'line-through'
                    ? 'none'
                    : 'line-through',
              })
            }
            className="line-through"
          >
            S
          </ToolbarBtn>
        </div>
      ) : null}

      {isImage ? (
        <div className={vertical ? 'mt-2 w-full space-y-2' : 'space-y-2'}>
          {onRemoveBackground ? (
            <ToolbarBtn
              title="Quitar fondo de la imagen"
              fullWidth={vertical}
              disabled={removingBackground}
              onClick={onRemoveBackground}
              className="text-sm font-semibold"
            >
              {removingBackground ? 'Procesando…' : 'Quitar fondo'}
            </ToolbarBtn>
          ) : null}
          <ToolbarBtn
            title={cropMode ? 'Terminar recorte' : 'Recortar en mockup'}
            active={cropMode}
            fullWidth={vertical}
            onClick={onToggleCrop}
            className="text-sm font-semibold"
          >
            ✂ {cropMode ? 'Terminar recorte' : 'Recortar'}
          </ToolbarBtn>
          {vertical ? (
            <p className="mt-2 text-xs text-neutral-500">
              Gira con ↻ en el mockup
            </p>
          ) : (
            <span className="text-[11px] font-medium text-neutral-500">
              Gira con ↻ en el mockup
            </span>
          )}
        </div>
      ) : null}

      <div
        className={
          (vertical ? 'mt-3 flex w-full flex-col gap-2 ' : 'mt-2 flex flex-wrap gap-1.5 ') +
          (isText || isImage ? '' : '')
        }
      >
        <ToolbarBtn
          title="Copiar"
          fullWidth={vertical}
          onClick={onDuplicate}
          className="text-sm font-semibold"
        >
          Copiar
        </ToolbarBtn>
        <ToolbarBtn
          title="Eliminar"
          fullWidth={vertical}
          onClick={onRemove}
          className="bg-red-50 text-sm font-semibold text-red-600 hover:bg-red-100"
        >
          Eliminar
        </ToolbarBtn>
      </div>
    </div>
  )
}
