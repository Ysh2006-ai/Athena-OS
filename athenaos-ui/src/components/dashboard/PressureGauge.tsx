"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

interface PressureGaugeProps {
    pressure: number; // 0 to 1
    emotionScore: number;
    phase: string;
    runsNeeded?: number;
    ballsRemaining?: number;
}

const PRESSURE_LEVELS = [
    { max: 0.25, label: "LOW", color: "#3b82f6", glow: "rgba(59,130,246,0.4)" },
    { max: 0.5, label: "MODERATE", color: "#eab308", glow: "rgba(234,179,8,0.4)" },
    { max: 0.75, label: "HIGH", color: "#f97316", glow: "rgba(249,115,22,0.4)" },
    { max: 1.0, label: "EXTREME", color: "#ef4444", glow: "rgba(239,68,68,0.4)" },
];

function getPressureLevel(p: number) {
    return PRESSURE_LEVELS.find((l) => p <= l.max) || PRESSURE_LEVELS[3];
}

export default function PressureGauge({ pressure, emotionScore, phase, runsNeeded, ballsRemaining }: PressureGaugeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const level = getPressureLevel(pressure);
    const pct = Math.round(pressure * 100);

    // Draw needle gauge
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const W = canvas.width;
        const H = canvas.height;
        const cx = W / 2;
        const cy = H - 20;
        const R = Math.min(cx, cy) - 10;

        ctx.clearRect(0, 0, W, H);

        // Draw arc segments
        const segments = [
            { start: Math.PI, end: Math.PI * 1.25, color: "#3b82f6" },
            { start: Math.PI * 1.25, end: Math.PI * 1.5, color: "#eab308" },
            { start: Math.PI * 1.5, end: Math.PI * 1.75, color: "#f97316" },
            { start: Math.PI * 1.75, end: Math.PI * 2, color: "#ef4444" },
        ];

        segments.forEach(({ start, end, color }) => {
            ctx.beginPath();
            ctx.arc(cx, cy, R, start, end);
            ctx.lineWidth = 16;
            ctx.strokeStyle = color + "60";
            ctx.stroke();
        });

        // Active arc
        const activeEnd = Math.PI + pressure * Math.PI;
        ctx.beginPath();
        ctx.arc(cx, cy, R, Math.PI, activeEnd);
        ctx.lineWidth = 16;
        ctx.strokeStyle = level.color;
        ctx.shadowColor = level.glow;
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Needle
        const angle = Math.PI + pressure * Math.PI;
        const needleLen = R - 20;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(
            cx + needleLen * Math.cos(angle),
            cy + needleLen * Math.sin(angle)
        );
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#fff";
        ctx.shadowColor = "rgba(255,255,255,0.5)";
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Center dot
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
    }, [pressure, level]);

    return (
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-white mb-2">Pressure Index</h3>

            <div className="flex flex-col items-center">
                <canvas ref={canvasRef} width={200} height={110} className="w-full max-w-[200px]" />

                <motion.div
                    key={pct}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="text-center -mt-2"
                >
                    <div className="text-3xl font-black" style={{ color: level.color }}>
                        {pct}%
                    </div>
                    <div
                        className="text-xs font-bold px-3 py-1 rounded-full mt-1"
                        style={{ background: level.color + "20", color: level.color, border: `1px solid ${level.color}40` }}
                    >
                        {level.label}
                    </div>
                </motion.div>
            </div>

            {/* Match State Chips */}
            <div className="mt-3 flex gap-2">

                {ballsRemaining !== undefined && (
                    <div className="bg-white/5 rounded-lg p-2 text-center flex-1">
                        <div className="text-lg font-bold text-white">{ballsRemaining}</div>
                        <div className="text-xs text-[var(--muted)]">Balls Left</div>
                    </div>
                )}
            </div>

            <div className="mt-2 text-center text-xs text-[var(--muted)]">
                Phase: <span className="text-white font-medium">{phase}</span>
            </div>
        </div>
    );
}
