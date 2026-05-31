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

  return (
    <div
      className={`pointer-events-none relative overflow-hidden bg-[#e8eaed] ${className}`}
      style={{ aspectRatio: '400 / 520' }}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={`${color}-${view}`}
        src={photoSrc}
        alt=""
        draggable={false}
        className="absolute inset-0 h-full w-full object-contain object-center"
        style={{ imageRendering: 'auto' }}
      />
    </div>
  )
}
