import { DimensionScore, EvaluationResult, RecommendationTier } from '@/types/interview'
import { RECOMMENDATION_THRESHOLDS, RUBRIC } from './rubric'

export function computeOverallScore(scores: DimensionScore[]): number {
  let weightedSum = 0
  let totalWeight = 0
  for (const score of scores) {
    const rubricEntry = RUBRIC.find(r => r.dimension === score.dimension)
    if (rubricEntry) {
      weightedSum += score.score * rubricEntry.weight
      totalWeight += rubricEntry.weight
    }
  }
  if (totalWeight === 0) return 0
  return Math.round(weightedSum / totalWeight)
}

export function determineRecommendation(overallScore: number): RecommendationTier {
  if (overallScore >= RECOMMENDATION_THRESHOLDS.strong_hire) return 'strong_hire'
  if (overallScore >= RECOMMENDATION_THRESHOLDS.hire) return 'hire'
  if (overallScore >= RECOMMENDATION_THRESHOLDS.maybe) return 'maybe'
  return 'no_hire'
}

export function scoreToGrade(score: number): string {
  if (score >= 90) return 'A+'
  if (score >= 85) return 'A'
  if (score >= 80) return 'A-'
  if (score >= 75) return 'B+'
  if (score >= 70) return 'B'
  if (score >= 65) return 'B-'
  if (score >= 60) return 'C+'
  if (score >= 55) return 'C'
  if (score >= 50) return 'C-'
  return 'D'
}

export function getScoreColor(score: number): string {
  if (score >= 80) return '#34D399'
  if (score >= 65) return '#22D3EE'
  if (score >= 50) return '#FBBF24'
  return '#F87171'
}

export function validateEvaluationResult(result: EvaluationResult): boolean {
  try {
    // Basic structure
    if (!Array.isArray(result.scores) || result.scores.length !== 6) return false

    const validDimensions = [
      'clarity',
      'warmth',
      'patience',
      'simplification',
      'fluency',
      'confidence'
    ]

    const seen = new Set()

    for (const s of result.scores) {
      if (
        !s.dimension ||
        typeof s.score !== 'number' ||
        !s.label ||
        !s.reasoning
      ) return false

      if (!validDimensions.includes(s.dimension)) return false
      if (s.score < 0 || s.score > 100) return false

      seen.add(s.dimension)
    }

    if (seen.size !== 6) return false

    // Overall score
    if (
      typeof result.overallScore !== 'number' ||
      result.overallScore < 0 ||
      result.overallScore > 100
    ) return false

    // Recommendation
    const validRecommendations = ['strong_hire', 'hire', 'maybe', 'no_hire']
    if (!validRecommendations.includes(result.recommendation)) return false

    // Evidence
    if (!Array.isArray(result.evidenceQuotes) || result.evidenceQuotes.length < 3) return false

    const validSentiments = ['positive', 'neutral', 'cautionary']

    for (const q of result.evidenceQuotes) {
      if (!q.text || !q.dimension || !q.sentiment) return false
      if (!validSentiments.includes(q.sentiment)) return false
    }

    // Logical consistency (basic)
    const avg =
      result.scores.reduce((sum, s) => sum + s.score, 0) / 6

    if (Math.abs(avg - result.overallScore) > 20) return false

    return true
  } catch {
    return false
  }
}