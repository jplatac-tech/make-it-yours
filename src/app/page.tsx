import { ProductCatalogGrid } from '../components/catalog/product-catalog-grid'
import { HomeHero } from '../components/home/home-hero'

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <section id="catalogo" className="scroll-mt-[60px] bg-white">
        <ProductCatalogGrid />
      </section>
    </>
  )
}
