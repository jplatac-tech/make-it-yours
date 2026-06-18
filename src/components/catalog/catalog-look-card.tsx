'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  formatCatalogPrice,
  getCatalogCardCopy,
  type CatalogProduct,
} from '../../lib/product-catalog'
import { EditorEntryTrigger } from '../editor/editor-entry-trigger'
import { CatalogGalleryMedia } from './catalog-gallery-media'

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
  imagePriority?: boolean
}

export function CatalogLookCard({
  product,
  detailLabel = 'Detalle',
  imagePriority = false,
}: Props) {
  const detailHref = productDetailHref(product)
  const cardCopy = getCatalogCardCopy(product.slug)
  const galleryImages =
    product.images && product.images.length > 1
      ? product.images
      : null

  return (
    <article
      className={
        'catalog-look-card' + (galleryImages ? ' catalog-look-card--gallery' : '')
      }
    >
      {galleryImages ? (
        <div className="catalog-look-card__media">
          <CatalogGalleryMedia
            images={galleryImages}
            alt={cardCopy.title}
            href={detailHref}
            badge={product.badge}
            imagePriority={imagePriority}
          />
        </div>
      ) : (
        <Link href={detailHref} className="catalog-look-card__media">
          <div className="catalog-look-card__media-frame">
            <Image
              src={product.image}
              alt={cardCopy.title}
              fill
              sizes="(max-width: 640px) 92vw, (max-width: 1024px) 33vw, 300px"
              loading={imagePriority ? 'eager' : 'lazy'}
              priority={imagePriority}
              className="catalog-look-card__img"
            />
            <div className="catalog-look-card__shade" aria-hidden />
            <span className="catalog-look-card__peek">Ver look →</span>
            {product.badge ? (
              <span className="catalog-look-card__badge">{product.badge}</span>
            ) : null}
          </div>
        </Link>
      )}

      <div className="catalog-look-card__body">
        <Link href={detailHref} className="catalog-look-card__title-link">
          <h3 className="catalog-look-card__title">{cardCopy.title}</h3>
        </Link>
        <p className="catalog-look-card__desc">{cardCopy.subtitle}</p>
        <p className="catalog-look-card__price">
          {formatCatalogPrice(product.price)}
        </p>
        <div className="catalog-look-card__actions">
          <EditorEntryTrigger
            product={product.slug}
            className="btn-card btn-card--primary"
          >
            Personalizar
          </EditorEntryTrigger>
          <Link href={detailHref} className="btn-card btn-card--secondary">
            {detailLabel}
          </Link>
        </div>
      </div>
    </article>
  )
}
