"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle, Trophy, FileText, Link, Film, type LucideIcon } from "lucide-react";

// API
import { AthenaAPI, type MatchAnalysis } from "@/lib/api";

// Dashboard Components
import TopBar from "@/components/dashboard/TopBar";
import EmotionGraph from "@/components/dashboard/EmotionGraph";
import EmotionHeatmap from "../../components/dashboard/EmotionHeatmap";
import KeyMomentsTimeline from "@/components/dashboard/KeyMomentsTimeline";
import PressureGauge from "@/components/dashboard/PressureGauge";
import BatterCards from "@/components/dashboard/BatterCards";
import MomentumBar from "@/components/dashboard/MomentumBar";
import CollapseRisk from "@/components/dashboard/CollapseRisk";
import AIStory from "@/components/dashboard/AIStory";
import StatsTable from "@/components/dashboard/StatsTable";
import ChatPanel from "@/components/dashboard/ChatPanel";

// Input Components
import MatchSelector from "@/components/input/MatchSelector";
import CommentaryPaste from "@/components/input/CommentaryPaste";
import URLInput from "@/components/input/URLInput";
import VideoUpload from "@/components/input/VideoUpload";

// ─── Types ────────────────────────────────────────────────────────────────────
type InputTab = "preloaded" | "commentary" | "url" | "video";

