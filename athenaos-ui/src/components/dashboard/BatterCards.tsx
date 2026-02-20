"use client";

import { motion } from "framer-motion";
import type { BatterCard } from "@/lib/api";

interface BatterCardsProps {
    cards: BatterCard[];
}

const PROFILE_COLORS: Record<string, string> = {
    "On Fire": "text-red-400",
    "Intense": "text-orange-400",
    "Steady": "text-yellow-400",
    "Ice Cold": "text-blue-400",
};

const CLUTCH_COLORS: Record<string, string> = {
    "Elite Clutch": "bg-purple-500/20 text-purple-300 border-purple-500/30",
    "Solid": "bg-green-500/20 text-green-300 border-green-500/30",
    "Fair": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    "Cold": "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

function ResilienceBar({ value }: { value: number }) {
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs text-[var(--muted)]">
                <span>Resilience</span>
                <span className="text-white">{value.toFixed(0)}/100</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    className="h-full rounded-full"
                    style={{
                        background: value >= 70
                            ? "linear-gradient(90deg, #8b5cf6, #ec4899)"
                            : value >= 40
                                ? "linear-gradient(90deg, #f59e0b, #f97316)"
                                : "linear-gradient(90deg, #3b82f6, #6366f1)",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                />
            </div>
        </div>
    );
}

function EmotionBar({ value }: { value: number }) {
    const color = value >= 70 ? "#ef4444" : value >= 50 ? "#f97316" : value >= 35 ? "#eab308" : "#3b82f6";
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs text-[var(--muted)]">
                <span>Avg E(t)</span>
                <span style={{ color }}>{value.toFixed(1)}</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    className="h-full rounded-full"
                    style={{ background: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                />
            </div>
        </div>
    );
}

export default function BatterCards({ cards }: BatterCardsProps) {
    if (cards.length === 0) {
        return (
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Batter Insights</h3>
                <div className="text-[var(--muted)] text-sm text-center py-6">No batter data yet</div>
            </div>
        );
    }

    return (
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Batter Insights</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cards.map((card, i) => {
                    const profileColor = PROFILE_COLORS[card.emotional_profile] || "text-gray-400";
                    const clutchClass = CLUTCH_COLORS[card.clutch_rating] || CLUTCH_COLORS.Fair;

                    return (
                        <motion.div
                            key={card.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-3"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <div className="font-bold text-white text-sm">{card.name}</div>
                                    <div className={`text-xs font-semibold ${profileColor}`}>
                                        {card.emotional_profile}
                                    </div>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${clutchClass}`}>
                                    {card.clutch_rating}
                                </span>
                            </div>

                            {/* Stats Row */}
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                    <div className="text-lg font-black text-white">{card.runs}</div>
                                    <div className="text-[10px] text-[var(--muted)]">Runs</div>
                                </div>
                                <div>
                                    <div className="text-lg font-black text-white">{card.strike_rate.toFixed(0)}</div>
                                    <div className="text-[10px] text-[var(--muted)]">SR</div>
                                </div>
                                <div>
                                    <div className="text-lg font-black text-white">{card.balls}</div>
                                    <div className="text-[10px] text-[var(--muted)]">Balls</div>
                                </div>
                            </div>

                            {/* Boundary Row */}
                            <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
                                <span>4s: <span className="text-blue-400 font-bold">{card.fours}</span></span>
                                <span>6s: <span className="text-green-400 font-bold">{card.sixes}</span></span>
                                <span>Dots: <span className="text-red-400 font-bold">{card.dots}</span></span>
                            </div>

                            {/* Bars */}
                            <div className="space-y-2">
                                <ResilienceBar value={card.resilience} />
                                <EmotionBar value={card.avg_emotion} />
                            </div>

                            {/* Peak */}
                            <div className="text-xs text-[var(--muted)]">
                                Peak E(t): <span className="text-white font-bold">{card.peak_emotion.toFixed(1)}</span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
