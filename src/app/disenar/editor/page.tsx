import { DesignStudioLoader } from '../../../components/editor/design-studio-loader'

export const metadata = {
  title: 'Editor',
  description: 'Editor visual 2D sobre mockup de crewneck.',
}

export default function DisenarEditorPage() {
  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      <DesignStudioLoader />
    </div>
  )
}
