'use client';

import React, { useState } from 'react';
import { auth } from '@/lib/firebase';
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface AuthCardProps {
    mode: 'login' | 'signup';
}

export default function AuthCard({ mode }: AuthCardProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [linkSent, setLinkSent] = useState(false);

    React.useEffect(() => {
        // Check if this is a sign-in email link
        if (isSignInWithEmailLink(auth, window.location.href)) {
            let emailForSignIn = window.localStorage.getItem('emailForSignIn');
            if (!emailForSignIn) {
                // If email is not in local storage, ask the user for it
                emailForSignIn = window.prompt('Please provide your email for confirmation');
            }

            if (emailForSignIn) {
                setLoading(true);
                signInWithEmailLink(auth, emailForSignIn, window.location.href)
                    .then((result) => {
                        window.localStorage.removeItem('emailForSignIn');
                        toast.success("Successfully signed in!");
                        router.push('/dashboard');
                    })
                    .catch((error) => {
                        console.error("Link Auth Error:", error);
                        toast.error("Error signing in with link. Link might be expired.");
                        setLoading(false);
                    });
            }
        }
    }, [router]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const actionCodeSettings = {
            // URL you want to redirect back to. The domain (www.example.com) for this
            // URL must be in the authorized domains list in the Firebase Console.
            url: window.location.origin + '/auth/login', // Use dynamic origin or hardcode appropriate url
            handleCodeInApp: true,
        };

        try {
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            window.localStorage.setItem('emailForSignIn', email);
            setLinkSent(true);

            if (mode === 'signup' && name) {
                // Determine how to store the name. 
                // Since we can't update profile before signing in, and we sign in only after clicking link,
                // we might need to store it locally and update after sign in, or rely on user updating it later.
                // For now, let's just save it to local storage to retrieve after login if needed.
                window.localStorage.setItem('tempNameForSignup', name);
            }

            toast.success("Magic link sent! Check your inbox.");
        } catch (error: any) {
            console.error("Auth Error:", error);
            let message = "Failed to send login link.";
            if (error.code === 'auth/invalid-email') message = "Invalid email address.";
            toast.error(message);
            setLoading(false);
        }
    };

    if (linkSent) {
        return (
            <div className="w-full max-w-md bg-[#0f1115]/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl text-center">
                <div className="mb-6 flex justify-center">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-500/30">
                        <Loader2 className="animate-pulse text-purple-400" size={32} />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Check your inbox</h2>
                <p className="text-slate-400 mb-8">
                    We've sent a magic link to <span className="text-white font-medium">{email}</span>.
                    Click the link to access AthenaOS.
                </p>
                <button
                    onClick={() => setLinkSent(false)}
                    className="text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                    Use a different email
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md bg-[#0f1115]/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-white mb-2">
                    {mode === 'login' ? 'Mission Control' : 'Join AthenaOS'}
                </h2>
                <p className="text-slate-400 text-sm">
                    {mode === 'login'
                        ? 'Enter your email to receive a secure access link.'
                        : 'Create your account to start analyzing match data.'
                    }
                </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
                {mode === 'signup' && (
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder="e.g. Ellyse Perry"
                            required
                        />
                    </div>
                )}

                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="analyst@team.com"
                        required
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                {mode === 'login' ? 'Send Magic Link' : 'Initialize Account'}
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
                {mode === 'login' ? (
                    <>
                        New to AthenaOS?{' '}
                        <Link href="/auth/signup" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                            Request Access
                        </Link>
                    </>
                ) : (
                    <>
                        Already have access?{' '}
                        <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                            Sign In
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
