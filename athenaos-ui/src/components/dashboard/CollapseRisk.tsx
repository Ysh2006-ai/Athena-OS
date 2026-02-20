"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Shield, AlertCircle, Zap } from "lucide-react";
import type { CollapseRisk as CollapseRiskType } from "@/lib/api";

interface CollapseRiskProps {
    risk: CollapseRiskType;
}

const LEVEL_CONFIG = {
    low: { icon: Shield, color: "#3b82f6", bg: "bg-blue-500/10 border-blue-500/20", label: "LOW RISK" },
    medium: { icon: AlertCircle, color: "#eab308", bg: "bg-yellow-500/10 border-yellow-500/20", label: "MEDIUM RISK" },
    high: { icon: AlertTriangle, color: "#f97316", bg: "bg-orange-500/10 border-orange-500/20", label: "HIGH RISK" },
    critical: { icon: Zap, color: "#ef4444", bg: "bg-red-500/10 border-red-500/20", label: "CRITICAL" },
};

export default function CollapseRisk({ risk }: CollapseRiskProps) {
    const config = LEVEL_CONFIG[risk.level] || LEVEL_CONFIG.low;
    const Icon = config.icon;

    return (
        <div className={`border rounded-2xl p-4 ${config.bg}`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Icon size={16} style={{ color: config.color }} />
                    <h3 className="text-sm font-semibold text-white">Collapse Risk</h3>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: config.color + "20", color: config.color, border: `1px solid ${config.color}40` }}>
                    {config.label}
                </span>
            </div>

            {/* Percentage */}
            <div className="flex items-end gap-2 mb-3">
                <motion.span
                    key={risk.percentage}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="text-4xl font-black"
                    style={{ color: config.color }}
                >
                    {risk.percentage.toFixed(0)}%
                </motion.span>
                <span className="text-[var(--muted)] text-sm mb-1">probability</span>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                <motion.div
                    className="h-full rounded-full"
                    style={{ background: config.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${risk.percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                />
            </div>

            {/* Reasons */}
            <div className="space-y-1.5">
                {risk.reasons.map((reason, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-2 text-xs text-white/70"
                    >
                        <span style={{ color: config.color }} className="mt-0.5 shrink-0">▸</span>
                        <span>{reason}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
