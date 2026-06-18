import type { Metadata } from 'next'
import './globals.css'
import { SiteFooter } from '../components/layout/site-footer'
import { SiteHeader } from '../components/layout/site-header'
import { ClientLayoutExtras } from '../components/layout/client-layout-extras'
import { AppStateProvider } from '../components/app-state/app-state-provider'

export const metadata: Metadata = {
  title: {
    default: 'Make It Yours',
    template: '%s | Make It Yours',
  },
  description:
    'Tienda de ropa personalizada: catálogo, editor 2D tipo Canva y pedidos por WhatsApp.',
  applicationName: 'Make It Yours',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="flex min-h-dvh flex-col">
        <AppStateProvider>
          <ClientLayoutExtras />
          <SiteHeader />
          <main className="flex min-h-0 flex-1 flex-col">{children}</main>
          <SiteFooter />
        </AppStateProvider>
      </body>
    </html>
  )
}
