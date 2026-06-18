'use client'

type Props = {
  index: number
  total: number
  onPrev: () => void
  onNext: () => void
  variant?: 'card' | 'detail'
}

export function ImageCarouselControls({
  index,
  total,
  onPrev,
  onNext,
  variant = 'card',
}: Props) {
  if (total <= 1) return null

  return (
    <div
      className={
        'image-carousel-controls ' +
        (variant === 'detail'
          ? 'image-carousel-controls--detail'
          : 'image-carousel-controls--card')
      }
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        aria-label="Foto anterior"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onPrev()
        }}
        className="image-carousel-controls__nav"
      >
        ‹
      </button>

      <div className="image-carousel-controls__center" aria-hidden>
        <div className="image-carousel-controls__dots">
          {Array.from({ length: total }, (_, dotIndex) => (
            <span
              key={dotIndex}
              className={
                'image-carousel-controls__dot ' +
                (dotIndex === index ? 'is-active' : '')
              }
            />
          ))}
        </div>
        <span className="image-carousel-controls__count">
          {index + 1}/{total}
        </span>
      </div>

      <button
        type="button"
        aria-label="Foto siguiente"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onNext()
        }}
        className="image-carousel-controls__nav"
      >
        ›
      </button>
    </div>
  )
}
