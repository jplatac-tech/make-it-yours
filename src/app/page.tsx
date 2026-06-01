import Link from 'next/link'
import { ProductCatalogGrid } from '../components/catalog/product-catalog-grid'
import { EDITOR_PATH, PROBAR_DISENO_PATH } from '../lib/start-editor'

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Elige prenda o diseño',
    text: 'Una prenda del catálogo aquí abajo, o un gráfico en Probar diseño.',
  },
  {
    step: '2',
    title: 'Diseña en 2D',
    text: 'Mueve el arte, añade texto e iconos y cambia el color en el mockup.',
  },
  {
    step: '3',
    title: 'Cotiza y compra',
    text: 'Envía tu diseño o carrito por WhatsApp y coordinamos contigo.',
  },
] as const

export default function HomePage() {
  return (
    <>
      <section className="border-b border-neutral-200 bg-gradient-to-b from-violet-50/80 to-[var(--background)]">
        <div className="container py-14 md:py-20 lg:py-24">
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_minmax(280px,380px)] lg:gap-14 xl:grid-cols-[1fr_400px]">
            <div>
              <p className="text-sm font-semibold tracking-[0.25em] text-violet-700 uppercase">
                Crea · Personaliza · Llévalo puesto
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-neutral-950 md:text-5xl">
                Si puedes imaginarlo, puedes estamparlo
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-600">
                Tu crewneck empieza con una idea: mezcla gráficos, color y texto en
                el editor, míralo en un mockup real y cuando te enamore, lo hacemos
                realidad — cotiza por WhatsApp o guarda tu pedido.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href={PROBAR_DISENO_PATH}
                  className="inline-flex items-center justify-center rounded-full bg-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-violet-700"
                >
                  Probar diseño
                </Link>
                <Link
                  href={EDITOR_PATH}
                  className="inline-flex items-center justify-center rounded-full border border-violet-300 bg-violet-50 px-8 py-3.5 text-sm font-semibold text-violet-900 transition hover:bg-violet-100"
                >
                  Ir al editor vacío
                </Link>
              </div>
            </div>

            <aside
              className="rounded-2xl border border-violet-100/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm md:p-7"
              aria-labelledby="how-it-works-heading"
            >
              <h2
                id="how-it-works-heading"
                className="text-lg font-semibold text-neutral-950"
              >
                ¿Cómo funciona?
              </h2>
              <ol className="mt-5 space-y-4">
                {HOW_IT_WORKS.map((item) => (
                  <li key={item.step} className="flex gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-800">
                      {item.step}
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <h3 className="font-semibold text-neutral-900">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                        {item.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </div>
      </section>

      <section id="catalogo" className="scroll-mt-20">
        <div className="container py-16">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-950">
              Catálogo de prendas
            </h2>
            <p className="mt-2 text-neutral-600">
              Camisetas, hoodies y crewneck listos para personalizar.
            </p>
          </div>
          <div className="mt-10">
            <ProductCatalogGrid />
          </div>
        </div>
      </section>
    </>
  )
}
