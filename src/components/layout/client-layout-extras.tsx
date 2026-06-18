'use client'

import dynamic from 'next/dynamic'

const WebVitalsReporter = dynamic(
  () =>
    import('../analytics/web-vitals').then((m) => m.WebVitalsReporter),
  { ssr: false },
)

const WhatsAppHelpFab = dynamic(
  () =>
    import('../layout/whatsapp-help-fab').then((m) => m.WhatsAppHelpFab),
  { ssr: false },
)

export function ClientLayoutExtras() {
  return (
    <>
      <WebVitalsReporter />
      <WhatsAppHelpFab />
    </>
  )
}
