'use client'

import { useEffect } from 'react'

type WebVitalMetric = {
  name: string
  value: number
  delta: number
  id: string
  label: string
}

function sendMetric(metric: WebVitalMetric) {
  void fetch('/api/web-vitals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metric),
  }).catch(() => {
    /* ignore metric send failures */
  })

  console.info('Web Vitals:', metric)
}

function observeMetric(
  type: string,
  callback: (entry: PerformanceEntry) => void,
) {
  if (typeof PerformanceObserver !== 'undefined') {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(callback)
      })
      observer.observe({ type, buffered: true })
      return () => observer.disconnect()
    } catch {
      return () => undefined
    }
  }
  return () => undefined
}

function normalizeEntry(entry: PerformanceEntry): WebVitalMetric | null {
  if (entry.entryType === 'largest-contentful-paint') {
    return {
      name: 'LCP',
      value: entry.startTime,
      delta: entry.startTime,
      id: `${entry.entryType}-${entry.startTime}`,
      label: 'web-vital',
    }
  }
  if (entry.entryType === 'first-input' || entry.entryType === 'first-input') {
    const firstInput = entry as PerformanceEventTiming
    return {
      name: 'FID',
      value: firstInput.processingStart - firstInput.startTime,
      delta: firstInput.processingStart - firstInput.startTime,
      id: `${entry.entryType}-${entry.startTime}`,
      label: 'web-vital',
    }
  }
  if (entry.entryType === 'layout-shift') {
    const shift = entry as any
    if (shift.hadRecentInput) return null
    return {
      name: 'CLS',
      value: shift.value,
      delta: shift.value,
      id: entry.name,
      label: 'web-vital',
    }
  }
  return null
}

export function WebVitalsReporter() {
  useEffect(() => {
    const disconnectors = [
      observeMetric('largest-contentful-paint', (entry) => {
        const metric = normalizeEntry(entry)
        if (metric) sendMetric(metric)
      }),
      observeMetric('first-input', (entry) => {
        const metric = normalizeEntry(entry)
        if (metric) sendMetric(metric)
      }),
      observeMetric('layout-shift', (entry) => {
        const metric = normalizeEntry(entry)
        if (metric) sendMetric(metric)
      }),
    ]

    return () => {
      disconnectors.forEach((disconnect) => disconnect())
    }
  }, [])

  return null
}
