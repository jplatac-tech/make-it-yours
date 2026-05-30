import Link from 'next/link'
import { getAdminQuotes } from '../../../server/queries/quotes'
import { QuoteStatusBadge } from '../../../components/admin/quote-status-badge'

export const dynamic = 'force-dynamic'

export default async function AdminQuotesPage() {
  const { quotes, dbUnavailable } = await getAdminQuotes()

  return (
    <main className="container py-16">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium tracking-[0.2em] text-neutral-500 uppercase">
            Admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-neutral-950">
            Pedidos recibidos
          </h1>
          <p className="mt-2 text-neutral-600">
            Panel para revisar diseños enviados por clientes.
          </p>
        </div>

        <Link href="/" className="btn btn-secondary">
          Ir a la tienda
        </Link>
      </div>

      {dbUnavailable ? (
        <div className="card mt-8 border-amber-200 bg-amber-50 p-6 text-amber-900">
          <p className="font-semibold">Base de datos no disponible</p>
          <p className="mt-2 text-sm">
            No se pudo conectar a PostgreSQL en{' '}
            <code className="rounded bg-amber-100 px-1">127.0.0.1:5432</code>.
            Inicia la base de datos o revisa tu archivo{' '}
            <code className="rounded bg-amber-100 px-1">.env</code> con{' '}
            <code className="rounded bg-amber-100 px-1">DATABASE_URL</code>.
          </p>
        </div>
      ) : null}

      <div className="card mt-8 overflow-hidden">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-neutral-50">
            <tr className="text-left text-neutral-500">
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Cantidad</th>
              <th className="px-4 py-3">Entrega</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {quotes.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-neutral-500"
                >
                  {dbUnavailable
                    ? 'Sin conexión a la base de datos.'
                    : 'No hay pedidos todavía.'}
                </td>
              </tr>
            ) : (
              quotes.map((quote) => (
                <tr key={quote.id} className="border-t border-neutral-200">
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/quotes/${quote.id}`}
                      className="font-medium text-neutral-900"
                    >
                      {quote.requestNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-neutral-700">
                    {quote.customer}
                  </td>
                  <td className="px-4 py-4 text-neutral-700">
                    {quote.product}
                  </td>
                  <td className="px-4 py-4 text-neutral-700">
                    {quote.quantity}
                  </td>
                  <td className="px-4 py-4 text-neutral-700">
                    {quote.neededBy ?? 'Sin fecha'}
                  </td>
                  <td className="px-4 py-4">
                    <QuoteStatusBadge status={quote.status} />
                  </td>
                  <td className="px-4 py-4 text-neutral-700">
                    {quote.createdAt}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
