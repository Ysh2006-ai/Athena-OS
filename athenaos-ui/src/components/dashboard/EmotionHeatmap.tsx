"use client";

import { motion } from "framer-motion";
import { HeatmapEntry } from "@/lib/api";

interface EmotionHeatmapProps {
    heatmap: HeatmapEntry[];
    currentOver: number;
    onOverClick: (over: number) => void;
}

export default function EmotionHeatmap({ heatmap, currentOver, onOverClick }: EmotionHeatmapProps) {
    if (!heatmap || heatmap.length === 0) return null;

    const getColor = (intensity: string) => {
        switch (intensity) {
            case "low": return "bg-emerald-500/20 border-emerald-500/40 text-emerald-400";
            case "medium": return "bg-yellow-500/20 border-yellow-500/40 text-yellow-400";
            case "high": return "bg-orange-500/20 border-orange-500/40 text-orange-400";
            case "extreme": return "bg-red-500/20 border-red-500/40 text-red-400";
            default: return "bg-slate-800 border-slate-700 text-slate-400";
        }
    };

    return (
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Emotional Intensity Heatmap (Per Over)</h3>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {heatmap.map((entry) => {
                    const isActive = entry.over === currentOver;
                    const colorClass = getColor(entry.intensity);

                    return (
                        <motion.button
                            key={entry.over}
                            onClick={() => onOverClick(entry.over)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`
                                relative h-12 rounded-lg border flex flex-col items-center justify-center transition-all
                                ${colorClass}
                                ${isActive ? "ring-2 ring-white shadow-lg shadow-white/20 z-10" : "opacity-80 hover:opacity-100"}
                            `}
                        >
                            <span className="text-xs font-bold">{entry.over}</span>
                            <div className="flex gap-0.5 mt-0.5">
                                {entry.wickets > 0 && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                )}
                                {entry.runs >= 10 && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                                )}
                            </div>

                            {/* Tooltip on hover (simplified via title for now, or custom component) */}
                            <div className="absolute inset-0 opacity-0 hover:opacity-100 bg-black/90 text-white text-[10px] p-2 rounded pointer-events-none transition-opacity flex flex-col items-center justify-center z-20 -translate-y-full -top-2 w-24">
                                <div>Over {entry.over}</div>
                                <div className="font-bold">{entry.runs} runs, {entry.wickets} wkt</div>
                                <div className="text-[var(--muted)]">E(t): {entry.avg_emotion}</div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            <div className="flex items-center gap-4 mt-3 text-[10px] text-[var(--muted)] px-1">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500/50" /> Low (0-35)
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-yellow-500/50" /> Medium (35-55)
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-orange-500/50" /> High (55-75)
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500/50" /> Extreme (75+)
                </div>
            </div>
        </div>
    );
}
