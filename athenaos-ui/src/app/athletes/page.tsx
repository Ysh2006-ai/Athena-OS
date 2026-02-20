"use client";

import React, { useEffect, useState } from 'react';
import PlayerCard from '@/components/PlayerCard';
import PlayerModal from '@/components/PlayerModal';
import { PlayerEmotionProfile } from '@/types';
import { Loader2 } from 'lucide-react';
import { MOCK_PLAYER_PROFILES } from '@/app/api/mockData';
import { motion, AnimatePresence } from 'framer-motion';

export default function AthletesPage() {
    const [profiles, setProfiles] = useState<PlayerEmotionProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlayer, setSelectedPlayer] = useState<PlayerEmotionProfile | null>(null);

    useEffect(() => {
        // Use mock profiles directly — the new backend focuses on match analysis
        // Player intelligence cards are demo data for the Athletes page
        setProfiles(MOCK_PLAYER_PROFILES as unknown as PlayerEmotionProfile[]);
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B0F19] flex h-[80vh] items-center justify-center">
                <Loader2 className="animate-spin text-indigo-500" size={48} />
                <span className="ml-4 text-slate-400 font-light">Loading Intelligence Profiles...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0F19] text-white selection:bg-indigo-500/30 relative">
            <div className="max-w-7xl mx-auto p-6 pb-20 pt-24">
                <header className="mb-14 text-center md:text-left">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-pink-500/30 bg-pink-500/10 backdrop-blur-md mb-6 shadow-[0_0_15px_rgba(236,72,153,0.15)]"
                    >
                        <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse"></span>
                        <span className="text-sm font-semibold text-pink-300 tracking-wide uppercase">Player Databank</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                        className="text-5xl font-extrabold text-white mb-4 drop-shadow-lg"
                    >
                        Athlete <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">Intelligence</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                        className="text-slate-400 text-lg max-w-2xl font-light mx-auto md:mx-0"
                    >
                        AthenaOS tracks psychological resilience, pressure performance, and emotional impact across an entire tournament.
                    </motion.p>
                </header>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: { transition: { staggerChildren: 0.1 } },
                        hidden: {}
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {profiles.map(p => (
                        <PlayerCard
                            key={p.player_name}
                            profile={p}
                            onClick={() => setSelectedPlayer(p)}
                        />
                    ))}
                </motion.div>

                {profiles.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-slate-500 mt-20 font-light"
                    >
                        No athlete data found.
                    </motion.div>
                )}
            </div>

            {/* Interactive Player Detail Modal Overlay */}
            <AnimatePresence>
                {selectedPlayer && (
                    <PlayerModal
                        profile={selectedPlayer}
                        onClose={() => setSelectedPlayer(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
