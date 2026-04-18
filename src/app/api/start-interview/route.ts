import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { name, email } = await req.json()

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // 1. Find or create candidate (but DO NOT reuse interview)
    let candidate = await prisma.candidate.findUnique({
      where: { email }
    })

    if (!candidate) {
      candidate = await prisma.candidate.create({
        data: { name, email }
      })
    }

    // 2. ALWAYS create a NEW interview
    const interview = await prisma.interview.create({
      data: {
        candidateId: candidate.id,
        status: 'PENDING'
      }
    })

    return NextResponse.json({ interviewId: interview.id }, { status: 200 })

  } catch (error) {
    console.error('Failed to create interview:', error)
    return NextResponse.json(
      { error: 'Database connection failed' },
      { status: 500 }
    )
  }
}