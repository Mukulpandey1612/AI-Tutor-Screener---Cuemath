'use client'
import { motion } from 'framer-motion'
import { TranscriptEntry } from '@/types/interview'

export function ChatBubble({ entry, index }: { entry: TranscriptEntry; index: number }) {
  const isAI = entry.role === 'ai'
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: index * 0.04 }}
      className={`flex gap-3 ${isAI ? '' : 'flex-row-reverse'}`}
    >
      <div className="shrink-0 mt-1">
        {isAI ? (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400/20 to-indigo-400/20 border border-cyan-400/30 flex items-center justify-center">
            <span className="text-[10px] font-mono font-semibold text-cyan-400">🤖</span>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400/20 to-pink-400/20 border border-indigo-400/30 flex items-center justify-center">
            <span className="text-[10px] font-mono font-semibold text-indigo-400">YOU</span>
          </div>
        )}
      </div>

      <div className={`flex flex-col gap-1 max-w-[80%] ${isAI ? 'items-start' : 'items-end'}`}>
        <span className="text-[10px] font-mono text-ink-faint uppercase tracking-widest px-1">
          {isAI ? 'AI Interviewer' : 'Candidate'}
          {entry.isFollowUp && <span className="ml-1.5 text-amber-400">· Follow-up</span>}
        </span>
        <div className={`px-4 py-3 rounded-2xl text-sm font-body leading-relaxed ${isAI ? 'bg-surface-overlay border border-border rounded-tl-sm text-ink' : 'bg-indigo-400/10 border border-indigo-400/20 rounded-tr-sm text-ink'}`}>
          {isAI ? <AIContent content={entry.content} /> : <p>{entry.content}</p>}
        </div>
        <span className="text-[10px] text-ink-faint font-mono px-1">
          {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  )
}

function AIContent({ content }: { content: string }) {
  return (
    <div className="space-y-1">
      {content.split('\n').map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />
        const parts = line.split(/\*\*(.*?)\*\*/g)
        return (
          <p key={i}>
            {parts.map((part, j) =>
              j % 2 === 1
                ? <strong key={j} className="font-semibold text-cyan-400">{part}</strong>
                : <span key={j}>{part}</span>
            )}
          </p>
        )
      })}
    </div>
  )
}

export function QuestionBadge({ index, total, isFollowUp }: { index: number; total: number; isFollowUp?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center my-4">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-overlay border border-border text-xs font-mono text-ink-muted">
        <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
        {isFollowUp
          ? <span className="text-amber-400">Follow-up Question</span>
          : <span>Question <span className="text-cyan-400">{index}</span> of <span className="text-ink">{total}</span></span>}
      </div>
    </motion.div>
  )
}