import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> } // 1. Define params as a Promise
) {
  try {
    // 2. Await the params before accessing properties
    const { id } = await params;

    const interview = await prisma.interview.findUnique({
      where: { id: id },
      include: { candidate: true }
    })

    if (!interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 })
    }

    return NextResponse.json(interview, { status: 200 })
  } catch (error) {
    console.error("Database fetch error:", error);
    return NextResponse.json({ error: 'Failed to fetch database' }, { status: 500 })
  }
}