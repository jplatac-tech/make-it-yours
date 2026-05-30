'use client'

import { getCatalogDesignGroups } from '../../lib/catalog-designs'

type Props = {
  onSelect: (src: string) => void
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
