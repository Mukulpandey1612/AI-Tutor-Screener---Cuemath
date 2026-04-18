"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { BrainCircuit, Mic, BarChart4, FileText } from "lucide-react";

const features = [
  {
    icon: BrainCircuit,
    title: "Adaptive Interrogation",
    desc: "Dynamic follow-ups expose true depth of knowledge, not memorized answers.",
    color: "#e8bc20", // Brand Gold
  },
  {
    icon: Mic,
    title: "Frictionless Audio",
    desc: "Natural speech processing. Fallback text ensures zero drop-off from mic issues.",
    color: "#e8bc20",
  },
  {
    icon: BarChart4,
    title: "6-Dimension Matrix",
    desc: "Objective scoring on clarity and warmth to eliminate interviewer bias.",
    color: "#10b981", // Success Green
  },
  {
    icon: FileText,
    title: "Instant Calibration",
    desc: "Actionable recruiter reports generated the second the candidate stops.",
    color: "#10b981",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isFocused, setIsFocused] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");

  const handleStart = async () => {
    if (!name.trim() || !email.trim()) {
      setError("Both Name and Email are required.");
      return;
    }

    setIsStarting(true);
    setError("");

    try {
      sessionStorage.removeItem("cuemath_interview_id");
      localStorage.removeItem("cuemath_interview_id");

      const res = await fetch("/api/start-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });

      if (!res.ok) throw new Error("Failed to start");

      const data = await res.json();

      sessionStorage.setItem(
        "cuemath_candidate",
        JSON.stringify({ name, email }),
      );
      sessionStorage.setItem("cuemath_interview_id", data.interviewId);

      router.push(`/interview/${data.interviewId}`);
    } catch (error) {
      setIsStarting(false);
      setError("Connection failed. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-[#F9F8F5] relative overflow-hidden flex flex-col items-center justify-center p-6">
      {/* 🛠️ Improved Math Grid: Matches the 60px size from our Login page */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* 🎨 Background Radial Glow - Gives the "Professional SaaS" depth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#e8bc20]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-gray-900"
          >
            Cuemath AI <span className="text-[#e8bc20]">Tutor Screener</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed"
          >
            Evaluate tutor candidates for clarity, warmth, and teaching skill in
            under 15 minutes.
          </motion.p>
        </div>

        {/* Main Form Card: Upgraded to match Login branding */}
        <motion.div
          className="w-full max-w-lg mb-16"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.1)] relative">
            <div className="mb-8">
              <h2 className="font-bold text-xl text-gray-900 mb-1">
                <center>Let's begin the screening process</center>
              </h2>
              <p className="text-sm text-gray-400 text-center">
                Please ensure you are in a quiet environment.
              </p>
            </div>

            <div className="space-y-5 mb-8">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                  placeholder="e.g. Mukul Pandey"
                  className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-900 focus:bg-white focus:border-[#e8bc20] focus:ring-4 focus:ring-[#e8bc20]/10 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="mukul@example.com"
                  className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-900 focus:bg-white focus:border-[#e8bc20] focus:ring-4 focus:ring-[#e8bc20]/10 transition-all outline-none"
                />
              </div>

              {error && (
                <p className="text-xs text-red-500 font-medium text-center">
                  {error}
                </p>
              )}
            </div>

            <button
              onClick={handleStart}
              disabled={!name.trim() || !email.trim() || isStarting}
              className="w-full py-4 bg-[#f6c928] text-black font-extrabold rounded-2xl border-b-4 border-[#f6c928] hover:bg-[#efc63d] hover:border-[#e8bc20] active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isStarting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Initializing...</span>
                </>
              ) : (
                "Start Your Interview"
              )}
            </button>
          </div>
        </motion.div>

        {/* Feature Cards: Upgraded with Glassmorphism and Hover scaling */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="bg-white/60 backdrop-blur-md p-6 rounded-[1.5rem] border border-gray-100/50 flex flex-col gap-4 shadow-sm"
              whileHover={{
                y: -8,
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderColor: "#e8bc2033",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                style={{ backgroundColor: `${f.color}15`, color: f.color }}
              >
                <f.icon size={20} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">
                  {f.title}
                </p>
                <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
