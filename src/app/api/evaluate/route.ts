import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { TranscriptEntry } from '@/types/interview'
import { buildEvaluationPrompt } from '@/lib/prompts'
import { validateEvaluationResult } from '@/lib/scoring'
import { generateHeuristicEvaluation } from '@/lib/heuristic'
import { optionalEnv } from '@/lib/env'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache' // 🔴 Added for instant dashboard updates

export const maxDuration = 60

function safeParse(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null
    try {
      return JSON.parse(match[0])
    } catch {
      return null
    }
  }
}

export async function POST(req: NextRequest) {
  let body: {
    interviewId: string
    candidateName: string
    transcript: TranscriptEntry[]
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { interviewId, candidateName, transcript } = body

  if (!interviewId || !candidateName || !Array.isArray(transcript)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  let finalEvaluation = null
  const apiKey = optionalEnv('GEMINI_API_KEY')

  // 🔹 STEP 1: Generate evaluation
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash', // 🔴 FIXED: Changed from 2.5 to 2.0
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      })

      const prompt = buildEvaluationPrompt(candidateName, transcript)
      const result = await model.generateContent(prompt)

      let jsonText = result.response.text().trim()

      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```json|```/g, '').trim()
      }

      const parsed = safeParse(jsonText)

      if (parsed && validateEvaluationResult(parsed)) {
        finalEvaluation = parsed
        console.log(`✅ AI Evaluation successful for ${candidateName}`)
      }
    } catch (err: any) {
      // 🔴 Log the specific error to help track 429s (Quota)
      console.error('❌ Gemini API Error:', err.message || err)
    }
  }

  // 🔹 STEP 2: Fallback
  if (!finalEvaluation) {
    console.warn(`⚠️ Using heuristic fallback for ${candidateName}`)
    finalEvaluation = generateHeuristicEvaluation(candidateName, transcript)
  }

  // 🔴 STEP 3: SAVE TO DATABASE
  try {
    await prisma.interview.update({
      where: { id: interviewId },
      data: {
        transcript: transcript as any,
        evaluation: finalEvaluation as any,
        overallScore: finalEvaluation.overallScore,
        recommendation: finalEvaluation.recommendation,
        status: 'COMPLETED',
        completedAt: new Date()
      },
    })

    // 🔴 CRITICAL: Tell Next.js to refresh the dashboard data
    revalidatePath('/admin/dashboard')
    revalidatePath(`/admin/results/${interviewId}`)

    return NextResponse.json({ 
      success: true, 
      isAiGenerated: !!apiKey && !finalEvaluation.fallback 
    })
    
  } catch (dbError) {
    console.error('CRITICAL: Failed to save to database:', dbError)
    return NextResponse.json({ error: 'Database save failed' }, { status: 500 })
  }
}