'use client'
import { motion, HTMLMotionProps } from 'framer-motion'
import { forwardRef } from 'react'

type CardVariant = 'default' | 'glass' | 'elevated' | 'bordered' | 'glow'

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  variant?: CardVariant
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  hoverable?: boolean
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-surface border border-border rounded-2xl',
  glass: 'glass rounded-2xl',
  elevated: 'bg-surface-raised border border-border rounded-2xl shadow-card',
  bordered: 'bg-surface-raised border border-border-strong rounded-2xl',
  glow: 'bg-surface border border-cyan-400/20 rounded-2xl shadow-glow-cyan',
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10',
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', hoverable = false, className = '', children, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={[
        variantStyles[variant],
        paddingStyles[padding],
        hoverable ? 'card-lift cursor-pointer' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </motion.div>
  )
)
Card.displayName = 'Card'

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mb-5 ${className}`}>{children}</div>
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`font-display font-semibold text-lg text-ink tracking-tight ${className}`}>{children}</h3>
}

export function CardDescription({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-sm text-ink-muted mt-1 ${className}`}>{children}</p>
}

export function Divider({ className = '' }: { className?: string }) {
  return <div className={`h-px bg-border my-5 ${className}`} />
}