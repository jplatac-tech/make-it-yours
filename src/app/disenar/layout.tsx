import { EditorFontsLoader } from '../../components/editor/editor-fonts-loader'

export default function DisenarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden max-lg:overscroll-none lg:h-[calc(100dvh-60px)] lg:max-h-[calc(100dvh-60px)]">
      <EditorFontsLoader />
      {children}
    </div>
  )
}