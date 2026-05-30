'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getFeaturedHomeDesigns } from '../../lib/catalog-designs'
import { EDITOR_PATH, saveEditorSession } from '../../lib/start-editor'
import { TemplateLink } from '../editor/template-link'

const FEATURED = getFeaturedHomeDesigns(20)

const PRINT_AREA = { x: 125, y: 238, width: 150, height: 150 }

function startWithDesign(src: string) {
  saveEditorSession({
    shapesByZone: {
      FRONT: [
        {
          id: `home-${Date.now()}`,
          type: 'image',
          x: PRINT_AREA.x + 15,
          y: PRINT_AREA.y + 15,
          src,
          width: 130,
          height: 130,
          scale: 1,
        },
      ],
      BACK: [],
    },
  })
  window.location.assign(EDITOR_PATH)
}

export function HomeTryDesignSection() {
  const [loadingSrc, setLoadingSrc] = useState<string | null>(null)

  const pickDesign = (src: string) => {
    setLoadingSrc(src)
    startWithDesign(src)
  }

  return (
    <section className="border-b border-neutral-200 bg-white">
      <div className="container py-14 md:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold tracking-[0.2em] text-violet-700 uppercase">
            Probar diseño
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-neutral-950 md:text-4xl">
            Elige un gráfico y ábrelo en el editor
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-neutral-600">
            Toca una imagen para colocarla en el mockup del crewneck. También
            puedes empezar en blanco y añadir más diseños dentro del editor.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <TemplateLink
            templateId="blank"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
          >
            Ir al editor vacío
          </TemplateLink>
          <Link
            href={EDITOR_PATH}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-violet-300 bg-violet-50 px-6 py-3 text-sm font-semibold text-violet-900 transition hover:bg-violet-100"
          >
            Abrir editor (más diseños)
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 min-[480px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {FEATURED.map((design) => (
            <button
              key={design.id}
              type="button"
              disabled={loadingSrc !== null}
              onClick={() => pickDesign(design.src)}
              className="group cursor-pointer overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 text-left shadow-sm transition hover:border-violet-400 hover:shadow-md disabled:opacity-60"
            >
              <div className="flex aspect-square items-center justify-center p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={design.src}
                  alt={design.title}
                  className="max-h-full max-w-full object-contain object-center transition group-hover:scale-[1.02]"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <p className="truncate border-t border-neutral-100 px-2.5 py-2 text-xs font-semibold text-neutral-800">
                {design.title}
              </p>
            </button>
          ))}
        </div>

        <p className="mt-6 text-sm text-neutral-500">
          Hay más gráficos, texto e iconos en la pestaña{' '}
          <strong className="text-neutral-700">Diseños</strong> del editor.
        </p>
      </div>
    </section>
  )
}
