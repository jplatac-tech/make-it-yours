import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 ring-0 outline-none placeholder:text-neutral-400 focus:border-neutral-900 sm:text-sm',
        className,
      )}
      {...props}
    />
  )
})

Input.displayName = 'Input'
