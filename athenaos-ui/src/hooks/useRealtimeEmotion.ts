import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { EmotionPoint } from '@/types';

export function useRealtimeEmotion(matchId: string) {
    const [d, setData] = useState<EmotionPoint[]>([]);
    const [rawData, setRawData] = useState<any[]>([]); // Raw events for advanced filtering
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!matchId) return;

        const q = query(
            collection(db, "emotion_timeline"),
            where("matchId", "==", matchId),
            orderBy("videoTime", "asc"),
            limit(100)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const points: EmotionPoint[] = [];
            const rawEvents: any[] = [];
            snapshot.forEach((doc) => {
                // Map Firestore doc to EmotionPoint
                const data = doc.data();
                points.push({
                    timestamp: data.over ? data.over.toString() : (data.videoTime || 0).toString(),
                    emotion_score: data.emotion_score,
                    emotion_label: data.emotion_label,
                    context_weight: 1, // Default for realtime
                    sentiment_raw: data.emotion_score // Default
                });

                // Add raw event data extraction for flexibility
                rawEvents.push({
                    playerId: data.playerId,
                    emotion_score: data.emotion_score,
                    videoTime: data.videoTime
                });
            });
            setData(points);
            setRawData(rawEvents);
            setLoading(false);
        }, (error) => {
            console.error("Firestore Listener Error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [matchId]);

    return { realtimeData: d, rawData, loading };
}
