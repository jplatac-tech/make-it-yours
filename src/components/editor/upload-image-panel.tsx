'use client'

type Props = {
  onUpload: (file: File) => void
  compact?: boolean
}

export function UploadImagePanel({ onUpload, compact = false }: Props) {
  return (
    <div className={compact ? 'w-full' : 'space-y-4'}>
      <label
        className={
          'flex w-full cursor-pointer flex-col rounded-2xl border-2 border-dashed border-violet-400 bg-gradient-to-b from-violet-50 to-white transition hover:border-violet-600 hover:shadow-md ' +
          (compact ? 'p-4' : 'p-6 sm:flex-row sm:items-center sm:gap-5')
        }
      >
        <span
          className={
            'flex shrink-0 items-center justify-center rounded-full bg-violet-600 font-bold text-white shadow-md ' +
            (compact ? 'mx-auto h-12 w-12 text-2xl' : 'h-16 w-16 text-3xl sm:mx-0')
          }
        >
          +
        </span>
        <span className={compact ? 'mt-3 text-center' : 'mt-4 text-center sm:mt-0 sm:text-left'}>
          <span className="block text-base font-bold text-neutral-900">
            Subir tu imagen
          </span>
          <span className="mt-1 block text-sm text-neutral-600">
            Toca aquí o arrastra PNG, JPG o WebP
          </span>
          <span className="mt-2 block text-xs font-medium text-violet-700">
            Se coloca en el suéter al instante
          </span>
        </span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onUpload(file)
            e.target.value = ''
          }}
        />
      </label>
      {!compact ? (
        <p className="text-sm text-neutral-500">
          Puedes subir varias imágenes. Selecciona cada una en el mockup para
          moverla o cambiar su capa (adelante / atrás).
        </p>
      ) : null}
    </div>
  )
}
