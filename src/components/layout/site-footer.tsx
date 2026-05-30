import Link from 'next/link'
import { buildWhatsAppUrl, formatQuickQuoteMessage } from '../../lib/whatsapp'

export function SiteFooter() {
  const whatsappHref = buildWhatsAppUrl(formatQuickQuoteMessage())

  return (
    <footer className="border-t border-neutral-200 py-10">
      <div className="container flex flex-wrap items-center justify-between gap-6 text-sm text-neutral-500">
        <p>Make It Yours — diseña, estampa y cotiza por WhatsApp.</p>
        <div className="flex flex-wrap gap-4 font-semibold text-neutral-700">
          <Link href="/catalogo">Catálogo</Link>
          <Link href="/disenar">Editor</Link>
          <Link href="/carrito">Carrito</Link>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </footer>
  )
}
