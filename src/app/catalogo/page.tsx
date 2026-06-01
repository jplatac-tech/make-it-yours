import { ProductCatalogGrid } from '../../components/catalog/product-catalog-grid'

export const metadata = {
  title: 'Catálogo',
  description:
    'Todas las prendas personalizables: filtros por estilo, precios y enlace al editor.',
}

export default function CatalogoPage() {
  return <ProductCatalogGrid />
}
