import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { HomeHero } from '../components/home/home-hero'
import { CATALOG_HERO_BLUR_IMAGE } from '../lib/catalog-looks'

const HomeTrendsSection = dynamic(
  () =>
    import('../components/home/home-trends-section').then(
      (m) => m.HomeTrendsSection,
    ),
  {
    loading: () => (
      <section
        className="border-b border-neutral-200 bg-[#fafafa] py-14"
        aria-hidden
      >
        <div className="container mx-auto h-64 max-w-6xl animate-pulse rounded-2xl bg-neutral-200/70" />
      </section>
    ),
  },
)

export const metadata: Metadata = {
  title: 'Inicio',
  description:
    'Diseña tu ropa con mockup real, catálogo personalizable y cotización por WhatsApp.',
}

export default function HomePage() {
  return (
    <>
      <link
        rel="preload"
        as="image"
        href={CATALOG_HERO_BLUR_IMAGE}
        fetchPriority="high"
      />
      <HomeHero />
      <HomeTrendsSection />
    </>
  )
}
