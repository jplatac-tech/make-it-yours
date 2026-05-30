'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import {
  DESIGN_GALLERY,
  GALLERY_LICENSE_NOTE,
  GALLERY_PRESETS,
} from '../../lib/design-gallery'
import { DESIGN_TEMPLATES } from '../../lib/design-templates'
import {
  EDITOR_PATH,
  saveEditorSession,
} from '../../lib/start-editor'
import { TemplateLink } from './template-link'
import { compressImageToDataUrl } from '../../lib/uploaded-files-storage'
import { EditorFontsLoader } from './editor-fonts-loader'

type HubSection = 'templates' | 'graphics' | 'upload'

export function DesignTemplatesHub() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [section, setSection] = useState<HubSection>('templates')
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      const dataUrl = await compressImageToDataUrl(file)
      const area = { x: 125, y: 238, width: 150, height: 150 }
      saveEditorSession({
        shapesByZone: {
          FRONT: [
            {
              id: `upload-${Date.now()}`,
              type: 'image',
              x: area.x + 10,
              y: area.y + 10,
              src: dataUrl,
              width: 140,
              height: 140,
              scale: 1,
            },
          ],
          BACK: [],
        },
      })
      window.location.assign(EDITOR_PATH)
    } finally {
      setUploading(false)
    }
  }

  const startWithGraphic = (src: string) => {
    const area = { x: 125, y: 238, width: 150, height: 150 }
    saveEditorSession({
      shapesByZone: {
        FRONT: [
          {
            id: `hub-${Date.now()}`,
            type: 'image',
            x: area.x + 20,
            y: area.y + 20,
            src,
            width: 120,
            height: 120,
            scale: 1,
          },
        ],
        BACK: [],
      },
    })
    window.location.assign(EDITOR_PATH)
  }

  return (
    <div className="min-h-[calc(100dvh-53px)] bg-[#f4f4f8]">
      <EditorFontsLoader />

      <div className="border-b border-neutral-200 bg-white">
        <div className="container flex flex-wrap items-center justify-between gap-4 py-6">
          <div>
            <p className="text-xs font-bold tracking-widest text-violet-600 uppercase">
              Paso 1 — Elige cómo empezar
            </p>
            <h1 className="mt-1 text-2xl font-bold text-neutral-950 md:text-3xl">
              Plantillas y diseños para tu crewneck
            </h1>
            <p className="mt-2 max-w-xl text-sm text-neutral-600">
              Selecciona una opción y pasarás al editor con el mockup de la
              prenda. Después cotizas por WhatsApp o añades al carrito.
            </p>
          </div>
          <TemplateLink
            templateId="blank"
            className="inline-flex rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Ir al editor vacío
          </TemplateLink>
        </div>

        <div className="container flex gap-2 overflow-x-auto pb-4">
          {(
            [
              ['templates', 'Plantillas'],
              ['graphics', 'Gráficos'],
              ['upload', 'Subir archivo'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setSection(id)}
              className={
                'shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition ' +
                (section === id
                  ? 'bg-violet-600 text-white'
                  : 'bg-white text-neutral-700 ring-1 ring-neutral-200 hover:bg-neutral-50')
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="container py-8">
        <p className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 text-xs text-emerald-900">
          {GALLERY_LICENSE_NOTE}
        </p>

        {section === 'templates' && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {DESIGN_TEMPLATES.map((tpl) => (
              <TemplateLink
                key={tpl.id}
                templateId={tpl.id}
                className="group block overflow-hidden rounded-2xl border border-neutral-200 bg-white text-left shadow-sm transition hover:border-violet-400 hover:shadow-lg"
              >
                <div
                  className={
                    'flex h-40 items-center justify-center bg-gradient-to-br ' +
                    tpl.previewClass
                  }
                >
                  <span className="rounded-lg bg-white/95 px-4 py-2 text-base font-bold text-neutral-900 shadow">
                    {tpl.title}
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-sm text-neutral-600">{tpl.description}</p>
                  <span className="mt-3 inline-flex text-sm font-semibold text-violet-700 group-hover:underline">
                    Usar plantilla →
                  </span>
                </div>
              </TemplateLink>
            ))}
          </div>
        )}

        {section === 'graphics' && (
          <>
            <h2 className="mb-4 text-lg font-semibold">Gráficos incluidos</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {GALLERY_PRESETS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => startWithGraphic(item.src)}
                  className="cursor-pointer overflow-hidden rounded-xl border border-neutral-200 bg-white p-3 text-left transition hover:border-violet-400 hover:shadow-md"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.src}
                    alt={item.title}
                    className="mx-auto h-20 w-20 object-contain"
                  />
                  <p className="mt-2 truncate text-center text-xs font-medium">
                    {item.title}
                  </p>
                  <p className="mt-1 text-center text-[10px] font-semibold text-violet-700">
                    Añadir al editor →
                  </p>
                </button>
              ))}
            </div>
            <h2 className="mt-10 mb-4 text-lg font-semibold">
              Posters (dominio público)
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {DESIGN_GALLERY.filter((i) => i.category === 'band-poster').map(
                (item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => startWithGraphic(item.src)}
                    className="w-full cursor-pointer overflow-hidden rounded-xl border border-neutral-200 bg-white text-left transition hover:ring-2 hover:ring-violet-300"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.src}
                      alt={item.title}
                      className="aspect-[3/4] w-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <p className="p-2 text-xs font-semibold">{item.title}</p>
                    <p className="px-2 pb-2 text-[10px] font-semibold text-violet-700">
                      Añadir al editor →
                    </p>
                  </button>
                ),
              )}
            </div>
          </>
        )}

        {section === 'upload' && (
          <div className="mx-auto max-w-lg rounded-2xl border-2 border-dashed border-violet-200 bg-white p-10 text-center">
            <p className="text-lg font-semibold text-neutral-900">
              Sube tu diseño
            </p>
            <p className="mt-2 text-sm text-neutral-600">
              PNG o JPG. Se abrirá el editor con tu archivo en el mockup.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void handleUpload(f)
                e.target.value = ''
              }}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="mt-8 cursor-pointer rounded-full bg-violet-600 px-8 py-3.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
            >
              {uploading ? 'Abriendo editor…' : 'Elegir archivo y editar'}
            </button>
          </div>
        )}

        <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm font-semibold">
          <Link href="/catalogo" className="text-violet-700 hover:underline">
            Ver catálogo de prendas
          </Link>
          <Link href="/carrito" className="text-neutral-700 hover:underline">
            Ir al carrito
          </Link>
        </div>
      </div>
    </div>
  )
}
