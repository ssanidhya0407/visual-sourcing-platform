"use client";

import { motion } from "framer-motion";
import { SourcingResult } from "@/services/sourcingService";
import { RecommendationCard } from "./RecommendationCard";
import { ArrowRight, Info } from "lucide-react";

interface RecommendationSectionProps {
    results: SourcingResult;
}

export function RecommendationSection({ results }: RecommendationSectionProps) {
    return (
        <div className="space-y-16 py-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-2">
                    <h2 className="text-4xl font-semibold tracking-tight">Recommendation Strategy</h2>
                    <p className="text-muted text-lg max-w-2xl leading-relaxed">
                        Identified from internal inventory for immediate availability and design-aligned alternatives.
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-xs font-medium text-muted uppercase tracking-wider">
                    <Info className="w-3.5 h-3.5" />
                    <span>Pricing includes quality & export buffer</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Primary Match */}
                <RecommendationCard product={results.primary} isPrimary index={0} />

                {/* Alternatives */}
                {results.alternatives.map((alt, idx) => (
                    <RecommendationCard key={alt.id} product={alt} index={idx + 1} />
                ))}
            </div>

            <div className="flex justify-center pt-12">
                <a href="/internal/sourcing" className="flex items-center gap-2 px-10 py-4 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-full hover:opacity-90 transition-all shadow-lg hover:shadow-xl">
                    Full Sourcing Report
                    <ArrowRight className="w-5 h-5" />
                </a>
            </div>
        </div>
    );
}
