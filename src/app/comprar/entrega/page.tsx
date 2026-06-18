import Link from 'next/link'
import { QuoteDeliveryForm } from '../../../components/forms/quote-delivery-form'

export default async function ComprarEntregaPage({
  searchParams,
}: {
  searchParams: Promise<{ quoteId?: string }>
}) {
  const { quoteId } = await searchParams

  return (
    <main className="container py-16">
      <div className="mx-auto max-w-xl">
        <p className="text-sm font-medium tracking-[0.2em] text-neutral-500 uppercase">
          Contacto
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-neutral-950 sm:text-3xl">
          Datos de contacto y entrega
        </h1>
        <p className="mt-4 text-neutral-600">
          Completa cómo contactarte y dónde entregar. Al enviar se abre
          WhatsApp con tus datos — no guardamos nada en servidor.
        </p>

        <div className="card mt-8 p-6">
          <QuoteDeliveryForm quoteId={quoteId} />
        </div>

        <p className="mt-6 text-center text-sm text-neutral-500">
          ¿Aún no cotizaste tu diseño?{' '}
          <Link href="/comprar" className="font-medium text-sky-700 underline">
            Ir a enviar diseño
          </Link>
        </p>
      </div>
    </main>
  )
}
