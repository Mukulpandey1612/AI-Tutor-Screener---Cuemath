'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { TranscriptEntry } from '@/types/interview'

export function TranscriptDrawer({ open, onClose, transcript }: { open: boolean; onClose: () => void; transcript: TranscriptEntry[] }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-void/70 backdrop-blur-sm z-40"
          />
          <motion.aside
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 flex flex-col bg-surface border-l border-border"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <div>
                <h2 className="font-display font-semibold text-ink">Full Transcript</h2>
                <p className="text-xs text-ink-muted mt-0.5">{transcript.length} messages</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-raised transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 chat-container">
              {transcript.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-ink-faint">
                  <span className="text-3xl mb-2">📝</span>
                  <p className="text-sm">No transcript yet</p>
                </div>
              ) : transcript.map((entry, i) => (
                <motion.div key={entry.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }} className="flex gap-3">
                  <div className="shrink-0 pt-0.5">
                    <span className={`inline-block text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded ${entry.role === 'ai' ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20' : 'bg-indigo-400/10 text-indigo-400 border border-indigo-400/20'}`}>
                      {entry.role === 'ai' ? 'AI' : 'YOU'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-ink-faint">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                      {entry.isFollowUp && <span className="text-[10px] font-mono text-amber-400">follow-up</span>}
                    </div>
                    <p className="text-sm text-ink leading-relaxed break-words">{entry.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="px-5 py-3 border-t border-border shrink-0">
              <p className="text-xs text-ink-faint text-center">Transcript auto-saved · Used for Gemini evaluation only</p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}