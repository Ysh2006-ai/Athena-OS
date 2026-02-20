"use client";

import type { MatchAnalysis } from "@/lib/api";

interface StatsTableProps {
    analysis: MatchAnalysis;
}

export default function StatsTable({ analysis }: StatsTableProps) {
    const { summary, emotional_phases, momentum_shifts } = analysis;

    return (
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-4 space-y-4">
            <h3 className="text-sm font-semibold text-white">Match Summary</h3>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "Avg E(t)", value: summary.avg_emotion.toFixed(1), color: "text-purple-400" },
                    { label: "Peak E(t)", value: summary.peak_emotion.toFixed(1), color: "text-red-400" },
                    { label: "Avg Pressure", value: `${(summary.avg_pressure * 100).toFixed(0)}%`, color: "text-orange-400" },
                    { label: "Momentum Shifts", value: summary.momentum_shifts, color: "text-yellow-400" },
                    { label: "Total Balls", value: summary.total_balls, color: "text-blue-400" },
                    { label: "Wickets", value: summary.wickets_fallen, color: "text-red-400" },
                    { label: "Runs Scored", value: summary.runs_scored, color: "text-green-400" },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white/5 rounded-xl p-3 text-center">
                        <div className={`text-xl font-black ${stat.color}`}>{stat.value}</div>
                        <div className="text-xs text-[var(--muted)] mt-0.5">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Emotional Phases Table */}
            {emotional_phases.length > 0 && (
                <div>
                    <h4 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">
                        Emotional Phases
                    </h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-2 text-[var(--muted)] font-medium">Phase</th>
                                    <th className="text-center py-2 text-[var(--muted)] font-medium">Overs</th>
                                    <th className="text-center py-2 text-[var(--muted)] font-medium">Avg E(t)</th>
                                    <th className="text-center py-2 text-[var(--muted)] font-medium">Peak E(t)</th>
                                    <th className="text-left py-2 text-[var(--muted)] font-medium">Key Event</th>
                                </tr>
                            </thead>
                            <tbody>
                                {emotional_phases.map((phase, i) => (
                                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="py-2 font-medium text-white">{phase.name}</td>
                                        <td className="py-2 text-center text-[var(--muted)]">
                                            {phase.over_start}–{phase.over_end}
                                        </td>
                                        <td className="py-2 text-center">
                                            <span className={`font-bold ${phase.avg_et >= 70 ? "text-red-400" : phase.avg_et >= 50 ? "text-orange-400" : phase.avg_et >= 35 ? "text-yellow-400" : "text-blue-400"}`}>
                                                {phase.avg_et}
                                            </span>
                                        </td>
                                        <td className="py-2 text-center text-white font-bold">{phase.peak_et}</td>
                                        <td className="py-2 text-[var(--muted)] max-w-[200px] truncate">{phase.key_event}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Momentum Shifts */}
            {momentum_shifts.length > 0 && (
                <div>
                    <h4 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">
                        Momentum Shifts ({momentum_shifts.length})
                    </h4>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                        {momentum_shifts.map((shift, i) => (
                            <div key={i} className="flex items-center gap-3 text-xs bg-white/5 rounded-lg px-3 py-2">
                                <span className="text-[var(--muted)] shrink-0">Over {shift.over}</span>
                                <span className={shift.from > 0 ? "text-purple-400" : "text-red-400"}>
                                    {shift.from > 0 ? "+" : ""}{shift.from.toFixed(2)}
                                </span>
                                <span className="text-[var(--muted)]">→</span>
                                <span className={shift.to > 0 ? "text-purple-400" : "text-red-400"}>
                                    {shift.to > 0 ? "+" : ""}{shift.to.toFixed(2)}
                                </span>
                                <span className="text-white/60 truncate">{shift.description}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
