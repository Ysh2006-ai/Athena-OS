"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, ReferenceDot } from 'recharts';
import { EmotionPoint } from '@/types';
import Card from './Card';
import { cn } from '@/lib/utils'; // Use the new util
// Fallback for demo explanation data
const DEMO_EXPLANATION = {
    factors: [
        { label: 'Commentary Sentiment', value: '-0.85', impact: 'negative' as const },
        { label: 'Run Rate Pressure', value: '+2.4', impact: 'negative' as const },
        { label: 'Crowd Noise', value: 'Low', impact: 'neutral' as const },
    ],
    confidence: 89
};

interface Props {
    data: EmotionPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data: EmotionPoint = payload[0].payload;
        return (
            <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-sm z-50">
                <p className="font-bold text-slate-200">{data.timestamp} - {data.emotion_label}</p>
                <p className="text-slate-400">Score: <span className={data.emotion_score > 0 ? "text-green-400" : "text-red-400"}>{data.emotion_score.toFixed(2)}</span></p>
                <div className="mt-2 text-xs text-slate-500 border-t border-slate-800 pt-1">
                    <p className="italic">"{data.emotion_label === 'Euphoria' ? 'Crowd goes wild after that six!' : 'Silence falls over the stadium.'}"</p>
                </div>
            </div>
        );
    }
    return null;
};

export default function EmotionalTimeline({ data }: Props) {
    // Identify key moments for annotations
    const keyMoments = data.filter(d => Math.abs(d.emotion_score) > 0.8 || d.timestamp === '18.1');

    return (
        <Card
            title="Live Emotional Pulse"
            className="h-[400px]"
            explanation={DEMO_EXPLANATION}
        >
            <div className="w-full h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorEmotion" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                        <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} domain={[-1, 1]} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />

                        {/* Annotations */}
                        <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" />

                        {keyMoments.map((moment, idx) => (
                            <ReferenceDot
                                key={idx}
                                x={moment.timestamp}
                                y={moment.emotion_score}
                                r={4}
                                fill={moment.emotion_score > 0 ? "#22c55e" : "#ef4444"}
                                stroke="#1e293b"
                                strokeWidth={2}
                            />
                        ))}

                        <Area
                            type="monotone"
                            dataKey="emotion_score"
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorEmotion)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
