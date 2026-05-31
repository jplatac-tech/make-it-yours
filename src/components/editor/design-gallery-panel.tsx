'use client'

import { useState } from 'react'
import {
  GALLERY_BAND_POSTERS,
  GALLERY_PRESETS,
  type GalleryItem,
} from '../../lib/design-gallery'

type Props = {
  onSelectDesign: (src: string, title: string) => void
}

export function DesignGalleryPanel({ onSelectDesign }: Props) {
  const hasPresets = GALLERY_PRESETS.length > 0
  const hasPosters = GALLERY_BAND_POSTERS.length > 0
  const [filter, setFilter] = useState<'preset' | 'band-poster'>(
    hasPresets ? 'preset' : 'band-poster',
  )

  if (!hasPresets && !hasPosters) {
    return null
  }

  const items: GalleryItem[] =
    filter === 'band-poster' || !hasPresets
      ? GALLERY_BAND_POSTERS
      : GALLERY_PRESETS

  return (
    <div className="space-y-4">
      {hasPresets && hasPosters ? (
        <div className="flex gap-1 rounded-xl bg-neutral-100 p-1">
          {(
            [
              ['preset', 'Gráficos'],
              ['band-poster', 'Posters'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={
                'min-h-[40px] flex-1 cursor-pointer rounded-lg px-2 py-2 text-xs font-semibold ' +
                (filter === key
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:bg-white/70')
              }
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}

      <p className="text-xs text-neutral-500">
        {filter === 'preset' && hasPresets
          ? 'Gráficos del proyecto (SVG).'
          : 'Posters históricos · Wikimedia Commons.'}
      </p>

      <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
        {items.map((item) => (
          <GalleryCard
            key={item.id}
            item={item}
            onSelect={() => onSelectDesign(item.src, item.title)}
          />
        ))}
      </div>
    </div>
  )
}

function GalleryCard({
  item,
  onSelect,
}: {
  item: GalleryItem
  onSelect: () => void
}) {
  const [error, setError] = useState(false)

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group cursor-pointer overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 text-left transition hover:border-violet-400 hover:shadow-md"
    >
      <div className="flex min-h-[120px] items-center justify-center overflow-hidden bg-neutral-50 p-2 lg:aspect-[3/4] lg:min-h-0 lg:bg-neutral-100 lg:p-0">
        {!error ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.src}
            alt={item.title}
            className="max-h-[180px] w-full object-contain object-center transition group-hover:scale-[1.02] lg:h-full lg:max-h-none lg:object-cover"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center p-2 text-center text-xs text-neutral-500">
            Vista no disponible
          </div>
        )}
      </div>
      <div className="border-t border-neutral-100 px-2 py-2">
        <p className="truncate text-xs font-semibold text-neutral-900">
          {item.title}
        </p>
      </div>
    </button>
  )
}
