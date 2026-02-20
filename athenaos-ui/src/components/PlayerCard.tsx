import React from 'react';
import { PlayerEmotionProfile } from '@/types';
import { Shield, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
    profile: PlayerEmotionProfile;
    onClick?: () => void;
}

export default function PlayerCard({ profile: p, onClick }: Props) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
            }}
            whileHover={{ scale: 1.02, y: -4 }}
            onClick={onClick}
            className="group relative bg-slate-900/40 backdrop-blur-md transition-all p-6 rounded-2xl border border-white/5 hover:border-indigo-500/40 overflow-hidden cursor-pointer"
        >
            {/* Soft background glow */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br 
                ${p.player_name.includes('India') ? 'from-blue-500' : 'from-yellow-500'} to-transparent`}></div>

            <div className="flex items-start justify-between mb-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg
                        ${p.player_name.includes('India') ? 'bg-gradient-to-br from-blue-600 to-blue-400 shadow-blue-500/20' : 'bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-yellow-500/20'}
                        border border-white/10 group-hover:scale-105 transition-transform duration-300`}>
                        {p.player_name.charAt(0)}
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-xl leading-tight group-hover:text-indigo-300 transition-colors drop-shadow-sm">{p.player_name}</h4>
                        <div className="flex items-center gap-2 mt-1.5">
                            <Activity size={14} className="text-slate-500" />
                            <span className={`text-xs uppercase font-bold tracking-widest ${p.pressure_performance === 'High' ? 'text-green-400' : 'text-orange-400'}`}>
                                {p.pressure_performance} Pressure
                            </span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Impact</div>
                    <div className="text-3xl font-extrabold text-white leading-none drop-shadow-md">{p.average_emotion_impact}</div>
                </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800/50 relative z-10">
                <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                        <span className="flex items-center gap-1.5 font-medium"><Shield size={14} className="text-indigo-400" /> Resilience Score</span>
                        <span className="font-mono font-bold text-slate-300">{(p.resilience_score * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-slate-800/80 rounded-full overflow-hidden border border-white/5">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-[0_0_10px_rgba(99,102,241,0.5)] relative"
                            style={{ width: `${p.resilience_score * 100}%` }}
                        >
                            {/* Shine effect inside the bar */}
                            <div className="absolute top-0 bottom-0 left-0 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
