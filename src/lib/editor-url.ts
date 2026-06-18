import { EDITOR_PATH } from './start-editor'
import type { ProductColorValue, ProductSlug } from './products'

export function buildEditorPath(options?: {
  product?: ProductSlug | string
  tpl?: string
  color?: ProductColorValue
}): string {
  const params = new URLSearchParams()
  if (options?.product) params.set('product', options.product)
  if (options?.tpl) params.set('tpl', options.tpl)
  if (options?.color) params.set('color', options.color)
  const q = params.toString()
  return q ? `${EDITOR_PATH}?${q}` : EDITOR_PATH
}
