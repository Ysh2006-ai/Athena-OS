"use client";

import { useState } from "react";
import { Loader2, FileText, AlertCircle } from "lucide-react";

interface CommentaryPasteProps {
    onAnalyze: (commentary: object[]) => Promise<void>;
    loading?: boolean;
}

const EXAMPLE = `17.1 Ismail to Mandhana, FOUR! Driven through covers.
17.2 Ismail to Mandhana, SIX! Over long-on!
17.3 Ismail to Shafali, OUT! Caught behind.
17.4 Kapp to Harmanpreet, dot ball.
17.5 Kapp to Harmanpreet, FOUR! Driven through covers.`;

function parseCommentaryText(text: string): { commentary: object[], match_info?: object } {
    const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    const ballRegex = /^\d+(\.\d+)?\s+/;

    // Detect match info from non-ball lines (e.g., "IND Women vs AUS Women")
    let matchInfo = undefined;
    const titleLine = lines.find(l => l.includes(" vs ") || l.includes(" v "));
    if (titleLine) {
        const [t1, t2] = titleLine.split(/ vs | v /i);
        matchInfo = {
            title: titleLine,
            team_batting: t1.trim(),
            team_bowling: t2.split(",")[0].trim() // Handle "AUS Women, 2nd T20I"
        };
    }

    const commentary = lines
        .filter(l => ballRegex.test(l)) // Only process lines starting with "14.2" etc
        .map((line, i) => {
            const lower = line.toLowerCase();
            const isWicket = /\bout\b|wicket|caught|bowled|lbw|stumped/.test(lower);
            const isSix = /\bsix\b/.test(lower);
            const isFour = /\bfour\b|\bboundary\b/.test(lower) && !isSix;
            const isDot = /\bdot\b|no run/.test(lower);
            const isWide = /\bwide\b/.test(lower);
            const isNoball = /no.?ball/.test(lower);

            let runs = 0;
            if (isSix) runs = 6;
            else if (isFour) runs = 4;
            else if (isWide || isNoball) runs = 1; // Basic assumption, regex below refines it
            else if (!isWicket && !isDot) {
                const m = line.match(/\b([1-3])\s*run/i);
                if (m) runs = parseInt(m[1]);
            }

            // Extract ball number from start of line
            const ballMatch = line.match(/^(\d+)\.(\d+)/);
            const overNum = ballMatch ? parseInt(ballMatch[1]) + 1 : Math.floor(i / 6) + 1;
            const ballNum = ballMatch ? parseInt(ballMatch[2]) : (i % 6) + 1;

            return {
                ball: (overNum - 1) * 6 + ballNum,
                over: overNum,
                text: line,
                runs,
                is_wicket: isWicket,
                is_four: isFour,
                is_six: isSix,
                is_dot: isDot,
                is_drop: /dropped/.test(lower),
                is_noball: isNoball,
                is_wide: isWide,
                batter: "",
                bowler: "",
            };
        });

    return { commentary, match_info: matchInfo };
}

export default function CommentaryPaste({ onAnalyze, loading }: CommentaryPasteProps) {
    const [text, setText] = useState("");
    const [error, setError] = useState("");
    const [parsedCount, setParsedCount] = useState(0);

    const handleChange = (val: string) => {
        setText(val);
        setError("");
        // Count only valid ball lines
        const validLines = val.split("\n").filter(l => /^\d+(\.\d+)?\s+/.test(l.trim())).length;
        setParsedCount(validLines);
    };

    const handleAnalyze = async () => {
        if (!text.trim()) {
            setError("Please paste some commentary first");
            return;
        }
        const { commentary } = parseCommentaryText(text);
        if (commentary.length < 3) {
            setError("Need at least 3 balls of commentary");
            return;
        }
        setError("");
        await onAnalyze(commentary);
    };

    return (
        <div className="space-y-3">
            <p className="text-xs text-[var(--muted)]">
                Paste ball-by-ball commentary (one ball per line):
            </p>

            <textarea
                value={text}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={EXAMPLE}
                rows={8}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-[var(--primary)]/50 resize-none custom-scrollbar font-mono"
            />

            {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs">
                    <AlertCircle size={12} />
                    {error}
                </div>
            )}

            <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--muted)]">
                    {parsedCount > 0 ? `${parsedCount} balls detected` : "Paste commentary above"}
                </span>
                <button
                    onClick={handleAnalyze}
                    disabled={loading || parsedCount < 3}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary)]/80 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                    {loading ? "Analyzing..." : "Analyze"}
                </button>
            </div>
        </div>
    );
}
