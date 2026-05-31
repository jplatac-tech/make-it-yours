'use client'

import type { ReactNode } from 'react'
import type { EditorPanelId } from './editor-panel'

export type DockOpenTab = EditorPanelId | 'properties' | null

const ITEMS: {
  id: EditorPanelId
  label: string
  Icon: (props: { active: boolean }) => ReactNode
}[] = [
  {
    id: 'designs',
    label: 'Diseños',
    Icon: ({ active }) => (
      <svg
        viewBox="0 0 24 24"
        className="h-[22px] w-[22px]"
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
    ),
  },
  {
    id: 'text',
    label: 'Texto',
    Icon: ({ active }) => (
      <span
        className={
          'font-serif leading-none ' + (active ? 'text-[17px]' : 'text-[16px]')
        }
      >
        T
      </span>
    ),
  },
  {
    id: 'elements',
    label: 'Elementos',
    Icon: ({ active }) => (
      <svg
        viewBox="0 0 24 24"
        className="h-[22px] w-[22px]"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.75}
        aria-hidden
      >
        <path d="M12 2l3 7h7l-5.5 4.5 2 7L12 16l-6.5 4.5 2-7L2 9h7z" />
      </svg>
    ),
  },
  {
    id: 'garment',
    label: 'Prenda',
    Icon: ({ active }) => (
      <svg
        viewBox="0 0 24 24"
        className="h-[22px] w-[22px]"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.75}
        aria-hidden
      >
        <path d="M8 4h8l2 4v2l-2 12H8L6 10V8l2-4z" />
        <path d="M8 4c0 0 2-2 4-2s4 2 4 2" />
      </svg>
    ),
  },
]

type Props = {
  activePanel: EditorPanelId
  onSelect: (id: EditorPanelId) => void
  layout?: 'vertical' | 'horizontal' | 'dock'
  /** Solo layout dock: pestaña activa del panel inferior */
  openTab?: DockOpenTab
}

export function EditorSidebarNav({
  activePanel,
  onSelect,
  layout = 'vertical',
  openTab = null,
}: Props) {
  if (layout === 'dock') {
    return (
      <nav
        className="flex min-w-0 flex-1 items-center justify-around gap-0.5"
        aria-label="Herramientas del editor"
      >
        {ITEMS.map((item) => {
          const active = openTab === item.id
          return (
            <button
              key={item.id}
              type="button"
              title={item.label}
              aria-current={active ? 'page' : undefined}
              onClick={() => onSelect(item.id)}
              className={
                'flex h-[64px] min-h-[64px] min-w-[56px] flex-1 max-w-[88px] cursor-pointer flex-col items-center justify-center rounded-xl px-1.5 transition ' +
                (active
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:bg-white/10 hover:text-neutral-200')
              }
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center">
                <item.Icon active={active} />
              </span>
              <span className="mt-1 truncate text-xs font-bold leading-none">
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>
    )
  }

  if (layout === 'horizontal') {
    return (
      <nav
        className="flex shrink-0 items-center gap-0.5"
        aria-label="Herramientas del editor"
      >
        {ITEMS.map((item) => {
          const active = activePanel === item.id
          return (
            <button
              key={item.id}
              type="button"
              title={item.label}
              onClick={() => onSelect(item.id)}
              className={
                'flex shrink-0 flex-col items-center rounded-lg px-2.5 py-1.5 transition ' +
                (active
                  ? 'bg-violet-600 text-white'
                  : 'text-neutral-400 hover:bg-white/10 hover:text-neutral-200')
              }
            >
              <span className="flex h-7 w-7 items-center justify-center">
                <item.Icon active={active} />
              </span>
              <span className="mt-0.5 text-[10px] font-semibold">{item.label}</span>
            </button>
          )
        })}
      </nav>
    )
  }

  return (
    <nav
      className="flex w-[64px] shrink-0 flex-col items-center border-r border-black/20 bg-[#12121a] py-3"
      aria-label="Herramientas del editor"
    >
      {ITEMS.map((item) => {
        const active = activePanel === item.id
        return (
          <button
            key={item.id}
            type="button"
            title={item.label}
            onClick={() => onSelect(item.id)}
            className={
              'group mb-0.5 flex w-full flex-col items-center rounded-md px-1 py-2 transition-colors ' +
              (active
                ? 'text-white'
                : 'text-neutral-500 hover:bg-white/[0.06] hover:text-neutral-300')
            }
          >
            <span
              className={
                'flex h-8 w-8 items-center justify-center rounded-lg transition ' +
                (active
                  ? 'bg-violet-600 shadow-sm shadow-violet-900/40'
                  : 'bg-transparent group-hover:bg-white/[0.05]')
              }
            >
              <item.Icon active={active} />
            </span>
            <span
              className={
                'mt-1 max-w-[58px] text-center text-[11px] font-semibold leading-tight ' +
                (active ? 'text-violet-100' : 'text-neutral-400 group-hover:text-neutral-300')
              }
            >
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
