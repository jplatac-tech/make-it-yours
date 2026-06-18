'use client'




import { useState } from 'react'

import { TEXT_PRESETS, type TextPreset } from '../../lib/text-presets'

import {
  CatalogDesignsGrid,
  MobileCatalogDesignsStrip,
} from './catalog-designs-grid'

import {
  GALLERY_BAND_POSTERS,
  GALLERY_PRESETS,
} from '../../lib/design-gallery'
import { GarmentColorPicker } from './garment-color-picker'

import type { ProductColorValue } from '../../lib/products'

import { UploadedFilesPanel } from './uploaded-files-panel'

import { DesignGalleryPanel } from './design-gallery-panel'

import { EditorSidebarNav } from './editor-sidebar-nav'
import { UploadImagePanel } from './upload-image-panel'
import { TextStyleControls } from './text-style-controls'
import { DesignLayersPanel } from './design-layers-panel'
import type { DesignShape } from '../../types/design'
import type { LayerMove } from '../../lib/shape-layers'
import type { PrintZoneValue } from '../../lib/products'



export type EditorPanelId =
  | 'designs'
  | 'text'
  | 'elements'
  | 'layers'
  | 'garment'



export const PANEL_TITLES: Record<EditorPanelId, string> = {

  designs: 'Diseños',

  text: 'Texto',

  elements: 'Elementos',

  layers: 'Capas',

  garment: 'Color de la prenda',

}



const ICON_OPTIONS = ['⭐', '❤', '⚡', '✦', '★', '✿', '☠', '♪', '🔥', '✌']



type Props = {

  mode?: 'desktop' | 'mobile'

  /** En móvil dentro del dock: el encabezado lo muestra el dock */
  hideHeader?: boolean

  /** Contenido suelto; el scroll lo maneja el dock móvil */
  embedded?: boolean

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

  selectedTextShape?: DesignShape | null

  onTextShapeChange?: (patch: Partial<DesignShape>) => void

  canvasShapes?: DesignShape[]

  selectedShapeId?: string | null

  printZone?: PrintZoneValue

  onSelectCanvasShape?: (id: string) => void

  onMoveShapeLayer?: (id: string, move: LayerMove) => void

}



function SectionTitle({ children }: { children: React.ReactNode }) {

  return (

    <h3 className="text-sm font-bold tracking-wide text-neutral-600 uppercase">

      {children}

    </h3>

  )

}



