"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Trophy } from "lucide-react";
import { AthenaAPI, type MatchInfo } from "@/lib/api";

interface MatchSelectorProps {
    onSelect: (matchId: string) => void;
    selectedId?: string;
    loading?: boolean;
}

export default function MatchSelector({ onSelect, selectedId, loading }: MatchSelectorProps) {
    const [matches, setMatches] = useState<MatchInfo[]>([]);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        AthenaAPI.listMatches()
            .then((res) => setMatches(res.matches))
            .catch(() => setError("Could not load matches. Is the backend running?"))
            .finally(() => setFetching(false));
    }, []);

    if (fetching) {
        return (
            <div className="flex items-center justify-center py-8 gap-2 text-[var(--muted)]">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">Loading matches...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-400 text-sm text-center py-4 bg-red-500/10 rounded-xl border border-red-500/20 px-4">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <p className="text-xs text-[var(--muted)] mb-3">Select a pre-loaded match to analyze:</p>
            {matches.map((match, i) => {
                const isSelected = match.match_id === selectedId;
                return (
                    <motion.button
                        key={match.match_id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => !loading && onSelect(match.match_id)}
                        disabled={loading}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${isSelected
                                ? "bg-[var(--primary)]/20 border-[var(--primary)]/50 text-white"
                                : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20"
                            } disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                        <div className="flex items-start gap-3">
                            <Trophy size={14} className={`mt-0.5 shrink-0 ${isSelected ? "text-[var(--primary)]" : "text-[var(--muted)]"}`} />
                            <div className="min-w-0">
                                <div className="font-semibold text-sm truncate">{match.title}</div>
                                <div className="text-xs text-[var(--muted)] mt-0.5 truncate">
                                    {match.venue} · {match.date}
                                </div>
                                {match.description && (
                                    <div className="text-xs text-white/40 mt-0.5 truncate">{match.description}</div>
                                )}
                            </div>
                            {isSelected && loading && (
                                <Loader2 size={14} className="animate-spin text-[var(--primary)] shrink-0 mt-0.5" />
                            )}
                        </div>
                    </motion.button>
                );
            })}
        </div>
    );
}
