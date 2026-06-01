'use client'

type IconBtnProps = {
  title: string
  onPointerDown?: (e: React.PointerEvent) => void
  onClick?: () => void
  danger?: boolean
  children: React.ReactNode
}

function FrameIconBtn({
  title,
  onPointerDown,
  onClick,
  danger,
  children,
}: IconBtnProps) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onPointerDown={(e) => {
        e.stopPropagation()
        onPointerDown?.(e)
      }}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      className={
        'flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-neutral-700 transition hover:bg-neutral-100 active:scale-95 ' +
        (danger ? 'hover:bg-red-50 hover:text-red-600' : '')
      }
    >
      {children}
    </button>
  )
}

function IconMove() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M12 2v20M2 12h20M7 7l5-5 5 5M7 17l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path d="M4 7h16M9 7V5h6v2M10 11v6M14 11v6M6 7l1 12h10l1-12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconRotate() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M4 12a8 8 0 0114-5M20 12a8 8 0 01-14 5" strokeLinecap="round" />
      <path d="M17 4v4h-4M7 20v-4h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

type Props = {
  onMoveStart: (e: React.PointerEvent) => void
  onRemove?: () => void
  onRotateStart: (e: React.PointerEvent) => void
}

/** Acciones visibles en el marco de selección (mover, eliminar, girar) */
export function SelectionFrameActions({
  onMoveStart,
  onRemove,
  onRotateStart,
}: Props) {
  return (
    <div
      className="flex items-center gap-0.5 rounded-full border border-neutral-200 bg-white px-1 py-0.5 shadow-[0_4px_16px_rgba(0,0,0,0.14)]"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <FrameIconBtn title="Mover" onPointerDown={onMoveStart}>
        <IconMove />
      </FrameIconBtn>
      {onRemove ? (
        <FrameIconBtn title="Eliminar" danger onClick={onRemove}>
          <IconTrash />
        </FrameIconBtn>
      ) : null}
      <FrameIconBtn title="Girar" onPointerDown={onRotateStart}>
        <IconRotate />
      </FrameIconBtn>
    </div>
  )
}
