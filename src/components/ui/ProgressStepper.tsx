'use client'
import { motion } from 'framer-motion'

interface ProgressStepperProps {
  total: number
  current: number
  labels?: string[]
  className?: string
}

export function ProgressStepper({ total, current, labels, className = '' }: ProgressStepperProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center gap-0 relative">
        <div className="absolute inset-y-1/2 left-0 right-0 h-px bg-border -translate-y-1/2 z-0" />
        <motion.div
          className="absolute inset-y-1/2 left-0 h-px bg-gradient-to-r from-cyan to-indigo -translate-y-1/2 z-[1]"
          initial={{ width: '0%' }}
          animate={{ width: `${(Math.max(0, current - 1) / (total - 1)) * 100}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
        {Array.from({ length: total }).map((_, i) => {
          const isComplete = i < current
          const isActive = i === current - 1
          const isFuture = i >= current
          return (
            <div key={i} className="flex-1 flex justify-center relative z-[2]">
              <motion.div
                initial={{ scale: 0.7, opacity: 0.5 }}
                animate={{ scale: isActive ? 1.2 : 1, opacity: isFuture ? 0.35 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className={[
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-semibold border-2 transition-colors duration-300',
                  isComplete ? 'bg-cyan border-cyan text-void' :
                  isActive ? 'bg-surface border-cyan text-cyan shadow-glow-cyan' :
                  'bg-surface border-border text-ink-muted',
                ].join(' ')}
              >
                {isComplete ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : <span>{i + 1}</span>}
              </motion.div>
            </div>
          )
        })}
      </div>

      {labels && (
        <div className="flex mt-2">
          {labels.map((label, i) => (
            <div key={i} className="flex-1 text-center">
              <span className={`text-xs font-body transition-colors duration-300 ${i === current - 1 ? 'text-cyan' : 'text-ink-muted'}`}>{label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 h-0.5 bg-border rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan to-indigo rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(current / total) * 100}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <div className="flex justify-between mt-2">
        <span className="text-xs text-ink-muted font-mono">Question {Math.min(current, total)} of {total}</span>
        <span className="text-xs text-ink-muted font-mono">{Math.round((current / total) * 100)}% complete</span>
      </div>
    </div>
  )
}