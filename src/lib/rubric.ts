import { EvaluationDimension } from '@/types/interview'

export interface RubricDimension {
  dimension: EvaluationDimension
  label: string
  description: string
  weight: number
  color: string
  icon: string
  levels: { score: [number, number]; label: string; description: string }[]
}

export const RUBRIC: RubricDimension[] = [
  {
    dimension: 'clarity',
    label: 'Clarity',
    description: 'Ability to communicate ideas in a clear, structured, and unambiguous way',
    weight: 0.2,
    color: '#22D3EE',
    icon: '💎',
    levels: [
      { score: [0, 40], label: 'Unclear', description: 'Rambling or hard to follow' },
      { score: [41, 60], label: 'Developing', description: 'Some structure but with gaps' },
      { score: [61, 80], label: 'Clear', description: 'Well-organized, easy to follow' },
      { score: [81, 100], label: 'Exceptional', description: 'Crystal clear, perfectly structured' },
    ],
  },
  {
    dimension: 'warmth',
    label: 'Warmth',
    description: 'Empathy, emotional attunement, and genuine care for the student',
    weight: 0.2,
    color: '#FB923C',
    icon: '☀️',
    levels: [
      { score: [0, 40], label: 'Distant', description: 'Transactional, lacks emotional connection' },
      { score: [41, 60], label: 'Neutral', description: 'Polite but not particularly warm' },
      { score: [61, 80], label: 'Warm', description: 'Genuinely caring and emotionally aware' },
      { score: [81, 100], label: 'Exceptional', description: 'Deeply empathetic, student-first mindset' },
    ],
  },
  {
    dimension: 'patience',
    label: 'Patience',
    description: 'Ability to stay composed and encouraging when students struggle',
    weight: 0.15,
    color: '#818CF8',
    icon: '⏳',
    levels: [
      { score: [0, 40], label: 'Impatient', description: 'Shows frustration or rushes the student' },
      { score: [41, 60], label: 'Adequate', description: 'Mostly patient but with some pressure' },
      { score: [61, 80], label: 'Patient', description: 'Calm, encouraging, adaptive' },
      { score: [81, 100], label: 'Exceptional', description: 'Infinitely patient, student-paced' },
    ],
  },
  {
    dimension: 'simplification',
    label: 'Simplification',
    description: 'Skill in breaking complex ideas into digestible explanations',
    weight: 0.2,
    color: '#34D399',
    icon: '🧩',
    levels: [
      { score: [0, 40], label: 'Abstract', description: 'Uses jargon or overly complex language' },
      { score: [41, 60], label: 'Basic', description: 'Somewhat simplified but still complex' },
      { score: [61, 80], label: 'Clear', description: 'Effective use of analogies and examples' },
      { score: [81, 100], label: 'Masterful', description: 'Brilliant simplification with real-world hooks' },
    ],
  },
  {
    dimension: 'fluency',
    label: 'Fluency',
    description: 'Smoothness and confidence of verbal expression and pace',
    weight: 0.1,
    color: '#F472B6',
    icon: '🌊',
    levels: [
      { score: [0, 40], label: 'Halting', description: 'Frequent pauses, filler words, or confusion' },
      { score: [41, 60], label: 'Moderate', description: 'Generally fluent with some hesitation' },
      { score: [61, 80], label: 'Fluent', description: 'Smooth, well-paced communication' },
      { score: [81, 100], label: 'Exceptional', description: 'Highly articulate and confident' },
    ],
  },
  {
    dimension: 'confidence',
    label: 'Confidence',
    description: 'Conviction in answers, professional assertiveness, and handling pressure',
    weight: 0.15,
    color: '#FBBF24',
    icon: '🎯',
    levels: [
      { score: [0, 40], label: 'Uncertain', description: 'Lacks conviction, overly hedges answers' },
      { score: [41, 60], label: 'Developing', description: 'Some confidence but with self-doubt' },
      { score: [61, 80], label: 'Confident', description: 'Assured, direct, handles pressure well' },
      { score: [81, 100], label: 'Exceptional', description: 'Highly confident, authoritative presence' },
    ],
  },
]

export const RECOMMENDATION_THRESHOLDS = {
  strong_hire: 82,
  hire: 68,
  maybe: 52,
  no_hire: 0,
}

// 🔴 Updated to match AI/Database keys
export const RECOMMENDATION_LABELS: Record<
  string,
  { label: string; color: string; bg: string; description: string }
> = {
  strong_hire: {
    label: 'STRONG HIRE',
    color: '#059669', // Emerald 600
    bg: 'rgba(5, 150, 105, 0.1)',
    description: 'Candidate exceeded expectations. Move to final leadership round immediately.',
  },
  hire: {
    label: 'HIRE',
    color: '#0891B2', // Cyan 600
    bg: 'rgba(8, 145, 178, 0.1)',
    description: 'Competent and ready for onboarding. Strong cultural and technical fit.',
  },
  maybe: {
    label: 'MAYBE',
    color: '#D97706', // Amber 600
    bg: 'rgba(217, 119, 6, 0.1)',
    description: 'Inconsistent performance. Human review of transcript evidence is mandatory.',
  },
  no_hire: {
    label: 'NO HIRE',
    color: '#E11D48', // Rose 600
    bg: 'rgba(225, 29, 72, 0.1)',
    description: 'Critical gaps identified. Candidate does not meet Cuemath standards.',
  },
}

export function getDimensionByKey(key: EvaluationDimension): RubricDimension {
  return RUBRIC.find(d => d.dimension === key)!
}

export function getScoreLevel(dimension: EvaluationDimension, score: number): string {
  const rubric = getDimensionByKey(dimension)
  const level = rubric.levels.find(l => score >= l.score[0] && score <= l.score[1])
  return level?.label ?? 'Unknown'
}