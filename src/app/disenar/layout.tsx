import { EditorFontsLoader } from '../../components/editor/editor-fonts-loader'

export default function DisenarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col [--editor-header:53px]">
      <EditorFontsLoader />
      {children}
    </div>
  )
}