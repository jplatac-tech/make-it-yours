'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  loadUploadedFiles,
  removeUploadedFile,
  type UploadedFile,
} from '../../lib/uploaded-files-storage'

type Props = {
  onSelectFile: (src: string, name: string) => void
  refreshKey?: number
}

export function UploadedFilesPanel({ onSelectFile, refreshKey = 0 }: Props) {
  const [files, setFiles] = useState<UploadedFile[]>([])

  const refresh = useCallback(() => {
    setFiles(loadUploadedFiles())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh, refreshKey])

  if (files.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-center">
        <p className="text-sm font-medium text-neutral-800">Sin archivos aún</p>
        <p className="mt-2 text-xs text-neutral-500">
          Sube imágenes en Elementos o Diseños y aparecerán aquí para
          reutilizarlas.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-neutral-500">
        {files.length} archivo{files.length === 1 ? '' : 's'} guardado
        {files.length === 1 ? '' : 's'} en este navegador.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {files.map((file) => (
          <div
            key={file.id}
            className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white"
          >
            <button
              type="button"
              onClick={() => onSelectFile(file.src, file.name)}
              className="block w-full text-left"
            >
              <div className="aspect-square overflow-hidden bg-neutral-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={file.src}
                  alt={file.name}
                  className="h-full w-full object-contain"
                />
              </div>
              <p className="truncate px-2 py-2 text-xs font-medium text-neutral-900">
                {file.name}
              </p>
            </button>
            <button
              type="button"
              onClick={() => {
                removeUploadedFile(file.id)
                refresh()
              }}
              className="absolute top-2 right-2 rounded-full bg-white/80 p-1 text-red-600 opacity-0 transition group-hover:opacity-100"
              aria-label="Eliminar archivo subido"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
