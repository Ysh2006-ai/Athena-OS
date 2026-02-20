"use client";

import { useState } from 'react';
import { Play, Pause, RotateCcw, FastForward, Rewind } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    replayTime: number;
    onTimeUpdate: (time: number) => void;
}

export default function EmotionReplay({ replayTime, onTimeUpdate }: Props) {
    const [isPlaying, setIsPlaying] = useState(false);

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        onTimeUpdate(Number(e.target.value));
    };

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-2xl z-40 animate-fade-in-up">

            {/* Header Label */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800/80 px-4 py-1 rounded-t-xl border border-b-0 border-slate-700 text-xs font-semibold text-slate-300 uppercase tracking-widest backdrop-blur-sm">
                Replay the Match’s Emotional Journey
            </div>

            <div className="flex items-center gap-4">
                {/* Controls */}
                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                        <Rewind size={20} />
                    </button>
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-3 bg-white text-black rounded-full hover:scale-105 transition-transform shadow-lg shadow-white/10"
                    >
                        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                        <FastForward size={20} />
                    </button>
                </div>

                {/* Timeline */}
                <div className="flex-1 relative">
                    <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold mb-1.5 px-1">
                        <span>Start (0.1)</span>
                        <span className="text-purple-400">Live Context Analysis</span>
                        <span>Now (18.5)</span>
                    </div>

                    {/* Custom Range Slider */}
                    <div className="relative h-6 flex items-center group">
                        <div className="absolute w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 rounded-full opacity-80"
                                style={{ width: `${replayTime}%` }}
                            />
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={replayTime}
                            onChange={handleSeek}
                            className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div
                            className="absolute h-4 w-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] pointer-events-none transition-transform group-hover:scale-125 border-2 border-purple-500"
                            style={{ left: `calc(${replayTime}% - 8px)` }}
                        />
                    </div>
                </div>

                <div className="text-right min-w-[60px]">
                    <div className="text-sm font-bold text-white font-mono">{(replayTime * 0.2).toFixed(1)}</div>
                    <div className="text-[10px] text-slate-400 uppercase">Over</div>
                </div>
            </div>
        </div>
    );
}
