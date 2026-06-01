import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '../../../../lib/prisma'
import { QuoteStatusBadge } from '../../../../components/admin/quote-status-badge'
import { getQuoteRequest } from '../../../../server/queries/quotes'

export const dynamic = 'force-dynamic'

export default async function AdminQuoteDetailPage({
  params,
}: {
  params: { id: string }
}) {
  async function updateQuoteStatus(formData: FormData) {
    'use server'
    const quoteId = formData.get('quoteId')
    const status = formData.get('status')

    if (typeof quoteId !== 'string' || typeof status !== 'string') {
      return
    }

    const existing = await prisma.quoteRequest.findUnique({
      where: { id: quoteId },
      select: { status: true },
    })

    if (!existing) return

    const nextStatus = status as
      | 'PENDING'
      | 'IN_REVIEW'
      | 'QUOTED'
      | 'APPROVED'
      | 'REJECTED'
      | 'NEW'
      | 'REVIEWING'
      | 'AWAITING_CORRECTION'
      | 'READY_FOR_PRINT'
      | 'IN_PRODUCTION'
      | 'COMPLETED'
      | 'CANCELLED'

    await prisma.quoteRequest.update({
      where: { id: quoteId },
      data: {
        status: nextStatus,
        statusHistory: {
          create: {
            fromStatus: existing.status,
            toStatus: nextStatus,
          },
        },
      },
    })
  }

  async function addQuoteNote(formData: FormData) {
    'use server'
    const quoteId = formData.get('quoteId')
    const note = formData.get('note')

    if (typeof quoteId !== 'string' || typeof note !== 'string') {
      return
    }

    const text = note.trim()
    if (!text) return

    const existing = await prisma.quoteRequest.findUnique({
      where: { id: quoteId },
      select: { status: true },
    })

    if (!existing) return

    await prisma.quoteRequest.update({
      where: { id: quoteId },
      data: {
        statusHistory: {
          create: {
            fromStatus: existing.status,
            toStatus: existing.status,
            note: text,
          },
        },
      },
    })
  }

  const quote = await getQuoteRequest(params.id)

  if (!quote) {
    notFound()
  }

  const item = quote.items[0]
  const mockupAssets =
    item?.assets.filter((asset) => asset.kind === 'MOCKUP_PREVIEW') ?? []
  const technicalAssets =
    item?.assets.filter((asset) => asset.kind === 'TECHNICAL_FILE') ?? []

  function assetZoneLabel(originalName: string | null | undefined) {
    if (originalName?.includes('FRONT')) return 'Frente'
    if (originalName?.includes('BACK')) return 'Espalda'
    return 'Vista'
  }
  const designJsonString = item
    ? JSON.stringify(item.designJson, null, 2)
    : '{}'
  const designJsonHref = `data:application/json;charset=utf-8,${encodeURIComponent(
    designJsonString,
  )}`

  return (
    <main className="container py-10 sm:py-16">
      <Link href="/admin/quotes" className="text-sm text-neutral-500">
        ← Volver a pedidos
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium tracking-[0.2em] text-neutral-500 uppercase">
            Pedido de producción
          </p>
          <h1 className="mt-3 break-all text-2xl font-semibold text-neutral-950 sm:text-3xl">
            {quote.requestNumber}
          </h1>
          <p className="mt-2 text-neutral-600">
            Detalle de pedido con archivos editables, mockup y arte técnico.
          </p>
        </div>

        <div className="rounded-full border border-neutral-300 px-4 py-2 text-sm text-neutral-700">
          <QuoteStatusBadge status={quote.status} />
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.95fr]">
        <section className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-neutral-900">Mockups</h2>
            {mockupAssets.length > 0 ? (
              <div
                className={
                  'mt-4 grid gap-4 ' +
                  (mockupAssets.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1')
                }
              >
                {mockupAssets.map((mockupAsset) =>
                  mockupAsset.url?.startsWith('data:') ||
                  mockupAsset.url?.startsWith('http') ? (
                    <div key={mockupAsset.id}>
                      <p className="mb-2 text-sm font-medium text-neutral-600">
                        {assetZoneLabel(mockupAsset.originalName)}
                      </p>
                      <img
                        src={mockupAsset.url}
                        alt={assetZoneLabel(mockupAsset.originalName)}
                        className="w-full rounded-3xl border border-neutral-200 object-contain"
                      />
                      <a
                        href={mockupAsset.url}
                        download={`mockup-${quote.requestNumber}-${mockupAsset.originalName ?? 'vista'}.png`}
                        className="btn btn-secondary mt-3 inline-flex"
                      >
                        Descargar
                      </a>
                    </div>
                  ) : null,
                )}
              </div>
            ) : (
              <div className="mt-4 flex min-h-105 items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 text-neutral-400">
                Mockup interno no disponible
              </div>
            )}
            {technicalAssets.length > 0 ? (
              <div className="mt-6 flex flex-wrap gap-3">
                {technicalAssets.map((technicalAsset) =>
                  technicalAsset.url.startsWith('data:') ||
                  technicalAsset.url.startsWith('http') ? (
                    <a
                      key={technicalAsset.id}
                      href={technicalAsset.url}
                      download={`print-ready-${quote.requestNumber}-${technicalAsset.originalName ?? 'arte'}.png`}
                      className="btn btn-primary"
                    >
                      Arte {assetZoneLabel(technicalAsset.originalName)}
                    </a>
                  ) : null,
                )}
              </div>
            ) : null}
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              Archivos del pedido
            </h2>
            <div className="mt-4 space-y-4 text-sm text-neutral-700">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="font-medium text-neutral-900">Diseño editable</p>
                <p className="mt-2 text-neutral-600">
                  El JSON se guarda para reabrir el diseño, corregir o generar
                  nuevas exportaciones.
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <a
                    href={designJsonHref}
                    download={`design-${quote.requestNumber}.json`}
                    className="btn btn-secondary"
                  >
                    Descargar design.json
                  </a>
                </div>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="font-medium text-neutral-900">Notas internas</p>
                <p className="mt-2 text-sm whitespace-pre-line text-neutral-600">
                  {quote.comments ?? 'Sin notas adicionales.'}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              Historial del trabajo
            </h2>
            <div className="mt-4 space-y-3 text-sm text-neutral-700">
              {quote.statusHistory.length === 0 ? (
                <p className="text-neutral-500">
                  Aún no hay movimientos registrados.
                </p>
              ) : (
                quote.statusHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs tracking-[0.2em] text-neutral-500 uppercase">
                      <span>
                        {entry.fromStatus ?? 'CREADO'} → {entry.toStatus}
                      </span>
                      <span>{entry.changedAt.toISOString().split('T')[0]}</span>
                    </div>
                    {entry.note ? (
                      <p className="mt-2 text-sm text-neutral-600">
                        {entry.note}
                      </p>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="card p-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              Datos del pedido
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500">Producto</dt>
                <dd className="font-medium text-neutral-900">
                  {item?.productVariant.product.name ?? 'N/A'}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500">SKU</dt>
                <dd className="font-medium text-neutral-900">
                  {item?.productVariant.sku ?? 'N/A'}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500">Color</dt>
                <dd className="font-medium text-neutral-900">
                  {item?.productVariant.color.toLowerCase() ?? 'N/A'}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500">Talla</dt>
                <dd className="font-medium text-neutral-900">
                  {item?.productVariant.size ?? 'N/A'}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500">Zona principal</dt>
                <dd className="font-medium text-neutral-900">
                  {item?.printZone.label ?? 'N/A'}
                  {mockupAssets.length > 1
                    ? ` (+${mockupAssets.length - 1} cara${mockupAssets.length > 2 ? 's' : ''} más en mockups)`
                    : ''}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500">Tamaño</dt>
                <dd className="font-medium text-neutral-900">
                  {item?.finalWidthIn?.toString() ?? 'N/A'} ×{' '}
                  {item?.finalHeightIn?.toString() ?? 'N/A'} in
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500">DPI</dt>
                <dd className="font-medium text-neutral-900">
                  {item?.printZone.dpi ?? 'N/A'}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500">Cantidad</dt>
                <dd className="font-medium text-neutral-900">
                  {quote.quantityDesired}
                </dd>
              </div>
            </dl>
          </section>

          <section className="card p-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              Cambiar estado
            </h2>
            <div className="mt-4 grid gap-3">
              <form action={updateQuoteStatus} className="grid gap-3">
                <input type="hidden" name="quoteId" value={quote.id} />
                <button
                  name="status"
                  value="NEW"
                  className="btn btn-secondary w-full"
                >
                  Marcar nuevo
                </button>
                <button
                  name="status"
                  value="REVIEWING"
                  className="btn btn-secondary w-full"
                >
                  En revisión interna
                </button>
                <button
                  name="status"
                  value="AWAITING_CORRECTION"
                  className="btn btn-secondary w-full"
                >
                  Solicitar corrección
                </button>
                <button
                  name="status"
                  value="READY_FOR_PRINT"
                  className="btn btn-secondary w-full"
                >
                  Listo para imprimir
                </button>
                <button
                  name="status"
                  value="IN_PRODUCTION"
                  className="btn btn-secondary w-full"
                >
                  En producción
                </button>
                <button
                  name="status"
                  value="COMPLETED"
                  className="btn btn-primary w-full"
                >
                  Marcar completado
                </button>
                <button
                  name="status"
                  value="CANCELLED"
                  className="btn btn-ghost w-full"
                >
                  Cancelar pedido
                </button>
              </form>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              Registrar comentario
            </h2>
            <form action={addQuoteNote} className="space-y-4">
              <input type="hidden" name="quoteId" value={quote.id} />
              <label className="block text-sm font-medium text-neutral-900">
                Nota interna
                <textarea
                  name="note"
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none"
                  placeholder="Describe la corrección o el comentario de producción"
                />
              </label>
              <button type="submit" className="btn btn-primary w-full">
                Guardar nota
              </button>
            </form>
          </section>
        </aside>
      </div>
    </main>
  )
}
