'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Waveform, PulseRing } from '@/components/ui/Waveform'
import { Button } from '@/components/ui/Button'
import React from 'react'

/* eslint-disable @typescript-eslint/no-explicit-any */

// ---------------------------------------------------------------------------
// Web Speech API types (not included in all TypeScript lib targets)
// ---------------------------------------------------------------------------
declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition
    webkitSpeechRecognition: new () => ISpeechRecognition
  }
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onstart: (() => void) | null
  onresult: ((event: ISpeechRecognitionEvent) => void) | null
  onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onnomatch: (() => void) | null
}

interface ISpeechRecognitionEvent {
  resultIndex: number
  results: {
    length: number
    [i: number]: { isFinal: boolean; [j: number]: { transcript: string } }
  }
}

interface ISpeechRecognitionErrorEvent {
  error: string
  message?: string
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface VoiceRecorderProps {
  onTranscript: (text: string) => void
  onFallback: () => void
  disabled?: boolean
  className?: string
}

// ---------------------------------------------------------------------------
// Error catalogue  (all strings use plain ASCII apostrophes only)
// ---------------------------------------------------------------------------
type SpeechErrorCode =
  | 'network'
  | 'not-allowed'
  | 'audio-capture'
  | 'no-speech'
  | 'aborted'
  | 'bad-grammar'
  | 'language-not-supported'
  | 'service-not-allowed'
  | 'unknown'

interface ErrorInfo {
  title: string
  detail: string
  /** auto-retry once before surfacing error */
  transient: boolean
  /** mic fundamentally unavailable; offer text-only fallback */
  hardFail: boolean
}

// Plain ASCII strings -- no smart quotes, no emoji in TS source literals
const NETWORK_DETAIL =
  'On Brave: click the lion icon in the address bar and choose "Shields Down for this site", ' +
  'then click Try Again. On other browsers: check your network connection. ' +
  'You can also switch to text input below.'

const NOT_ALLOWED_DETAIL =
  'Click the lock icon in the address bar, open Site settings, and set Microphone to Allow. ' +
  'Then refresh the page and try again.'

const ERROR_MAP: Record<SpeechErrorCode, ErrorInfo> = {
  network: {
    title: 'Speech server unreachable',
    detail: NETWORK_DETAIL,
    transient: true,
    hardFail: false,
  },
  'not-allowed': {
    title: 'Microphone permission denied',
    detail: NOT_ALLOWED_DETAIL,
    transient: false,
    hardFail: true,
  },
  'audio-capture': {
    title: 'No microphone detected',
    detail: 'Make sure a microphone is connected and not in use by another app (e.g. Teams, Zoom).',
    transient: false,
    hardFail: true,
  },
  'no-speech': {
    title: 'No speech detected',
    detail: 'Nothing was heard. Speak clearly and closer to your microphone.',
    transient: true,
    hardFail: false,
  },
  aborted: {
    title: 'Recording cancelled',
    detail: 'Recognition was interrupted. Click Start Recording to try again.',
    transient: false,
    hardFail: false,
  },
  'bad-grammar': {
    title: 'Grammar configuration error',
    detail: 'A speech grammar issue occurred. Please use text input.',
    transient: false,
    hardFail: true,
  },
  'language-not-supported': {
    title: 'Language not supported',
    detail: 'Your browser does not support English speech recognition. Please use text input.',
    transient: false,
    hardFail: true,
  },
  'service-not-allowed': {
    title: 'Speech service blocked',
    detail:
      'This browser or network is blocking the speech API. ' +
      'Try Chrome or Edge, or disable content-blockers for this site.',
    transient: false,
    hardFail: true,
  },
  unknown: {
    title: 'Speech recognition failed',
    detail: 'An unexpected error occurred. Try again or switch to text input.',
    transient: false,
    hardFail: false,
  },
}

type RecorderState = 'idle' | 'recording' | 'retrying' | 'processing' | 'error'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getSpeechAPI(): (new () => ISpeechRecognition) | null {
  if (typeof window === 'undefined') return null
  return (window.SpeechRecognition || window.webkitSpeechRecognition) ?? null
}

function detectBrave(): boolean {
  if (typeof navigator === 'undefined') return false
  return 'brave' in navigator
}

function toErrorCode(raw: string): SpeechErrorCode {
  const known: SpeechErrorCode[] = [
    'network', 'not-allowed', 'audio-capture', 'no-speech',
    'aborted', 'bad-grammar', 'language-not-supported', 'service-not-allowed',
  ]
  return known.includes(raw as SpeechErrorCode) ? (raw as SpeechErrorCode) : 'unknown'
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function VoiceRecorder({
  onTranscript,
  onFallback,
  disabled = false,
  className = '',
}: VoiceRecorderProps) {
  const [recState, setRecState]   = useState<RecorderState>('idle')
  const [liveText, setLiveText]   = useState('')
  const [finalText, setFinalText] = useState('')
  const [errorCode, setErrorCode] = useState<SpeechErrorCode | null>(null)
  const [isSupported, setIsSupported] = useState(true)
  const [isBrave, setIsBrave]     = useState(false)

  // Stable refs that survive re-renders without triggering effects
  const instanceRef     = useRef<ISpeechRecognition | null>(null)
  const safetyTimer     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const silenceTimer    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const recStateRef     = useRef<RecorderState>('idle')
  const finalRef        = useRef('')
  const liveRef         = useRef('')
  const retryCountRef   = useRef(0)
  const startSessionRef = useRef<((isRetry?: boolean) => void) | null>(null)

  // Keep value refs in sync
  useEffect(() => { recStateRef.current = recState }, [recState])
  useEffect(() => { finalRef.current = finalText },   [finalText])
  useEffect(() => { liveRef.current  = liveText },    [liveText])

  // Detect API + Brave once on mount
  useEffect(() => {
    setIsSupported(!!getSpeechAPI())
    setIsBrave(detectBrave())
  }, [])

  // -------------------------------------------------------------------------
  // Timer management
  // -------------------------------------------------------------------------
  const clearTimers = useCallback(() => {
    if (safetyTimer.current)  { clearTimeout(safetyTimer.current);  safetyTimer.current  = null }
    if (silenceTimer.current) { clearTimeout(silenceTimer.current); silenceTimer.current = null }
  }, [])

  // -------------------------------------------------------------------------
  // Destroy the current recognition instance safely
  // -------------------------------------------------------------------------
  const destroyInstance = useCallback(() => {
    const inst = instanceRef.current
    if (!inst) return
    try { inst.onstart   = null } catch (_) { /* noop */ }
    try { inst.onresult  = null } catch (_) { /* noop */ }
    try { inst.onerror   = null } catch (_) { /* noop */ }
    try { inst.onend     = null } catch (_) { /* noop */ }
    try { inst.onnomatch = null } catch (_) { /* noop */ }
    try { inst.abort()          } catch (_) { /* already stopped */ }
    instanceRef.current = null
  }, [])

  // -------------------------------------------------------------------------
  // Commit whatever text was captured
  // -------------------------------------------------------------------------
  const commitTranscript = useCallback(() => {
    clearTimers()
    const combined = (finalRef.current + ' ' + liveRef.current).trim()
    setFinalText('')
    setLiveText('')
    finalRef.current = ''
    liveRef.current  = ''
    if (combined.length > 0) {
      onTranscript(combined)
    } else {
      setRecState('idle')
    }
  }, [clearTimers, onTranscript])

  // -------------------------------------------------------------------------
  // Handle a recognition error
  // -------------------------------------------------------------------------
  const handleError = useCallback((code: SpeechErrorCode) => {
    clearTimers()
    destroyInstance()

    const info = ERROR_MAP[code]

    if (info.transient && retryCountRef.current < 1) {
      retryCountRef.current += 1
      setRecState('retrying')
      setTimeout(() => {
        if (recStateRef.current === 'retrying') {
          startSessionRef.current?.(true)
        }
      }, 3500)
      return
    }

    setErrorCode(code)
    setRecState('error')
  }, [clearTimers, destroyInstance])

  // -------------------------------------------------------------------------
  // Start (or restart) a recognition session
  // -------------------------------------------------------------------------
  const startSession = useCallback((isRetry = false) => {
    clearTimers()
    destroyInstance()

    if (!isRetry) {
      retryCountRef.current = 0
      setFinalText('')
      setLiveText('')
      setErrorCode(null)
      finalRef.current = ''
      liveRef.current  = ''
    }

    const API = getSpeechAPI()
    if (!API) { setIsSupported(false); return }

    const inst = new API()
    inst.continuous     = false
    inst.interimResults = true
    inst.lang           = 'en-US'
    inst.maxAlternatives = 1
    instanceRef.current = inst

    inst.onstart = () => {
      if (recStateRef.current !== 'recording') setRecState('recording')
    }

    inst.onresult = (event: ISpeechRecognitionEvent) => {
      let interim = ''
      let final   = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) final += t + ' '
        else interim += t
      }
      if (final) setFinalText(prev => prev + final)
      setLiveText(interim)

      if (silenceTimer.current) clearTimeout(silenceTimer.current)
      silenceTimer.current = setTimeout(() => {
        if (recStateRef.current === 'recording') {
          try { instanceRef.current?.stop() } catch (_) { /* noop */ }
        }
      }, 5000)
    }

    inst.onerror = (event: ISpeechRecognitionErrorEvent) => {
      if (event.error === 'aborted' && recStateRef.current === 'processing') return
      handleError(toErrorCode(event.error))
    }

    inst.onend = () => {
      clearTimers()
      if (recStateRef.current === 'recording' || recStateRef.current === 'retrying') {
        setRecState('processing')
        setTimeout(commitTranscript, 250)
      }
    }

    safetyTimer.current = setTimeout(() => {
      if (recStateRef.current === 'recording') {
        try { instanceRef.current?.stop() } catch (_) { /* noop */ }
      }
    }, 60_000)

    setRecState('recording')

    try {
      inst.start()
    } catch (e: any) {
      console.warn('[VoiceRecorder] start() threw:', e?.message ?? e)
      handleError('unknown')
    }
  }, [clearTimers, destroyInstance, handleError, commitTranscript])

