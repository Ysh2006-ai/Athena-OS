"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, getDocs, writeBatch, where } from 'firebase/firestore';
import matchEvents from '@/data/matchEvents.json';
import { calculateEmotionScore, getEmotionLabel } from '@/lib/emotionEngine';
import { Play, Pause, RotateCcw, Activity } from 'lucide-react';
import { toast } from 'sonner';

const MATCH_ID = "demo_match_001";

export default function MatchSimulator() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [videoTime, setVideoTime] = useState(0);

    // Refs for mutable state without re-renders during high-freq ticks
    const processedEvents = useRef<Set<number>>(new Set());
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // TASK 2: REPLAY (Wipe & Reset)
    const handleReplay = async () => {
        // 1. Stop Playback
        stopSimulation();

        // 2. Reset States
        setVideoTime(0);
        processedEvents.current.clear();

        try {
            console.log(`[AthenaOS] Resetting Match: ${MATCH_ID}...`);

            // 4. DELETE all Firestore documents for current matchId
            const q = query(
                collection(db, "emotion_timeline"),
                where("matchId", "==", MATCH_ID) // Using camelCase schema
            );

            const snapshot = await getDocs(q);

            // Firestore Batch Limit is 500. For a demo, one batch is usually enough.
            // For production, we would loop chunks of 500.
            const batch = writeBatch(db);
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });

            await batch.commit();
            console.log("[AthenaOS] Cleanup Complete. Database Wiped.");
            toast.success("Match Reset & Database Wiped");

            // 6. Restart playback automatically
            startSimulation();

        } catch (error) {
            console.error("Reset Failed:", error);
            toast.error("Failed to reset match database");
        }
    };

    // TASK 1: PLAY (Simulation Logic)
    const startSimulation = () => {
        if (timerRef.current) return;
        setIsPlaying(true);

        timerRef.current = setInterval(() => {
            setVideoTime((prevTime) => {
                const newTime = prevTime + 1;
                processTimeStep(newTime);
                return newTime;
            });
        }, 1000); // 1 Real Second = 1 Video Second
    };

    const stopSimulation = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setIsPlaying(false);
    };

    const togglePlay = () => {
        if (isPlaying) {
            stopSimulation();
        } else {
            startSimulation();
        }
    };

    const processTimeStep = async (currentTime: number) => {
        // Match current time against predefined events
        // Optimization: Create a map if array is large, but for <500 items, find is fine.
        const matches = matchEvents.filter(e =>
            // Allow a small window if needed, but for 1s ticks, exact second matching is safest
            Math.floor(e.time) === currentTime
        );

        for (const event of matches) {
            // RULE: DO NOT push duplicate events
            // We use the event's index or unique combo as a key
            const eventId = event.time; // Using time as unique key for demo simplicity

            if (!processedEvents.current.has(eventId)) {
                console.log(`[AthenaOS] Event Triggered @ ${currentTime}s:`, event.event);

                // Mark processed immediately to prevent race conditions
                processedEvents.current.add(eventId);

                const score = calculateEmotionScore(event.event, true); // deterministic

                // Push to Firestore
                await addDoc(collection(db, "emotion_timeline"), {
                    matchId: MATCH_ID,
                    videoTime: currentTime,
                    over: event.over, // Added missing field
                    event: event.event,
                    emotion_score: score,
                    emotion_label: getEmotionLabel(score),
                    created_at: serverTimestamp()
                });
            }
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => stopSimulation();
    }, []);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 group">
            <div className="bg-slate-900/90 backdrop-blur border border-slate-700 p-3 rounded-xl shadow-2xl flex items-center gap-4 transition-all hover:scale-105">

                {/* Time Display */}
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Match Time</span>
                    <span className="text-xl font-bold text-white font-mono w-[60px]">
                        {Math.floor(videoTime / 60)}:{(videoTime % 60).toString().padStart(2, '0')}
                    </span>
                </div>

                <div className="h-8 w-[1px] bg-slate-700" />

                {/* Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={togglePlay}
                        className={`p-3 rounded-full transition-all shadow-lg ${isPlaying
                            ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30'
                            : 'bg-green-600 text-white hover:bg-green-500 hover:scale-110'
                            }`}
                    >
                        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                    </button>

                    <button
                        onClick={handleReplay}
                        className="p-3 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all hover:rotate-180"
                        title="Reset & Replay Match"
                    >
                        <RotateCcw size={20} />
                    </button>
                </div>
            </div>

            {/* Status Indicator */}
            {isPlaying && (
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full animate-pulse">
                    <Activity size={12} className="text-green-500" />
                    <span className="text-xs font-medium text-green-400">Live Simulation Active</span>
                </div>
            )}
        </div>
    );
}
