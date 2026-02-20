import { useState, useEffect } from 'react';
import Card from './Card';
import { AthenaAPI } from '@/app/api/athena';
import { PredictionResponse, EmotionPoint } from '@/types';
import { TrendingUp, TrendingDown, AlertTriangle, Activity, BrainCircuit } from 'lucide-react';

interface Props {
    timeline: EmotionPoint[];
}

export default function PredictionCard({ timeline }: Props) {
    const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [showDrivers, setShowDrivers] = useState(true);

    useEffect(() => {
        if (timeline.length > 0) {
            fetchPrediction();
        }
    }, [timeline]);

    const fetchPrediction = async () => {
        setLoading(true);
        try {
            const res = await AthenaAPI.predictTurn(timeline);
            setPrediction(res);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!prediction && !loading) return null;

    return (
        <Card title="AI Predictive Model" className="h-full border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
            {loading ? (
                <div className="flex items-center justify-center h-48 animate-pulse text-slate-500 text-sm">
                    Calculating Probability Vectors...
                </div>
            ) : prediction && (
                <div className="space-y-3">
                    {/* Header Status */}
                    <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[10px] uppercase tracking-wider">Next Phase: <span className="text-white font-bold">{prediction.prediction}</span></span>
                        <div className="flex items-center gap-1 text-[9px] text-blue-400 font-mono">
                            <Activity size={10} /> Live
                        </div>
                    </div>

                    {/* Emotional Spectrum Bar - Compact */}
                    <div className="relative pt-2 pb-3 px-1">
                        <div className="flex justify-between text-[9px] text-slate-500 mb-0.5 font-bold uppercase tracking-wide">
                            <span>Collapse</span>
                            <span>Neutral</span>
                            <span>Surge</span>
                        </div>
                        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden flex">
                            <div className="w-1/3 bg-gradient-to-r from-red-500/20 to-slate-800" />
                            <div className="w-1/3 bg-slate-800" />
                            <div className="w-1/3 bg-gradient-to-r from-slate-800 to-green-500/20" />
                        </div>
                        {/* Triangle Marker */}
                        <div
                            className="absolute bottom-1 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-blue-400 transition-all duration-1000"
                            style={{ left: `calc(${50 + (prediction.spectrum_value * 40)}% - 4px)` }}
                        />
                        <div
                            className="absolute -bottom-2 text-[9px] text-blue-400 font-bold whitespace-nowrap transition-all duration-1000 scale-75 origin-top"
                            style={{ left: `calc(${50 + (prediction.spectrum_value * 40)}% - 15px)` }}
                        >
                            You are here
                        </div>
                    </div>

                    {/* Confidence - Compact */}
                    <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded border border-blue-500/20">
                        <div className="text-right flex-1 border-r border-slate-700 pr-2">
                            <div className="text-[9px] text-slate-400 uppercase">Confidence</div>
                            <div className="text-base font-bold text-blue-400">{(prediction.confidence || 0) * 100}%</div>
                        </div>
                        <div className="flex-[2] pl-1">
                            <div className="text-[9px] text-slate-500 mb-0.5 truncate">{prediction.model_training_stats}</div>
                            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[80%] rounded-full shadow-[0_0_8px_theme(colors.blue.500)]" />
                            </div>
                        </div>
                    </div>


                    {/* Drivers (Compact) */}
                    <div>
                        <div className="flex items-center gap-1.5 mb-1">
                            <BrainCircuit size={12} className="text-purple-400" />
                            <h4 className="text-[10px] font-bold text-slate-300 uppercase">Why this prediction?</h4>
                        </div>
                        <ul className="space-y-1 pl-1">
                            {prediction.drivers.slice(0, 3).map((driver, i) => (
                                <li key={i} className="text-[10px] text-slate-400 flex items-start gap-1.5 leading-tight">
                                    <span className="text-blue-500 mt-0.5">•</span>
                                    {driver}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Probabilities & What-If - Compact Grid */}
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <h4 className="text-[9px] font-bold text-slate-500 uppercase mb-1">Outcomes</h4>
                            <div className="space-y-0.5">
                                {Object.entries(prediction.probabilities).map(([key, val]) => (
                                    <div key={key} className="flex justify-between text-[10px]">
                                        <span className="text-slate-400 truncate pr-1">{key.split(' ')[0]}</span>
                                        <span className="text-slate-200 font-mono">{(val * 100).toFixed(0)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-red-500/5 rounded p-1.5 border border-red-500/10">
                            <h4 className="text-[9px] font-bold text-red-400 uppercase mb-0.5">What If?</h4>
                            <p className="text-[10px] text-slate-300 leading-tight">
                                {prediction.what_if.replace("prediction shifts to:", "→")}
                            </p>
                        </div>
                    </div>

                    {/* Actionable Insight - Compact */}
                    <div className="pt-2 border-t border-slate-800">
                        <div className="flex items-start gap-1.5 text-[10px]">
                            <div className="bg-green-500/20 text-green-400 px-1 py-0 rounded text-[9px] font-bold uppercase shrink-0">Insight</div>
                            <p className="text-slate-300 italic leading-tight">"{prediction.insight_analyst}"</p>
                        </div>
                    </div>

                </div>
            )}
        </Card>
    );
}
