"use client";

import { useEffect, useRef } from "react";
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, PointElement, LineElement,
    Filler, Tooltip, Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { BallData } from "@/lib/api";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface EmotionGraphProps {
    ballData: BallData[];
    currentBall: number;
    onBallClick?: (ball: number) => void;
}

export default function EmotionGraph({ ballData, currentBall, onBallClick }: EmotionGraphProps) {
    const visible = ballData.slice(0, currentBall);

    const labels = visible.map((b) => `${b.over}.${b.ball_number % 6 || 6}`);
    const emotionData = visible.map((b) => b.emotion_score);
    const pressureData = visible.map((b) => b.pressure * 100);

    // Event markers (wickets, sixes)
    const wicketPoints = visible.map((b) => (b.is_wicket ? b.emotion_score : null));
    const sixPoints = visible.map((b) => (b.is_six ? b.emotion_score : null));

    const data = {
        labels,
        datasets: [
            {
                label: "E(t) Score",
                data: emotionData,
                borderColor: "rgba(139, 92, 246, 1)",
                backgroundColor: "rgba(139, 92, 246, 0.15)",
                borderWidth: 2.5,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 5,
            },
            {
                label: "Pressure %",
                data: pressureData,
                borderColor: "rgba(239, 68, 68, 0.7)",
                backgroundColor: "transparent",
                borderWidth: 1.5,
                borderDash: [4, 4],
                fill: false,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 4,
            },
            {
                label: "Wicket",
                data: wicketPoints,
                borderColor: "transparent",
                backgroundColor: "rgba(239, 68, 68, 0.9)",
                pointRadius: 6,
                pointStyle: "triangle",
                showLine: false,
            },
            {
                label: "Six",
                data: sixPoints,
                borderColor: "transparent",
                backgroundColor: "rgba(34, 197, 94, 0.9)",
                pointRadius: 5,
                pointStyle: "star",
                showLine: false,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        interaction: { mode: "index" as const, intersect: false },
        onClick: (_: unknown, elements: { index: number }[]) => {
            if (elements.length > 0 && onBallClick) {
                onBallClick(elements[0].index + 1);
            }
        },
        plugins: {
            legend: {
                display: true,
                labels: {
                    color: "rgba(255,255,255,0.6)",
                    font: { size: 11 },
                    boxWidth: 12,
                    padding: 16,
                },
            },
            tooltip: {
                backgroundColor: "rgba(15, 15, 25, 0.95)",
                borderColor: "rgba(139, 92, 246, 0.3)",
                borderWidth: 1,
                titleColor: "#fff",
                bodyColor: "rgba(255,255,255,0.7)",
                callbacks: {
                    title: (items: { label: string }[]) => `Over ${items[0]?.label}`,
                    afterBody: (items: { dataIndex: number }[]) => {
                        const ball = visible[items[0]?.dataIndex];
                        if (!ball) return [];
                        const lines = [];
                        if (ball.is_wicket) lines.push("🔴 WICKET!");
                        if (ball.is_six) lines.push("🟢 SIX!");
                        if (ball.is_four) lines.push("🔵 FOUR!");
                        if (ball.batter) lines.push(`Batter: ${ball.batter}`);
                        return lines;
                    },
                },
            },
        },
        scales: {
            x: {
                ticks: {
                    color: "rgba(255,255,255,0.4)",
                    font: { size: 10 },
                    autoSkip: true,
                    maxRotation: 0,
                    callback: function (this: any, val: string | number) {
                        const label = this.getLabelForValue(val as number);
                        // Only show the label if it's the first ball of the over (ends in .1)
                        if (typeof label === "string" && label.endsWith(".1")) {
                            return `Ov ${label.split(".")[0]}`;
                        }
                        return null;
                    },
                },
                grid: { color: "rgba(255,255,255,0.05)" },
            },
            y: {
                min: 0,
                max: 100,
                ticks: { color: "rgba(255,255,255,0.4)", font: { size: 10 } },
                grid: { color: "rgba(255,255,255,0.05)" },
            },
        },
    };

    return (
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Emotion Timeline — E(t)</h3>
                <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-0.5 bg-purple-500 inline-block" /> E(t)
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-0.5 bg-red-500 inline-block border-dashed border-t" /> Pressure
                    </span>
                </div>
            </div>
            <div className="h-56">
                {visible.length > 0 ? (
                    <Line data={data} options={options} />
                ) : (
                    <div className="h-full flex items-center justify-center text-[var(--muted)] text-sm">
                        No data yet — load a match to begin
                    </div>
                )}
            </div>
        </div>
    );
}
