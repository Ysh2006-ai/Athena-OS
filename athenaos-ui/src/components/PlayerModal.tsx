import React from 'react';
import { PlayerEmotionProfile } from '@/types';
import { motion } from 'framer-motion';
import { Shield, Activity, Share2, X, Trophy, Heart, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
    profile: PlayerEmotionProfile;
    onClose: () => void;
}

export default function PlayerModal({ profile: p, onClose }: Props) {
    const isIndia = p.player_name.includes('India');
    const themeColor = isIndia ? 'blue' : 'yellow';

    const handleShare = async () => {
        const shareData = {
            title: `AthenaOS Intelligence: ${p.player_name}`,
            text: `Check out ${p.player_name}'s live emotional intelligence profile on AthenaOS! Resilience: ${(p.resilience_score * 100).toFixed(0)}%`,
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                toast.success('Shared successfully!');
            } else {
                await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
                toast.success('Profile link copied to clipboard!');
            }
        } catch (err) {
            console.error('Error sharing', err);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                transition={{ type: "spring", duration: 0.5 }}
                className={`relative w-full max-w-lg overflow-hidden rounded-3xl bg-slate-900/80 backdrop-blur-2xl border border-white/10 shadow-2xl`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Background Glow */}
                <div className={`absolute -top-32 -right-32 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none ${isIndia ? 'bg-blue-500' : 'bg-yellow-500'}`}></div>

                {/* Header Section */}
                <div className="p-6 md:p-8 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-center gap-5 mb-8">
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white font-extrabold text-3xl shadow-xl border border-white/20
                            ${isIndia ? 'bg-gradient-to-br from-blue-600 to-blue-400 shadow-blue-500/30' : 'bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-yellow-500/30'}
                        `}>
                            {p.player_name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md">{p.player_name}</h2>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-widest bg-white/5 border border-white/10 ${p.pressure_performance === 'High' ? 'text-green-400' : 'text-orange-400'}`}>
                                    <Activity size={14} />
                                    {p.pressure_performance} Pressure
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {/* Impact */}
                        <div className="bg-slate-800/40 rounded-2xl p-4 border border-white/5 relative overflow-hidden group">
                            <div className={`absolute inset-0 bg-gradient-to-br ${isIndia ? 'from-blue-500/10' : 'from-yellow-500/10'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                                <Zap size={16} className={isIndia ? 'text-blue-400' : 'text-yellow-400'} />
                                <span className="text-xs uppercase font-bold tracking-widest">Impact Score</span>
                            </div>
                            <div className="text-4xl font-black text-white">{p.average_emotion_impact}</div>
                        </div>

                        {/* Clutch */}
                        <div className="bg-slate-800/40 rounded-2xl p-4 border border-white/5 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                                <Trophy size={16} className="text-purple-400" />
                                <span className="text-xs uppercase font-bold tracking-widest">Clutch Moments</span>
                            </div>
                            <div className="text-4xl font-black text-white">{p.clutch_moment_count}</div>
                        </div>

                        {/* Resilience (Full Width) */}
                        <div className="col-span-2 bg-slate-800/40 rounded-2xl p-5 border border-white/5">
                            <div className="flex justify-between items-end mb-3">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Shield size={16} className="text-cyan-400" />
                                    <span className="text-xs uppercase font-bold tracking-widest">Psychological Resilience</span>
                                </div>
                                <span className="text-xl font-bold text-white">{(p.resilience_score * 100).toFixed(0)}%</span>
                            </div>
                            <div className="h-3 bg-slate-900/80 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 shadow-[0_0_15px_rgba(6,182,212,0.5)] relative"
                                    style={{ width: `${p.resilience_score * 100}%` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Share Action */}
                    <div className="pt-6 border-t border-slate-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 px-3 py-1.5 rounded-lg">
                            <Heart size={14} className="text-pink-400 fill-pink-400/20" />
                            <span className="text-xs font-bold text-pink-300">{(p.fan_favorite_score * 100).toFixed(0)}% Fan Favorite</span>
                        </div>

                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold transition-all hover:scale-105 active:scale-95"
                        >
                            <Share2 size={16} />
                            Share Intel
                        </button>
                    </div>

                </div>
            </motion.div>
        </motion.div>
    );
}
