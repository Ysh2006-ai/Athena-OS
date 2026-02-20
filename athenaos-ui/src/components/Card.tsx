import { ReactNode, useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { HelpCircle, X } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CardProps {
    children: ReactNode;
    className?: string;
    title?: string;
    explanation?: {
        factors: { label: string; value: string; impact: 'positive' | 'negative' | 'neutral' }[];
        confidence: number;
    };
}

export default function Card({ children, className, title, explanation }: CardProps) {
    const [showExplain, setShowExplain] = useState(false);

    return (
        <div className={cn("relative bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm overflow-hidden group", className)}>
            <div className="flex justify-between items-start mb-4">
                {title && (
                    <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
                )}
                {explanation && (
                    <button
                        onClick={() => setShowExplain(!showExplain)}
                        className="text-slate-400 hover:text-purple-400 transition-colors"
                        title="Explain this metric"
                    >
                        <HelpCircle size={18} />
                    </button>
                )}
            </div>

            <div className="relative z-10">
                {children}
            </div>

            {/* Explainability Drawer */}
            <div className={cn(
                "absolute inset-0 bg-slate-900/95 z-20 transition-transform duration-300 ease-in-out p-6 flex flex-col",
                showExplain ? "translate-y-0" : "translate-y-full"
            )}>
                <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-purple-400">Why this score?</h4>
                    <button onClick={() => setShowExplain(false)} className="text-slate-400 hover:text-white">
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-3 overflow-y-auto">
                    {explanation?.factors.map((factor, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="text-slate-300">{factor.label}</span>
                            <span className={cn(
                                "font-mono font-bold",
                                factor.impact === 'positive' ? "text-green-400" :
                                    factor.impact === 'negative' ? "text-red-400" : "text-slate-400"
                            )}>
                                {factor.value}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-auto pt-4 border-t border-slate-700">
                    <div className="flex justify-between items-center text-xs text-slate-400">
                        <span>Confidence Score</span>
                        <span className="text-purple-400 font-bold">{explanation?.confidence}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 mt-1 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-purple-500"
                            style={{ width: `${explanation?.confidence}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

