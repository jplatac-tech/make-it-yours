'use client'

import Link from 'next/link'
import { EDITOR_PATH, PROBAR_DISENO_PATH } from '../../lib/start-editor'

const HERO_SRC = '/home-hero-1920.webp'
const HERO_SRC_2X = '/home-hero.webp'

const btnBase =
  'inline-flex min-h-[50px] w-full items-center justify-center rounded-full px-6 text-sm font-bold transition duration-300 hover:-translate-y-0.5 active:translate-y-0 sm:min-w-0 sm:flex-1'

export function HomeHero() {
  return (
    <section className="relative min-h-[calc(100svh-60px)] w-full overflow-hidden bg-neutral-950">
      <picture className="absolute inset-0 block h-full w-full motion-hero-zoom">
        <source srcSet={HERO_SRC_2X} media="(min-width: 1920px)" type="image/webp" />
        <source srcSet={HERO_SRC} type="image/webp" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_SRC}
          srcSet={`${HERO_SRC} 1920w, ${HERO_SRC_2X} 2560w`}
          sizes="100vw"
          alt="Colección Make It Yours"
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover object-center"
        />
      </picture>

      <div
        className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/25"
        aria-hidden
      />
      <div className="absolute inset-x-0 bottom-0 h-[75%] bg-gradient-to-t from-black/95 via-black/60 to-transparent" />

      <div className="absolute inset-0 z-10 flex flex-col justify-end px-5 pb-20 sm:px-8 md:px-14 md:pb-28 lg:px-20 lg:pb-32">
        <div className="max-w-3xl rounded-2xl border border-white/15 bg-black/80 p-6 shadow-2xl backdrop-blur-md sm:p-8 lg:max-w-4xl">
          <p className="motion-fade-in-up text-xs font-bold tracking-[0.28em] text-white uppercase sm:text-[13px]">
            Crea · Personaliza · Llévalo puesto
          </p>
          <h1 className="motion-fade-in-up motion-delay-1 mt-4 font-serif text-3xl leading-[1.08] font-normal tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl [text-shadow:0_2px_20px_rgba(0,0,0,0.8)]">
            Si puedes imaginarlo, puedes estamparlo
          </h1>
          <p className="motion-fade-in-up motion-delay-2 mt-4 max-w-xl text-base leading-relaxed text-neutral-100 sm:text-lg">
            Personaliza en minutos, revisa tu diseño en{' '}
            <strong className="font-semibold text-white">mockup real</strong> y
            cotiza sin presión cuando esté listo.
          </p>
          <div className="motion-fade-in-up motion-delay-3 mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Link
              href={EDITOR_PATH}
              className={
                btnBase +
                ' bg-white text-neutral-900 shadow-[0_4px_28px_rgba(0,0,0,0.45)] hover:bg-neutral-100'
              }
            >
              Ir al editor
            </Link>
            <Link
              href={PROBAR_DISENO_PATH}
              className={
                btnBase +
                ' bg-white text-neutral-900 shadow-[0_4px_28px_rgba(0,0,0,0.45)] hover:bg-neutral-100'
              }
            >
              Probar diseño
            </Link>
            <Link
              href="/#catalogo"
              className={
                btnBase +
                ' border-2 border-white bg-transparent text-white shadow-[0_4px_20px_rgba(0,0,0,0.35)] hover:bg-white/10'
              }
            >
              Ver catálogo
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
