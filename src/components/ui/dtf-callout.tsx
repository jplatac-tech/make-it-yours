import { DTF_EXPLAINER } from '../../lib/products'

type Props = {
  className?: string
  variant?: 'light' | 'muted'
}

export function DtfCallout({ className = '', variant = 'muted' }: Props) {
  return (
    <div
      className={
        'rounded-xl border px-4 py-3 text-sm leading-relaxed ' +
        (variant === 'light'
          ? 'border-sky-200 bg-sky-50 text-sky-950'
          : 'border-neutral-200 bg-neutral-50 text-neutral-700') +
        ' ' +
        className
      }
    >
      <p className="font-semibold text-neutral-900">¿Qué es el estampado DTF?</p>
      <p className="mt-1">{DTF_EXPLAINER}</p>
    </div>
  )
}
