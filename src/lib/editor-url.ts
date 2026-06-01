import { EDITOR_PATH } from './start-editor'
import type { ProductSlug } from './products'

export function buildEditorPath(options?: {
  product?: ProductSlug | string
  tpl?: string
}): string {
  const params = new URLSearchParams()
  if (options?.product) params.set('product', options.product)
  if (options?.tpl) params.set('tpl', options.tpl)
  const q = params.toString()
  return q ? `${EDITOR_PATH}?${q}` : EDITOR_PATH
}
