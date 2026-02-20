'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth(); // Use the hook

    return (
        <nav className="w-full bg-[#0B0F19] border-b border-slate-800/50 h-[80px] sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
            <div className="max-w-7xl mx-auto h-full px-6 flex justify-between items-center">
                {/* Branding */}
                <div className="flex flex-col">
                    <Link href="/" className="text-2xl font-bold text-white tracking-tight">
                        AthenaOS
                    </Link>
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">
                        Performance Intelligence Platform
                    </span>
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-8">
                    {user && (
                        <div className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
                            <Link href="/dashboard" className="hover:text-white transition-colors duration-300">Dashboard</Link>
                            <Link href="/athletes" className="hover:text-white transition-colors duration-300">Athletes</Link>
                            <Link href="/stories" className="hover:text-white transition-colors duration-300">Stories</Link>
                        </div>
                    )}

                    <div className="hidden md:flex items-center gap-4 pl-6 border-l border-slate-800/50">
                        {!user ? (
                            <>
                                <Link href="/auth/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors duration-300">
                                    Sign In
                                </Link>
                                <Link href="/auth/signup" className="text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-full transition-all duration-300 shadow-[0_0_15px_-3px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_-3px_rgba(99,102,241,0.5)]">
                                    Sign Up
                                </Link>
                            </>
                        ) : (
                            <button
                                onClick={logout}
                                className="text-sm font-medium text-slate-400 hover:text-white transition-colors duration-300"
                            >
                                Sign Out
                            </button>
                        )}
                    </div>


                </div>
            </div>
        </nav>
    );
}
