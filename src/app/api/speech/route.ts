import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Speech processing is handled client-side via the Web Speech API.',
    fallback: 'text_input',
  })
}