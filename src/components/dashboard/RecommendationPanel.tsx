"use client";
import { motion } from "framer-motion";
import { EvaluationResult } from "@/types/interview";
import { RECOMMENDATION_LABELS } from "@/lib/rubric";

export function RecommendationPanel({
  evaluation,
  candidateName,
  className = "",
}: {
  evaluation: EvaluationResult;
  candidateName: string;
  className?: string;
}) {
  const rawRec = evaluation.recommendation as keyof typeof RECOMMENDATION_LABELS;
  const rec = RECOMMENDATION_LABELS[rawRec] || {
    label: String(evaluation.recommendation || "UNKNOWN").replace(/_/g, " ").toUpperCase(),
    bg: "rgba(244, 63, 94, 0.1)",
    color: "#f43f5e",
    description: "Manual review of the transcript is required for this candidate."
  };

  // Helper to determine the "Logic Path" based on the verdict string from DB
  const getLogicTag = () => {
    const verdict = String(evaluation.recommendation).toLowerCase();
    
    switch(verdict) {
      case 'strong_hire': return "Top Talent";
      case 'hire':        return "Solid Choice";
      case 'maybe':       return "Manual Review";
      case 'no_hire':     return "High Risk";
      default:            return evaluation.overallScore >= 75 ? "High Potential" : "General Review";
    }
  };

  const logicPath = getLogicTag();

  return (
    <div className={`space-y-5 ${className}`}>
      {/* ── Main Recommendation Card ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border p-6 relative overflow-hidden"
        style={{ backgroundColor: rec.bg, borderColor: `${rec.color}30` }}
      >
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <p className="text-[10px] font-mono text-ink-muted mb-1 uppercase tracking-widest opacity-70 font-bold">
              AI Decision Engine
            </p>
            <h2 className="text-4xl font-display font-black tracking-tight mb-2" style={{ color: rec.color }}>
              {rec.label}
            </h2>
            <p className="text-sm font-medium leading-relaxed max-w-xl" style={{ color: `${rec.color}dd` }}>
              {rec.description}
            </p>
          </div>

          {/* Logic Path Badge */}
          <div className="shrink-0 flex flex-col items-start md:items-center gap-2">
            <div className="px-5 py-2.5 rounded-xl border-2 border-dashed flex flex-col items-center justify-center bg-surface/30 backdrop-blur-sm"
                 style={{ borderColor: rec.color }}>
               <span className="text-[9px] font-mono font-bold uppercase tracking-tighter opacity-60 text-ink-muted">
                 Logic Path
               </span>
               <span className="text-xs font-display font-black uppercase tracking-tight" style={{ color: rec.color }}>
                 {logicPath}
               </span>
            </div>
            {evaluation.fallback && (
               <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-md">
                 <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                 <span className="text-[9px] font-mono font-bold text-amber-600 uppercase">Heuristic Mode</span>
               </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Executive Summary */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-surface-raised border border-border rounded-2xl p-6 shadow-sm group hover:border-border-strong transition-colors"
      >
        <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
            <p className="text-[10px] font-mono text-ink-faint uppercase tracking-widest font-bold">
              Executive Summary
            </p>
        </div>
        <p className="text-sm text-ink leading-relaxed font-medium">
          {evaluation.summary}
        </p>
      </motion.div>

      {/* Strengths & Watch Points Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 hover:bg-emerald-500/10 transition-colors">
          <p className="text-[10px] font-mono text-emerald-600 uppercase tracking-widest mb-4 font-bold">Key Strengths</p>
          <ul className="space-y-3">
            {evaluation.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-ink font-medium">
                <span className="text-emerald-500 mt-1 shrink-0">●</span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-5 hover:bg-amber-500/10 transition-colors">
          <p className="text-[10px] font-mono text-amber-600 uppercase tracking-widest mb-4 font-bold">Watch Points</p>
          <ul className="space-y-3">
            {evaluation.improvements.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-ink font-medium">
                <span className="text-amber-500 mt-1 shrink-0">▲</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}