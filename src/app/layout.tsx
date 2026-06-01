import type { Metadata } from 'next'
import './globals.css'
import { SiteFooter } from '../components/layout/site-footer'
import { SiteHeader } from '../components/layout/site-header'
import { AppStateProvider } from '../components/app-state/app-state-provider'
import { WebVitalsReporter } from '../components/analytics/web-vitals'

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
          <WebVitalsReporter />
          <SiteHeader />
          <main className="flex min-h-0 flex-1 flex-col">{children}</main>
          <SiteFooter />
        </AppStateProvider>
      </body>
    </html>
  )
}
