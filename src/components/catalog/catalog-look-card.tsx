'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  formatCatalogPrice,
  type CatalogProduct,
} from '../../lib/product-catalog'
import { buildEditorPath } from '../../lib/editor-url'

function productDetailHref(product: CatalogProduct) {
  if (product.catalogId === product.slug) {
    return `/productos/${product.slug}`
  }
  return `/productos/${product.slug}?look=${encodeURIComponent(product.catalogId)}`
}

type Props = {
  product: CatalogProduct
  /** Segundo botón: "Detalle" en home, "Ver detalle" en catálogo */
  detailLabel?: string
}

export function CatalogLookCard({
  product,
  detailLabel = 'Detalle',
}: Props) {
  const detailHref = productDetailHref(product)
  const editorHref = buildEditorPath({ product: product.slug })
  const description = product.highlight || product.description

  return (
    <article className="catalog-look-card">
      <Link href={detailHref} className="catalog-look-card__media">
        <div className="catalog-look-card__media-frame">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 33vw, 300px"
            className="catalog-look-card__img"
          />
          <div className="catalog-look-card__shade" aria-hidden />
          <span className="catalog-look-card__peek">Ver look →</span>
          {product.badge ? (
            <span className="catalog-look-card__badge">{product.badge}</span>
          ) : null}
        </div>
      </Link>

      <div className="catalog-look-card__body">
        <Link href={detailHref} className="catalog-look-card__title-link">
          <h3 className="catalog-look-card__title">{product.name}</h3>
        </Link>
        <p className="catalog-look-card__desc">{description}</p>
        <p className="catalog-look-card__price">
          {formatCatalogPrice(product.price)}
        </p>
        <div className="catalog-look-card__actions">
          <Link href={editorHref} className="btn-card btn-card--primary">
            Personalizar
          </Link>
          <Link href={detailHref} className="btn-card btn-card--secondary">
            {detailLabel}
          </Link>
        </div>
      </div>
    </article>
  )
}
