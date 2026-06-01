import Link from 'next/link'
import { HomeEditorInterfacePreview } from './home-editor-interface-preview'
import { EDITOR_PATH, PROBAR_DISENO_PATH } from '../../lib/start-editor'

const FEATURES = [
  'Mockup fotográfico en tiempo real',
  'Diseña frente y espalda con capas',
  'Sube imágenes o elige de la galería',
  'Cotiza cuando tu diseño esté listo',
] as const

export function HomeEditorPreviewSection() {
  return (
    <section className="bg-white">
      <div className="container py-12 sm:py-14 md:py-20">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="order-2 flex justify-center px-1 sm:px-0 lg:order-1 lg:justify-end lg:pr-4">
            <HomeEditorInterfacePreview />
          </div>

          <div className="order-1 lg:order-2">
            <p className="text-xs font-bold tracking-[0.22em] text-neutral-500 uppercase">
              Vista previa
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950 md:text-3xl">
              Así se ve el editor
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-neutral-600 md:text-base">
              Panel lateral, mockup en el centro y barra de zoom: la misma
              interfaz que usarás al personalizar, antes de pedir tu cotización.
            </p>
            <ul className="mt-6 space-y-3">
              {FEATURES.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-neutral-800"
                >
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-900"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={EDITOR_PATH}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-neutral-900 px-6 text-sm font-bold text-white transition hover:bg-neutral-800"
              >
                Abrir editor
              </Link>
              <Link
                href={PROBAR_DISENO_PATH}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-neutral-300 bg-white px-6 text-sm font-bold text-neutral-900 transition hover:bg-neutral-50"
              >
                Probar un diseño
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
