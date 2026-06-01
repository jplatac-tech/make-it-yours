'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { DesignStudio } from './design-studio'

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
