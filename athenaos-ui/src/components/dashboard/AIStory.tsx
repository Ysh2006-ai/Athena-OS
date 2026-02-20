"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

interface AIStoryProps {
    story: string;
    matchId?: string;
    onGenerate?: () => Promise<void>;
    isGenerating?: boolean;
}

export default function AIStory({ story, matchId, onGenerate, isGenerating }: AIStoryProps) {
    const [expanded, setExpanded] = useState(false);

    const preview = story ? story.slice(0, 200) + (story.length > 200 ? "..." : "") : "";

    return (
        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/10 border border-purple-500/20 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-purple-400" />
                    <h3 className="text-sm font-semibold text-white">AI Match Story</h3>
                </div>
                {onGenerate && (
                    <button
                        onClick={onGenerate}
                        disabled={isGenerating || !matchId}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? (
                            <><Loader2 size={12} className="animate-spin" /> Generating...</>
                        ) : (
                            <><Sparkles size={12} /> Generate</>
                        )}
                    </button>
                )}
            </div>

            {!story ? (
                <div className="text-[var(--muted)] text-sm text-center py-6">
                    {isGenerating ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 size={20} className="animate-spin text-purple-400" />
                            <span>AthenaBot is crafting your story...</span>
                        </div>
                    ) : (
                        "Click Generate to create an AI narrative for this match"
                    )}
                </div>
            ) : (
                <div>
                    <AnimatePresence mode="wait">
                        {expanded ? (
                            <motion.div
                                key="full"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-sm text-white/80 leading-relaxed whitespace-pre-line"
                            >
                                {story}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="preview"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-sm text-white/80 leading-relaxed"
                            >
                                {preview}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {story.length > 200 && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="mt-2 flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                        >
                            {expanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Read full story</>}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
