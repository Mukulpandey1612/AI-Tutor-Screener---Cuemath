'use client'
import { motion } from 'framer-motion'
import { forwardRef } from 'react'
import React from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'ember'
type Size = 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: React.ReactNode
  iconRight?: React.ReactNode
  fullWidth?: boolean
  children?: React.ReactNode
  disabled?: boolean
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

const variantStyles: Record<Variant, string> = {
  primary:   'bg-cyan text-void font-semibold hover:bg-cyan/90 shadow-glow-cyan',
  secondary: 'bg-surface-raised border border-border-strong text-ink hover:bg-surface-overlay hover:border-ink/20',
  ghost:     'text-ink-muted hover:text-ink hover:bg-ink/5',
  danger:    'bg-rose/10 border border-rose/30 text-rose hover:bg-rose/20',
  ember:     'bg-ember text-void font-semibold hover:bg-ember/90 shadow-glow-ember',
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5 rounded-lg',
  md: 'px-4 py-2.5 text-sm gap-2 rounded-xl',
  lg: 'px-6 py-3 text-base gap-2.5 rounded-xl',
  xl: 'px-8 py-4 text-lg gap-3 rounded-2xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', loading = false, icon, iconRight, fullWidth = false, children, disabled, className = '', onClick, type = 'button' }, ref) => {
    const isDisabled = disabled || loading
    return (
      <motion.button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={isDisabled}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: isDisabled ? 1 : 1.01 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={[
          'inline-flex items-center justify-center font-body transition-all duration-200',
          'focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-void',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth ? 'w-full' : '',
          className,
        ].join(' ')}
      >
        {loading ? (
          <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : icon && <span className="shrink-0">{icon}</span>}
        {children}
        {iconRight && !loading && <span className="shrink-0">{iconRight}</span>}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'