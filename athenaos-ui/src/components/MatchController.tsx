"use client";

import { useEffect, useState, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, getDocs, writeBatch, where } from 'firebase/firestore';
import matchEvents from '@/data/matchEvents.json';
import players from '@/data/players.json';
import { calculatePlayerEmotion, getEmotionLabel } from '@/lib/emotionEngine';
import { Play, Pause, RotateCcw, Activity } from 'lucide-react';
import { toast } from 'sonner';
import VideoPlayer from './VideoPlayer';

const MATCH_ID = "demo_match_001";

// Optional: Provide a demo video URL (or leave undefined to test timer fallback)
// Enable Video Sync
// Place a file named 'demo.mp4' in your 'public' folder to see it work!
const DEMO_VIDEO_SRC = undefined; // Using Timer Fallback with Image for MVP Concept
// const DEMO_VIDEO_SRC = "/demo.mp4"; // Production Path

export default function MatchController() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);

    // Core Engine State
    const processedEvents = useRef<Set<number>>(new Set());
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // --- REPLAY LOGIC ---
    const handleReplay = async () => {
        stopController();
        setCurrentTime(0);
        processedEvents.current.clear();

        try {
            console.log(`[AthenaOS] Resetting Match: ${MATCH_ID}`);

            // Batch Delete Firestore Docs
            const q = query(collection(db, "emotion_timeline"), where("matchId", "==", MATCH_ID));
            const snapshot = await getDocs(q);
            const batch = writeBatch(db);
            snapshot.docs.forEach((doc) => batch.delete(doc.ref));
            await batch.commit();

            toast.success("Match Reset & Database Wiped");
            startController(); // Auto-restart

        } catch (error) {
            console.error("Reset Failed:", error);
            toast.error("Reset Failed");
        }
    };

    // --- PLAY/PAUSE LOGIC ---
    const togglePlay = () => isPlaying ? stopController() : startController();

    const startController = () => {
        setIsPlaying(true);
        if (!DEMO_VIDEO_SRC) {
            // Start Fallback Timer
            if (timerRef.current) return;
            timerRef.current = setInterval(() => {
                setCurrentTime(prev => {
                    const newTime = prev + 1;
                    processTimeStep(newTime);
                    return newTime;
                });
            }, 1000);
        }
    };

    const stopController = () => {
        setIsPlaying(false);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    // --- SYNC ENGINE (Video or Timer calls this) ---
    const handleTimeUpdate = (time: number) => {
        // If we have video, this is called by VideoPlayer.
        // We sync our local state and process logic.
        setCurrentTime(time);
        processTimeStep(time);
    };

    const processTimeStep = async (time: number) => {
        // Floor time to match integer seconds in JSON
        const timeSec = Math.floor(time);

        // Find events in this second window (0.5s tolerance)
        const events = matchEvents.filter(e => Math.abs(e.time - timeSec) < 0.5);

        for (const event of events) {
            const eventKey = event.time; // Unique ID

            if (!processedEvents.current.has(eventKey)) {
                // Prevent duplicate processing
                processedEvents.current.add(eventKey);
                console.log(`[AthenaOS] Event: ${event.event} at ${timeSec}s`);

                // Player Intelligence Lookup
                // @ts-ignore
                const player = players.find(p => p.playerId === event.playerId);

                // Emotion Rules
                // @ts-ignore
                const score = calculatePlayerEmotion(event.event, player, event.pressureLevel);

                // Firestore Push
                await addDoc(collection(db, "emotion_timeline"), {
                    matchId: MATCH_ID,
                    videoTime: timeSec, // Sync Key
                    // @ts-ignore
                    over: event.over,
                    // @ts-ignore
                    event: event.event,
                    // @ts-ignore
                    playerId: event.playerId,
                    // @ts-ignore
                    pressureLevel: event.pressureLevel,
                    emotion_score: score,
                    emotion_label: getEmotionLabel(score),
                    created_at: serverTimestamp()
                });
            }
        }
    };

    // Cleanup
    useEffect(() => {
        return () => stopController();
    }, []);

    return (
        <>
            {/* Visual Layer (Optional) */}
            <VideoPlayer
                src={DEMO_VIDEO_SRC}
                poster="/poster.png"
                isPlaying={isPlaying}
                onTimeUpdate={handleTimeUpdate}
            />

            {/* Controller UI */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 group">
                <div className="bg-slate-900/90 backdrop-blur border border-slate-700 p-3 rounded-xl shadow-2xl flex items-center gap-4 transition-all hover:scale-105">

                    {/* Time Display */}
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">
                            {DEMO_VIDEO_SRC ? "Video Time" : "Sim Time"}
                        </span>
                        <span className="text-xl font-bold text-white font-mono w-[60px]">
                            {Math.floor(currentTime / 60)}:{(Math.floor(currentTime) % 60).toString().padStart(2, '0')}
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
                        <span className="text-xs font-medium text-green-400">
                            {DEMO_VIDEO_SRC ? 'Syncing Video...' : 'Simulating Live...'}
                        </span>
                    </div>
                )}
            </div>
        </>
    );
}
