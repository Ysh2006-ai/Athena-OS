import Card from './Card';
import { PlayerEmotionProfile } from '@/types';
import PlayerCard from './PlayerCard';

interface Props {
    profiles: PlayerEmotionProfile[];
}

export default function PlayerInsights({ profiles }: Props) {
    return (
        <Card title="Player Intelligence" className="h-full border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.05)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profiles.map((p) => (
                    <PlayerCard key={p.player_name} profile={p} />
                ))}

                {profiles.length === 0 && (
                    <div className="col-span-2 text-center text-slate-500 text-sm py-8 animate-pulse">
                        Waiting for player events to generate profiles...
                    </div>
                )}
            </div>
        </Card>
    );
}
