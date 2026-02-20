import { EmotionalTimelineResponse, PlayerEmotionProfile } from '@/types';

export const MOCK_TIMELINE_RESPONSE: EmotionalTimelineResponse = {
    timeline: [
        { timestamp: "1.1", emotion_score: 0.1, emotion_label: "Neutral", context_weight: 1.0, sentiment_raw: 0.1 },
        { timestamp: "1.2", emotion_score: 0.4, emotion_label: "Positive", context_weight: 1.2, sentiment_raw: 0.4 },
        { timestamp: "1.3", emotion_score: 0.2, emotion_label: "Neutral", context_weight: 1.0, sentiment_raw: 0.2 },
        { timestamp: "2.1", emotion_score: -0.5, emotion_label: "Tense", context_weight: 1.5, sentiment_raw: -0.5 },
        { timestamp: "2.4", emotion_score: 0.6, emotion_label: "High Positive", context_weight: 1.5, sentiment_raw: 0.6 },
        { timestamp: "3.2", emotion_score: -0.3, emotion_label: "Tense", context_weight: 1.2, sentiment_raw: -0.3 },
        { timestamp: "4.1", emotion_score: -0.8, emotion_label: "Pressure", context_weight: 1.8, sentiment_raw: -0.8 },
        { timestamp: "4.2", emotion_score: -0.4, emotion_label: "Tense", context_weight: 1.2, sentiment_raw: -0.4 },
        { timestamp: "14.2", emotion_score: -0.2, emotion_label: "Neutral", context_weight: 1.0, sentiment_raw: -0.2 },
        { timestamp: "15.4", emotion_score: 0.1, emotion_label: "Neutral", context_weight: 1.1, sentiment_raw: 0.1 },
        { timestamp: "18.1", emotion_score: -0.9, emotion_label: "Heartbreak", context_weight: 2.0, sentiment_raw: -0.9 },
        { timestamp: "18.5", emotion_score: 0.8, emotion_label: "Euphoria", context_weight: 2.0, sentiment_raw: 0.8 },
    ],
    key_moments: {
        highest_pressure: { timestamp: "18.1", emotion_score: -0.9, emotion_label: "Heartbreak", context_weight: 2.0, sentiment_raw: -0.9 },
        turning_point: { timestamp: "18.5", emotion_score: 0.8, emotion_label: "Euphoria", context_weight: 2.0, sentiment_raw: 0.8 }
    },
    summary_stats: {
        avg_intensity: 0.6,
        resilience: 0.7
    }
};

export const MOCK_PLAYER_PROFILES: PlayerEmotionProfile[] = [
    {
        player_name: "Smriti Mandhana",
        average_emotion_impact: 0.4,
        resilience_score: 0.8,
        pressure_performance: "High",
        clutch_moment_count: 2,
        fan_favorite_score: 0.9
    },
    {
        player_name: "Harmanpreet Kaur",
        average_emotion_impact: 0.7,
        resilience_score: 0.9,
        pressure_performance: "High",
        clutch_moment_count: 5,
        fan_favorite_score: 0.95
    },
    {
        player_name: "Ellyse Perry",
        average_emotion_impact: 0.6,
        resilience_score: 0.95,
        pressure_performance: "High",
        clutch_moment_count: 3,
        fan_favorite_score: 0.9
    },
    {
        player_name: "Richa Ghosh",
        average_emotion_impact: 0.85,
        resilience_score: 0.7,
        pressure_performance: "Medium",
        clutch_moment_count: 1,
        fan_favorite_score: 0.8
    }
];
