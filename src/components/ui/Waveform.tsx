'use client'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface WaveformProps {
  active: boolean
  bars?: number
  color?: string
  height?: number
  className?: string
}

export function Waveform({ active, bars = 12, color = '#22D3EE', height = 40, className = '' }: WaveformProps) {
  const [amplitudes, setAmplitudes] = useState<number[]>(Array.from({ length: bars }, () => 0.15))

  useEffect(() => {
    if (!active) {
      setAmplitudes(Array.from({ length: bars }, () => 0.15))
      return
    }
    const interval = setInterval(() => {
      setAmplitudes(
        Array.from({ length: bars }, (_, i) => {
          const base = Math.sin(Date.now() / 400 + i * 0.8) * 0.3 + 0.5
          const noise = (Math.random() - 0.5) * 0.3
          return Math.min(1, Math.max(0.08, base + noise))
        })
      )
    }, 80)
    return () => clearInterval(interval)
  }, [active, bars])

  return (
    <div className={`flex items-center gap-0.5 ${className}`} style={{ height }} aria-label={active ? 'Recording audio' : 'Microphone idle'} role="img">
      {amplitudes.map((amplitude, i) => (
        <motion.div
          key={i}
          animate={{ scaleY: amplitude }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{
            width: `${100 / bars}%`, maxWidth: 6, minWidth: 2, height: '100%',
            backgroundColor: color, borderRadius: 3, transformOrigin: 'center',
            opacity: active ? 0.8 + amplitude * 0.2 : 0.25,
          }}
        />
      ))}
    </div>
  )
}

export function PulseRing({ active, size = 80, color = '#22D3EE', className = '' }: { active: boolean; size?: number; color?: string; className?: string }) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {active && (
        <>
          <motion.div className="absolute inset-0 rounded-full border-2" style={{ borderColor: color }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute inset-0 rounded-full border" style={{ borderColor: color }}
            animate={{ scale: [1, 1.7, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }} />
        </>
      )}
      <motion.div className="absolute inset-0 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}18` }}
        animate={active ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={{ duration: 1.5, repeat: active ? Infinity : 0, ease: 'easeInOut' }}>
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
      </motion.div>
    </div>
  )
}