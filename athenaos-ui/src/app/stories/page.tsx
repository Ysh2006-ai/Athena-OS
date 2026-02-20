"use client";

import React from 'react';
import StoryPanel from '@/components/StoryPanel';
import { Sparkles, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data for initial story generation
const MOCK_TIMELINE: any[] = [
    { timestamp: "18.1", emotion_score: 0.2, emotion_label: "Neutral" },
    { timestamp: "18.2", emotion_score: 0.8, emotion_label: "Euphoria" },
    { timestamp: "18.3", emotion_score: 0.9, emotion_label: "Euphoria" }
];

export default function StoriesPage() {
    return (
        <div className="min-h-screen bg-[#0B0F19] text-white selection:bg-pink-500/30">
            <div className="max-w-7xl mx-auto p-6 pb-20 pt-24">
                <header className="mb-14 text-center md:text-left">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-md mb-6 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                    >
                        <Sparkles className="text-purple-400" size={16} />
                        <span className="text-sm font-semibold text-purple-300 tracking-wide uppercase">AI Story Engine</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                        className="text-5xl font-extrabold text-white mb-4 drop-shadow-lg"
                    >
                        Match <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Narratives</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                        className="text-slate-400 text-lg max-w-2xl font-light mx-auto md:mx-0"
                    >
                        AI-generated storytelling converting data into drama. Relive the match through the lens of emotional momentum.
                    </motion.p>
                </header>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: { transition: { staggerChildren: 0.15 } },
                        hidden: {}
                    }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                    {/* Main Story Generator */}
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 30 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                        }}
                        className="lg:col-span-2 relative group"
                    >
                        {/* Glow behind the panel */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-1000 bg-opacity-50"></div>
                        <div className="relative h-full">
                            <StoryPanel
                                timeline={MOCK_TIMELINE}
                                moments={{
                                    turning_point: { timestamp: "18.2", emotion_score: 0.8, emotion_label: "Euphoria", context_weight: 1, sentiment_raw: 0.8 },
                                    highest_pressure: { timestamp: "18.1", emotion_score: 0.9, emotion_label: "High Pressure", context_weight: 1, sentiment_raw: 0.9 }
                                }}
                                players={["Richa Ghosh", "Smriti Mandhana", "Ellyse Perry"]}
                            />
                        </div>
                    </motion.div>

                    {/* Sidebar / Archive */}
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 30 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                        }}
                        className="space-y-6"
                    >
                        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                            {/* Subtle top edge glow */}
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>

                            <div className="flex items-center gap-3 mb-6 text-white font-bold text-lg">
                                <BookOpen size={20} className="text-purple-400" />
                                <h3>Archive</h3>
                            </div>

                            <div className="space-y-4">
                                {/* Archive Item 1 */}
                                <div className="p-5 rounded-2xl bg-slate-800/30 border border-white/5 hover:border-purple-500/50 hover:bg-slate-800/60 transition-all duration-300 cursor-pointer group hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:scale-[1.02]">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-purple-400 font-mono tracking-wider">YESTERDAY</span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 group-hover:animate-pulse"></span>
                                    </div>
                                    <h4 className="font-bold text-white group-hover:text-purple-300 transition-colors text-lg">IND-W vs ENG-W</h4>
                                    <p className="text-sm text-slate-400 mt-2 line-clamp-2 font-light leading-relaxed">
                                        A nail-biting finish as Harmanpreet Kaur steers the ship through stormy waters...
                                    </p>
                                </div>

                                {/* Archive Item 2 */}
                                <div className="p-5 rounded-2xl bg-slate-800/30 border border-white/5 hover:border-pink-500/50 hover:bg-slate-800/60 transition-all duration-300 cursor-pointer group hover:shadow-[0_0_20px_rgba(236,72,153,0.15)] hover:scale-[1.02]">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-pink-400 font-mono tracking-wider">2 DAYS AGO</span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600 transition-colors"></span>
                                    </div>
                                    <h4 className="font-bold text-white group-hover:text-pink-300 transition-colors text-lg">AUS-W vs SA-W</h4>
                                    <p className="text-sm text-slate-400 mt-2 line-clamp-2 font-light leading-relaxed">
                                        Wolvaardt's elegance wasn't enough to stop the Australian juggernaut in the semi-final...
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Did You Know Box */}
                        <div className="p-6 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/5 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="text-pink-400" size={16} />
                                <h3 className="text-white font-bold text-lg">Did you know?</h3>
                            </div>
                            <p className="text-slate-400 text-sm font-light leading-relaxed relative z-10">
                                AthenaOS analyzes over 50 micro-expressions and contextual events to determine the <span className="text-purple-300">"Emotional Temperature"</span> of a match narrative.
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
