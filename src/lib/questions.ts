import { BaseQuestion } from '@/types/interview'
export type Question = {
  id: string
  category: string
  targetDimensions: string[]
  text: string
}
export const QUESTION_BANK: Question[] = [
  // Simplification & Foundational
  { id: 'q1', category: 'Foundational Teaching', targetDimensions: ['Simplification', 'Clarity'], text: 'A 6-year-old keeps counting on fingers even for simple addition like 5 + 3. Explain how you would help them move beyond finger counting.' },
  { id: 'q2', category: 'Conceptual Understanding', targetDimensions: ['Simplification', 'Fluency'], text: 'A student asks, "Why is any number multiplied by zero equal to zero?" How do you explain this without just saying "It\'s a rule"?' },
  { id: 'q3', category: 'Simplification', targetDimensions: ['Simplification', 'Clarity'], text: 'Teach the concept of a fraction (like 1/4) to an 8-year-old using an everyday object other than a pizza or a pie.' },
  { id: 'q4', category: 'Foundational Teaching', targetDimensions: ['Simplification', 'Clarity'], text: 'A student doesn\'t understand why negative times a negative equals a positive. Walk me through how you would teach this.' },
  
  // Patience & Student Psychology
  { id: 'q5', category: 'Student Psychology', targetDimensions: ['Warmth', 'Patience'], text: 'A student answers every question with "I don\'t know" without even trying. How do you respond to encourage effort without pressuring them?' },
  { id: 'q6', category: 'Patience & Empathy', targetDimensions: ['Patience', 'Warmth'], text: 'You’ve explained a concept three times using different methods, and the student starts crying out of frustration. What is your immediate next step?' },
  { id: 'q7', category: 'Student Psychology', targetDimensions: ['Confidence', 'Warmth'], text: 'A gifted student finishes the 30-minute worksheet in 5 minutes and says they are bored. How do you keep them engaged for the remaining time?' },
  { id: 'q8', category: 'Patience & Empathy', targetDimensions: ['Patience', 'Warmth'], text: 'A student is highly distracted, constantly looking away from the screen and playing with toys. How do you respectfully regain their focus?' },

  // Diagnosis & Correction
  { id: 'q9', category: 'Diagnosis', targetDimensions: ['Clarity', 'Confidence'], text: 'A student calculates 23 + 18 as 311. Identify the specific misconception they have and explain how you would correct it.' },
  { id: 'q10', category: 'Error Correction', targetDimensions: ['Patience', 'Simplification'], text: 'A student keeps making the exact same careless calculation error, even though you know they understand the core concept. How do you address this behavior?' },
  { id: 'q11', category: 'Diagnosis', targetDimensions: ['Clarity', 'Simplification'], text: 'A student says "0.5 is bigger than 0.75 because 5 is a bigger number." How do you guide them to see their own mistake?' },
  { id: 'q12', category: 'Error Correction', targetDimensions: ['Warmth', 'Confidence'], text: 'During a live session, you make a noticeable math error on the whiteboard. The student points it out. How do you handle the situation?' },

  // Parent Interaction & Professionalism (Confidence)
  { id: 'q13', category: 'Parent Interaction', targetDimensions: ['Confidence', 'Fluency'], text: 'An aggressive parent interrupts your live session to complain that your teaching method is too slow. How do you de-escalate and manage the parent?' },
  { id: 'q14', category: 'Professionalism', targetDimensions: ['Confidence', 'Clarity'], text: 'A parent asks you to guarantee that their child will score an A+ on their next exam if they take your classes. What is your response?' },
  { id: 'q15', category: 'Parent Interaction', targetDimensions: ['Warmth', 'Fluency'], text: 'You need to deliver negative feedback to a parent about their child\'s severe lack of participation. Roleplay how you would start that conversation.' },
  { id: 'q16', category: 'Professionalism', targetDimensions: ['Confidence', 'Patience'], text: 'A student asks you for help with their school homework, which violates Cuemath policy. They say their teacher will fail them if you don\'t help. What do you do?' },

  // Advanced / Wildcards
  { id: 'q17', category: 'Adaptability', targetDimensions: ['Fluency', 'Simplification'], text: 'Your internet connection drops frequently during a concept explanation, and the student is confused. How do you recover the session once stabilized?' },
  { id: 'q18', category: 'Conceptual Understanding', targetDimensions: ['Clarity', 'Simplification'], text: 'Explain the difference between perimeter and area to a 10-year-old using the concept of building a fence around a garden.' },
  { id: 'q19', category: 'Engagement', targetDimensions: ['Warmth', 'Fluency'], text: 'A normally talkative student logs into the session completely silent and looks upset. How do you approach the first 5 minutes of class?' },
  { id: 'q20', category: 'Adaptability', targetDimensions: ['Patience', 'Simplification'], text: 'You realize halfway through a lesson that the material assigned is far too advanced for the student\'s current level. How do you pivot on the spot?' }
]

// ─── THE RANDOMIZER ENGINE ──────────────────────────────────────────────────
export function getRandomQuestionSet(count: number = 10): Question[] {
  // Shuffle the array using Fisher-Yates algorithm
  const shuffled = [...QUESTION_BANK]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  // Return the requested number of questions
  return shuffled.slice(0, count)
}

// Fallback for UI components that just need a number
export const getTotalQuestions = () => 10

export const INTRO_MESSAGE = `Hi! I'll be your guide for this interview.

Over the next few minutes, I'll ask 10 scenario-based questions to understand how you teach, communicate, and support learners.

There's no need to overthink your answers — we value sincerity, clarity, and a supportive tone.

Imagine you're speaking with a real student or parent, and answer naturally.

Let's get started.`

export const CLOSING_MESSAGE = `You've completed the full set of 10 questions — Thank You.

We have received your assessment data, and our team will review it alongside your application. You will receive an update regarding the next steps via email shortly.`

export const SESSION_LENGTH = 5;

/**
 * Uses the Fisher-Yates algorithm to randomly shuffle the question bank
 * and return a subset of the specified size.
 */
// Retained for legacy components, but deprecated for the randomized flow
