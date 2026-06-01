import { Suspense } from 'react'
import { DesignStudio } from '../../../components/editor/design-studio'

export const metadata = {
  title: 'Editor',
  description: 'Editor visual 2D sobre mockup de crewneck.',
}

export default function DisenarEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-neutral-600">
          Cargando editor…
        </div>
      }
    >
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <DesignStudio />
      </div>
    </Suspense>
  )
}
