'use client'

import type { Dispatch, SetStateAction } from 'react'
import type { TextPreset } from '../../lib/text-presets'
import type { ProductColorValue } from '../../lib/products'
import { EditorPanel, type EditorPanelId } from './editor-panel'
import type { ComponentProps } from 'react'

type EditorPanelContentProps = Pick<
  ComponentProps<typeof EditorPanel>,
  | 'canvasShapes'
  | 'selectedShapeId'
  | 'printZone'
  | 'onSelectCanvasShape'
  | 'onMoveShapeLayer'
  | 'selectedTextShape'
  | 'onTextShapeChange'
>
import { EditorSidebarNav } from './editor-sidebar-nav'

export type MobileDockTab = EditorPanelId | null

type Props = {
  mobileTab: MobileDockTab
  setMobileTab: Dispatch<SetStateAction<MobileDockTab>>
  activePanel: EditorPanelId
  setActivePanel: (id: EditorPanelId) => void
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
} & EditorPanelContentProps

const TAB_BAR_H =
  'min-h-[72px] py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]'

function panelPopupClass(tab: NonNullable<MobileDockTab>) {
  if (tab === 'elements' || tab === 'layers') {
    return 'max-h-[min(52dvh,440px)] overflow-y-auto overscroll-contain touch-pan-y'
  }
  if (tab === 'designs' || tab === 'text' || tab === 'garment') {
    return 'max-h-[96px] overflow-hidden'
  }
  return 'max-h-[min(46dvh,400px)] overflow-y-auto overscroll-contain touch-pan-y'
}

export function EditorMobileDock({
  mobileTab,
  setMobileTab,
  activePanel,
  setActivePanel,
  ...rest
}: Props) {
  const closePanel = () => setMobileTab(null)

  const selectTool = (id: EditorPanelId) => {
    setActivePanel(id)
    setMobileTab((prev) => (prev === id ? null : id))
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
            <EditorPanel
              mode="mobile"
              hideHeader
              embedded
              activePanel={activePanel}
              setActivePanel={setActivePanel}
              {...rest}
            />
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
        </div>
      </div>
    </div>
  )
}
