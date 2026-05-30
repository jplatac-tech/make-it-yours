import Link from 'next/link'
import { HomeTryDesignSection } from '../../components/home/home-try-design-section'

export const metadata = {
  title: 'Probar diseño',
  description:
    'Elige un gráfico para tu crewneck y ábrelo en el editor con mockup real.',
}

export default function ProbarDisenoPage() {
  return (
    <>
      <div className="border-b border-neutral-200 bg-white">
        <div className="container flex flex-wrap items-center justify-between gap-3 py-4">
          <Link
            href="/"
            className="text-sm font-semibold text-neutral-600 transition hover:text-neutral-950"
          >
            ← Inicio
          </Link>
        </div>
      </div>
      <HomeTryDesignSection />
    </>
  )
}
