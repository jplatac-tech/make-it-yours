'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

const DesignStudio = dynamic(
  () => import('./design-studio').then((m) => m.DesignStudio),
  {
    loading: () => (
      <div className="flex h-full min-h-[40vh] flex-1 flex-col items-center justify-center gap-3 bg-[#eef0f4] text-neutral-600">
        <div
          className="h-9 w-9 animate-spin rounded-full border-2 border-neutral-300 border-t-violet-600"
          aria-hidden
        />
        <p className="text-sm font-medium">Cargando editor…</p>
      </div>
    ),
    ssr: false,
  },
)

function DesignStudioWithParams() {
  const searchParams = useSearchParams()
  return <DesignStudio searchParams={searchParams} />
}

export function DesignStudioLoader() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full min-h-[40vh] flex-1 items-center justify-center bg-[#eef0f4] text-neutral-600">
          Cargando editor…
        </div>
      }
    >
      <DesignStudioWithParams />
    </Suspense>
  )
}
