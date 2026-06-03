import Image from 'next/image'
import { CREWNECK_UNISEX_MOCKUPS } from '../../lib/mockup-assets'

const NAV_ITEMS = [
  { label: 'Diseños', active: true },
  { label: 'Texto', active: false },
  { label: 'Elementos', active: false },
  { label: 'Capas', active: false },
  { label: 'Prenda', active: false },
] as const

function NavIcon({ active }: { active: boolean }) {
  return (
    <span
      className={
        'flex h-5 w-5 items-center justify-center rounded-md ' +
        (active ? 'bg-violet-600' : 'bg-transparent')
      }
    >
      <svg
        viewBox="0 0 24 24"
        className="h-3 w-3"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.75}
        aria-hidden
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    </span>
  )
}

/** Icono de imagen (miniatura / diseño en el mockup) */
function ImagePictureIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className ?? 'h-5 w-5'}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.75" fill="currentColor" stroke="none" />
      <path
        d="M3 16l5.5-5.5a1.5 1.5 0 0 1 2.1 0L14 14l2.4-2.4a1.5 1.5 0 0 1 2.1 0L21 16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function AccountIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className ?? 'h-3.5 w-3.5'}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" strokeLinecap="round" />
    </svg>
  )
}

function BagIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className ?? 'h-3.5 w-3.5'}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M8 7V6a4 4 0 118 0v1" />
      <path d="M5 7h14l-1.2 12H6.2L5 7z" />
    </svg>
  )
}

function DesignThumbCell() {
  return (
    <div className="flex aspect-square items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-400">
      <ImagePictureIcon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
    </div>
  )
}

function PropertiesToolbarMock() {
  return (
    <div className="flex items-center gap-0.5 rounded-full border border-neutral-200 bg-white px-1 py-0.5 shadow-md">
      <span className="flex h-5 w-5 items-center justify-center rounded-full text-neutral-600">
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path d="M12 2v20M2 12h20" strokeLinecap="round" />
        </svg>
      </span>
      <span className="flex h-5 w-5 items-center justify-center rounded-full text-violet-600">
        <ImagePictureIcon className="h-3 w-3" />
      </span>
      <span className="flex h-5 w-5 items-center justify-center rounded-full text-neutral-500">
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path d="M4 7h16M9 7V5h6v2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  )
}

/** Vista estática del editor (barra, panel, lienzo y controles) para la home */
export function HomeEditorInterfacePreview() {
  const mockupSrc = CREWNECK_UNISEX_MOCKUPS.WHITE.front

  return (
    <div
      className="mx-auto w-full max-w-[min(100%,420px)] overflow-hidden rounded-2xl border border-neutral-200 bg-[#eef0f4] shadow-[0_16px_40px_rgba(0,0,0,0.08)]"
      role="img"
      aria-label="Vista del editor: barra superior, panel de diseños, mockup con gráfico y controles de zoom"
    >
      <div className="flex h-8 items-center justify-between gap-2 border-b border-neutral-700/40 bg-[#1e1e2e] px-2.5 text-white">
        <span className="truncate text-[10px] font-bold tracking-tight">
          Make It Yours
        </span>
        <div className="flex shrink-0 items-center gap-1">
          <span className="hidden rounded-full border border-white/35 bg-white px-2 py-0.5 text-[8px] font-bold text-neutral-900 sm:inline">
            Cotizar
          </span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-white">
            <AccountIcon />
          </span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-white">
            <BagIcon />
          </span>
        </div>
      </div>

      <div className="flex h-[200px] min-h-0 sm:h-[220px]">
        <nav className="flex w-10 shrink-0 flex-col items-center gap-0.5 border-r border-black/20 bg-[#12121a] py-1.5 sm:w-11">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              className="flex w-full flex-col items-center px-0.5 py-0.5"
            >
              <NavIcon active={item.active} />
              <span
                className={
                  'mt-0.5 max-w-full truncate text-center text-[7px] font-semibold leading-none ' +
                  (item.active ? 'text-violet-200' : 'text-neutral-500')
                }
              >
                {item.label}
              </span>
            </div>
          ))}
        </nav>

        <aside className="flex w-[88px] shrink-0 flex-col border-r border-neutral-200 bg-[#f8f9fb] sm:w-[100px]">
          <div className="shrink-0 border-b border-neutral-200 bg-white px-2 py-1.5">
            <p className="text-[9px] font-bold text-neutral-900">Diseños</p>
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-2 gap-1 overflow-hidden p-1.5">
            {Array.from({ length: 4 }, (_, i) => (
              <DesignThumbCell key={i} />
            ))}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="relative flex min-h-0 flex-1 items-center justify-center bg-[#e8ebf0] px-1.5 py-1.5">
            <div className="pointer-events-none absolute inset-x-0 top-1.5 z-10 flex justify-center px-1">
              <PropertiesToolbarMock />
            </div>

            <div className="relative aspect-[400/520] h-full max-h-[148px] w-auto overflow-hidden rounded-md shadow-md sm:max-h-[168px]">
              <Image
                src={mockupSrc}
                alt=""
                fill
                sizes="160px"
                className="object-contain object-center"
              />
              <div className="absolute inset-0 flex items-center justify-center p-[18%]">
                <div className="flex aspect-[5/4] w-[48%] items-center justify-center rounded border-2 border-violet-400/80 bg-violet-50/90 text-violet-600 shadow-sm">
                  <ImagePictureIcon className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex h-7 shrink-0 items-center justify-end gap-1 border-t border-neutral-200 bg-[#eef0f2] px-2">
            <span className="text-[8px] font-medium text-neutral-500">100%</span>
            <span className="mx-0.5 h-3 w-px bg-neutral-300" />
            <span className="rounded-md bg-violet-600 px-1.5 py-0.5 text-[8px] font-semibold text-white shadow-sm">
              Frente
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
