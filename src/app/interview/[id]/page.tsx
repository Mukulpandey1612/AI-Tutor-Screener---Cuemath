"use client";
import { useState, useEffect, useRef, useCallback, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/Button";
import {
  TypingIndicator,
  EvaluatingIndicator,
} from "@/components/ui/TypingIndicator";
import { ChatBubble, QuestionBadge } from "@/components/interview/ChatBubble";
import { VoiceRecorder } from "@/components/interview/VoiceRecorder";
import { FallbackInput } from "@/components/interview/FallbackInput";
import { TranscriptDrawer } from "@/components/interview/TranscriptDrawer";
import { TranscriptEntry, InterviewPhase } from "@/types/interview";
import { useRouter } from "next/navigation";
import {
  Question,
  getRandomQuestionSet,
  INTRO_MESSAGE,
  CLOSING_MESSAGE,
  getTotalQuestions,
} from "@/lib/questions";

const TOTAL = getTotalQuestions();

export default function InterviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: interviewId } = use(params);

  const bottomRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const initializedRef = useRef(false);

  const [candidateName, setCandidateName] = useState("Candidate");
  const [phase, setPhase] = useState<InterviewPhase>("idle");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [useFallback, setUseFallback] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const [evalError, setEvalError] = useState("");

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript, isTyping]);

  const addMessage = useCallback(
    (role: "ai" | "candidate", content: string, questionIndex: number) => {
      const entry: TranscriptEntry = {
        id: uuidv4(),
        role,
        content,
        timestamp: new Date().toISOString(),
        questionIndex,
        isFollowUp: false,
      };
      setTranscript((prev) => [...prev, entry]);
      return entry;
    },
    [],
  );

  const simulateTyping = useCallback(
    (duration = 1200): Promise<void> =>
      new Promise((resolve) => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          resolve();
        }, duration);
      }),
    [],
  );

  const startInterview = useCallback(
    async (questions: Question[]) => {
      setPhase("intro");
      await simulateTyping(1500);
      addMessage("ai", INTRO_MESSAGE, -1);
      setPhase("asking");
      await simulateTyping(1200);
      addMessage("ai", questions[0].text, 0);
      setPhase("recording");
      setCurrentQ(0);
    },
    [addMessage, simulateTyping],
  );

  useEffect(() => {
    if (initializedRef.current || !interviewId) return;
    initializedRef.current = true;
    const rawCandidate = sessionStorage.getItem("cuemath_candidate");
    if (!rawCandidate) {
      router.replace("/");
      return;
    }

    try {
      const { name } = JSON.parse(rawCandidate);
      setCandidateName(name || "Candidate");
      const storedActiveId = sessionStorage.getItem("cuemath_active_id");
      const savedProgress = sessionStorage.getItem("cuemath_progress");
      const savedQs = sessionStorage.getItem("cuemath_session_questions");

      if (storedActiveId !== interviewId || !savedProgress || !savedQs) {
        sessionStorage.removeItem("cuemath_progress");
        sessionStorage.removeItem("cuemath_session_questions");
        sessionStorage.setItem("cuemath_active_id", interviewId);
        const newQs = getRandomQuestionSet(TOTAL);
        setSessionQuestions(newQs);
        sessionStorage.setItem(
          "cuemath_session_questions",
          JSON.stringify(newQs),
        );
        setTranscript([]);
        setCurrentQ(0);
        setTimeout(() => startInterview(newQs), 800);
      } else {
        setSessionQuestions(JSON.parse(savedQs));
        const parsed = JSON.parse(savedProgress);
        setTranscript(parsed.transcript || []);
        setCurrentQ(parsed.currentQ || 0);
        setPhase(
          parsed.phase === "processing"
            ? "recording"
            : parsed.phase || "recording",
        );
      }
    } catch (e) {
      router.replace("/");
    }
  }, [router, startInterview, interviewId]);

  useEffect(() => {
    if (phase !== "idle" && phase !== "intro" && transcript.length > 0) {
      sessionStorage.setItem(
        "cuemath_progress",
        JSON.stringify({ phase, transcript, currentQ }),
      );
    }
  }, [phase, transcript, currentQ]);

  const evaluateSession = useCallback(async () => {
    setEvalError("");
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId,
          candidateName,
          transcript: transcriptRef.current,
        }),
      });
      if (!res.ok) throw new Error("Evaluation failed");
      sessionStorage.removeItem("cuemath_progress");
      sessionStorage.removeItem("cuemath_session_questions");
      sessionStorage.removeItem("cuemath_active_id");
      setPhase("complete");
      setTimeout(() => router.push(`/thank-you`), 2000);
    } catch (err) {
      setPhase("error");
      setEvalError("Could not save interview results.");
    }
  }, [router, interviewId, candidateName]);

  const handleAnswer = useCallback(
    async (answer: string) => {
      if (!answer.trim() || sessionQuestions.length === 0) return;

      // 1. Log candidate answer
      setPhase("processing");
      addMessage("candidate", answer, currentQ);

      // 2. Logic Shift: Remove API call to /api/followup
      // Simply move to the next question
      const nextQ = currentQ + 1;

      if (nextQ < TOTAL) {
        await simulateTyping(1200); // Natural thinking pause
        addMessage("ai", sessionQuestions[nextQ].text, nextQ);
        setCurrentQ(nextQ);
        setPhase("recording");
      } else {
        await simulateTyping(1000);
        addMessage("ai", CLOSING_MESSAGE, TOTAL);
        setPhase("evaluating");
        setTimeout(() => evaluateSession(), 2000);
      }
    },
    [currentQ, addMessage, simulateTyping, evaluateSession, sessionQuestions],
  );

  const completedCount =
    phase === "complete" || phase === "evaluating" ? TOTAL : currentQ;
  const percent = Math.round((completedCount / TOTAL) * 100);
  const activeQuestionData = sessionQuestions[currentQ] || null;

  return (
    <div className="h-screen bg-[#FDFDFB] bg-grid-pattern bg-[length:40px_40px] flex flex-col relative overflow-hidden font-sans">
      <header className="shrink-0 border-b border-gray-100 bg-white/80 backdrop-blur-md z-30 h-16 flex items-center">
        <div className="w-full max-w-7xl mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#e8bc20] flex items-center justify-center text-black font-bold shadow-sm">
              C
            </div>
            <span className="font-bold text-gray-800 tracking-tight">
              Cuemath AI Screener
            </span>
          </div>
          <div className="flex items-center gap-6">
            {["recording", "processing", "asking"].includes(phase) && (
              <div className="flex items-center gap-2 px-3 py-1 bg-[#FFF5F5] rounded-full border border-[#FFE0E0]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF4D4D] animate-pulse shadow-[0_0_8px_rgba(255,77,77,0.5)]" />
                <span className="text-[10px] font-black text-[#FF4D4D] uppercase tracking-wider">
                  LIVE
                </span>
              </div>
            )}
            <button
              onClick={() => setShowTranscript(true)}
              className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors group"
            >
              <span className="text-[11px] font-bold uppercase tracking-widest">
                Transcript
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-8 py-8 flex flex-col lg:flex-row gap-8 min-h-0">
        <section className="flex-1 flex flex-col bg-white border border-gray-100 rounded-[2rem] shadow-sm overflow-hidden relative z-10">
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {transcript.map((entry, i) => (
              <div key={entry.id}>
                {entry.role === "ai" &&
                  !entry.isFollowUp &&
                  entry.questionIndex >= 0 &&
                  entry.questionIndex < TOTAL && (
                    <QuestionBadge
                      index={entry.questionIndex + 1}
                      total={TOTAL}
                    />
                  )}
                <ChatBubble entry={entry} index={i} />
              </div>
            ))}
            <AnimatePresence>
              {isTyping && (
                <TypingIndicator
                  label={
                    phase === "evaluating" ? "Finalizing..." : "Thinking..."
                  }
                />
              )}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          {phase === "recording" && (
            <div className="p-8 border-t border-gray-50 bg-white/50 backdrop-blur-sm">
              {useFallback ? (
                <FallbackInput
                  onSubmit={handleAnswer}
                  onSwitchToVoice={() => setUseFallback(false)}
                  disabled={false}
                />
              ) : (
                <VoiceRecorder
                  onTranscript={handleAnswer}
                  onFallback={() => setUseFallback(true)}
                  disabled={false}
                />
              )}
            </div>
          )}
        </section>

        <aside className="hidden lg:flex w-80 flex-col gap-4 shrink-0">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
              Questions Completed
            </h3>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-black text-gray-900">
                {completedCount}
              </span>
              <span className="text-lg text-gray-200 font-medium">
                / {TOTAL}
              </span>
              <span className="ml-auto text-xs font-bold text-[#F97316] bg-orange-50 px-2 py-0.5 rounded-md">
                {percent}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#F97316] transition-all duration-700 ease-in-out"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeQuestionData &&
              !["evaluating", "complete", "error"].includes(phase) && (
                <motion.div
                  key={currentQ}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm"
                >
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                    Current Scenario
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[9px] text-gray-400 font-black uppercase mb-2">
                        Target Dimension
                      </p>
                      <span className="px-3 py-1 bg-orange-50 text-[#F97316] border border-orange-100 rounded-lg text-xs font-bold capitalize">
                        {activeQuestionData.category}
                      </span>
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-400 font-black uppercase mb-2">
                        Measuring
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {activeQuestionData.targetDimensions?.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-50 text-gray-500 border border-gray-100 rounded-md text-[10px] font-bold capitalize"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
          </AnimatePresence>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex-1 overflow-y-auto scrollbar-hide">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-5">
              Session Map
            </h3>
            <div className="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-100">
              {Array.from({ length: TOTAL }).map((_, i) => {
                // 🔴 UPDATED LOGIC
                // A question is complete if we've moved past it OR if the whole interview is finished
                const isComplete =
                  i < currentQ ||
                  phase === "evaluating" ||
                  phase === "complete";

                // A question is active only if it's the current one AND we aren't finished yet
                const isActive =
                  i === currentQ && !["evaluating", "complete"].includes(phase);

                return (
                  <div
                    key={i}
                    className="flex items-center gap-4 relative z-10"
                  >
                    <div
                      className={`w-[22px] h-[22px] rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isComplete
                          ? "bg-[#F97316] border-[#F97316] text-white"
                          : isActive
                            ? "bg-white border-[#F97316] shadow-[0_0_10px_rgba(249,115,22,0.2)]"
                            : "bg-white border-gray-100"
                      }`}
                    >
                      {isComplete ? (
                        "✓"
                      ) : (
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-[#F97316]" : "bg-transparent"}`}
                        />
                      )}
                    </div>
                    <span
                      className={`text-sm tracking-tight ${isActive ? "text-gray-900 font-bold" : "text-gray-400 font-medium"}`}
                    >
                      Question {i + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </main>

      <TranscriptDrawer
        open={showTranscript}
        onClose={() => setShowTranscript(false)}
        transcript={transcript}
      />
    </div>
  );
}
