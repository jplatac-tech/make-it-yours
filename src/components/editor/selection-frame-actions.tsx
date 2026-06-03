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
  btnPx,
  iconPx,
  children,
}: IconBtnProps & { btnPx: number; iconPx: number }) {
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
        'flex shrink-0 cursor-pointer items-center justify-center rounded-full text-neutral-700 transition hover:bg-neutral-100 active:scale-95 touch-manipulation ' +
        (danger ? ' hover:bg-red-50 hover:text-red-600' : '')
      }
      style={{ width: btnPx, height: btnPx, minWidth: btnPx, minHeight: btnPx }}
    >
      <span
        className="flex items-center justify-center [&>svg]:block"
        style={{ width: iconPx, height: iconPx }}
      >
        {children}
      </span>
    </button>
  )
}

function IconMove({ size }: { size: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        d="M12 2v20M2 12h20M7 7l5-5 5 5M7 17l5 5 5-5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconTrash({ size }: { size: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        d="M4 7h16M9 7V5h6v2M10 11v6M14 11v6M6 7l1 12h10l1-12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconRotate({ size }: { size: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path d="M4 12a8 8 0 0114-5M20 12a8 8 0 01-14 5" strokeLinecap="round" />
      <path
        d="M17 4v4h-4M7 20v-4h4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

type Props = {
  onMoveStart: (e: React.PointerEvent) => void
  onRemove?: () => void
  onRotateStart: (e: React.PointerEvent) => void
  btnPx?: number
  iconPx?: number
}

/** Acciones visibles en el marco de selección (mover, eliminar, girar) */
export function SelectionFrameActions({
  onMoveStart,
  onRemove,
  onRotateStart,
  btnPx = 28,
  iconPx = 14,
}: Props) {
  return (
    <div
      className="flex items-center gap-0.5 rounded-full border border-neutral-200 bg-white px-0.5 py-0.5 shadow-[0_2px_10px_rgba(0,0,0,0.12)] touch-manipulation"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <FrameIconBtn
        title="Mover"
        btnPx={btnPx}
        iconPx={iconPx}
        onPointerDown={onMoveStart}
      >
        <IconMove size={iconPx} />
      </FrameIconBtn>
      {onRemove ? (
        <FrameIconBtn
          title="Eliminar"
          danger
          btnPx={btnPx}
          iconPx={iconPx}
          onClick={() => onRemove()}
        >
          <IconTrash size={iconPx} />
        </FrameIconBtn>
      ) : null}
      <FrameIconBtn
        title="Girar"
        btnPx={btnPx}
        iconPx={iconPx}
        onPointerDown={onRotateStart}
      >
        <IconRotate size={iconPx} />
      </FrameIconBtn>
    </div>
  )
}
