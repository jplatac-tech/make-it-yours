import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="container flex min-h-screen items-center justify-center py-16">
      <div className="card w-full max-w-xl p-8 text-center">
        <p className="text-sm font-medium tracking-[0.2em] text-neutral-500 uppercase">
          Error 404
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-neutral-900">
          Página no encontrada
        </h1>
        <p className="mt-3 text-neutral-600">
          La página que buscas no existe o fue movida.
        </p>

        <div className="mt-6 flex justify-center">
          <Link href="/" className="btn btn-primary">
            Ir al inicio
          </Link>
        </div>
      </div>
    </main>
  )
}
