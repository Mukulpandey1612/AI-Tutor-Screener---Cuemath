'use client'
import { motion } from 'framer-motion'

export function TypingIndicator({ label = 'AI is thinking', className = '' }: { label?: string; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
      className={`flex items-center gap-3 ${className}`}>
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400/20 to-indigo-400/20 border border-cyan-400/30 flex items-center justify-center shrink-0">
        <span className="text-xs font-mono text-cyan-400">AI</span>
      </div>
      <div className="bg-surface-overlay border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map(i => (
            <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400"
              animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
          ))}
        </div>
        <span className="text-xs text-ink-muted">{label}</span>
      </div>
    </motion.div>
  )
}

export function EvaluatingIndicator({ className = '' }: { className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center gap-4 py-8 ${className}`}>
      <div className="relative w-16 h-16">
        <motion.div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 border-r-indigo-400"
          animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} />
        <motion.div className="absolute inset-2 rounded-full border border-transparent border-b-cyan-400/50"
          animate={{ rotate: -360 }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg">✦</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-ink font-display font-semibold">Generating Assessment</p>
        <p className="text-ink-muted text-sm mt-1">Gemini is analysing your responses across 6 dimensions…</p>
      </div>
      <div className="w-48 h-0.5 bg-border rounded-full overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-cyan-400 to-indigo-400"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }} />
      </div>
    </motion.div>
  )
}