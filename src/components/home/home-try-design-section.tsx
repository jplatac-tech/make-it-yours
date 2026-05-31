'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getFeaturedHomeDesigns } from '../../lib/catalog-designs'
import { MOCKUP_PRINT_AREAS } from '../../lib/mockup-assets'
import {
  loadImageDimensions,
  fitImageInitialInPrintArea,
} from '../../lib/resolve-image-src'
import { resolveAndPrepareDesignImage } from '../../lib/remove-background'
import { EDITOR_PATH, saveEditorSession } from '../../lib/start-editor'
import { TemplateLink } from '../editor/template-link'

const FEATURED = getFeaturedHomeDesigns(20)
const PRINT_AREA = MOCKUP_PRINT_AREAS.FRONT

const CHECKER =
  'linear-gradient(45deg, #e8e8e8 25%, transparent 25%), linear-gradient(-45deg, #e8e8e8 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e8e8e8 75%), linear-gradient(-45deg, transparent 75%, #e8e8e8 75%)'

function startWithDesign(
  src: string,
  width: number,
  height: number,
) {
  saveEditorSession({
    shapesByZone: {
      FRONT: [
        {
          id: `home-${Date.now()}`,
          type: 'image',
          x: PRINT_AREA.x + PRINT_AREA.width / 2 - width / 2,
          y: PRINT_AREA.y + PRINT_AREA.height / 2 - height / 2,
          src,
          width,
          height,
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

  const pickDesign = async (src: string) => {
    setLoadingSrc(src)
    try {
      const prepared = await resolveAndPrepareDesignImage(src)
      const dims = await loadImageDimensions(prepared)
      const { width, height } = fitImageInitialInPrintArea(
        dims.width,
        dims.height,
        PRINT_AREA,
        0.55,
      )
      startWithDesign(prepared, width, height)
    } catch {
      const { width, height } = fitImageInitialInPrintArea(100, 100, PRINT_AREA, 0.55)
      startWithDesign(src, width, height)
    }
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
            Los diseños del catálogo ya vienen sin fondo para verse bien en
            cualquier color de suéter. Al abrirlos aparecen en un tamaño cómodo
            en el mockup; puedes agrandarlos o moverlos después.
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
              onClick={() => void pickDesign(design.src)}
              className="group cursor-pointer overflow-hidden rounded-xl border border-neutral-200 bg-white text-left shadow-sm transition hover:border-violet-400 hover:shadow-md disabled:opacity-60"
            >
              <div
                className="flex aspect-square items-center justify-center p-2"
                style={{
                  backgroundColor: '#f5f5f5',
                  backgroundImage: CHECKER,
                  backgroundSize: '12px 12px',
                  backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0',
                }}
              >
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
