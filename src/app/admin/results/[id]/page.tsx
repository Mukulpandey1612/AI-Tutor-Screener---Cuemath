"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { RecommendationPanel } from "@/components/dashboard/RecommendationPanel";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { EvaluationResult, TranscriptEntry } from "@/types/interview";
import { RUBRIC, RECOMMENDATION_LABELS } from "@/lib/rubric";
import { getScoreColor } from "@/lib/scoring";
import { getTotalQuestions } from '@/lib/questions';

type Tab = "overview" | "dimensions" | "transcript";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "dimensions", label: "Dimensions" },
  // { id: "evidence", label: "Evidence" },
  { id: "transcript", label: "Transcript" },
];

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 46;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="120" height="100" viewBox="0 0 110 110">
        <circle
          cx="55"
          cy="55"
          r={r}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="8"
          className="opacity-20"
        />
        <circle
          cx="55"
          cy="55"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 55 55)"
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)" }}
        />
        <text
          x="55"
          y="54"
          textAnchor="middle"
          fontSize="32"
          fontWeight="900"
          fill="currentColor"
          fontFamily="inherit"
          className="text-ink"
        >
          {score}
        </text>
        <text
          x="55"
          y="72"
          textAnchor="middle"
          fontSize="12"
          fontWeight="600"
          fill="currentColor"
          fontFamily="inherit"
          className="text-ink-faint uppercase tracking-tighter"
        >
          / 100
        </text>
      </svg>
      <span className="text-[10px] font-mono font-bold text-ink-faint uppercase tracking-widest">
        Final Score
      </span>
    </div>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const params = useParams();
  const TOTAL = getTotalQuestions();

  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [candidateName, setCandidateName] = useState("Candidate");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Helper to generate initials from candidate name
  const getInitials = (name: string) => {
    if (!name) return "??";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  useEffect(() => {
    if (!params?.id) return;
    const fetchDossier = async () => {
      try {
        const res = await fetch(`/api/interviews/${params.id}`);
        if (!res.ok) throw new Error("Failed to load dossier");
        const data = await res.json();
        if (data.evaluation) setEvaluation(data.evaluation);
        if (data.transcript) setTranscript(data.transcript);
        if (data.candidate) {
          setCandidateName(data.candidate.name);
          setCandidateEmail(data.candidate.email || "");
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        router.replace("/admin/dashboard");
      }
    };
    fetchDossier();
  }, [params?.id, router]);

  if (isLoading || !evaluation) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center text-ink">
        <div className="w-full max-w-4xl px-4 py-8">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  const rawRec =
    evaluation.recommendation as keyof typeof RECOMMENDATION_LABELS;
  const rec = RECOMMENDATION_LABELS[rawRec] || {
    label: evaluation.recommendation || "Review Needed",
    bg: "var(--amber-bg, rgba(251,191,36,0.1))",
    color: "var(--amber, #FBBF24)",
  };
  const scoreColor = getScoreColor(evaluation.overallScore);

  return (
    <div className="min-h-screen bg-void selection:bg-cyan/20 selection:text-cyan">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-md h-16 flex items-center">
        <div className="w-full max-w-4xl mx-auto px-6 flex items-center justify-between gap-4">
          {/* <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan to-indigo flex items-center justify-center shadow-sm text-void">
              <span className="font-display font-bold text-sm">C</span>
            </div>
            <span className="font-display font-semibold text-ink">
              Recruiter Dossier
            </span>
          </div> */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/dashboard")}
            >
              ← Dashboard
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => window.print()}
              icon={
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            >
              Export PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 pb-24">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-10 pb-10 border-b border-border"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-2 mb-4">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider"
                style={{
                  backgroundColor: rec.bg,
                  borderColor: `${rec.color}40`,
                  color: rec.color,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: rec.color }}
                />
                {rec.label}
              </span>
              <span className="text-[11px] font-mono text-ink-faint border border-border px-2 py-0.5 rounded-md">
                {new Date(evaluation.evaluatedAt).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            <h1 className="font-display font-black text-5xl sm:text-6xl text-ink tracking-tight mb-1 break-words">
              {candidateName}
            </h1>

            {candidateEmail && (
              <p className="text-base font-medium text-ink-muted mb-4 opacity-80 break-all">
                {candidateEmail}
              </p>
            )}
          </div>

          <div className="shrink-0 bg-surface-raised p-4 rounded-3xl border border-border shadow-sm">
            <ScoreRing score={evaluation.overallScore} color={scoreColor} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-1 p-1 bg-surface border border-border rounded-2xl w-fit mb-8"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${activeTab === t.id ? "bg-surface-raised border border-border text-ink shadow-sm" : "text-ink-muted hover:text-ink"}`}
            >
              {t.label}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === "overview" && (
              <div className="space-y-8">
                <section>
                  <p className="text-[11px] font-mono text-ink-faint uppercase tracking-widest mb-4">
                    AI Evaluator Summary
                  </p>
                  <RecommendationPanel
                    evaluation={evaluation}
                    candidateName={candidateName}
                  />
                </section>

                {/* <section>
                  <p className="text-[11px] font-mono text-ink-faint uppercase tracking-widest mb-4">
                    Score Snapshot
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {evaluation.scores.map((score) => {
                      const rubric = RUBRIC.find(
                        (r) => r.dimension === score.dimension,
                      );
                      return (
                        <div
                          key={score.dimension}
                          className="bg-surface border border-border rounded-2xl px-4 pt-4 pb-3"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className="text-lg"
                              style={{ color: rubric?.color }}
                            >
                              {rubric?.icon}
                            </span>
                            <span
                              className="text-xl font-display font-bold"
                              style={{ color: rubric?.color }}
                            >
                              {score.score}
                            </span>
                          </div>
                          <p className="text-xs text-ink-muted capitalize mb-2">
                            {score.dimension}
                          </p>
                          <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: rubric?.color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${score.score}%` }}
                              transition={{ duration: 0.8, delay: 0.1 }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section> */}
              </div>
            )}

            {activeTab === "dimensions" && (
              <section className="space-y-4">
                <p className="text-[11px] font-mono text-ink-faint uppercase tracking-widest mb-4">
                  Dimension Breakdown
                </p>
                {evaluation.scores.map((score, i) => {
                  const rubric = RUBRIC.find(
                    (r) => r.dimension === score.dimension,
                  );
                  return (
                    <div
                      key={score.dimension}
                      className="bg-surface-raised border border-border rounded-2xl px-6 py-5"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xl"
                            style={{ color: rubric?.color }}
                          >
                            {rubric?.icon}
                          </span>
                          <h3 className="text-sm font-semibold text-ink capitalize">
                            {score.dimension}
                          </h3>
                        </div>
                        <span
                          className="text-2xl font-display font-bold"
                          style={{ color: rubric?.color }}
                        >
                          {score.score}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: rubric?.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${score.score}%` }}
                          transition={{ delay: i * 0.08, duration: 0.8 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </section>
            )}

            {activeTab === "transcript" && (
              <section>
                <div className="flex items-baseline justify-between mb-4 text-ink">
                  <p className="text-[11px] font-mono text-ink-faint uppercase tracking-widest">
                    Raw Transcript
                  </p>
                  <span className="text-xs text-ink-muted bg-surface border border-border px-2 py-1 rounded-md">
                    {transcript.length} Exchanges
                  </span>
                </div>
                <div className="space-y-3">
                  {transcript.map((entry) => (
                    <div
                      key={entry.id}
                      className={`flex gap-4 p-5 rounded-2xl border ${entry.role === "ai" ? "bg-surface border-border" : "bg-indigo/5 border-indigo/15"}`}
                    >
                      <div className="shrink-0 pt-0.5">
                        <span
                          className={`inline-block text-[10px] font-mono font-bold px-2 py-1 rounded-md ${entry.role === "ai" ? "bg-cyan/10 text-cyan border border-cyan/20" : "bg-indigo/10 text-indigo border border-indigo/20"}`}
                        >
                          {entry.role === "ai"
                            ? "AI"
                            : getInitials(candidateName)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {/* 🔴 Only show the 'Q' prefix if it's an actual question (0-9), otherwise hide it */}
                          {entry.questionIndex >= 0 &&
                            entry.questionIndex < TOTAL && (
                              <span className="text-[11px] font-mono font-medium text-ink-muted">
                                Q{entry.questionIndex + 1}
                              </span>
                            )}

                          {/* 🟢 Optional: Label the closing message clearly instead of using a number */}
                          {entry.questionIndex === TOTAL && (
                            <span className="text-[11px] font-mono font-bold text-orange-500 uppercase">
                              End of Session
                            </span>
                          )}
                          {entry.isFollowUp && (
                            <span className="text-[11px] font-mono font-medium text-amber">
                              Follow-up
                            </span>
                          )}
                          <span className="text-[11px] font-mono text-ink-faint ml-auto">
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
                          {entry.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
