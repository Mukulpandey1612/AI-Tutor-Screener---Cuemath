export type EvaluationDimension =
  | 'clarity'
  | 'warmth'
  | 'patience'
  | 'simplification'
  | 'fluency'
  | 'confidence'

export interface DimensionScore {
  dimension: EvaluationDimension
  score: number
  label: string
  evidence: string
  reasoning: string
}

export interface EvidenceQuote {
  id: string
  text: string
  dimension: EvaluationDimension
  sentiment: 'positive' | 'cautionary' | 'neutral'
  questionIndex: number
}

export type RecommendationTier = 'strong_hire' | 'hire' | 'maybe' | 'no_hire'

export interface EvaluationResult {
  scores: DimensionScore[]
  overallScore: number
  recommendation: RecommendationTier
  summary: string
  strengths: string[]
  improvements: string[]
  evidenceQuotes: EvidenceQuote[]
  evaluatedAt: string
  /** true when scored locally without Gemini (fallback mode) */
  fallback?: boolean
}

export interface TranscriptEntry {
  id: string
  role: 'ai' | 'candidate'
  content: string
  timestamp: string
  questionIndex: number
  isFollowUp?: boolean
}

export interface InterviewSession {
  sessionId: string
  candidateName: string
  candidateEmail?: string
  targetRole: string
  startedAt: string
  completedAt?: string
  transcript: TranscriptEntry[]
  evaluation?: EvaluationResult
  totalQuestions: number
  questionsAnswered: number
}

export type InterviewPhase =
  | 'idle'
  | 'intro'
  | 'asking'
  | 'recording'
  | 'processing'
  | 'showing_followup'
  | 'evaluating'
  | 'complete'
  | 'error'

export interface BaseQuestion {
  id: string
  text: string
  category: string
  intent: string
  targetDimensions: EvaluationDimension[]
  followUpPrompt?: string
}