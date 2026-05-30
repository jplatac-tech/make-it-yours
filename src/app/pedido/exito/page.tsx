import Link from 'next/link'

export default function PedidoExitoPage() {
  return (
    <main className="container flex min-h-screen items-center justify-center py-16">
      <div className="card w-full max-w-2xl p-8 text-center">
        <p className="text-sm font-medium tracking-[0.2em] text-neutral-500 uppercase">
          Pedido enviado
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-neutral-950">
          Tu diseño fue enviado correctamente
        </h1>
        <p className="mt-4 text-neutral-600">
          Revisaremos tu prenda y te contactaremos con los siguientes pasos.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/disenar" className="btn btn-primary">
            Crear otro diseño
          </Link>
          <Link href="/" className="btn btn-secondary">
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  )
}
