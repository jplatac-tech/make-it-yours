'use client'

import { useEffect } from 'react'
import { getGoogleFontsStylesheets } from '../../lib/editor-fonts'

export function EditorFontsLoader() {
  useEffect(() => {
    const sheets = getGoogleFontsStylesheets()
    sheets.forEach((href, index) => {
      const id = `editor-google-fonts-${index}`
      if (document.getElementById(id)) return
      const link = document.createElement('link')
      link.id = id
      link.rel = 'stylesheet'
      link.href = href
      document.head.appendChild(link)
    })
  }, [])
  return null
}
