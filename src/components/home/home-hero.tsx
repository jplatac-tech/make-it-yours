import Link from 'next/link'
import {
  buildHeroSrcSet,
  CATALOG_HERO_BLUR_IMAGE,
  CATALOG_HERO_BLUR_VARIANTS,
  CATALOG_HERO_FOCUS_IMAGE,
  CATALOG_HERO_FOCUS_VARIANTS,
} from '../../lib/catalog-looks'
import { EDITOR_PATH, PROBAR_DISENO_PATH } from '../../lib/start-editor'

const HERO_BLUR_SRCSET = buildHeroSrcSet(CATALOG_HERO_BLUR_VARIANTS, 'image/webp')
const HERO_FOCUS_SRCSET = buildHeroSrcSet(CATALOG_HERO_FOCUS_VARIANTS, 'image/webp')

/** Tamaños responsivos — evita descargar 2560px en móvil */
const HERO_SIZES =
  '(max-width: 640px) 100vw, (max-width: 1280px) 100vw, 1920px'

/** Encuadre retrato completo — centro-inferior */
const heroImgBase =
  'absolute left-0 h-[132%] w-full max-w-none object-cover object-[center_62%] sm:object-[center_64%]'
const heroImgFrame = heroImgBase + ' [transform:translate3d(0,-24%,0)_scale(1.04)]'
const heroImgBlur =
  heroImgBase + ' opacity-95 [transform:translate3d(0,-24%,0)_scale(1.06)]'

export function HomeHero() {
  return (
    <section className="relative min-h-[min(calc(100svh-var(--header-height)),860px)] w-full overflow-hidden bg-neutral-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={CATALOG_HERO_BLUR_IMAGE}
          srcSet={HERO_BLUR_SRCSET || undefined}
          sizes={HERO_SIZES}
          alt=""
          fetchPriority="high"
          decoding="async"
          className={heroImgBlur}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={CATALOG_HERO_FOCUS_IMAGE}
          srcSet={HERO_FOCUS_SRCSET || undefined}
          sizes={HERO_SIZES}
          alt="Colección Make It Yours — streetwear personalizable"
          loading="lazy"
          decoding="async"
          className={heroImgFrame}
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_55%,transparent_0%,rgba(0,0,0,0.35)_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/75"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/85 via-black/35 to-transparent"
        aria-hidden
      />

      <div className="absolute inset-0 z-10 flex flex-col justify-end">
        <div className="container pb-10 sm:pb-14 md:pb-16 lg:pb-20">
          <div className="max-w-xl motion-fade-in-up">
            <p className="inline-flex items-center gap-2.5 text-[10px] font-semibold tracking-[0.24em] text-white/85 uppercase sm:text-[11px]">
              <span className="h-px w-6 bg-white/50" aria-hidden />
              Crea · Personaliza · Llévalo puesto
            </p>

            <h1 className="motion-fade-in-up motion-delay-1 mt-4 max-w-[18rem] font-serif text-[1.75rem] leading-[1.1] font-normal tracking-tight text-white sm:max-w-md sm:text-4xl md:text-[2.35rem] lg:max-w-lg lg:text-[2.5rem] [text-shadow:0_2px_24px_rgba(0,0,0,0.35)]">
              Si puedes imaginarlo, puedes estamparlo
            </h1>

            <p className="motion-fade-in-up motion-delay-2 mt-3 max-w-sm text-sm leading-relaxed text-white/80 sm:mt-4 sm:text-[15px]">
              Prendas personalizadas con vista previa en tiempo real. Diseña en
              línea y solicita tu cotización por WhatsApp.
            </p>

            <div className="motion-fade-in-up motion-delay-3 mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <Link
                href={EDITOR_PATH}
                prefetch={false}
                className="btn-interactive inline-flex min-h-[44px] items-center justify-center rounded-full bg-white px-6 text-sm font-bold text-neutral-900 shadow-[0_4px_24px_rgba(0,0,0,0.25)] hover:bg-neutral-100 sm:min-h-[46px] sm:px-7"
              >
                Ir al editor
              </Link>
              <Link
                href={PROBAR_DISENO_PATH}
                prefetch={false}
                className="btn-interactive inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/60 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20 sm:min-h-[46px] sm:px-6"
              >
                Probar un diseño
              </Link>
              <Link
                href="/catalogo"
                className="btn-interactive inline-flex min-h-[44px] items-center justify-center px-2 text-sm font-semibold text-white/90 underline-offset-4 hover:text-white hover:underline sm:min-h-[46px]"
              >
                Ver catálogo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
