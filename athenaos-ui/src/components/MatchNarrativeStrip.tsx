import { useRef } from 'react';
import { TrendingUp, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NarrativePoint {
    id: string;
    label: string;
    description: string;
    type: 'start' | 'rising' | 'climax' | 'collapse' | 'victory';
    status: 'completed' | 'active' | 'future';
}

const DEMO_NARRATIVE: NarrativePoint[] = [
    { id: '1', label: 'Match Start', description: 'Smooth start, decent run rate.', type: 'start', status: 'completed' },
    { id: '2', label: 'Rising Pressure', description: 'Quick wickets increased RR.', type: 'rising', status: 'completed' },
    { id: '3', label: 'Collapse Risk', description: 'Back-to-back dot balls.', type: 'collapse', status: 'active' },
    { id: '4', label: 'Comeback?', description: 'Predicted partnership needed.', type: 'climax', status: 'future' },
    { id: '5', label: 'Final Stretch', description: 'Death overs intensity.', type: 'victory', status: 'future' },
];

export default function MatchNarrativeStrip() {
    const scrollRef = useRef<HTMLDivElement>(null);

    return (
        <div className="w-full bg-slate-900/50 border-y border-slate-800 backdrop-blur-md sticky top-0 z-30">
            <div
                ref={scrollRef}
                className="flex items-center gap-0 overflow-x-auto no-scrollbar py-4 px-6 snap-x"
            >
                {DEMO_NARRATIVE.map((point, idx) => {
                    const isActive = point.status === 'active';
                    const isCompleted = point.status === 'completed';

                    return (
                        <div key={point.id} className="flex items-center shrink-0 snap-center">
                            {/* Narrative Node */}
                            <div className={cn(
                                "relative flex flex-col items-center gap-2 px-4 transition-all duration-300 group cursor-pointer",
                                isActive ? "opacity-100 scale-105" : isCompleted ? "opacity-70" : "opacity-40 blur-[1px]"
                            )}>
                                {/* Icon Bubble */}
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-lg transition-all",
                                    isActive ? "bg-purple-600 border-purple-400 shadow-purple-500/30 animate-pulse" :
                                        isCompleted ? "bg-slate-800 border-green-500" : "bg-slate-800 border-slate-600"
                                )}>
                                    {point.type === 'start' && <CheckCircle2 size={18} className={isCompleted ? "text-green-400" : "text-slate-400"} />}
                                    {point.type === 'rising' && <TrendingUp size={18} className="text-yellow-400" />}
                                    {point.type === 'collapse' && <AlertTriangle size={18} className="text-red-400" />}
                                    {point.type === 'climax' && <Zap size={18} className="text-purple-400" />}
                                    {point.type === 'victory' && <CheckCircle2 size={18} className="text-slate-400" />}
                                </div>

                                {/* Label & Desc */}
                                <div className="text-center w-32">
                                    <p className={cn(
                                        "text-xs font-bold uppercase tracking-wider mb-1",
                                        isActive ? "text-purple-300" : "text-slate-400"
                                    )}>
                                        {point.label}
                                    </p>
                                    <p className="text-[10px] text-slate-500 leading-tight hidden group-hover:block transition-all">
                                        {point.description}
                                    </p>
                                </div>
                            </div>

                            {/* Connector Line */}
                            {idx < DEMO_NARRATIVE.length - 1 && (
                                <div className={cn(
                                    "h-[2px] w-12 rounded-full",
                                    isCompleted ? "bg-green-500/50" : "bg-slate-800"
                                )} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
