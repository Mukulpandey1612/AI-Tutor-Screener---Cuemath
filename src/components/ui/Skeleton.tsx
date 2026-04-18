'use client'
import { motion } from 'framer-motion'

export function Skeleton({ className = '', rounded = 'md' }: { className?: string; rounded?: 'sm' | 'md' | 'lg' | 'full' }) {
  const r = { sm: 'rounded', md: 'rounded-lg', lg: 'rounded-2xl', full: 'rounded-full' }[rounded]
  return <div className={`skeleton ${r} ${className}`} role="status" aria-label="Loading…" />
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" rounded="lg" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-surface-raised border border-border rounded-2xl p-5 space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-1.5 w-full" rounded="full" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-raised border border-border rounded-2xl p-6 space-y-4">
          <Skeleton className="h-64 w-full" rounded="lg" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-4 h-4" rounded="full" />
              <Skeleton className="h-3 flex-1" />
              <Skeleton className="w-12 h-3" />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-surface-raised border border-border rounded-xl p-4 space-y-2">
              <Skeleton className="h-3 w-16" rounded="full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}