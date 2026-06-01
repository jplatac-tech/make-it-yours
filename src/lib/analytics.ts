export type AnalyticsParams = Record<string, string | number | boolean>

export function trackEvent(name: string, params?: AnalyticsParams) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent('miy-analytics', { detail: { name, params } }),
  )
  if (process.env.NODE_ENV === 'development') {
    console.debug('[analytics]', name, params ?? {})
  }
}
