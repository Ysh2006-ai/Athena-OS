"use client";
import { useEffect, useState } from 'react';
import Card from './Card';
import { AthenaAPI } from '@/app/api/athena';
import { Users, TrendingUp, AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';
import { DivergenceResponse } from '@/types';

export default function CollectiveSentiment() {
    const [data, setData] = useState<DivergenceResponse | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await AthenaAPI.getDivergenceAnalysis();
                setData(res);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);

    if (!data) return null;

    return (
        <Card title="Fan Zone Consensus" className="h-auto">
            <div className="space-y-3">

                {/* Fan Prediction Stat - Compact */}
                <div className="flex items-center justify-between p-2.5 bg-slate-900/50 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-2">
                        <div className="bg-purple-500/10 p-1.5 rounded-full">
                            <Users className="text-purple-400" size={16} />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Fans Predict</p>
                            <p className="text-slate-200 text-xs font-medium">Momentum Shift</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-bold text-white">78%</p>
                    </div>
                </div>

                {/* AI vs Crowd Delta - Compact */}
                <div>
                    <div className="flex justify-between items-center mb-1.5">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Reality Check</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-bold scale-90 origin-right ${data.bias_label.includes("Optimism") ? 'text-orange-400 bg-orange-400/10 border-orange-400/20' :
                            'text-slate-400 bg-slate-800 border-slate-700'
                            }`}>
                            {data.bias_label}
                        </span>
                    </div>

                    <div className="relative pt-4 pb-1">
                        {/* Track */}
                        <div className="h-1.5 w-full bg-slate-800 rounded-full" />

                        {/* Markers */}
                        <div className="absolute top-0 left-[78%] flex flex-col items-center -translate-x-1/2">
                            <span className="text-[9px] text-purple-400 font-bold mb-0.5">FANS</span>
                            <div className="w-0.5 h-6 bg-purple-500 rounded-full shadow-[0_0_8px_theme(colors.purple.500)]" />
                        </div>

                        <div className="absolute top-0 left-[42%] flex flex-col items-center -translate-x-1/2">
                            <span className="text-[9px] text-green-400 font-bold mb-0.5">AI</span>
                            <div className="w-0.5 h-6 bg-green-500 rounded-full shadow-[0_0_8px_theme(colors.green.500)]" />
                        </div>
                    </div>
                </div>

                {/* Why Fans & AI Disagree - Compact List */}
                <div className="bg-slate-900/80 rounded p-2.5 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                        <HelpCircle size={12} className="text-blue-400" />
                        <span className="text-[10px] font-bold text-slate-300">Why the disagreement?</span>
                    </div>
                    <ul className="space-y-1">
                        {data.reasons.slice(0, 2).map((reason, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-[10px] text-slate-400 leading-tight">
                                <span className="text-slate-600 mt-0.5">•</span>
                                {reason}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Recent Triggers - Compact Row */}
                <div>
                    <p className="text-[9px] text-slate-500 uppercase font-bold mb-1.5">Recent Triggers</p>
                    <div className="flex gap-1.5">
                        {data.recent_triggers.map((trigger, i) => (
                            <div key={i} className="flex-1 bg-slate-800/50 rounded p-1.5 border border-slate-800 text-center">
                                <div className="text-[9px] text-slate-400 truncate">{trigger.event}</div>
                                <div className={`text-[9px] font-bold ${trigger.impact.includes("Optimism") ? 'text-purple-400' : 'text-slate-300'}`}>
                                    {trigger.impact.split(' ')[1]} {/* Show only impact word e.g. "Optimism" */}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Historical Accuracy - Micro */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 bg-slate-800/30 px-2 py-1.5 rounded border border-slate-800/50">
                    <span>Accuracy check:</span>
                    <div className="flex items-center gap-1">
                        <CheckCircle2 size={10} className="text-green-500" />
                        <span className="text-green-400 font-mono font-bold">AI {data.historical_accuracy}%</span>
                    </div>
                </div>

                {/* Actions - Compact */}
                <div className="pt-2 border-t border-slate-800 flex gap-2">
                    <button className="flex-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 rounded border border-slate-700">
                        Update Vote
                    </button>
                    <button className="flex-[1.5] text-[10px] bg-purple-600/10 hover:bg-purple-600/20 text-purple-300 py-1.5 rounded border border-purple-500/20 flex items-center justify-center gap-1.5">
                        <HelpCircle size={10} />
                        Pro Insights
                    </button>
                </div>
            </div>
        </Card>
    );
}
