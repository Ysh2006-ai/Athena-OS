import axios from 'axios';
import {
    MatchInfo,
    MatchEvent,
    EmotionalTimelineResponse,
    PlayerEmotionProfile,
    PredictionResponse,
    GamificationResponse,
    DivergenceResponse,
    EmotionPoint,
    KeyMoments
} from '@/types';
import { MOCK_TIMELINE_RESPONSE, MOCK_PLAYER_PROFILES } from './mockData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const AthenaAPI = {
    analyzeEmotion: async (matchInfo: MatchInfo, events: MatchEvent[]) => {
        try {
            const response = await api.post<EmotionalTimelineResponse>('/emotion/analyze', {
                request_id: crypto.randomUUID(),
                match_info: matchInfo,
                events: events
            });
            return response.data;
        } catch (error) {
            console.error("Emotion Analysis Error (Falling back to mock):", error);
            return MOCK_TIMELINE_RESPONSE;
        }
    },

    getPlayerProfiles: async (playerNames: string[], events: MatchEvent[], timeline: EmotionPoint[]) => {
        try {
            const response = await api.post<{ data: PlayerEmotionProfile[] }>('/players/profile', {
                request_id: crypto.randomUUID(),
                player_names: playerNames,
                events: events,
                emotional_timeline: timeline
            });
            return response.data.data;
        } catch (error) {
            console.error("Player Profile Error (Falling back to mock):", error);
            return MOCK_PLAYER_PROFILES;
        }
    },

    generateStory: async (type: string, tone: string, timeline: EmotionPoint[], moments: KeyMoments, players: string[], result: string, timestamp?: string, context?: string) => {
        try {
            // Call Next.js API Route (Gemini) instead of Backend
            const response = await axios.post('/api/story/generate', {
                timeline,
                matchContext: context
            });
            return response.data.data;
        } catch (error) {
            console.error("Story Gen Error:", error);
            throw error;
        }
    },

    predictTurn: async (timeline: EmotionPoint[]) => {
        try {
            const response = await api.post<{ data: PredictionResponse }>('/prediction/emotional-turn', {
                request_id: crypto.randomUUID(),
                current_timeline: timeline
            });
            return response.data.data;
        } catch (error) {
            console.error("Prediction Error:", error);
            throw error;
        }
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getFanGame: async (summary: Record<string, any>) => {
        try {
            const response = await api.post<{ data: GamificationResponse }>('/gamification/fan', {
                request_id: crypto.randomUUID(),
                timeline_summary: summary
            });
            return response.data.data;
        } catch (error) {
            console.error("Gamification Error:", error);
            throw error;
        }
    },

    getDivergenceAnalysis: async () => {
        try {
            const response = await api.get<{ data: DivergenceResponse }>('/gamification/divergence');
            return response.data.data;
        } catch (error) {
            console.error("Divergence API Error:", error);
            throw error;
        }
    }
};
