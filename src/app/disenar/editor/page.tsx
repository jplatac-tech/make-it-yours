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
      <DesignStudio />
    </Suspense>
  )
}
