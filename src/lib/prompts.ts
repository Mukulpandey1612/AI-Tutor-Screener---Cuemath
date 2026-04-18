import { TranscriptEntry } from '@/types/interview'

export function buildEvaluationPrompt(candidateName: string, transcript: TranscriptEntry[]): string {
  const formattedTranscript = transcript
    .map(e => `[${e.role === 'ai' ? 'INTERVIEWER' : 'CANDIDATE'}]: ${e.content}`)
    .join('\n\n')

  return `You are a Senior Talent Evaluator at Cuemath. Your task is to perform a strict, objective assessment of a 10-question linear screening interview. 

CANDIDATE NAME: ${candidateName}

=== INTERVIEW TRANSCRIPT ===
${formattedTranscript}
=== END TRANSCRIPT ===

INSTRUCTIONS:
Analyze the candidate's responses across 6 core dimensions based ONLY on their initial answers to the prompts. 
Note: This is a linear interview with NO follow-up questions. Do not penalize the candidate for not providing "extra" detail that was not explicitly asked for in the main question.

1. clarity: Structured, organized, and easy-to-follow communication.
2. warmth: Empathy, encouragement, and care for students.
3. patience: Composure and willingness to guide struggling learners.
4. simplification: Ability to break down complex math into accessible steps without using jargon.
5. fluency: Smooth, articulate verbal expression.
6. confidence: Conviction, authority, and professional presence.

SCORING RUBRIC:
0-39: Unacceptable. Candidate provided gibberish, single words, or off-topic answers.
40-59: Below Bar. Explanations were confusing or lacked human connection.
60-79: Meets Bar. Solid, acceptable teaching.
80-100: Exceptional. Highly engaging, crystal clear, deeply empathetic.

🚨 GIBBERISH / NON-ANSWER OVERRIDE 🚨
If the candidate's answers consist primarily of random letters (e.g., "h", "asdf") or they refused to answer:
- ALL dimension scores MUST be strictly below 20.
- The overallScore MUST be below 20.
- The recommendation MUST be "no_hire".

JSON SCHEMA STRICT REQUIREMENT:
Output ONLY raw, valid JSON. No backticks. 

{
  "scores": [
    {
      "dimension": "clarity",
      "score": 75,
      "label": "Clear",
      "reasoning": "1 sentence explaining this specific score."
    }
  ],
  "overallScore": 74,
  "recommendation": "hire",
  "summary": "2-3 sentences summarizing fit.",
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Improvement 1", "Improvement 2"],
  ],
  "evaluatedAt": "${new Date().toISOString()}"
}`
}

// 🔴 REMOVAL: You should delete buildFollowUpPrompt entirely from this file 
// since you are removing the /api/followup route and the frontend logic.