import Link from 'next/link'
import { ProductCatalogGrid } from '../components/catalog/product-catalog-grid'
import { APP_NAME } from '../lib/constants'
import { buildWhatsAppUrl, formatQuickQuoteMessage } from '../lib/whatsapp'
import { SAFE_MAX_CM, PRESS_MAX_CM } from '../lib/size-limits'

export default function HomePage() {
  const whatsappHref = buildWhatsAppUrl(formatQuickQuoteMessage())

  return (
    <>
      <section className="border-b border-neutral-200 bg-gradient-to-b from-violet-50/80 to-[var(--background)]">
        <div className="container py-16 md:py-24">
          <p className="text-sm font-semibold tracking-[0.25em] text-violet-700 uppercase">
            Estampado · Diseño · Pedido
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-neutral-950 md:text-5xl">
            Diseña tu crewneck y pide estampado
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-600">
            Elige prenda, personaliza en el editor con mockup real y cotiza por
            WhatsApp o arma tu carrito.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/disenar"
              className="inline-flex items-center justify-center rounded-full bg-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-violet-700"
            >
              Elegir plantilla y diseñar
            </Link>
            <Link
              href="/disenar"
              className="inline-flex items-center justify-center rounded-full border border-violet-300 bg-violet-50 px-8 py-3.5 text-sm font-semibold text-violet-900 transition hover:bg-violet-100"
            >
              Ver plantillas
            </Link>
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-8 py-3.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
            >
              Ver catálogo
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 px-8 py-3.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
            >
              Cotizar por WhatsApp
            </a>
          </div>
          <p className="mt-8 text-sm text-neutral-500">
            Área segura máx. {SAFE_MAX_CM.w}×{SAFE_MAX_CM.h} cm · Prensa hasta{' '}
            {PRESS_MAX_CM.w}×{PRESS_MAX_CM.h} cm (el editor limita el tamaño
            automáticamente).
          </p>
        </div>
      </section>

      <section className="container py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-950">
              Catálogo de prendas
            </h2>
            <p className="mt-2 text-neutral-600">
              Camisetas, hoodies y crewneck listos para personalizar.
            </p>
          </div>
          <Link
            href="/catalogo"
            className="text-sm font-semibold text-violet-700 hover:underline"
          >
            Ver todo el catálogo →
          </Link>
        </div>
        <div className="mt-10">
          <ProductCatalogGrid />
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-white">
        <div className="container py-16">
          <h2 className="text-center text-2xl font-semibold text-neutral-950">
            ¿Cómo funciona?
          </h2>
          <ol className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Elige tu prenda',
                text: 'Explora el catálogo, talla y cantidad. Añade al carrito o abre el editor.',
              },
              {
                step: '2',
                title: 'Diseña en 2D',
                text: 'Editor tipo Canva: texto, iconos, imágenes y plantillas sobre el suéter.',
              },
              {
                step: '3',
                title: 'Cotiza y compra',
                text: 'Envía tu diseño o carrito por WhatsApp y coordinamos producción contigo.',
              },
            ].map((item) => (
              <li
                key={item.step}
                className="rounded-2xl border border-neutral-200 p-6 text-center"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-800">
                  {item.step}
                </span>
                <h3 className="mt-4 font-semibold text-neutral-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-600">{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  )
}