export function EditorPanel(props: Props) {

  const {

    mode = 'desktop',

    hideHeader = false,

    embedded = false,

    activePanel,

    setActivePanel,

    productColor,

    setProductColor,

    onClearSelection,

    addText,

    addTextPreset,

    onDesignSelect,

    onGallerySelect,

    addIcon,

    onUploadSelect,

    onUserUpload,

    uploadsRefresh,

    selectedTextShape,

    onTextShapeChange,

    canvasShapes = [],

    selectedShapeId = null,

    printZone = 'FRONT',

    onSelectCanvasShape,

    onMoveShapeLayer,

  } = props

  const printZoneLabel = printZone === 'BACK' ? 'Espalda' : 'Frente'



  const hasElementGraphics = GALLERY_PRESETS.length > 0
  const [elementsTab, setElementsTab] = useState<'upload' | 'graphics'>('upload')

  const [presetsOpen, setPresetsOpen] = useState(true)



  const subTab =

    'cursor-pointer rounded-lg px-3 py-2.5 text-sm font-semibold transition'



  const mobileShell = mode === 'mobile' && (hideHeader || embedded)

  const panelBody = (
      <div
        className={
          mobileShell
            ? 'w-full'
            : mode === 'mobile'
              ? 'flex w-full flex-col bg-[#f8f9fb]'
              : 'flex min-h-0 w-[min(340px,32vw)] max-w-[340px] flex-1 flex-col overflow-hidden border-r border-neutral-200 bg-[#f8f9fb] shadow-md'
        }
      >

        {mobileShell ? null : (
          <div className="shrink-0 border-b border-neutral-200 bg-white px-5 py-3">
            <h2 className="text-base font-bold text-neutral-900">
              {PANEL_TITLES[activePanel]}
            </h2>
          </div>
        )}

        <div
          className={
            mobileShell
              ? ['designs', 'text', 'elements', 'garment'].includes(activePanel)
                ? 'p-0'
                : 'px-4 py-3 pb-8'
              : 'min-h-0 flex-1 overflow-x-hidden overflow-y-scroll overscroll-y-contain px-4 py-4 [-webkit-overflow-scrolling:touch] [scrollbar-gutter:stable] touch-pan-y lg:px-5 lg:py-5'
          }
          style={
            mobileShell || mode === 'mobile'
              ? undefined
              : { WebkitOverflowScrolling: 'touch' }
          }
        >

          {activePanel === 'designs' && (
            mobileShell ? (
              <div
                className="flex touch-pan-x gap-2 overflow-x-auto overscroll-x-contain px-3 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                <label
                  title="Subir tu imagen"
                  className="flex h-16 w-[5.5rem] shrink-0 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-violet-500 bg-violet-600 text-center shadow-sm active:scale-95"
                >
                  <span className="text-xl font-bold text-white">+</span>
                  <span className="mt-0.5 text-[10px] font-bold text-white">
                    Subir
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) onUserUpload(file)
                      e.target.value = ''
                    }}
                  />
                </label>
                <MobileCatalogDesignsStrip
                  onSelect={onDesignSelect}
                  onGallerySelect={onGallerySelect}
                />
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-sm leading-relaxed text-neutral-600 max-lg:hidden">
                  Elige un diseño: quitamos el fondo y se coloca en el mockup.
                  Puedes añadir <strong>varias imágenes</strong> y ordenar capas
                  desde la barra del elemento seleccionado.
                </p>
                <CatalogDesignsGrid onSelect={onDesignSelect} />
                {GALLERY_PRESETS.length > 0 || GALLERY_BAND_POSTERS.length > 0 ? (
                  <div>
                    <SectionTitle>Posters y gráficos extra</SectionTitle>
                    <div className="mt-3">
                      <DesignGalleryPanel onSelectDesign={onGallerySelect} />
                    </div>
                  </div>
                ) : null}
              </div>
            )
          )}



          {activePanel === 'text' &&
            (mobileShell ? (
              <div
                className="flex touch-pan-x gap-2 overflow-x-auto overscroll-x-contain px-3 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                style={{ WebkitOverflowScrolling: 'touch' }}
                aria-label="Texto y estilos"
              >
                <button
                  type="button"
                  onClick={addText}
                  title="Añadir texto"
                  className="flex h-16 w-16 shrink-0 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-violet-500 bg-violet-600 text-sm font-bold text-white shadow-sm active:scale-95"
                >
                  T+
                </button>
                {TEXT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    title={preset.label}
                    onClick={() => addTextPreset(preset)}
                    className="flex h-16 w-[4.75rem] shrink-0 cursor-pointer flex-col items-center justify-center rounded-lg border border-neutral-200 bg-white px-1 shadow-sm active:scale-95 hover:border-violet-400"
                  >
                    <span
                      className="line-clamp-2 max-w-full text-center leading-tight text-neutral-900"
                      style={{
                        fontFamily: `"${preset.fontFamily}", sans-serif`,
                        fontSize: Math.min(preset.fontSize * 0.32, 14),
                        fontWeight: preset.fontWeight,
                      }}
                    >
                      {preset.preview}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {selectedTextShape && onTextShapeChange ? (
                  <TextStyleControls
                    shape={selectedTextShape}
                    onChange={onTextShapeChange}
                    layout="sidebar"
                  />
                ) : null}
                <button
                  type="button"
                  onClick={addText}
                  className="flex min-h-[52px] w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-violet-300 bg-white text-base font-bold text-violet-900 shadow-sm transition hover:border-violet-500 hover:bg-violet-50"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-xl font-bold text-white">
                    T
                  </span>
                  Añadir cuadro de texto
                </button>
                <div>
                  <button
                    type="button"
                    onClick={() => setPresetsOpen((o) => !o)}
                    className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-800 shadow-sm"
                  >
                    Estilos de texto listos
                    <span className="text-neutral-400">
                      {presetsOpen ? '▲' : '▼'}
                    </span>
                  </button>
                  {presetsOpen ? (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {TEXT_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => addTextPreset(preset)}
                          className="flex min-h-[64px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white px-2 py-3 shadow-sm transition hover:border-violet-400 hover:shadow-md"
                        >
                          <span
                            className="line-clamp-2 max-w-full px-1 text-center leading-tight text-neutral-900"
                            style={{
                              fontFamily: `"${preset.fontFamily}", sans-serif`,
                              fontSize: Math.min(preset.fontSize * 0.38, 18),
                              fontWeight: preset.fontWeight,
                            }}
                          >
                            {preset.preview}
                          </span>
                          <span className="mt-1.5 text-xs font-medium text-neutral-600">
                            {preset.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <p className="text-sm leading-relaxed text-neutral-500">
                  Selecciona un texto en el mockup para editar fuente y tamaño aquí
                  o en la barra flotante sobre el diseño.
                </p>
              </div>
            ))}



          {activePanel === 'elements' &&
            (mobileShell ? (
              <div className="space-y-4 px-4 py-4">
                <UploadImagePanel onUpload={onUserUpload} compact />
                <div>
                  <p className="text-sm font-bold text-neutral-800">Añadir icono</p>
                  <div className="mt-2 grid grid-cols-5 gap-2">
                    {ICON_OPTIONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => addIcon(icon)}
                        className="flex aspect-square cursor-pointer items-center justify-center rounded-xl border border-neutral-200 bg-white text-xl shadow-sm active:scale-95 hover:border-violet-400"
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
            <div className="space-y-5">

              {hasElementGraphics ? (
              <div className="flex gap-1.5 rounded-xl bg-neutral-200/80 p-1.5">

                {(

                  [

                    ['upload', 'Subir'],

                    ['graphics', 'Gráficos'],

                  ] as const

                ).map(([key, label]) => (

                  <button

                    key={key}

                    type="button"

                    onClick={() => setElementsTab(key)}

                    className={

                      subTab +

                      ' flex-1 ' +

                      (elementsTab === key

                        ? 'bg-white text-violet-800 shadow-sm'

                        : 'text-neutral-600 hover:text-neutral-900')

                    }

                  >

                    {label}

                  </button>

                ))}

              </div>
              ) : null}

              {(elementsTab === 'upload' || !hasElementGraphics) && (

                <div className="space-y-5">

                  <UploadImagePanel onUpload={onUserUpload} />

                  <div>

                    <SectionTitle>Mis archivos</SectionTitle>

                    <p className="mt-2 text-sm text-neutral-500">

                      Guardados en este navegador.

                    </p>

                    <div className="mt-3">

                      <UploadedFilesPanel

                        refreshKey={uploadsRefresh}

                        onSelectFile={onUploadSelect}

                      />

                    </div>

                  </div>

                </div>

              )}



              {hasElementGraphics && elementsTab === 'graphics' && (

                <div className="space-y-6">

                  <div>

                    <SectionTitle>Gráficos</SectionTitle>

                    <div className="mt-3 grid grid-cols-3 gap-3">

                      {GALLERY_PRESETS.map((item) => (

                        <button

                          key={item.id}

                          type="button"

                          onClick={() => onDesignSelect(item.src)}

                          className="flex aspect-square cursor-pointer items-center justify-center rounded-2xl border border-neutral-200 bg-white p-2.5 shadow-sm transition hover:border-violet-400"

                        >

                          {/* eslint-disable-next-line @next/next/no-img-element */}

                          <img

                            src={item.src}

                            alt={item.title}

                            className="max-h-full max-w-full object-contain"

                          />

                        </button>

                      ))}

                    </div>

                  </div>

                  <div>

                    <SectionTitle>Iconos</SectionTitle>

                    <div className="mt-3 grid grid-cols-5 gap-2">

                      {ICON_OPTIONS.map((icon) => (

                        <button

                          key={icon}

                          type="button"

                          onClick={() => addIcon(icon)}

                          className="flex aspect-square cursor-pointer items-center justify-center rounded-xl border border-neutral-200 bg-white text-xl shadow-sm hover:border-violet-300 hover:bg-violet-50"

                        >

                          {icon}

                        </button>

                      ))}

                    </div>

                  </div>

                </div>

              )}

            </div>
            ))}



          {activePanel === 'layers' &&
            onSelectCanvasShape &&
            onMoveShapeLayer && (
              <DesignLayersPanel
                shapes={canvasShapes}
                selectedId={selectedShapeId}
                printZoneLabel={printZoneLabel}
                onSelectShape={onSelectCanvasShape}
                onMoveLayer={onMoveShapeLayer}
              />
            )}

          {activePanel === 'garment' &&
            (mobileShell ? (
              <GarmentColorPicker
                compact
                value={productColor}
                onChange={(v) => {
                  setProductColor(v)
                  onClearSelection()
                }}
              />
            ) : (
              <div className="space-y-4">
                <GarmentColorPicker
                  value={productColor}
                  onChange={(v) => {
                    setProductColor(v)
                    onClearSelection()
                  }}
                />
                <p className="text-sm leading-relaxed text-neutral-500">
                  Cada color tiene su propio mockup. Arriba a la izquierda verás
                  las miniaturas de frente y espalda. Al seleccionar un elemento,
                  al seleccionarlo verás la barra de edición arriba del mockup.
                </p>
              </div>
            ))}

        </div>



      </div>
  )

  if (mode === 'mobile') {
    return panelBody
  }

  return (
    <aside className="relative z-20 hidden h-full min-h-0 shrink-0 flex-row items-stretch overflow-hidden lg:flex">
      <EditorSidebarNav activePanel={activePanel} onSelect={setActivePanel} />
      {panelBody}
    </aside>
  )

}


