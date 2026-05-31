/** Catálogo generado desde public/gallery/sin-fondo (npm run sync-catalog) */

import catalogManifest from '../data/catalog-manifest.json'
import type { DesignCategoryId } from './catalog-designs-types'

export type { DesignCategoryId, CatalogDesign, CatalogDesignGroup } from './catalog-designs-types'

import type { CatalogDesign, CatalogDesignGroup } from './catalog-designs-types'

export const DESIGN_CATEGORIES: {
  id: DesignCategoryId
  label: string
}[] = [
  { id: 'anime-japanese', label: 'Anime y japonés' },
  { id: 'retro', label: 'Retro y groovy' },
  { id: 'streetwear', label: 'Streetwear y urbano' },
  { id: 'gaming-tech', label: 'Gaming y tech' },
  { id: 'cute-illustration', label: 'Ilustración cute' },
  { id: 'minimal-text', label: 'Tipografía minimal' },
  { id: 'deportes', label: 'Deportes' },
  { id: 'clasico', label: 'Diseños clásicos' },
  { id: 'otros', label: 'Otros' },
]

export const CATALOG_DESIGNS: CatalogDesign[] =
  catalogManifest.designs as CatalogDesign[]

export function getFeaturedHomeDesigns(limit = 16): CatalogDesign[] {
  const out: CatalogDesign[] = []
  for (const group of getCatalogDesignGroups()) {
    for (const design of group.designs) {
      if (out.length >= limit) return out
      out.push(design)
    }
  }
  return out
}

export function getCatalogDesignGroups(): CatalogDesignGroup[] {
  const byCategory = new Map<DesignCategoryId, CatalogDesign[]>()

  for (const design of CATALOG_DESIGNS) {
    const list = byCategory.get(design.category) ?? []
    list.push(design)
    byCategory.set(design.category, list)
  }

  return DESIGN_CATEGORIES.filter((cat) => (byCategory.get(cat.id)?.length ?? 0) > 0).map(
    (cat) => ({
      id: cat.id,
      label: cat.label,
      designs: byCategory.get(cat.id)!,
    }),
  )
}
