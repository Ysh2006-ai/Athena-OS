"use client";

import { useState } from "react";
import { Link, Loader2, AlertCircle } from "lucide-react";

interface URLInputProps {
    onAnalyze: (url: string) => Promise<void>;
    loading?: boolean;
}

export default function URLInput({ onAnalyze, loading }: URLInputProps) {
    const [url, setUrl] = useState("");
    const [error, setError] = useState("");

    const isValid = url.includes("espncricinfo.com") || url.includes("cricbuzz.com");

    const handleAnalyze = async () => {
        if (!url.trim()) {
            setError("Please enter a URL");
            return;
        }
        if (!isValid) {
            setError("Only ESPNcricinfo and Cricbuzz URLs are supported");
            return;
        }
        setError("");
        await onAnalyze(url.trim());
    };

    return (
        <div className="space-y-3">
            <p className="text-xs text-[var(--muted)]">
                Paste an ESPNcricinfo match URL to scrape ball-by-ball commentary:
            </p>

            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-[var(--primary)]/50 transition-colors">
                <Link size={14} className="text-[var(--muted)] shrink-0" />
                <input
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                    placeholder="https://www.espncricinfo.com/series/.../match/..."
                    className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none"
                />
                {url && isValid && (
                    <span className="text-green-400 text-xs shrink-0">✓ Valid</span>
                )}
            </div>

            {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs">
                    <AlertCircle size={12} />
                    {error}
                </div>
            )}

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-3 py-2 text-xs text-yellow-400">
                ⚠️ Scraping may be blocked by the website. Use pre-loaded matches or paste commentary for reliable results.
            </div>

            <button
                onClick={handleAnalyze}
                disabled={loading || !url.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary)]/80 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Link size={14} />}
                {loading ? "Scraping..." : "Scrape & Analyze"}
            </button>
        </div>
    );
}
