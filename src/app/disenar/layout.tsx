import { EditorFontsLoader } from '../../components/editor/editor-fonts-loader'

export default function DisenarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="editor-shell-height w-full max-lg:overscroll-none">
      <EditorFontsLoader />
      {children}
    </div>
  )
}
