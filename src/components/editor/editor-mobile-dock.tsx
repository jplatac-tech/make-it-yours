'use client'

import type { Dispatch, SetStateAction } from 'react'
import Link from 'next/link'
import type { TextPreset } from '../../lib/text-presets'
import type { ProductColorValue } from '../../lib/products'
import type { DesignShape } from '../../types/design'
import { EditorPanel, type EditorPanelId } from './editor-panel'
import { EditorSidebarNav } from './editor-sidebar-nav'
import { MockupEditPanel } from './mockup-edit-panel'

export type MobileDockTab = EditorPanelId | 'properties' | null

type Props = {
  mobileTab: MobileDockTab
  setMobileTab: Dispatch<SetStateAction<MobileDockTab>>
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
  printZone: string
  canvasW: number
  canvasH: number
  updateShape: (id: string, patch: Partial<DesignShape>) => void
  onDuplicate: () => void
  onRemove: () => void
  cropMode: boolean
  onToggleCrop: () => void
  onRemoveBackground?: () => void
  removingBackground?: boolean
}

const TAB_BAR_H = 'min-h-[80px] py-2'

function panelPopupClass(tab: NonNullable<MobileDockTab>) {
  if (
    tab === 'designs' ||
    tab === 'text' ||
    tab === 'elements' ||
    tab === 'garment'
  ) {
    return 'max-h-[96px] overflow-hidden'
  }
  return 'max-h-[min(46dvh,400px)] overflow-y-auto overscroll-contain touch-pan-y'
}

export function EditorMobileDock({
  mobileTab,
  setMobileTab,
  activePanel,
  setActivePanel,
  selectedShape,
  ...rest
}: Props) {
  const closePanel = () => setMobileTab(null)

  const selectTool = (id: EditorPanelId) => {
    setActivePanel(id)
    setMobileTab((prev) => (prev === id ? null : id))
  }

  const selectProperties = () => {
    if (!selectedShape) return
    setMobileTab((prev) => (prev === 'properties' ? null : 'properties'))
  }

  const panelOpen = mobileTab !== null

  return (
    <div className="relative z-30 shrink-0 lg:hidden">
      {panelOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/25 lg:hidden"
          aria-label="Cerrar herramientas"
          onClick={closePanel}
        />
      ) : null}

      <div className="relative z-40">
        {panelOpen ? (
          <div
            role="dialog"
            aria-modal="true"
            className={
              'absolute bottom-full left-0 right-0 rounded-t-2xl border border-b-0 border-neutral-200/90 bg-[#f8f9fb] shadow-[0_-10px_28px_rgba(0,0,0,0.14)] ' +
              panelPopupClass(mobileTab)
            }
            style={{ WebkitOverflowScrolling: 'touch' }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {mobileTab === 'properties' && selectedShape ? (
              <MockupEditPanel
                mode="mobile"
                selectedShape={selectedShape}
                {...rest}
              />
            ) : mobileTab === 'properties' ? (
              <p className="px-4 py-4 text-sm text-neutral-500">
                Selecciona un elemento en el mockup para editar propiedades.
              </p>
            ) : (
              <EditorPanel
                mode="mobile"
                hideHeader
                embedded
                activePanel={activePanel}
                setActivePanel={setActivePanel}
                {...rest}
              />
            )}
          </div>
        ) : null}

        <div
          className={
            'flex shrink-0 items-stretch gap-1.5 border-t border-black/20 bg-[#12121a] px-2 ' +
            TAB_BAR_H
          }
        >
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
              'flex h-[64px] min-w-[64px] shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl px-2 transition ' +
              (mobileTab === 'properties'
                ? 'bg-violet-600 text-white'
                : selectedShape
                  ? 'text-neutral-300 hover:bg-white/10'
                  : 'cursor-not-allowed text-neutral-600 opacity-50')
            }
          >
            <span className="flex h-9 w-9 items-center justify-center text-xl font-bold">
              ⚙
            </span>
            <span className="mt-0.5 text-xs font-bold">Props</span>
          </button>
        </div>
      </div>

      <div className="relative z-40 shrink-0 border-t border-neutral-200 bg-white px-3 py-3 pb-[max(8px,env(safe-area-inset-bottom))]">
        <Link
          href="/comprar"
          className="block py-1 text-center text-sm font-semibold text-violet-700"
        >
          Guardar pedido
        </Link>
      </div>
    </div>
  )
}
