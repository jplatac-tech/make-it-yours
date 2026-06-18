'use client'

import type { CSSProperties, ElementType, ReactNode } from 'react'
import { useInView } from '../../hooks/use-in-view'

type Props = {
  children: ReactNode
  className?: string
  delay?: number
  threshold?: number
  as?: ElementType
}

export function MotionStaggerItem({
  children,
  className = '',
  delay = 0,
  threshold = 0.12,
  as: Tag = 'div',
}: Props) {
  const { ref, visible } = useInView<HTMLElement>(threshold)

  const style = {
    '--stagger-delay': `${delay}ms`,
  } as CSSProperties

  return (
    <Tag
      ref={ref}
      className={
        'motion-stagger-item ' +
        (visible ? 'is-item-visible ' : '') +
        className
      }
      style={style}
    >
      {children}
    </Tag>
  )
}
