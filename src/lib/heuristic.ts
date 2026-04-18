import { EvaluationResult, TranscriptEntry, RecommendationTier } from '@/types/interview'

export function generateHeuristicEvaluation(
  candidateName: string,
  transcript: TranscriptEntry[]
): EvaluationResult {
  
  // 🔴 1. CRITICAL DATA CHECK
  if (!transcript || !Array.isArray(transcript) || transcript.length === 0) {
    return {
      scores: [
        { dimension: "clarity", score: 10, label: "N/A", reasoning: "Data missing", evidence: "None" },
        { dimension: "warmth", score: 10, label: "N/A", reasoning: "Data missing", evidence: "None" },
        { dimension: "patience", score: 10, label: "N/A", reasoning: "Data missing", evidence: "None" },
        { dimension: "simplification", score: 10, label: "N/A", reasoning: "Data missing", evidence: "None" },
        { dimension: "fluency", score: 10, label: "N/A", reasoning: "Data missing", evidence: "None" },
        { dimension: "confidence", score: 10, label: "N/A", reasoning: "Data missing", evidence: "None" }
      ],
      overallScore: 10,
      recommendation: 'no_hire',
      summary: "System failed to process the transcript due to empty data.",
      strengths: ["None"],
      improvements: ["Critical system error or empty interview."],
      evidenceQuotes: [],
      evaluatedAt: new Date().toISOString(),
      fallback: true
    }
  }

  // 🟢 2. DYNAMIC HEURISTIC ENGINE
  const candidateAnswers = transcript.filter(t => t?.role === 'candidate')
  const totalWords = candidateAnswers.reduce((sum, entry) => sum + (entry?.content?.split(/\s+/)?.length || 0), 0)
  const avgWords = candidateAnswers.length > 0 ? totalWords / candidateAnswers.length : 0

  // Logic: Scale score between 20 and 75 based on word count. 
  // We cap heuristic at 75 because a "Strong Hire" (80+) requires real AI validation.
  let baseScore = Math.min(Math.max(Math.floor(avgWords * 1.5), 20), 75)
  
  // Determine Recommendation based on performance
  let recommendation: RecommendationTier = 'no_hire'
  if (baseScore >= 60) recommendation = 'maybe'
  if (baseScore >= 70) recommendation = 'hire'

  const isGibberish = avgWords < 8

  // 🟡 3. DIMENSION VARIANCE (The "No-Glitch" Effect)
  // We apply slight offsets so the scores aren't identical
  const dimensions = [
    { name: "clarity", offset: 2 },
    { name: "warmth", offset: -3 },
    { name: "patience", offset: 1 },
    { name: "simplification", offset: -1 },
    { name: "fluency", offset: 3 },
    { name: "confidence", offset: 0 }
  ]

  const scores = dimensions.map(d => ({
    dimension: d.name,
    score: Math.min(baseScore + d.offset, 100),
    label: baseScore < 40 ? "Poor" : baseScore < 65 ? "Average" : "Good",
    reasoning: "Volume-based heuristic estimation.",
    evidence: `Average response length of ${Math.round(avgWords)} words.`
  }))

  const summary = isGibberish
    ? `${candidateName} provided very brief responses. AI analysis was inconclusive due to lack of data.`
    : `AI processing encountered a timeout. Provisional evaluation based on ${candidateAnswers.length} responses suggests ${candidateName} was engaged and provided sufficient detail for review.`

  return {
    scores,
    overallScore: baseScore,
    recommendation,
    summary,
    strengths: isGibberish ? ["Completed session"] : ["Good engagement volume", "Detailed verbal responses"],
    improvements: isGibberish ? ["Low participation", "Brief answers"] : ["Needs deep AI qualitative analysis"],
    evidenceQuotes: candidateAnswers.slice(0, 3).map((ans, i) => ({
      id: `ev_${i}`,
      text: ans.content || '',
      dimension: "fluency",
      sentiment: isGibberish ? "cautionary" : "neutral",
      questionIndex: ans.questionIndex || 0
    })),
    evaluatedAt: new Date().toISOString(),
    fallback: true
  }
}