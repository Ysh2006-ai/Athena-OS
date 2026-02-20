"use client";

import { useState } from 'react';
import Card from './Card';
import { GamificationResponse } from '@/types';
import { Trophy, HelpCircle, CheckCircle2 } from 'lucide-react';

interface Props {
    gameData?: GamificationResponse;
}

export default function FanGame({ gameData }: Props) {
    const [answeredState, setAnsweredState] = useState<Record<string, string>>({});
    const [totalPoints, setTotalPoints] = useState(0);

    const handleAnswer = (qid: string, option: string, points: number) => {
        if (answeredState[qid]) return;

        setAnsweredState(prev => ({ ...prev, [qid]: option }));
        setTotalPoints(prev => prev + points);
        // In a real app, we'd validate the answer with backend
    };

    const defaultQuestions = [
        {
            id: "demo1",
            text: "Will the emotional intensity peak in this over?",
            options: ["Yes, huge spike!", "No, steady"],
            points: 50
        }
    ];

    const questions = gameData?.questions || defaultQuestions;

    return (
        <Card title="Fan Zone Predictions" className="h-full">
            <div className="flex items-center justify-between mb-6 bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2">
                    <Trophy className="text-yellow-400" size={20} />
                    <span className="text-slate-300 text-sm">Your Score</span>
                </div>
                <div className="text-xl font-bold text-white">{totalPoints} XP</div>
            </div>

            <div className="space-y-4">
                {questions.map((q) => (
                    <div key={q.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700/50">
                        <div className="flex gap-3 mb-3">
                            <HelpCircle className="text-purple-400 shrink-0" size={18} />
                            <p className="text-slate-200 text-sm font-medium">{q.text}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {q.options.map((opt) => {
                                const isSelected = answeredState[q.id] === opt;
                                const isAnswered = !!answeredState[q.id];

                                return (
                                    <button
                                        key={opt}
                                        onClick={() => handleAnswer(q.id, opt, q.points)}
                                        disabled={isAnswered}
                                        className={`
                      text-xs py-2 px-3 rounded border transition-all text-center
                      ${isSelected
                                                ? 'bg-green-600/20 border-green-500 text-green-300'
                                                : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'}
                      ${isAnswered && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                                    >
                                        {opt}
                                        {isSelected && <CheckCircle2 size={12} className="inline ml-1" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}
