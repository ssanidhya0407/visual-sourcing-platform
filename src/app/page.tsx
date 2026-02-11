"use client";

import { useState } from "react";
import { UploadSection } from "@/components/UploadSection";
import { RecommendationSection } from "@/components/RecommendationSection";
import { SourcingResult } from "@/services/sourcingService";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function Home() {
  const [results, setResults] = useState<SourcingResult | null>(null);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] animate-in fade-in duration-1000">
      {/* Focused Upload Section */}
      <section className="w-full flex justify-center">
        <UploadSection onResults={(r) => setResults(r)} />
      </section>

      <AnimatePresence>
        {results && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="w-full border-t border-white/10 pt-12"
          >
            <RecommendationSection results={results} />
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
