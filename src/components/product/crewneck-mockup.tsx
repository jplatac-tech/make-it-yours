import {
  type ProductColorValue,
  type PrintZoneValue,
} from '../../lib/products'
import {
  getCrewneckMockupSrc,
  type MockupColorKey,
} from '../../lib/mockup-assets'

type Props = {
  view: PrintZoneValue
  color: ProductColorValue
  className?: string
}

/**
 * Mockup fotográfico — imagen original sin optimizar de Next (máxima nitidez).
 */
export function CrewneckMockup({
  view,
  color,
  className = '',
}: Props) {
  const photoSrc = getCrewneckMockupSrc(color as MockupColorKey, view)
  const colorLabel =
    color === 'HEATHER_GRAY'
      ? 'Gris jaspe'
      : color === 'BLACK'
        ? 'Negro'
        : color === 'BEIGE'
          ? 'Beige'
          : 'Blanco'

  return (
    <div
      className={`relative overflow-hidden bg-[#e8eaed] ${className}`}
      style={{ aspectRatio: '400 / 520' }}
      aria-hidden
    >
      {/* img nativo: evita compresión de next/image (quality 75 + resize) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={`${color}-${view}`}
        src={photoSrc}
        alt=""
        draggable={false}
        className="absolute inset-0 h-full w-full object-contain object-center"
        style={{ imageRendering: 'auto' }}
      />

      <div className="pointer-events-none absolute top-2 left-2 rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
        Crewneck unisex · {colorLabel}
      </div>
    </div>
  )
}
