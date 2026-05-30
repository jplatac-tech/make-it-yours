import { TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        'min-h-28 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900',
        className,
      )}
      {...props}
    />
  )
})

Textarea.displayName = 'Textarea'
