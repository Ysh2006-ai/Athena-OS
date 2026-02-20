"use client";

import { useRole, UserRole } from '@/contexts/RoleContext';
import { cn } from '@/lib/utils';
import { Users, ClipboardList, Glasses } from 'lucide-react';

export default function RoleSelector() {
    const { role, setRole } = useRole();

    const roles: { id: UserRole; label: string; icon: any }[] = [
        { id: 'fan', label: 'Fan Zone', icon: Users },
        { id: 'coach', label: 'Coach View', icon: ClipboardList },
        { id: 'analyst', label: 'Deep Dive', icon: Glasses },
    ];

    return (
        <div className="flex bg-slate-900/50 p-1 rounded-lg border border-slate-700/50 backdrop-blur-sm self-center">
            {roles.map((r) => {
                const Icon = r.icon;
                const isActive = role === r.id;
                return (
                    <button
                        key={r.id}
                        onClick={() => setRole(r.id)}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                            isActive
                                ? "bg-slate-700 text-white shadow-sm"
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                        )}
                    >
                        <Icon size={14} />
                        <span className="hidden md:inline">{r.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
