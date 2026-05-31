'use client'

import {
  GALLERY_BAND_POSTERS,
  GALLERY_PRESETS,
  type GalleryItem,
} from '../../lib/design-gallery'
import { getCatalogDesignGroups } from '../../lib/catalog-designs'

type Props = {
  onSelect: (src: string) => void
}

type StripProps = Props & {
  onGallerySelect?: (src: string, title: string) => void
}

const MOBILE_THUMB =
  'h-[64px] w-[64px] shrink-0 snap-start overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition active:scale-95 hover:border-violet-400'

export function MobileCatalogDesignsStrip({
  onSelect,
  onGallerySelect,
}: StripProps) {
  const designs = getCatalogDesignGroups().flatMap((g) => g.designs)
  const galleryItems: GalleryItem[] = [
    ...GALLERY_PRESETS,
    ...GALLERY_BAND_POSTERS,
  ]

  if (designs.length === 0 && galleryItems.length === 0) {
    return (
      <p className="px-3 py-3 text-center text-xs text-neutral-500">
        No hay diseños en el catálogo.
      </p>
    )
  }

  return (
    <div
      className="flex touch-pan-x gap-2 overflow-x-auto overscroll-x-contain px-3 py-2.5 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ WebkitOverflowScrolling: 'touch' }}
      aria-label="Catálogo de diseños"
    >
      {designs.map((design) => (
        <button
          key={design.id}
          type="button"
          title={design.title}
          onClick={() => onSelect(design.src)}
          className={`${MOBILE_THUMB} cursor-pointer`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={design.src}
            alt={design.title}
            className="h-full w-full object-contain p-1"
            loading="lazy"
            decoding="async"
          />
        </button>
      ))}
      {galleryItems.map((item) => (
        <button
          key={item.id}
          type="button"
          title={item.title}
          onClick={() =>
            onGallerySelect
              ? onGallerySelect(item.src, item.title)
              : onSelect(item.src)
          }
          className={`${MOBILE_THUMB} cursor-pointer`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.src}
            alt={item.title}
            className="h-full w-full object-contain p-1"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
        </button>
      ))}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold tracking-wide text-neutral-600 uppercase lg:text-sm">
      {children}
    </h3>
  )
}

export function CatalogDesignsGrid({ onSelect }: Props) {
  const groups = getCatalogDesignGroups()

  return (
    <div className="space-y-5 lg:space-y-6">
      {groups.map((group) => (
        <section key={group.id}>
          <SectionTitle>
            {group.label}
            <span className="ml-1.5 font-medium normal-case text-neutral-400">
              ({group.designs.length})
            </span>
          </SectionTitle>
          <div className="mt-3 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 lg:grid-cols-2">
            {group.designs.map((design) => (
              <button
                key={design.id}
                type="button"
                onClick={() => onSelect(design.src)}
                className="cursor-pointer overflow-hidden rounded-xl border border-neutral-200 bg-white text-left shadow-sm transition hover:border-violet-400 hover:shadow-md active:scale-[0.99]"
              >
                <div className="flex min-h-[140px] items-center justify-center bg-neutral-50 p-2 lg:min-h-0 lg:aspect-square lg:p-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={design.src}
                    alt={design.title}
                    className="max-h-[200px] w-full object-contain object-center lg:aspect-square lg:max-h-none lg:object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <p className="truncate px-3 py-2.5 text-sm font-semibold text-neutral-800 lg:px-2.5 lg:py-2 lg:text-xs">
                  {design.title}
                </p>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
