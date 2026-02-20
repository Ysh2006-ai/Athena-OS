"use client";

import { useEffect, useRef, useState } from 'react';
import { X, Minimize2, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    src?: string;
    poster?: string; // Added poster prop
    isPlaying: boolean;
    onTimeUpdate: (time: number) => void;
    onEnded?: () => void;
    className?: string;
}

export default function VideoPlayer({ src, poster, isPlaying, onTimeUpdate, onEnded, className }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    // Sync Play/Pause with Parent Prop
    useEffect(() => {
        if (!videoRef.current || !src) return;

        if (isPlaying) {
            videoRef.current.play().catch(e => console.error("Video Play Error:", e));
        } else {
            videoRef.current.pause();
        }
    }, [isPlaying, src]);

    // Handle Time Updates
    const handleTimeUpdate = () => {
        if (videoRef.current) {
            onTimeUpdate(videoRef.current.currentTime);
        }
    };

    if (!src || !isVisible) return null;

    return (
        <div
            className={cn(
                "fixed z-50 transition-all duration-300 shadow-2xl rounded-xl overflow-hidden border border-slate-700 bg-black",
                isMinimized ? "bottom-24 left-6 w-48" : "top-24 right-6 w-80",
                className
            )}
        >
            {/* Header Controls */}
            <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 hover:opacity-100 transition-opacity">
                <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-1 bg-black/50 text-white rounded hover:bg-black/80"
                >
                    {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                </button>
                <button
                    onClick={() => setIsVisible(false)}
                    className="p-1 bg-red-500/50 text-white rounded hover:bg-red-600"
                >
                    <X size={14} />
                </button>
            </div>

            {src ? (
                <video
                    ref={videoRef}
                    src={src}
                    poster={poster}
                    className="w-full h-full object-cover"
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={onEnded}
                    muted
                    playsInline
                />
            ) : (
                /* Simulation Mode Backdrop */
                <div className="relative w-full h-full">
                    {poster && (
                        <img
                            src={poster}
                            alt="Match Simulation"
                            className="w-full h-full object-cover opacity-60"
                        />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                        <span className="text-white/80 font-mono text-sm tracking-widest uppercase border border-white/20 px-3 py-1 rounded-full">
                            {isPlaying ? "LIVE SIMULATION" : "PAUSED"}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
