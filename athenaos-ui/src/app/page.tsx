"use client";

import Link from "next/link";
import { ArrowRight, Activity, Brain, TrendingUp, Play } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

import dynamic from 'next/dynamic';
import { motion } from "framer-motion";

const HeroScene = dynamic(() => import('@/components/HeroScene'), { ssr: false });

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden relative">
      <HeroScene />
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-32 relative z-10">

        {/* HERO SECTION */}
        <section className="text-center max-w-4xl mx-auto mb-32 space-y-8 mt-12">

          {/* Tagline */}

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-white drop-shadow-2xl"
          >
            AthenaOS — Real-time Emotional Intelligence for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Elite Sports Experience</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md"
          >
            Measure pressure, resilience, and momentum to uncover the psychological story behind every match.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 relative group"
          >
            {/* Animated Glow Background behind the button */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-xl blur-xl opacity-20 group-hover:opacity-60 transition-opacity duration-500 animate-pulse"></div>

            <Link
              href={user ? "/dashboard" : "/auth/login"}
              className="relative px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300 flex items-center gap-3 overflow-hidden group/btn shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95"
            >
              {/* Shine effect overlay */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/btn:translate-x-[150%] duration-1000 transition-transform ease-in-out"></div>
              <Play size={20} fill="currentColor" className="text-cyan-400 group-hover/btn:scale-110 transition-transform" />
              Launch Live Dashboard
            </Link>
          </motion.div>
        </section>


        {/* LIVE MATCH CARDS */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-32"
        >
          {/* Card 2 - Now Premium Glass */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="md:col-span-2 mx-auto w-full max-w-xl group relative bg-slate-900/40 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all duration-500 overflow-hidden"
          >
            {/* Subtle glow orb inside card */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/40 transition-colors duration-500"></div>

            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30">
                  <Activity size={14} className="text-indigo-400" />
                  {/* Ping effect */}
                  <div className="absolute inset-0 rounded-full border border-indigo-400 animate-ping opacity-20"></div>
                </div>
                <span className="text-xs font-bold tracking-widest text-indigo-300 uppercase letter-spacing-2">Live Stream Active</span>
              </div>

              {/* Fake Audio/Data animation bars */}
              <div className="flex items-end gap-[3px] h-4">
                <span className="w-1 bg-cyan-400 rounded-full animate-pulse blur-[1px]"></span>
                <span className="w-1 bg-cyan-400 rounded-full animate-pulse delay-75 blur-[1px]"></span>
                <span className="w-1 bg-cyan-400 rounded-full animate-pulse delay-150 blur-[1px]"></span>
                <span className="w-1 bg-cyan-400 rounded-full animate-pulse delay-300 blur-[1px]"></span>
              </div>
            </div>

            <h3 className="text-3xl font-extrabold text-white mb-2 relative z-10 drop-shadow-md">Match Emotional Timeline</h3>
            <p className="text-slate-300 relative z-10 font-light">Detecting pressure spikes & momentum shifts in real-time...</p>
          </motion.div>
        </motion.section>

        {/* FEATURES SECTION */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.2 } },
            hidden: {}
          }}
          className="max-w-6xl mx-auto border-t border-slate-800/50 pt-20"
        >
          <div className="mb-14 text-center md:text-left">
            <motion.h2
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
              className="text-4xl font-extrabold text-white mb-3"
            >
              Turning <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-400">Emotion</span> Into Data.
            </motion.h2>
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
              className="text-lg text-slate-400 font-light"
            >
              Beyond the scoreboard—quantifying the intangible.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Value 1 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="relative bg-slate-900/40 backdrop-blur-md border border-white/5 p-8 rounded-2xl hover:border-indigo-500/30 transition-all duration-300 group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(99,102,241,0.1)] group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all duration-500">
                <Brain className="text-indigo-400 group-hover:text-indigo-300" size={26} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-100 transition-colors">Emotional Engine</h3>
              <p className="text-slate-400 leading-relaxed font-light relative z-10">
                Real-time emotional modeling from match events and commentary, calculating impact scores for every ball.
              </p>
            </motion.div>

            {/* Value 2 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="relative bg-slate-900/40 backdrop-blur-md border border-white/5 p-8 rounded-2xl hover:border-cyan-500/30 transition-all duration-300 group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(6,182,212,0.1)] group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all duration-500">
                <Activity className="text-cyan-400 group-hover:text-cyan-300" size={26} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-100 transition-colors">Athlete Intelligence</h3>
              <p className="text-slate-400 leading-relaxed font-light relative z-10">
                Tracks resilience, volatility, and pressure response per player to identify clutch performers.
              </p>
            </motion.div>

            {/* Value 3 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="relative bg-slate-900/40 backdrop-blur-md border border-white/5 p-8 rounded-2xl hover:border-pink-500/30 transition-all duration-300 group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-14 h-14 bg-pink-500/10 border border-pink-500/20 rounded-xl flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(236,72,153,0.1)] group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(236,72,153,0.4)] transition-all duration-500">
                <TrendingUp className="text-pink-400 group-hover:text-pink-300" size={26} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-pink-100 transition-colors">Momentum Insights</h3>
              <p className="text-slate-400 leading-relaxed font-light relative z-10">
                Identifies collapse risk, comebacks, and psychological turning points before they happen.
              </p>
            </motion.div>
          </div>
        </motion.section>

      </main>
    </div>
  );
}
