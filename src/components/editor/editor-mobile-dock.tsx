'use client'

import type { CSSProperties, Dispatch, SetStateAction } from 'react'
import Link from 'next/link'
import type { TextPreset } from '../../lib/text-presets'
import type { ProductColorValue } from '../../lib/products'
import type { DesignShape } from '../../types/design'
import { EditorPanel, type EditorPanelId, PANEL_TITLES } from './editor-panel'
import { EditorSidebarNav } from './editor-sidebar-nav'
import { MockupEditPanel } from './mockup-edit-panel'

export type MobileDockTab = EditorPanelId | 'properties'

/** Altura del panel desplegable cuando una pestaña está abierta */
export const MOBILE_DOCK_PANEL_MAX = 'min(44dvh, 400px)'

type Props = {
  mobileTab: MobileDockTab | null
  setMobileTab: Dispatch<SetStateAction<MobileDockTab | null>>
  activePanel: EditorPanelId
  setActivePanel: (id: EditorPanelId) => void
  selectedShape: DesignShape | null
  productColor: ProductColorValue
  setProductColor: (v: ProductColorValue) => void
  onClearSelection: () => void
  addText: () => void
  addTextPreset: (preset: TextPreset) => void
  onDesignSelect: (src: string) => void
  onGallerySelect: (src: string, title: string) => void
  addIcon: (icon: string) => void
  onUploadSelect: (src: string, name: string) => void
  onUserUpload: (file: File) => void
  uploadsRefresh: number
  canContinue: boolean
  whatsappDesignHref: string
  printZone: string
  canvasW: number
  canvasH: number
  updateShape: (id: string, patch: Partial<DesignShape>) => void
  onDuplicate: () => void
  onRemove: () => void
  cropMode: boolean
  onToggleCrop: () => void
}

function panelTitle(tab: MobileDockTab): string {
  return tab === 'properties' ? 'Propiedades' : PANEL_TITLES[tab]
}

export function EditorMobileDock({
  mobileTab,
  setMobileTab,
  activePanel,
  setActivePanel,
  selectedShape,
  ...rest
}: Props) {
  const isOpen = mobileTab !== null

  const toggleTool = (id: EditorPanelId) => {
    setActivePanel(id)
    setMobileTab((current) => (current === id ? null : id))
  }

  const toggleProperties = () => {
    if (!selectedShape) return
    setMobileTab((current) => (current === 'properties' ? null : 'properties'))
  }

  const closePanel = () => setMobileTab(null)

  return (
    <div
      className="flex shrink-0 flex-col lg:hidden"
      style={
        {
          '--mobile-dock-panel-max': MOBILE_DOCK_PANEL_MAX,
        } as CSSProperties
      }
    >
      {/* Panel colapsable */}
      <div
        className={
          'overflow-hidden border-t border-neutral-200 bg-[#f8f9fb] transition-[max-height] duration-300 ease-out ' +
          (isOpen ? 'max-h-[var(--mobile-dock-panel-max)]' : 'max-h-0')
        }
        aria-hidden={!isOpen}
      >
        {isOpen && mobileTab ? (
          <div
            className="flex max-h-[var(--mobile-dock-panel-max)] flex-col"
            style={{ maxHeight: MOBILE_DOCK_PANEL_MAX }}
          >
            <div className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-neutral-200 bg-white px-3">
              <h2 className="truncate text-sm font-bold text-neutral-900">
                {panelTitle(mobileTab)}
              </h2>
              <button
                type="button"
                onClick={closePanel}
                className="flex h-9 min-w-[72px] shrink-0 cursor-pointer items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-xs font-bold text-neutral-700"
                aria-label="Cerrar panel"
              >
                Cerrar
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {mobileTab === 'properties' && selectedShape ? (
                <MockupEditPanel
                  mode="mobile"
                  selectedShape={selectedShape}
                  {...rest}
                />
              ) : mobileTab !== 'properties' ? (
                <EditorPanel
                  mode="mobile"
                  hideHeader
                  activePanel={activePanel}
                  setActivePanel={setActivePanel}
                  {...rest}
                />
              ) : null}
            </div>

            <div className="shrink-0 space-y-2 border-t border-neutral-200 bg-white px-3 py-2.5">
              {rest.canContinue ? (
                <a
                  href={rest.whatsappDesignHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-full items-center justify-center rounded-xl bg-[#25D366] text-sm font-bold text-white"
                >
                  Cotizar por WhatsApp
                </a>
              ) : (
                <p className="py-0.5 text-center text-xs text-neutral-500">
                  Añade un elemento para cotizar
                </p>
              )}
              <Link
                href="/comprar"
                className="block text-center text-xs font-semibold text-violet-700"
              >
                Guardar pedido
              </Link>
            </div>
          </div>
        ) : null}
      </div>

      {/* Barra de pestañas — siempre visible, tamaño fijo */}
      <div className="flex h-[60px] shrink-0 items-stretch gap-1 border-t border-black/25 bg-[#12121a] px-1 py-1 pb-[max(4px,env(safe-area-inset-bottom))]">
        <EditorSidebarNav
          layout="dock"
          activePanel={activePanel}
          openTab={mobileTab}
          onToggle={toggleTool}
        />
        <button
          type="button"
          onClick={toggleProperties}
          disabled={!selectedShape}
          aria-expanded={mobileTab === 'properties'}
          className={
            'flex h-[52px] min-w-[52px] shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl px-2 transition ' +
            (mobileTab === 'properties'
              ? 'bg-violet-600 text-white'
              : selectedShape
                ? 'text-neutral-300 hover:bg-white/10'
                : 'cursor-not-allowed text-neutral-600 opacity-50')
          }
        >
          <span className="flex h-7 w-7 items-center justify-center text-base font-bold">
            ⚙
          </span>
          <span className="mt-0.5 text-[10px] font-bold">Props</span>
        </button>
        {rest.canContinue ? (
          <a
            href={rest.whatsappDesignHref}
            target="_blank"
            rel="noopener noreferrer"
            title="Cotizar por WhatsApp"
            className="ml-auto flex h-[52px] min-w-[52px] shrink-0 flex-col items-center justify-center rounded-xl bg-[#25D366] px-2 text-white"
          >
            <span className="text-lg leading-none" aria-hidden>
              💬
            </span>
            <span className="mt-0.5 text-[9px] font-bold">WA</span>
          </a>
        ) : null}
      </div>
    </div>
  )
}
