import React, { useState, useEffect } from 'react';
import { Terminal, Activity, Languages, MonitorPlay, Bug } from 'lucide-react';
import StressTesterTab from './developer/StressTesterTab';
import TranslationMatrixTab from './developer/TranslationMatrixTab';
import LiveSessionsTab from './developer/LiveSessionsTab';
import AnalyticsTab from './developer/AnalyticsTab';

export default function DeveloperPortal({ lang, profile }) {
    // 1. HARD SECURITY GATE
    if (profile?.role !== 'super_admin') {
        return <div className="p-8 text-center text-rose-500 font-bold">Unauthorized Access</div>;
    }

    // 2. PERSISTENT STATE
    const [devTab, setDevTab] = useState(() => {
        return sessionStorage.getItem('devPortal_activeTab') || 'stress_tester';
    });

    useEffect(() => {
        sessionStorage.setItem('devPortal_activeTab', devTab);
    }, [devTab]);

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-300">
            {/* Dev Portal Header */}
            <div className="bg-[var(--bg-card)] rounded-[var(--radius-card)] border border-[var(--border-main)] p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-emerald-400 border border-slate-700 shadow-inner">
                        <Terminal size={20} />
                    </div>
                    <div>
                        <h2 className="font-black uppercase tracking-tight text-[var(--text-main)]">Developer Console</h2>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Super Admin Diagnostics</p>
                    </div>
                </div>
            </div>

            {/* Dev Portal Nav */}
            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                {[
                    { id: 'stress_tester', label: 'Stress Tester', icon: <Bug size={14} /> },
                    { id: 'translations', label: 'Translation Matrix', icon: <Languages size={14} /> },
                    { id: 'sessions', label: 'Live Sessions', icon: <MonitorPlay size={14} /> },
                    { id: 'analytics', label: 'Sys Analytics', icon: <Activity size={14} /> }
                ].map(t => (
                    <button 
                        key={t.id} onClick={() => setDevTab(t.id)}
                        className={`px-4 py-2 rounded-[var(--radius-btn)] text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${devTab === t.id ? 'bg-[var(--text-main)] text-[var(--bg-canvas)] shadow-md' : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-main)]'}`}
                    >
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* Dev Portal Content Area */}
            <div className="w-full bg-[var(--bg-card)] rounded-[var(--radius-card)] border border-[var(--border-main)] p-6 shadow-sm min-h-[500px]">
                
                {devTab === 'stress_tester' && <StressTesterTab lang={lang} />}
                {devTab === 'translations' && <TranslationMatrixTab />}
                {devTab === 'sessions' && <LiveSessionsTab />}
                {devTab === 'analytics' && <AnalyticsTab />}
                
                {/* Fallback for unbuilt tabs */}
                {devTab !== 'stress_tester' && devTab !== 'translations' && devTab !== 'sessions' && devTab !== 'analytics' && (
                    <div className="flex flex-col items-center justify-center h-[400px] text-[var(--text-muted)] opacity-50">
                        <Terminal size={48} className="mb-4" />
                        <p className="text-sm font-black uppercase tracking-widest">Module under construction</p>
                    </div>
                )}
            </div>
        </div>
    );
}