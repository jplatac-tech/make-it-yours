import Link from 'next/link'
import { ProductCatalogGrid } from '../../components/catalog/product-catalog-grid'
import { buildWhatsAppUrl, formatQuickQuoteMessage } from '../../lib/whatsapp'

export const metadata = {
  title: 'Catálogo',
}

export default function CatalogoPage() {
  return (
    <main className="container py-12 md:py-16">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold tracking-[0.2em] text-violet-700 uppercase">
          Catálogo
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-neutral-950">
          Prendas para estampar
        </h1>
        <p className="mt-4 text-neutral-600">
          Elige producto, personalízalo en el editor 2D o cotiza directo por
          WhatsApp con nuestro equipo.
        </p>
        <a
          href={buildWhatsAppUrl(formatQuickQuoteMessage())}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#20bd5a]"
        >
          Hablar por WhatsApp
        </a>
      </div>

      <div className="mt-12">
        <ProductCatalogGrid />
      </div>

      <div className="mt-16 rounded-2xl border border-violet-100 bg-violet-50/50 p-8 text-center">
        <h2 className="text-xl font-semibold text-neutral-900">
          ¿Ya tienes un diseño en mente?
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          Abre el editor y coloca tu arte en frente o espalda del suéter.
        </p>
        <Link
          href="/disenar"
          className="btn btn-primary mt-6 inline-flex bg-violet-600 hover:opacity-90"
        >
          Elegir plantilla y diseñar
        </Link>
      </div>
    </main>
  )
}
