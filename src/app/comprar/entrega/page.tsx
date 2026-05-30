import Link from 'next/link'
import { QuoteDeliveryForm } from '../../../components/forms/quote-delivery-form'

export default async function ComprarEntregaPage({
  searchParams,
}: {
  searchParams: Promise<{ quoteId?: string }>
}) {
  const { quoteId } = await searchParams

  if (!quoteId) {
    return (
      <main className="container py-16">
        <div className="card mx-auto max-w-xl p-8 text-center">
          <h1 className="text-2xl font-semibold text-neutral-950">
            Pedido no encontrado
          </h1>
          <p className="mt-4 text-neutral-600">
            Confirma primero tu pedido desde el editor de diseño.
          </p>
          <Link href="/comprar" className="btn btn-primary mt-8 inline-flex">
            Ir a confirmar pedido
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="container py-16">
      <div className="mx-auto max-w-xl">
        <p className="text-sm font-medium tracking-[0.2em] text-neutral-500 uppercase">
          Paso 2
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-neutral-950">
          Datos de contacto y entrega
        </h1>
        <p className="mt-4 text-neutral-600">
          Tu pedido ya fue registrado. Completa cómo contactarte y dónde
          entregar.
        </p>

        <div className="card mt-8 p-6">
          <QuoteDeliveryForm quoteId={quoteId} />
        </div>

        <p className="mt-6 text-center text-sm text-neutral-500">
          <Link href="/pedido/exito" className="underline">
            Omitir por ahora
          </Link>
        </p>
      </div>
    </main>
  )
}