  useEffect(() => { startSessionRef.current = startSession }, [startSession])

  // -------------------------------------------------------------------------
  // Manual stop
  // -------------------------------------------------------------------------
  const stopRecording = useCallback(() => {
    clearTimers()
    setRecState('processing')
    try { instanceRef.current?.stop() }
    catch (_) { commitTranscript() }
  }, [clearTimers, commitTranscript])

  // -------------------------------------------------------------------------
  // Escape: switch to text while still recording
  // -------------------------------------------------------------------------
  const switchToText = useCallback(() => {
    clearTimers()
    destroyInstance()
    setRecState('idle')
    onFallback()
  }, [clearTimers, destroyInstance, onFallback])

  useEffect(() => {
    return () => { clearTimers(); destroyInstance() }
  }, [clearTimers, destroyInstance])

  const errorInfo  = errorCode ? ERROR_MAP[errorCode] : null
  const isHardFail = !!errorInfo?.hardFail
  const isBraveNet = isBrave && (errorCode === 'network' || errorCode === 'service-not-allowed')

  // -------------------------------------------------------------------------
  // Browser does not support Web Speech API
  // -------------------------------------------------------------------------
  if (!isSupported) {
    return (
      <div className={`flex flex-col items-center gap-4 ${className}`}>
        <ErrorNotice
          icon="no-voice"
          title="Voice input unavailable"
          detail="Your browser does not support the Web Speech API. Please use text input."
          color="amber"
        />
        <Button variant="primary" size="md" onClick={onFallback}>
          Switch to Text Input
        </Button>
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Main render
  // -------------------------------------------------------------------------
  return (
    <div className={`flex flex-col items-center gap-5 w-full ${className}`}>
      {/* Live transcript preview */}
      <AnimatePresence>
        {(finalText || liveText) && recState === 'recording' && (
          <motion.div
            key="live"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="w-full max-w-md bg-surface-overlay border border-border rounded-xl px-4 py-3 min-h-[52px]"
          >
            <p className="text-sm text-ink leading-relaxed">
              <span>{finalText}</span>
              <span className="text-ink-muted italic">{liveText}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error notice */}
      <AnimatePresence>
        {recState === 'error' && errorInfo && (
          <motion.div
            key="err"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="w-full max-w-md"
          >
            <ErrorNotice
              icon={isHardFail ? 'block' : 'warn'}
              title={errorInfo.title}
              color={isHardFail ? 'rose' : 'amber'}
              detail={
                isBraveNet
                  ? errorInfo.detail +
                    ' (Brave detected: click the lion shield icon in the top-right of your address bar and choose "Shields Down for localhost".)'
                  : errorInfo.detail
              }
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Retrying indicator */}
      <AnimatePresence>
        {recState === 'retrying' && (
          <motion.div
            key="retrying"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-xs text-amber font-mono"
          >
            <motion.span
              className="inline-block w-3 h-3 rounded-full border-2 border-amber border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
            Retrying speech recognition...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mic visual */}
      <div className="flex flex-col items-center gap-4">
        {/* Passed CSS variables dynamically to the PulseRing instead of hex codes */}
        <PulseRing
          active={recState === 'recording'}
          size={72}
          color={
            recState === 'error'    ? 'var(--rose)'
            : recState === 'retrying' ? 'var(--amber)'
            : 'var(--cyan)'
          }
        />

        <AnimatePresence>
          {recState === 'recording' && (
            <motion.div
              key="waveform"
              initial={{ opacity: 0, scaleX: 0.8 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0 }}
            >
              <Waveform active bars={16} height={32} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {recState === 'idle' || recState === 'error' ? (
            <>
              {!isHardFail && (
                <Button
                  variant="primary"
                  size="md"
                  disabled={disabled}
                  onClick={() => startSession(false)}
                  icon={<MicIcon />}
                >
                  {recState === 'error' ? 'Try Again' : 'Start Recording'}
                </Button>
              )}
              <Button
                variant={isHardFail ? 'primary' : 'ghost'}
                size="md"
                onClick={onFallback}
              >
                {isHardFail ? 'Use Text Input' : 'Type instead'}
              </Button>
            </>
          ) : recState === 'recording' ? (
            <>
              <Button
                variant="danger"
                size="md"
                onClick={stopRecording}
                icon={<StopIcon />}
              >
                Stop Recording
              </Button>
              <Button variant="ghost" size="sm" onClick={switchToText}>
                Switch to text
              </Button>
            </>
          ) : (
            <Button variant="secondary" size="md" loading>
              {recState === 'retrying' ? 'Retrying...' : 'Processing...'}
            </Button>
          )}
        </div>

        {/* Status hint text */}
        {recState === 'idle' && (
          <p className="text-xs text-ink-muted text-center max-w-xs">
            Speak clearly. Recording stops automatically after 5s of silence.
          </p>
        )}
        {recState === 'idle' && isBrave && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[11px] text-amber/70 text-center max-w-xs"
          >
            Brave users: disable Shields for localhost if speech fails.
          </motion.p>
        )}
        {recState === 'recording' && (
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-xs text-cyan text-center"
          >
            Listening... speak now
          </motion.p>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function ErrorNotice({
  icon,
  title,
  detail,
  color,
}: {
  icon: string
  title: string
  detail: string
  color: 'rose' | 'amber'
}) {
  const IconEl = icon === 'block' ? BlockIcon : icon === 'warn' ? WarnIcon : NoVoiceIcon

  // Use dynamic tailwind classes mapped to your CSS variables
  const containerClass = color === 'rose'
    ? 'bg-rose/10 border-rose/30 text-rose'
    : 'bg-amber/10 border-amber/30 text-amber'

  return (
    <div className={`rounded-xl border p-4 w-full ${containerClass}`}>
      <div className="flex items-start gap-3">
        <span className="shrink-0 mt-0.5">
          <IconEl />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold mb-1 text-ink">{title}</p>
          <p className="text-xs text-ink-muted leading-relaxed">{detail}</p>
        </div>
      </div>
    </div>
  )
}

function MicIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1a4 4 0 014 4v7a4 4 0 01-8 0V5a4 4 0 014-4zm0 2a2 2 0 00-2 2v7a2 2 0 004 0V5a2 2 0 00-2-2zm-1 15.93V21h-2v-2.07A8 8 0 014 11h2a6 6 0 0012 0h2a8 8 0 01-7 7.93z" />
    </svg>
  )
}
function StopIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  )
}
function WarnIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round" />
      <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" />
    </svg>
  )
}
function BlockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" strokeLinecap="round" />
    </svg>
  )
}
function NoVoiceIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" strokeLinecap="round" />
      <path d="M17 16.95A7 7 0 015 12v-2M19 19L5 5" strokeLinecap="round" />
    </svg>
  )
}