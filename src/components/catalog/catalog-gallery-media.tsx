'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useInViewport } from '../../hooks/use-in-view'
import { shouldMountCarouselSlide } from '../../lib/carousel'
import { ImageCarouselControls } from '../ui/image-carousel-controls'

const AUTO_ADVANCE_MS = 1000
const PAUSE_AFTER_MANUAL_MS = 2500

type Props = {
  images: string[]
  alt: string
  href: string
  badge?: string
  imagePriority?: boolean
}

export function CatalogGalleryMedia({
  images,
  alt,
  href,
  badge,
  imagePriority = false,
}: Props) {
  const { ref, visible } = useInViewport<HTMLDivElement>(0.12)
  const [index, setIndex] = useState(0)
  const [manualPauseUntil, setManualPauseUntil] = useState(0)
  const total = images.length
  const hasMany = total > 1
  const activeIndex = visible ? index : 0

  const go = useCallback(
    (delta: number) => {
      setIndex((current) => (current + delta + total) % total)
      setManualPauseUntil(Date.now() + PAUSE_AFTER_MANUAL_MS)
    },
    [total],
  )

  const mountedSlides = useMemo(() => {
    if (!visible) return new Set([0])
    const set = new Set<number>()
    for (let i = 0; i < total; i += 1) {
      if (shouldMountCarouselSlide(i, activeIndex, total)) set.add(i)
    }
    return set
  }, [activeIndex, total, visible])

  useEffect(() => {
    if (!hasMany || !visible) return

    const tick = () => {
      if (Date.now() < manualPauseUntil) return
      if (document.visibilityState !== 'visible') return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      setIndex((current) => (current + 1) % total)
    }

    const timer = window.setInterval(tick, AUTO_ADVANCE_MS)
    return () => window.clearInterval(timer)
  }, [hasMany, manualPauseUntil, total, visible])

  return (
    <div
      ref={ref}
      className="catalog-gallery-media catalog-look-card__media-frame"
    >
      <Link href={href} className="catalog-gallery-media__hit" aria-label={alt}>
        <div className="catalog-gallery-media__slides">
          {images.map((src, slideIndex) => {
            if (!mountedSlides.has(slideIndex)) return null
            const isActive = slideIndex === activeIndex
            return (
              <Image
                key={src}
                src={src}
                alt={isActive ? alt : ''}
                fill
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 33vw, 300px"
                loading={
                  imagePriority && slideIndex === 0 ? 'eager' : 'lazy'
                }
                priority={imagePriority && slideIndex === 0}
                className={
                  'catalog-look-card__img catalog-gallery-media__slide ' +
                  (isActive ? 'is-active' : '')
                }
                aria-hidden={!isActive}
              />
            )
          })}
        </div>
      </Link>

      {badge ? (
        <span className="catalog-look-card__badge catalog-gallery-media__badge">
          {badge}
        </span>
      ) : null}

      {hasMany && visible ? (
        <ImageCarouselControls
          index={activeIndex}
          total={total}
          onPrev={() => go(-1)}
          onNext={() => go(1)}
          variant="card"
        />
      ) : null}
    </div>
  )
}
