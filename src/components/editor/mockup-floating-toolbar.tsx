'use client'

import type { DesignShape } from '../../types/design'

type Props = {
  shape: DesignShape
  onDuplicate: () => void
  onRemove: () => void
  cropMode: boolean
  onToggleCrop: () => void
  onRemoveBackground?: () => void
  removingBackground?: boolean
}

function Btn({
  onClick,
  children,
  variant = 'default',
  disabled,
  title,
}: {
  onClick: () => void
  children: React.ReactNode
  variant?: 'default' | 'danger' | 'primary'
  disabled?: boolean
  title: string
}) {
  const styles = {
    default:
      'bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-50',
    danger: 'bg-red-600 text-white border-red-700 hover:bg-red-700',
    primary:
      'bg-violet-600 text-white border-violet-700 hover:bg-violet-700',
  }
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={
        'flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold shadow-md transition active:scale-95 sm:px-4 sm:text-sm ' +
        styles[variant]
      }
    >
      {children}
    </button>
  )
}

export function MockupFloatingToolbar({
  shape,
  onDuplicate,
  onRemove,
  cropMode,
  onToggleCrop,
  onRemoveBackground,
  removingBackground,
}: Props) {
  const isImage = shape.type === 'image'

  return (
    <div
      className="flex max-w-[min(100vw-24px,420px)] flex-wrap items-center justify-center gap-2 rounded-2xl border border-neutral-200/90 bg-white/95 p-2 shadow-xl backdrop-blur-md"
      onPointerDown={(e) => e.stopPropagation()}
      role="toolbar"
      aria-label="Acciones del elemento"
    >
      <Btn title="Eliminar del mockup" variant="danger" onClick={onRemove}>
        <span aria-hidden>🗑</span>
        <span>Eliminar</span>
      </Btn>
      <Btn title="Duplicar elemento" onClick={onDuplicate}>
        <span aria-hidden>⧉</span>
        <span>Copiar</span>
      </Btn>
      {isImage ? (
        <>
          <Btn
            title={cropMode ? 'Terminar recorte' : 'Recortar imagen'}
            variant={cropMode ? 'primary' : 'default'}
            onClick={onToggleCrop}
          >
            ✂ {cropMode ? 'Listo' : 'Recortar'}
          </Btn>
          {onRemoveBackground ? (
            <Btn
              title="Quitar fondo"
              disabled={removingBackground}
              onClick={onRemoveBackground}
            >
              {removingBackground ? '…' : 'Sin fondo'}
            </Btn>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
