'use client'



import Link from 'next/link'

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



export type EditorPanelId = 'designs' | 'text' | 'elements' | 'garment'



export const PANEL_TITLES: Record<EditorPanelId, string> = {

  designs: 'Diseños',

  text: 'Texto',

  elements: 'Elementos',

  garment: 'Prenda',

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

  } = props



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
              : 'flex w-[340px] shrink-0 flex-col border-r border-neutral-200 bg-[#f8f9fb] shadow-md'
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
              : 'min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 lg:px-5 lg:py-5'
          }
        >

          {activePanel === 'designs' && (
            mobileShell ? (
              <MobileCatalogDesignsStrip
                onSelect={onDesignSelect}
                onGallerySelect={onGallerySelect}
              />
            ) : (
              <div className="space-y-6">
                <p className="text-sm leading-relaxed text-neutral-600 max-lg:hidden">
                  Elige un diseño: quitamos el fondo y se coloca en el mockup.
                  Solo <strong>una imagen</strong> a la vez; el tamaño lo
                  ajustas en el mockup.
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
                  Selecciona un texto en el mockup para cambiar fuente, tamaño y
                  color en la pestaña Props (derecha en PC).
                </p>
              </div>
            ))}



          {activePanel === 'elements' &&
            (mobileShell ? (
              <div
                className="flex touch-pan-x gap-2 overflow-x-auto overscroll-x-contain px-3 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                style={{ WebkitOverflowScrolling: 'touch' }}
                aria-label="Subir e iconos"
              >
                <label
                  title="Subir imagen"
                  className="flex h-16 w-16 shrink-0 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-violet-400 bg-white text-xl active:scale-95"
                >
                  ↑
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
                {ICON_OPTIONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => addIcon(icon)}
                    className="flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-neutral-200 bg-white text-xl shadow-sm active:scale-95 hover:border-violet-300"
                  >
                    {icon}
                  </button>
                ))}
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

                  <SectionTitle>Subir imagen</SectionTitle>

                  <p className="text-sm text-neutral-500">

                    Una imagen en el mockup a la vez; si subes otra, reemplaza la

                    anterior. También aparece en <strong>Diseños → Mis archivos</strong>.

                  </p>

                  <label className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-300 bg-white px-4 py-6 text-center shadow-sm transition hover:border-violet-500">

                    <span className="text-3xl">↑</span>

                    <span className="mt-2 text-sm font-semibold text-neutral-700">

                      PNG, JPG o WebP

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
                  sus opciones aparecen en la barra derecha Propiedades.
                </p>
              </div>
            ))}

        </div>



        <div
          className={
            'shrink-0 border-t border-neutral-200 bg-white px-5 py-4 ' +
            (mode === 'mobile' ? 'hidden' : '')
          }
        >
          <Link
            href="/comprar"
            className="block text-center text-sm font-semibold text-violet-700 hover:underline"
          >
            Guardar pedido
          </Link>
        </div>

      </div>
  )

  if (mode === 'mobile') {
    return panelBody
  }

  return (
    <aside className="relative z-20 hidden h-full min-h-0 shrink-0 lg:flex">
      <EditorSidebarNav activePanel={activePanel} onSelect={setActivePanel} />
      {panelBody}
    </aside>
  )

}