const INPUT_TABS: { id: InputTab; label: string; icon: LucideIcon }[] = [
    { id: "preloaded", label: "Pre-loaded", icon: Trophy },
    { id: "commentary", label: "Paste", icon: FileText },
    { id: "url", label: "URL", icon: Link },
    { id: "video", label: "Video", icon: Film },
];

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
        >
            <div className="w-20 h-20 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center mb-6">
                <Trophy size={32} className="text-[var(--primary)]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">AthenaOS Dashboard</h2>
            <p className="text-[var(--muted)] max-w-md">
                Select a match from the panel above to begin emotional analysis.
                Watch E(t) scores, pressure indices, and momentum shifts unfold ball by ball.
            </p>
        </motion.div>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<InputTab>("preloaded");
    const [analysis, setAnalysis] = useState<MatchAnalysis | null>(null);
    const [selectedMatchId, setSelectedMatchId] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Playback state
    const [currentBall, setCurrentBall] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Story state
    const [story, setStory] = useState("");
    const [generatingStory, setGeneratingStory] = useState(false);

    // Perspective state
    const [perspective, setPerspective] = useState<"batting" | "bowling">("batting");

    // ─── Computed Analysis Data based on Perspective ──────────────────────────
    const displayAnalysis = analysis ? {
        ...analysis,
        summary: {
            ...analysis.summary,
            avg_emotion: perspective === "bowling" ? analysis.summary.avg_emotion_bowling : analysis.summary.avg_emotion,
            peak_emotion: perspective === "bowling" ? analysis.summary.peak_emotion_bowling : analysis.summary.peak_emotion,
        },
        ball_by_ball: analysis.ball_by_ball.map(b => ({
            ...b,
            emotion_score: perspective === "bowling" ? (b.emotion_score_bowling ?? 0) : b.emotion_score,
            // Flip momentum for bowling perspective so "positive" means good for them
            momentum: perspective === "bowling" ? -b.momentum : b.momentum,
        })),
        current_state: {
            ...analysis.current_state,
            emotion_score: perspective === "bowling" ? (analysis.ball_by_ball[analysis.ball_by_ball.length - 1]?.emotion_score_bowling ?? 0) : analysis.current_state.emotion_score,
            momentum: perspective === "bowling" ? -analysis.current_state.momentum : analysis.current_state.momentum,
        },
        heatmap: analysis.heatmap.map(h => ({
            ...h,
            avg_emotion: perspective === "bowling" ? (h.avg_emotion_bowling ?? 0) : h.avg_emotion,
            peak_emotion: perspective === "bowling" ? (h.peak_emotion_bowling ?? 0) : h.peak_emotion,
            intensity: perspective === "bowling" ? (h.intensity_bowling ?? "low") : h.intensity,
        })),
        emotional_phases: perspective === "bowling" ? (analysis.emotional_phases_bowling ?? []) : analysis.emotional_phases,
    } : null;

    // ─── Playback ─────────────────────────────────────────────────────────────
    const totalBalls = displayAnalysis?.ball_by_ball.length || 0;

    const stopPlayback = useCallback(() => {
        if (playIntervalRef.current) {
            clearInterval(playIntervalRef.current);
            playIntervalRef.current = null;
        }
        setIsPlaying(false);
    }, []);

    const startPlayback = useCallback(() => {
        if (currentBall >= totalBalls) {
            setCurrentBall(0);
        }
        setIsPlaying(true);
        playIntervalRef.current = setInterval(() => {
            setCurrentBall((prev) => {
                if (prev >= totalBalls) {
                    stopPlayback();
                    return prev;
                }
                return prev + 1;
            });
        }, 400);
    }, [currentBall, totalBalls, stopPlayback]);

    useEffect(() => {
        return () => stopPlayback();
    }, [stopPlayback]);

    // ─── Current ball data ────────────────────────────────────────────────────
    const currentBallData = displayAnalysis?.ball_by_ball[Math.max(currentBall - 1, 0)];
    const emotionScore = currentBallData?.emotion_score ?? 0;
    const pressure = currentBallData?.pressure ?? 0;
    const momentum = currentBallData?.momentum ?? 0;
    const phase = currentBallData?.phase ?? "CALM";
    const currentOver = currentBallData?.over ?? 1;

    // Collapse risk and batter cards from last ball

    const collapseRisk = displayAnalysis?.current_state.collapse_risk ?? {
        percentage: 10,
        level: "low" as const,
        reasons: ["Match situation stable"],
    };
    const batterCards = displayAnalysis?.current_state.batter_cards ?? [];

    // Runs needed / balls remaining
    const runsScored = displayAnalysis?.ball_by_ball
        .slice(0, currentBall)
        .reduce((sum, b) => sum + b.runs, 0) ?? 0;
    const target = displayAnalysis?.match_info.target || 0;
    const ballsRemaining = totalBalls - currentBall;

    // ─── Analysis Handlers ────────────────────────────────────────────────────
    const handlePreloaded = async (matchId: string) => {
        setSelectedMatchId(matchId);
        setLoading(true);
        setError("");
        setStory("");
        stopPlayback();
        try {
            const result = await AthenaAPI.analyzePreloaded(matchId);
            setAnalysis(result);
            setCurrentBall(result.ball_by_ball.length); // Show full match by default
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Failed to analyze match");
        } finally {
            setLoading(false);
        }
    };

    const handleCommentary = async (commentary: object[]) => {
        setLoading(true);
        setError("");
        setStory("");
        stopPlayback();
        try {
            const result = await AthenaAPI.analyzeCommentary(commentary);
            setAnalysis(result);
            setSelectedMatchId("custom");
            setCurrentBall(result.ball_by_ball.length);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Failed to analyze commentary");
        } finally {
            setLoading(false);
        }
    };

    const handleURL = async (url: string) => {
        setLoading(true);
        setError("");
        setStory("");
        stopPlayback();
        try {
            const result = await AthenaAPI.analyzeURL(url);
            setAnalysis(result);
            setSelectedMatchId("scraped");
            setCurrentBall(result.ball_by_ball.length);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Failed to scrape URL");
        } finally {
            setLoading(false);
        }
    };

    const handleVideo = async (file: File) => {
        setLoading(true);
        setError("");
        setStory("");
        stopPlayback();
        try {
            const result = await AthenaAPI.analyzeVideo(file);
            setAnalysis(result);
            setSelectedMatchId("video");
            setCurrentBall(result.ball_by_ball.length);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Failed to process video");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateStory = async () => {
        if (!selectedMatchId || selectedMatchId === "custom" || selectedMatchId === "scraped" || selectedMatchId === "video") {
            // For non-preloaded, use the analysis data directly
            if (!analysis) return;
            setGeneratingStory(true);
            try {
                const res = await AthenaAPI.generateReport(selectedMatchId || "match_001");
                setStory(res.story);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Failed to generate story. Please try again.";
                setStory(message);
            } finally {
                setGeneratingStory(false);
            }
            return;
        }
        setGeneratingStory(true);
        try {
            const res = await AthenaAPI.generateReport(selectedMatchId);
            setStory(res.story);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to generate story. Please try again.";
            setStory(message);
        } finally {
            setGeneratingStory(false);
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#0a0e1a] text-white px-4 py-6 max-w-[1600px] mx-auto">

            {/* ── Input Panel ─────────────────────────────────────────────────── */}
            <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 mb-6">
                {/* Tabs */}
                <div className="flex items-center gap-1 mb-4 flex-wrap">
                    {INPUT_TABS.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                    ? "bg-emerald-600 text-white"
                                    : "text-gray-400 hover:text-white hover:bg-white/10"
                                    }`}
                            >
                                <Icon size={14} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content — scrollable so all matches are visible */}
                <div className="max-h-64 overflow-y-auto pr-1">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.15 }}
                        >
                            {activeTab === "preloaded" && (
                                <MatchSelector
                                    onSelect={handlePreloaded}
                                    selectedId={selectedMatchId}
                                    loading={loading}
                                />
                            )}
                            {activeTab === "commentary" && (
                                <CommentaryPaste onAnalyze={handleCommentary} loading={loading} />
                            )}
                            {activeTab === "url" && (
                                <URLInput onAnalyze={handleURL} loading={loading} />
                            )}
                            {activeTab === "video" && (
                                <VideoUpload onAnalyze={handleVideo} loading={loading} />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Error */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-3 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2"
                    >
                        <AlertCircle size={14} />
                        {error}
                    </motion.div>
                )}

                {/* Loading overlay */}
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-3 flex items-center gap-2 text-emerald-400 text-sm"
                    >
                        <Loader2 size={14} className="animate-spin" />
                        Analyzing match data...
                    </motion.div>
                )}
            </div>


            {/* ── Dashboard ───────────────────────────────────────────────────── */}
            {!displayAnalysis ? (
                <EmptyState />
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                >
                    {/* TopBar */}
                    <TopBar
                        matchInfo={displayAnalysis.match_info}
                        currentBall={currentBall}
                        totalBalls={totalBalls}
                        emotionScore={emotionScore}
                        phase={phase}
                        isPlaying={isPlaying}
                        onPlay={startPlayback}
                        onPause={stopPlayback}
                        onSeek={(ball) => { setCurrentBall(ball); stopPlayback(); }}
                        onSkipEnd={() => { setCurrentBall(totalBalls); stopPlayback(); }}
                        perspective={perspective}
                        onTogglePerspective={setPerspective}
                    />

                    {/* Main Grid: 60/40 */}
                    <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4">

                        {/* Left Column */}
                        <div className="space-y-4">
                            <EmotionGraph
                                ballData={displayAnalysis.ball_by_ball}
                                currentBall={currentBall}
                                onBallClick={(ball) => { setCurrentBall(ball); stopPlayback(); }}
                            />
                            <EmotionHeatmap
                                heatmap={displayAnalysis.heatmap}
                                currentOver={currentOver}
                                onOverClick={(over: number) => {
                                    const ball = displayAnalysis.ball_by_ball.findIndex((b) => b.over === over);
                                    if (ball >= 0) { setCurrentBall(ball + 1); stopPlayback(); }
                                }}
                            />
                            <KeyMomentsTimeline
                                moments={displayAnalysis.key_moments}
                                currentBall={currentBall}
                                onMomentClick={(ball) => { setCurrentBall(ball); stopPlayback(); }}
                            />
                            <BatterCards cards={batterCards} />
                            <StatsTable analysis={displayAnalysis} />
                            <AIStory
                                story={story}
                                matchId={selectedMatchId}
                                onGenerate={handleGenerateStory}
                                isGenerating={generatingStory}
                            />
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            <PressureGauge
                                pressure={pressure}
                                emotionScore={emotionScore}
                                phase={phase}
                                runsNeeded={target > 0 ? Math.max(target - runsScored, 0) : undefined}
                                ballsRemaining={ballsRemaining}
                            />
                            <MomentumBar
                                momentum={momentum}
                                teamBatting={displayAnalysis.match_info.team_batting}
                                teamBowling={displayAnalysis.match_info.team_bowling}
                            />
                            <CollapseRisk risk={collapseRisk} />

                            {/* Current Ball Commentary */}
                            {currentBallData && (
                                <motion.div
                                    key={currentBall}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-4"
                                >
                                    <div className="text-xs text-[var(--muted)] mb-1">
                                        Over {currentBallData.over} · Ball {currentBall}
                                    </div>
                                    <p className="text-sm text-white leading-relaxed">
                                        {currentBallData.text}
                                    </p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-[var(--muted)]">
                                        {currentBallData.is_wicket && <span className="text-red-400 font-bold">🔴 WICKET</span>}
                                        {currentBallData.is_six && <span className="text-green-400 font-bold">🟢 SIX</span>}
                                        {currentBallData.is_four && <span className="text-blue-400 font-bold">🔵 FOUR</span>}
                                        <span>Runs: {currentBallData.runs}</span>
                                        {currentBallData.batter && <span>· {currentBallData.batter}</span>}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Floating Chatbot */}
            <ChatPanel matchId={selectedMatchId || undefined} />
        </div>
    );
}
