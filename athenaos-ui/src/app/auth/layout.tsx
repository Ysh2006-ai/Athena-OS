import React from 'react';
import CricketLoader3D from '@/components/loader/CricketLoader3D';
import { Trophy } from 'lucide-react';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#05050a] flex flex-col md:flex-row text-white overflow-hidden">
            {/* Left Column: Brand & 3D Experience (Sticky/Fixed on Desktop) */}
            <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-between relative bg-gradient-to-br from-[#0f1115] to-[#05050a]">

                {/* Branding */}
                <div className="z-10">
                    <div className="flex items-center gap-2 mb-6">
                        <Trophy size={28} className="text-purple-500" />
                        <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
                            AthenaOS
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 text-white">
                        Athlete Emotional <br />
                        <span className="text-slate-500">Intelligence Platform</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-md">
                        The world's first AI engine dedicated to decoding pressure, resilience, and momentum in ICC Women's Cricket.
                    </p>
                </div>

                {/* 3D Loader Container */}
                <div className="absolute inset-0 flex items-center justify-center opacity-80 pointer-events-none">
                    <CricketLoader3D />
                </div>

                {/* Footer/Context */}
                <div className="z-10 text-xs text-slate-600 font-mono">
                    SYSTEM STATUS: ONLINE <br />
                    VERSION: 2.5.0-BETA
                </div>
            </div>

            {/* Right Column: Auth Card (Scrollable if needed) */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-[#05050a] relative">
                {/* Background ambient glow */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="w-full max-w-md z-10">
                    {children}
                </div>
            </div>
        </div>
    );
}
