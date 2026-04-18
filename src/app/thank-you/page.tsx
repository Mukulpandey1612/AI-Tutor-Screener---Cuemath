"use client";
import { motion } from "framer-motion";

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface-raised border border-border p-10 rounded-3xl max-w-lg text-center shadow-card"
      >
        <div className="w-16 h-16 bg-cyan/10 border border-cyan/20 rounded-full flex items-center justify-center mx-auto mb-6 text-cyan">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h1 className="font-display font-bold text-3xl text-ink mb-3">
          Interview Complete
        </h1>
        <p className="text-ink-muted leading-relaxed mb-8">
          Your responses have been securely submitted to our recruiting team. We will
          review your results and follow up with you shortly.
        </p>
        <p className="text-sm font-mono text-ink-faint">
          You may now close this window.
        </p>
      </motion.div>
    </div>
  );
}
