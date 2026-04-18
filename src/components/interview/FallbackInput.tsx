'use client'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'

interface FallbackInputProps {
  onSubmit: (text: string) => void
  onSwitchToVoice: () => void
  disabled?: boolean
}

export function FallbackInput({ onSubmit, onSwitchToVoice, disabled }: FallbackInputProps) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // NOTE: The auto-resize useEffect has been completely deleted.

  const handleSubmit = () => {
    if (text.trim() && !disabled) {
      onSubmit(text.trim())
      setText('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="relative rounded-2xl border border-border bg-surface shadow-sm focus-within:border-cyan focus-within:ring-1 focus-within:ring-cyan transition-all duration-200">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Type your answer here..."
          // Fixed height to 120px and enforced the vertical scrollbar
          className="w-full bg-transparent border-none resize-none px-5 py-4 text-ink placeholder:text-ink-muted focus:outline-none h-[120px] overflow-y-auto text-sm leading-relaxed"
        />
        
        {/* Helper Footer inside the input box */}
        <div className="flex items-center justify-between px-5 pb-3 text-[11px] text-ink-muted font-mono select-none">
          <span>{text.length} / 2000</span>
          <span className="hidden sm:inline-block">⌘ ↵ to submit</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onSwitchToVoice} disabled={disabled}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          }>
          Use voice instead
        </Button>
        
        <Button variant="primary" size="md" onClick={handleSubmit} disabled={disabled || !text.trim()}>
          Submit Answer
        </Button>
      </div>
    </div>
  )
}