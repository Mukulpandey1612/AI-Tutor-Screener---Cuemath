# Cuemath AI Tutor Screener

A premium, production-grade voice AI screening platform for Cuemath tutor candidates.

## Features

- 🎙️ **Voice-First Interview** — Browser-native SpeechRecognition with text fallback
- 🤖 **AI-Adaptive Questions** — 5 scenario-based questions with contextual follow-ups
- 📊 **6-Dimension Evaluation** — Clarity, Warmth, Patience, Simplification, Fluency, Confidence
- 📈 **Recruiter Dashboard** — Radar chart, evidence quotes, recommendation verdict
- 📝 **Full Transcript** — Expandable, filterable conversation log
- ✨ **Premium Design** — Dark SaaS aesthetic with Framer Motion animations

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**
- **Recharts** (Radar chart)
- **Anthropic Claude** (AI evaluation + follow-up generation)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Edit `.env.local`:

```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Get your API key from [console.anthropic.com](https://console.anthropic.com).

### 3. Run in development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Build for production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── evaluate/route.ts     # AI evaluation endpoint
│   │   ├── followup/route.ts     # Follow-up question generator
│   │   └── speech/route.ts       # Speech API info endpoint
│   ├── interview/page.tsx        # Voice interview experience
│   ├── results/page.tsx          # Recruiter dashboard
│   ├── globals.css               # Design system + custom animations
│   ├── layout.tsx                # Root layout with metadata
│   └── page.tsx                  # Landing page
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx            # Multi-variant button
│   │   ├── Card.tsx              # Glass/elevated card variants
│   │   ├── ProgressStepper.tsx   # Interview progress tracker
│   │   ├── Waveform.tsx          # Voice visualization
│   │   ├── TypingIndicator.tsx   # AI thinking states
│   │   └── Skeleton.tsx          # Loading skeletons
│   ├── interview/
│   │   ├── ChatBubble.tsx        # Message bubbles
│   │   ├── TranscriptDrawer.tsx  # Slide-out transcript panel
│   │   ├── VoiceRecorder.tsx     # Browser SpeechRecognition
│   │   └── FallbackInput.tsx     # Text input fallback
│   └── dashboard/
│       ├── RadarScoreCard.tsx    # Recharts radar + score bars
│       └── RecommendationPanel.tsx # Verdict + strengths/improvements
│
├── lib/
│   ├── questions.ts              # 5 base screening questions
│   ├── rubric.ts                 # Scoring rubric definitions
│   ├── scoring.ts                # Score computation utilities
│   └── prompts.ts                # AI prompt templates
│
└── types/
    └── interview.ts              # TypeScript interfaces
```

## Interview Flow

1. **Landing page** — Candidate enters name and email
2. **Interview** — AI asks 5 adaptive questions with optional follow-ups
3. **Evaluation** — Claude evaluates across 6 dimensions
4. **Results** — Full recruiter dashboard with radar chart and evidence

## Browser Support

Voice input requires:
- Chrome 33+
- Edge 79+
- Safari 14.1+ (with user permission)

Text fallback is automatically offered when voice is unavailable.

## AI Models Used

- **claude-sonnet-4-5** — Full evaluation and scoring
- **claude-haiku-4-5-20251001** — Follow-up question generation (faster, cheaper)

---

*Internal Cuemath Talent Platform · Not for external distribution*
