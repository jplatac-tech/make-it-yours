'use client'

import type { ReactNode } from 'react'
import { useInView } from '../../hooks/use-in-view'

type Props = {
  children: ReactNode
  className?: string
  threshold?: number
}

export function MotionSection({ children, className = '', threshold = 0.08 }: Props) {
  const { ref, visible } = useInView<HTMLElement>(threshold)

  return (
    <section
      ref={ref}
      className={'motion-in-view ' + (visible ? 'is-visible ' : '') + className}
    >
      {children}
    </section>
  )
}
