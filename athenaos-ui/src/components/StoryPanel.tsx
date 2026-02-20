"use client";

import { useState } from 'react';
import Card from './Card';
import { AthenaAPI } from '@/app/api/athena';
import { Loader2, Sparkles, Copy, Share2, Activity } from 'lucide-react';
import { KeyMoments } from '@/types';



interface Props {
    timeline: any[];
    moments: KeyMoments;
    players: string[];
    replayTime?: number;
}

export default function StoryPanel({ timeline, moments, players, replayTime }: Props) {
    const [storyData, setStoryData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [tone, setTone] = useState("emotional");
    const [type, setType] = useState("match_recap");

    const generate = async () => {
        setLoading(true);
        try {
            const timestamp = replayTime ? replayTime.toFixed(1) : undefined;
            const context = timestamp ? `Over ${timestamp} Pressure High` : undefined; // Mock context derived from time

            const res = await AthenaAPI.generateStory(
                type,
                tone,
                timeline,
                moments,
                players,
                "Match in Progress",
                timestamp,
                context
            );
            setStoryData(res);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            {/* Subtle top horizontal shine */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                    <Sparkles className="text-purple-400" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">AI Story Engine</h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6 relative z-10">
                <div className="relative group/select">
                    <select
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="w-full sm:w-auto appearance-none bg-slate-800/50 text-white font-medium text-sm rounded-xl pl-4 pr-10 py-3 border border-white/10 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all cursor-pointer backdrop-blur-sm shadow-inner"
                    >
                        <option value="emotional">Emotional Scope</option>
                        <option value="hype">Hype Mode 🔥</option>
                        <option value="analytical">Analytical Breakdown</option>
                    </select>
                    {/* Custom Dropdown Arrow */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover/select:text-white transition-colors">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                </div>

                <div className="flex-1 relative group/btn">
                    {/* Glowing button background effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-30 group-hover/btn:opacity-60 transition duration-500 animate-[pulse_3s_ease-in-out_infinite]"></div>
                    <button
                        onClick={generate}
                        disabled={loading}
                        className="relative w-full bg-slate-900/80 backdrop-blur border border-white/10 hover:border-white/20 hover:bg-slate-800/80 text-white font-bold rounded-xl px-6 py-3 flex items-center justify-center gap-3 transition-all disabled:opacity-50 overflow-hidden shadow-xl"
                    >
                        {/* Shine overlay */}
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover/btn:translate-x-[120%] duration-1000 transition-transform ease-in-out"></div>

                        {loading ? <Loader2 className="animate-spin text-purple-400" size={18} /> : <Sparkles className="text-pink-400" size={18} />}
                        <span className="bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                            {replayTime ? `Analyze ${replayTime.toFixed(1)}` : 'Generate Recap'}
                        </span>
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-slate-800/30 rounded-2xl p-6 border border-white/5 overflow-y-auto min-h-[250px] relative shadow-inner">
                {storyData ? (
                    <div className="animate-fade-in space-y-6">
                        {/* Header Metadata */}
                        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                            <div>
                                <div className="text-xs text-slate-400 uppercase tracking-[0.2em] mb-1">{storyData.moment_label}</div>
                                <div className={`text-sm font-bold tracking-wider inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10 ${storyData.emotion_level.includes("High") ? 'text-pink-400' : 'text-cyan-400'
                                    }`}>
                                    <Activity size={12} />
                                    {storyData.emotion_level}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">AI Confidence</div>
                                <div className="text-lg font-mono font-bold text-white drop-shadow-md">{(storyData.confidence * 100).toFixed(0)}%</div>
                            </div>
                        </div>

                        {/* Narrative */}
                        <div className="text-white leading-relaxed text-[15px] font-light md:text-base">
                            {storyData.story_text}
                        </div>

                        {/* Insights */}
                        {storyData.insights && (
                            <div className="bg-slate-900/60 backdrop-blur border border-purple-500/20 rounded-xl p-5 text-sm space-y-3 mt-6">
                                <div className="font-bold text-white flex items-center gap-2 mb-2">
                                    <Sparkles size={14} className="text-purple-400" />
                                    Why this mattered:
                                </div>
                                {storyData.insights.map((insight: string, i: number) => (
                                    <div key={i} className="flex gap-3 text-slate-300 font-light leading-relaxed">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(168,85,247,0.8)]"></div>
                                        <span>{insight}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm gap-4 absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/20">
                        <div className="w-16 h-16 rounded-2xl bg-slate-800/50 border border-white/5 flex items-center justify-center shadow-inner mb-2 animate-pulse">
                            <Sparkles className="text-slate-600" size={32} />
                        </div>
                        <span className="font-light tracking-wide">Waiting for initialization...</span>
                        <div className="text-xs text-slate-600 font-mono tracking-widest">READY</div>
                    </div>
                )}
            </div>
        </div>
    );
}
