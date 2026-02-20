export interface MatchInfo {
    sport: string;
    category: string;
    teams: string[];
    venue: string;
    match_type: "T20" | "ODI" | "Test";
}

export interface MatchContext {
    runs_needed?: number;
    balls_remaining?: number;
    wickets_left?: number;
    innings?: number;
    current_score?: string;
}

export interface MatchEvent {
    timestamp: string;
    event_type: "WICKET" | "FOUR" | "SIX" | "DOT" | "DROP_CATCH" | "SINGLE" | "WIDE" | "NO_BALL" | "BOUNDARY";
    player: string;
    bowler?: string;
    commentary: string;
    match_context: MatchContext;
}

export interface EmotionPoint {
    timestamp: string;
    emotion_score: number;
    emotion_label: "Euphoria" | "High Positive" | "Positive" | "Neutral" | "Tense" | "Pressure" | "High Pressure" | "Heartbreak";
    context_weight: number;
    sentiment_raw: number;
}

export interface KeyMoments {
    turning_point?: EmotionPoint;
    collapse_moment?: EmotionPoint;
    comeback_zone?: EmotionPoint;
    highest_pressure?: EmotionPoint;
}

export interface EmotionalTimelineResponse {
    timeline: EmotionPoint[];
    key_moments: KeyMoments;
    summary_stats: Record<string, any>;
}

export interface PlayerEmotionProfile {
    player_name: string;
    average_emotion_impact: number;
    resilience_score: number;
    pressure_performance: "High" | "Medium" | "Low";
    clutch_moment_count: number;
    fan_favorite_score: number;
}

export interface StoryResponse {
    status: string;
    request_id: string;
    data: {
        story_text: string;
        highlight_players: string[];
        title: string;
        moment_label?: string;
        emotion_level?: string;
        confidence?: number;
        insights?: string[];
    }
}

export interface PredictionResponse {
    prediction: string;
    confidence: number;
    window: string;
    drivers: string[];
    spectrum_value: number;
    probabilities: Record<string, number>;
    what_if: string;
    model_training_stats: string;
    insight_fan: string;
    insight_analyst: string;
}

export interface GamificationResponse {
    questions: {
        id: string;
        text: string;
        options: string[];
        points: number;
    }[];
    reward_points: number;
}

export interface DivergenceResponse {
    divergence_score: number;
    bias_label: string;
    reasons: string[];
    recent_triggers: { event: string; impact: string }[];
    historical_accuracy: number;
}
