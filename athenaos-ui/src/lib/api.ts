/**
 * AthenaOS API Client
 * Typed client for the FastAPI backend at http://localhost:8000
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MatchInfo {
    match_id: string;
    title: string;
    team_batting: string;
    team_bowling: string;
    venue: string;
    date: string;
    format: string;
    description: string;
    target?: number;
}

export interface BallData {
    ball_number: number;
    over: number;
    text: string;
    runs: number;
    is_wicket: boolean;
    is_four: boolean;
    is_six: boolean;
    batter: string;
    bowler: string;
    emotion_score: number;
    emotion_score_bowling: number;
    pressure: number;
    momentum: number;
    phase: string;
}

export interface CollapseRisk {
    percentage: number;
    level: "low" | "medium" | "high" | "critical";
    reasons: string[];
}

export interface BatterCard {
    name: string;
    runs: number;
    balls: number;
    strike_rate: number;
    fours: number;
    sixes: number;
    dots: number;
    avg_emotion: number;
    peak_emotion: number;
    resilience: number;
    clutch_rating: string;
    emotional_profile: string;
}

export interface KeyMoment {
    ball_number: number;
    over: number;
    ball_in_over: number;
    description: string;
    emotion_score: number;
    event_type: "wicket" | "six" | "boundary" | "drop" | "high_emotion" | "normal";
    batter: string;
    bowler: string;
}

export interface EmotionalPhase {
    name: string;
    over_start: number;
    over_end: number;
    avg_et: number;
    peak_et: number;
    key_event: string;
}

export interface HeatmapEntry {
    over: number;
    avg_emotion: number;
    peak_emotion: number;
    avg_emotion_bowling: number;
    peak_emotion_bowling: number;
    runs: number;
    wickets: number;
    intensity: "low" | "medium" | "high" | "extreme";
    intensity_bowling: "low" | "medium" | "high" | "extreme";
}

export interface MomentumShift {
    ball_number: number;
    over: number;
    from: number;
    to: number;
    description: string;
}

export interface MatchAnalysis {
    match_info: MatchInfo;
    summary: {
        avg_emotion: number;
        peak_emotion: number;
        avg_emotion_bowling: number;
        peak_emotion_bowling: number;
        avg_pressure: number;
        momentum_shifts: number;
        total_balls: number;
        wickets_fallen: number;
        runs_scored: number;
    };
    ball_by_ball: BallData[];
    current_state: {
        emotion_score: number;
        pressure: number;
        momentum: number;
        phase: string;
        collapse_risk: CollapseRisk;
        batter_cards: BatterCard[];
    };
    key_moments: KeyMoment[];
    emotional_phases: EmotionalPhase[];
    emotional_phases_bowling: EmotionalPhase[];
    heatmap: HeatmapEntry[];
    momentum_shifts: MomentumShift[];
}

// ─── API Functions ────────────────────────────────────────────────────────────

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(error.detail || `API error ${res.status}`);
    }
    return res.json();
}

export const AthenaAPI = {
    /** Health check */
    health: () => fetchAPI<{ status: string }>("/health"),

    /** List all pre-loaded matches */
    listMatches: () => fetchAPI<{ matches: MatchInfo[] }>("/matches"),

    /** Analyze a pre-loaded match */
    analyzePreloaded: (matchId: string) =>
        fetchAPI<MatchAnalysis>("/analyze/preloaded", {
            method: "POST",
            body: JSON.stringify({ match_id: matchId }),
        }),

    /** Analyze pasted commentary */
    analyzeCommentary: (commentary: object[], matchInfo?: object) =>
        fetchAPI<MatchAnalysis>("/analyze/commentary", {
            method: "POST",
            body: JSON.stringify({ commentary, match_info: matchInfo }),
        }),

    /** Analyze from ESPN URL */
    analyzeURL: (url: string) =>
        fetchAPI<MatchAnalysis>("/analyze/url", {
            method: "POST",
            body: JSON.stringify({ url }),
        }),

    /** Analyze uploaded video */
    analyzeVideo: async (file: File): Promise<MatchAnalysis> => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(`${BASE_URL}/analyze/video`, {
            method: "POST",
            body: formData,
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({ detail: res.statusText }));
            throw new Error(error.detail || `API error ${res.status}`);
        }
        return res.json();
    },

    /** RAG chatbot */
    chat: (message: string, matchId?: string, history?: { role: string; content: string }[]) =>
        fetchAPI<{ response: string; match_id?: string }>("/chat", {
            method: "POST",
            body: JSON.stringify({ message, match_id: matchId, history }),
        }),

    /** Generate AI story + report */
    generateReport: (matchId: string) =>
        fetchAPI<{ story: string; match_data: MatchAnalysis }>("/report/generate", {
            method: "POST",
            body: JSON.stringify({ match_id: matchId }),
        }),
};
