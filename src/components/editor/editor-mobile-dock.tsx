'use client'

import Link from 'next/link'
import type { TextPreset } from '../../lib/text-presets'
import type { ProductColorValue } from '../../lib/products'
import type { DesignShape } from '../../types/design'
import { EditorPanel, type EditorPanelId } from './editor-panel'
import { EditorSidebarNav } from './editor-sidebar-nav'
import { MockupEditPanel } from './mockup-edit-panel'

export type MobileDockTab = EditorPanelId | 'properties'

type Props = {
  mobileTab: MobileDockTab
  setMobileTab: (tab: MobileDockTab) => void
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

export function EditorMobileDock({
  mobileTab,
  setMobileTab,
  activePanel,
  setActivePanel,
  selectedShape,
  ...rest
}: Props) {
  const selectTool = (id: EditorPanelId) => {
    setActivePanel(id)
    setMobileTab(id)
  }

  const selectProperties = () => {
    if (!selectedShape) return
    setMobileTab('properties')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col border-t border-neutral-200 bg-[#f8f9fb] lg:hidden">
      <div className="flex h-[56px] shrink-0 items-stretch gap-1 border-b border-black/20 bg-[#12121a] px-1 py-1">
        <EditorSidebarNav
          layout="dock"
          activePanel={activePanel}
          openTab={mobileTab}
          onSelect={selectTool}
        />
        <button
          type="button"
          onClick={selectProperties}
          disabled={!selectedShape}
          aria-current={mobileTab === 'properties' ? 'page' : undefined}
          className={
            'flex h-[48px] min-w-[48px] shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl px-2 transition ' +
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
            className="ml-auto flex h-[48px] min-w-[48px] shrink-0 flex-col items-center justify-center rounded-xl bg-[#25D366] px-2 text-white"
          >
            <span className="text-lg leading-none" aria-hidden>
              💬
            </span>
            <span className="mt-0.5 text-[9px] font-bold">WA</span>
          </a>
        ) : null}
      </div>

      <div
        className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {mobileTab === 'properties' && selectedShape ? (
          <MockupEditPanel mode="mobile" selectedShape={selectedShape} {...rest} />
        ) : mobileTab !== 'properties' ? (
          <EditorPanel
            mode="mobile"
            hideHeader
            embedded
            activePanel={activePanel}
            setActivePanel={setActivePanel}
            {...rest}
          />
        ) : (
          <p className="px-4 py-6 text-sm text-neutral-500">
            Selecciona un elemento en el mockup para editar propiedades.
          </p>
        )}
      </div>

      <div className="shrink-0 space-y-1.5 border-t border-neutral-200 bg-white px-3 py-2 pb-[max(6px,env(safe-area-inset-bottom))]">
        {rest.canContinue ? (
          <a
            href={rest.whatsappDesignHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-full items-center justify-center rounded-xl bg-[#25D366] text-sm font-bold text-white"
          >
            Cotizar por WhatsApp
          </a>
        ) : null}
        <Link
          href="/comprar"
          className="block text-center text-xs font-semibold text-violet-700"
        >
          Guardar pedido
        </Link>
      </div>
    </div>
  )
}
