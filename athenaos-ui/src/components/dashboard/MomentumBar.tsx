"use client";

import { motion } from "framer-motion";

interface MomentumBarProps {
    momentum: number; // -1 to +1
    teamBatting: string;
    teamBowling: string;
}

export default function MomentumBar({ momentum, teamBatting, teamBowling }: MomentumBarProps) {
    // Convert -1..+1 to 0..100 for display
    const pct = ((momentum + 1) / 2) * 100;
    const isBatting = momentum > 0;
    const isBowling = momentum < 0;
    const isNeutral = Math.abs(momentum) < 0.1;

    const battingWidth = Math.max(pct, 0);
    const bowlingWidth = Math.max(100 - pct, 0);

    const battingColor = "#8b5cf6";
    const bowlingColor = "#ef4444";
    const neutralColor = "#6b7280";

    const label = isNeutral
        ? "BALANCED"
        : isBatting
            ? `${teamBatting.split(" ")[0]} MOMENTUM`
            : `${teamBowling.split(" ")[0]} MOMENTUM`;

    const labelColor = isNeutral ? neutralColor : isBatting ? battingColor : bowlingColor;

    return (
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-white">Momentum</h3>
                <motion.span
                    key={label}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs font-bold"
                    style={{ color: labelColor }}
                >
                    {label}
                </motion.span>
            </div>

            {/* Team Labels */}
            <div className="flex justify-between text-xs text-[var(--muted)] mb-1">
                <span className="truncate max-w-[45%]">{teamBatting}</span>
                <span className="truncate max-w-[45%] text-right">{teamBowling}</span>
            </div>

            {/* Bar */}
            <div className="relative h-6 bg-white/5 rounded-full overflow-hidden flex">
                <motion.div
                    className="h-full rounded-l-full"
                    style={{ background: `linear-gradient(90deg, ${battingColor}80, ${battingColor})` }}
                    animate={{ width: `${battingWidth}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
                <motion.div
                    className="h-full rounded-r-full"
                    style={{ background: `linear-gradient(90deg, ${bowlingColor}, ${bowlingColor}80)` }}
                    animate={{ width: `${bowlingWidth}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
                {/* Center line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20" />
                {/* Indicator dot */}
                <motion.div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg border-2 border-gray-800"
                    animate={{ left: `calc(${pct}% - 8px)` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
            </div>

            {/* Values */}
            <div className="flex justify-between mt-1 text-xs">
                <span style={{ color: battingColor }} className="font-bold">
                    {battingWidth.toFixed(0)}%
                </span>
                <span className="text-[var(--muted)]">
                    Raw: {momentum > 0 ? "+" : ""}{momentum.toFixed(2)}
                </span>
                <span style={{ color: bowlingColor }} className="font-bold">
                    {bowlingWidth.toFixed(0)}%
                </span>
            </div>
        </div>
    );
}
