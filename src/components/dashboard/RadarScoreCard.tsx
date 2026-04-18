'use client'
import { motion } from 'framer-motion'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { DimensionScore } from '@/types/interview'
import { RUBRIC } from '@/lib/rubric'
import { getScoreColor } from '@/lib/scoring'

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { subject: string; score: number } }> }) {
  if (!active || !payload?.length) return null
  const { subject, score } = payload[0].payload
  return (
    <div className="bg-surface-overlay border border-border rounded-xl px-3 py-2 shadow-card">
      <p className="text-xs text-ink-muted font-mono mb-0.5">{subject}</p>
      <p className="text-lg font-display font-bold" style={{ color: getScoreColor(score) }}>
        {score}<span className="text-xs text-ink-faint ml-0.5">/100</span>
      </p>
    </div>
  )
}

function CustomTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  const rubricEntry = RUBRIC.find(r => r.label.toLowerCase() === (payload?.value ?? '').toLowerCase())
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 11, fontFamily: 'Plus Jakarta Sans', fill: rubricEntry?.color ?? '#9CA3AF', fontWeight: 600 }}>
      {payload?.value}
    </text>
  )
}

export function RadarScoreCard({ scores, className = '' }: { scores: DimensionScore[]; className?: string }) {
  const radarData = scores.map(s => ({
    subject: s.dimension.charAt(0).toUpperCase() + s.dimension.slice(1),
    score: s.score,
    fullMark: 100,
  }))

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={radarData} margin={{ top: 16, right: 32, bottom: 16, left: 32 }}>
          <defs>
            <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#818CF8" stopOpacity={0.1} />
            </radialGradient>
          </defs>
          <PolarGrid stroke="rgba(255,255,255,0.06)" gridType="polygon" />
          <PolarAngleAxis dataKey="subject" tick={CustomTick as (props: unknown) => React.ReactElement} tickLine={false} />
          <Radar name="Score" dataKey="score" stroke="#22D3EE" strokeWidth={1.5} fill="url(#radarFill)"
            dot={{ fill: '#22D3EE', r: 3, strokeWidth: 0 }} />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>

      <div className="space-y-2.5 mt-4">
        {scores.map((score, i) => {
          const rubricEntry = RUBRIC.find(r => r.dimension === score.dimension)
          const color = rubricEntry?.color ?? '#9CA3AF'
          return (
            <motion.div key={score.dimension}
              initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              className="flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="text-xs font-body text-ink-muted w-24 shrink-0">{rubricEntry?.label ?? score.dimension}</span>
              <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${score.score}%` }}
                  transition={{ delay: 0.2 + i * 0.07, duration: 0.7, ease: [0.16, 1, 0.3, 1] }} />
              </div>
              <span className="text-xs font-mono font-semibold w-8 text-right shrink-0" style={{ color }}>{score.score}</span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}