import { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

export function Button({
  className,
  variant = 'primary',
  type = 'button',
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition',
        variant === 'primary' && 'bg-neutral-900 text-white hover:opacity-90',
        variant === 'secondary' &&
          'border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50',
        variant === 'ghost' && 'text-neutral-700 hover:bg-neutral-100',
        className,
      )}
      {...props}
    />
  )
}
