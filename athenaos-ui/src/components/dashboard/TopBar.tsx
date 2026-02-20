"use client";

import { motion } from "framer-motion";
import { Activity, Zap, TrendingUp, Clock, ChevronLeft, ChevronRight, Play, Pause, SkipForward } from "lucide-react";

interface TopBarProps {
    matchInfo: {
        title: string;
        team_batting: string;
        team_bowling: string;
        venue: string;
        format: string;
    };
    currentBall: number;
    totalBalls: number;
    emotionScore: number;
    phase: string;
    isPlaying: boolean;
    onPlay: () => void;
    onPause: () => void;
    onSeek: (ball: number) => void;
    onSkipEnd: () => void;
    perspective: "batting" | "bowling";
    onTogglePerspective: (p: "batting" | "bowling") => void;
}

const PHASE_COLORS: Record<string, string> = {
    "CALM": "text-blue-400 bg-blue-400/10 border-blue-400/30",
    "BUILDING": "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
    "HIGH INTENSITY": "text-orange-400 bg-orange-400/10 border-orange-400/30",
    "PEAK EMOTION": "text-red-400 bg-red-400/10 border-red-400/30",
};

const EMOTION_COLOR = (score: number) => {
    if (score >= 75) return "#ef4444";
    if (score >= 55) return "#f97316";
    if (score >= 35) return "#eab308";
    return "#3b82f6";
};

export default function TopBar({
    matchInfo, currentBall, totalBalls, emotionScore, phase,
    isPlaying, onPlay, onPause, onSeek, onSkipEnd,
    perspective, onTogglePerspective,
}: TopBarProps) {
    const progress = totalBalls > 0 ? (currentBall / totalBalls) * 100 : 0;
    const phaseClass = PHASE_COLORS[phase] || PHASE_COLORS["CALM"];
    const etColor = EMOTION_COLOR(emotionScore);

    return (
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-4 space-y-3">
            {/* Match Title Row */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h2 className="text-lg font-bold text-white leading-tight">{matchInfo.title}</h2>
                    <p className="text-sm text-[var(--muted)] mt-0.5">
                        {matchInfo.venue} · {matchInfo.format}
                    </p>
                </div>

                {/* E(t) Score */}
                <motion.div
                    key={emotionScore}
                    initial={{ scale: 0.9, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-end"
                >
                    <div className="flex items-center gap-2">
                        <Activity size={16} style={{ color: etColor }} />
                        <span className="text-2xl font-black" style={{ color: etColor }}>
                            {emotionScore.toFixed(1)}
                        </span>
                        <span className="text-xs text-[var(--muted)]">/100</span>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${phaseClass}`}>
                        {phase}
                    </span>
                    <span className="text-[10px] text-[var(--muted)] mt-0.5 uppercase tracking-wider">
                        {perspective} Perspective
                    </span>
                </motion.div>
            </div>

            {/* Teams Toggle */}
            <div className="flex items-center gap-2 text-sm bg-black/20 p-1 rounded-lg w-fit">
                <button
                    onClick={() => onTogglePerspective("batting")}
                    className={`px-3 py-1.5 rounded-md transition-all font-medium flex items-center gap-2 ${perspective === "batting"
                        ? "bg-[var(--primary)] text-white shadow-lg shadow-purple-500/20"
                        : "text-[var(--muted)] hover:text-white hover:bg-white/5"
                        }`}
                >
                    <span className="w-2 h-2 rounded-full bg-current opacity-60" />
                    {matchInfo.team_batting}
                </button>
                <span className="text-[var(--muted)]/50 text-xs">vs</span>
                <button
                    onClick={() => onTogglePerspective("bowling")}
                    className={`px-3 py-1.5 rounded-md transition-all font-medium flex items-center gap-2 ${perspective === "bowling"
                        ? "bg-[var(--primary)] text-white shadow-lg shadow-purple-500/20"
                        : "text-[var(--muted)] hover:text-white hover:bg-white/5"
                        }`}
                >
                    <span className="w-2 h-2 rounded-full bg-current opacity-60" />
                    {matchInfo.team_bowling}
                </button>
            </div>

            {/* Playback Controls */}
            <div className="space-y-2">
                {/* Progress Bar */}
                <div className="relative h-2 bg-white/10 rounded-full cursor-pointer group"
                    onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const ratio = (e.clientX - rect.left) / rect.width;
                        onSeek(Math.round(ratio * totalBalls));
                    }}
                >
                    <motion.div
                        className="absolute left-0 top-0 h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, var(--primary), ${etColor})` }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                    {/* Thumb */}
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ left: `calc(${progress}% - 6px)` }}
                    />
                </div>

                {/* Controls Row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={isPlaying ? onPause : onPlay}
                            className="p-2 rounded-lg bg-[var(--primary)]/20 hover:bg-[var(--primary)]/40 text-[var(--primary)] transition-colors"
                        >
                            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                        </button>
                        <button
                            onClick={onSkipEnd}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--muted)] transition-colors"
                        >
                            <SkipForward size={16} />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                        <Clock size={12} />
                        <span>Ball {currentBall} / {totalBalls}</span>
                        <span className="text-white/30">·</span>
                        <span>Over {Math.ceil(currentBall / 6)}.{currentBall % 6 || 6}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
