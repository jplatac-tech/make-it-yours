export type DesignCategoryId =
  | 'anime-japanese'
  | 'retro'
  | 'streetwear'
  | 'gaming-tech'
  | 'cute-illustration'
  | 'minimal-text'
  | 'deportes'
  | 'clasico'
  | 'graficos'
  | 'otros'

export type CatalogDesign = {
  id: string
  title: string
  src: string
  category: DesignCategoryId
}

export type CatalogDesignGroup = {
  id: DesignCategoryId
  label: string
  designs: CatalogDesign[]
}
