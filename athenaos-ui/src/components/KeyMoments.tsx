import { KeyMoments as KeyMomentsType } from '@/types';
import Card from './Card';
import { ArrowUpCircle, AlertTriangle, TrendingUp, Activity } from 'lucide-react';

interface Props {
    moments: KeyMomentsType;
}

export default function KeyMoments({ moments }: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-green-900/40 to-slate-900 border-green-500/30">
                <div className="flex items-center gap-3 mb-2">
                    <ArrowUpCircle className="text-green-400" size={24} />
                    <h4 className="text-slate-300 text-sm font-medium">Turning Point</h4>
                </div>
                <div className="text-2xl font-bold text-white">
                    {moments.turning_point?.timestamp || "--"}
                </div>
                <div className="text-xs text-green-300 mt-1">
                    Score: {moments.turning_point?.emotion_score.toFixed(2)}
                </div>
            </Card>

            <Card className="bg-gradient-to-br from-red-900/40 to-slate-900 border-red-500/30">
                <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="text-red-400" size={24} />
                    <h4 className="text-slate-300 text-sm font-medium">Collapse Risk</h4>
                </div>
                <div className="text-2xl font-bold text-white">
                    {moments.collapse_moment?.timestamp || "Safe"}
                </div>
                <div className="text-xs text-red-300 mt-1">
                    {moments.collapse_moment ? "Critical Dip detected" : "Stability maintained"}
                </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/40 to-slate-900 border-purple-500/30">
                <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="text-purple-400" size={24} />
                    <h4 className="text-slate-300 text-sm font-medium">Comeback Zone</h4>
                </div>
                <div className="text-xl font-bold text-white">
                    Overs 15-20
                </div>
                <div className="text-xs text-purple-300 mt-1">
                    Projected High Energy
                </div>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900/40 to-slate-900 border-blue-500/30">
                <div className="flex items-center gap-3 mb-2">
                    <Activity className="text-blue-400" size={24} />
                    <h4 className="text-slate-300 text-sm font-medium">Match Intensity</h4>
                </div>
                <div className="text-2xl font-bold text-white">
                    High
                </div>
                <div className="text-xs text-blue-300 mt-1">
                    Consistent engagement
                </div>
            </Card>
        </div>
    );
}
