"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { KeyMoment } from "@/lib/api";

interface KeyMomentsTimelineProps {
    moments: KeyMoment[];
    currentBall: number;
    onMomentClick?: (ball: number) => void;
}

const EVENT_STYLES: Record<string, { icon: string; color: string; bg: string }> = {
    wicket: { icon: "🔴", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
    six: { icon: "🟢", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
    boundary: { icon: "🔵", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    drop: { icon: "🟡", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
    high_emotion: { icon: "⚡", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
    normal: { icon: "⚪", color: "text-gray-400", bg: "bg-gray-500/10 border-gray-500/20" },
};

export default function KeyMomentsTimeline({ moments, currentBall, onMomentClick }: KeyMomentsTimelineProps) {
    const [expanded, setExpanded] = useState<number | null>(null);

    return (
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">
                Key Moments <span className="text-[var(--muted)] font-normal">({moments.length})</span>
            </h3>

            {moments.length === 0 ? (
                <div className="text-[var(--muted)] text-sm text-center py-6">No key moments yet</div>
            ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                    {moments.map((moment, i) => {
                        const style = EVENT_STYLES[moment.event_type] || EVENT_STYLES.normal;
                        const isPast = moment.ball_number <= currentBall;
                        const isExpanded = expanded === i;

                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: isPast ? 1 : 0.4, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`border rounded-xl p-3 cursor-pointer transition-all ${style.bg} ${isPast ? "hover:brightness-125" : ""
                                    }`}
                                onClick={() => {
                                    setExpanded(isExpanded ? null : i);
                                    if (isPast) onMomentClick?.(moment.ball_number);
                                }}
                            >
                                <div className="flex items-start gap-2">
                                    <span className="text-base mt-0.5">{style.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className={`text-xs font-bold ${style.color}`}>
                                                Over {moment.over} · Ball {moment.ball_number}
                                            </span>
                                            <span className="text-xs text-[var(--muted)] shrink-0">
                                                E(t) {moment.emotion_score.toFixed(1)}
                                            </span>
                                        </div>
                                        <p className={`text-xs text-white/80 mt-0.5 ${isExpanded ? "" : "truncate"}`}>
                                            {moment.description}
                                        </p>
                                        <AnimatePresence>
                                            {isExpanded && (moment.batter || moment.bowler) && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="mt-1 text-xs text-[var(--muted)]"
                                                >
                                                    {moment.batter && <span>Batter: {moment.batter} · </span>}
                                                    {moment.bowler && <span>Bowler: {moment.bowler}</span>}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
