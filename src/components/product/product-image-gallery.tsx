'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { shouldMountCarouselSlide } from '../../lib/carousel'
import { ImageCarouselControls } from '../ui/image-carousel-controls'

const AUTO_ADVANCE_MS = 1000
const PAUSE_AFTER_MANUAL_MS = 2500

export function ProductImageGallery({
  images,
  alt,
}: {
  images: string[]
  alt: string
}) {
  const [index, setIndex] = useState(0)
  const [manualPauseUntil, setManualPauseUntil] = useState(0)
  const total = images.length

  const go = useCallback(
    (delta: number) => {
      setIndex((current) => (current + delta + total) % total)
      setManualPauseUntil(Date.now() + PAUSE_AFTER_MANUAL_MS)
    },
    [total],
  )

  const mountedSlides = useMemo(() => {
    const set = new Set<number>()
    for (let i = 0; i < total; i += 1) {
      if (shouldMountCarouselSlide(i, index, total)) set.add(i)
    }
    return set
  }, [index, total])

  useEffect(() => {
    if (total <= 1) return

    const tick = () => {
      if (Date.now() < manualPauseUntil) return
      if (document.visibilityState !== 'visible') return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      setIndex((current) => (current + 1) % total)
    }

    const timer = window.setInterval(tick, AUTO_ADVANCE_MS)
    return () => window.clearInterval(timer)
  }, [manualPauseUntil, total])

  if (total <= 1) {
    return (
      <Image
        src={images[0]}
        alt={alt}
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover object-center"
        priority
      />
    )
  }

  return (
    <div className="catalog-gallery-media absolute inset-0">
      <div className="catalog-gallery-media__slides">
        {images.map((src, slideIndex) => {
          if (!mountedSlides.has(slideIndex)) return null
          const isActive = slideIndex === index
          return (
            <Image
              key={src}
              src={src}
              alt={isActive ? alt : ''}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className={
                'object-cover object-center catalog-gallery-media__slide ' +
                (isActive ? 'is-active' : '')
              }
              loading={slideIndex === 0 ? 'eager' : 'lazy'}
              priority={slideIndex === 0}
              aria-hidden={!isActive}
            />
          )
        })}
      </div>
      <ImageCarouselControls
        index={index}
        total={total}
        onPrev={() => go(-1)}
        onNext={() => go(1)}
        variant="detail"
      />
    </div>
  )
}
