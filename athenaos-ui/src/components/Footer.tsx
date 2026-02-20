import Link from "next/link";
import { Twitter, Linkedin, Instagram, Activity } from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[#0B0F19] text-slate-300 py-16 px-6 border-t border-slate-800/50 relative z-10 w-full">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

                {/* Brand & Mission Column */}
                <div className="md:col-span-1">
                    <Link href="/" className="inline-block mb-4">
                        <h2 className="text-2xl font-bold text-white tracking-tight">Athena<span className="text-indigo-400">OS</span></h2>
                    </Link>
                    <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                        Emotional Intelligence for Elite Cricket. We measure pressure, resilience, and momentum to uncover the psychological story behind every match.
                    </p>
                    <div className="flex items-center gap-4">
                        <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-500/20 hover:text-indigo-400 transition-colors">
                            <Twitter size={18} />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-cyan-500/20 hover:text-cyan-400 transition-colors">
                            <Linkedin size={18} />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-pink-500/20 hover:text-pink-400 transition-colors">
                            <Instagram size={18} />
                        </a>
                    </div>
                </div>

                {/* Platform Links */}
                <div>
                    <h3 className="text-white font-semibold mb-6">Platform</h3>
                    <ul className="space-y-4 text-sm">
                        <li><Link href="/features" className="hover:text-cyan-400 transition-colors">Core Features</Link></li>
                        <li><Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Live Dashboard</Link></li>
                        <li><Link href="/analysis" className="hover:text-cyan-400 transition-colors">Match Analysis</Link></li>
                        <li><Link href="/athletes" className="hover:text-cyan-400 transition-colors">Athlete Intelligence</Link></li>
                    </ul>
                </div>

                {/* Company Links */}
                <div>
                    <h3 className="text-white font-semibold mb-6">Company</h3>
                    <ul className="space-y-4 text-sm">
                        <li><Link href="/about" className="hover:text-indigo-400 transition-colors">About Us</Link></li>
                        <li><Link href="/careers" className="hover:text-indigo-400 transition-colors">Careers</Link></li>
                        <li><Link href="/contact" className="hover:text-indigo-400 transition-colors">Contact</Link></li>
                        <li><Link href="/blog" className="hover:text-indigo-400 transition-colors">Blog & Insights</Link></li>
                    </ul>
                </div>

                {/* Legal Links */}
                <div>
                    <h3 className="text-white font-semibold mb-6">Legal</h3>
                    <ul className="space-y-4 text-sm">
                        <li><Link href="/privacy" className="hover:text-slate-100 transition-colors">Privacy Policy</Link></li>
                        <li><Link href="/terms" className="hover:text-slate-100 transition-colors">Terms of Service</Link></li>
                        <li><Link href="/cookies" className="hover:text-slate-100 transition-colors">Cookie Policy</Link></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800/50 flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                    <Activity size={14} className="text-indigo-500/50" />
                    <p className="text-slate-500 text-xs font-medium">Built for high-performance sports analytics</p>
                </div>

                <p className="text-slate-600 text-xs text-center">
                    © {currentYear} AthenaOS Intelligence Platform. All rights reserved.
                </p>

                <div className="flex items-center gap-4 text-slate-500 text-xs font-bold tracking-[0.5em]">
                    <span>BCCI</span>
                    <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                    <span>ICC</span>
                </div>
            </div>
        </footer>
    );
}
