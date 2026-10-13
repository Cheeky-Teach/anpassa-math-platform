import React, { useMemo } from 'react';
import { Layers, Star, ChevronRight, LayoutGrid, LogOut, Compass, ArrowRight, FolderKanban } from 'lucide-react';
import PreferencesToggle from '../ui/PreferencesToggle';

export default function StudentGateway({ buckets, onSelectBucket, onSelectFreePlay, onLeave, classCode, lang = 'sv' }) {
    
    const groupedBuckets = useMemo(() => {
        const visible = (buckets || []).filter(b => b.is_visible);
        return visible.reduce((acc, bucket) => {
            const folder = bucket.folder || 'Okategoriserad';
            if (!acc[folder]) acc[folder] = [];
            acc[folder].push(bucket);
            return acc;
        }, {});
    }, [buckets]);

    return (
        <div className="relative w-full min-h-screen bg-[var(--bg-canvas)] py-4 px-3 sm:px-6 font-sans overflow-hidden animate-in fade-in">
            <div className="relative z-10 max-w-6xl mx-auto space-y-4">
                {/* 2. PROMINENT HERO: HELA MATEMATIKBIBLIOTEKET */}
                <div
                    onClick={onSelectFreePlay}
                    className="w-full text-left bg-gradient-to-r from-[var(--bg-card)] via-[var(--bg-surface)] to-[var(--bg-card)] hover:to-[var(--bg-surface-hover)] border-2 border-emerald-500/60 hover:border-emerald-500 rounded-2xl p-4 sm:p-5 shadow-[0_4px_0_0_rgba(16,185,129,0.3)] hover:shadow-[0_4px_0_0_rgba(16,185,129,0.6)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group cursor-pointer"
                >
                    <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 group-hover:rotate-3 transition-transform">
                            <Compass size={24} />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                                    {lang === 'sv' ? "Öppen träning" : "Open access"}
                                </span>
                            </div>
                            <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-[var(--text-main)] mt-0.5">
                                {lang === 'sv' ? "Hela Matematikbiblioteket" : "All Topics & Full Curriculum"}
                            </h2>
                            <p className="text-[11px] font-bold text-[var(--text-muted)] truncate">
                                {lang === 'sv' 
                                    ? "Träna fritt på alla moment & nivåer utanför tilldelade mappar" 
                                    : "Explore the full curriculum with complete freedom"}
                            </p>
                            
                            {/* Class Code Pill */}
                            <div className="flex items-center gap-2 mt-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[11px] font-black uppercase tracking-wider text-[var(--text-muted)]">
                                    {lang === 'sv' ? "Klasskod:" : "Class:"} <span className="text-[var(--text-main)] font-mono tracking-widest">{classCode}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ACTION BUTTONS: Öppna + Lämna */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button 
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onLeave();
                            }}
                            className="flex items-center gap-1.5 px-3 py-2 bg-[var(--bg-surface)] hover:bg-[var(--theme-rose-bg)] text-[var(--text-muted)] hover:text-rose-600 border border-[var(--border-main)] hover:border-rose-300 rounded-xl font-black uppercase tracking-widest text-[11px] transition-all active:scale-95 shadow-xs"
                        >
                            <LogOut size={14} />
                            {lang === 'sv' ? "Lämna" : "Leave"}
                        </button>

                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelectFreePlay();
                            }}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all active:scale-95 shadow-xs"
                        >
                            <span>{lang === 'sv' ? "Öppna" : "Explore"}</span>
                            <ArrowRight size={15} />
                        </button>
                    </div>
                </div>

                {/* 3. VÄLJ DITT OMRÅDE SECTION DIVIDER */}
                <div className="flex items-center gap-3 pt-3">
                    <div className="flex items-center gap-2">
                        <FolderKanban size={15} className="text-[var(--text-muted)]" />
                        <h2 className="text-xs sm:text-sm font-black uppercase italic tracking-tight text-[var(--text-main)]">
                            {lang === 'sv' ? "Välj ditt område" : "Assigned Topics"}
                        </h2>
                    </div>
                    <div className="h-px bg-[var(--border-main)] flex-1" />
                </div>

                {/* 4. ASSIGNED FOLDERS & BUCKETS */}
                {Object.keys(groupedBuckets).length === 0 ? (
                    <div className="text-center py-10 bg-[var(--bg-card)] rounded-xl border-2 border-dashed border-[var(--border-main)]">
                        <LayoutGrid size={32} className="mx-auto text-[var(--text-muted)] opacity-30 mb-2" />
                        <p className="text-[var(--text-muted)] font-bold text-xs">
                            {lang === 'sv' ? "Inga specifika grupper utdelade just nu. Klicka ovan för att träna fritt!" : "No custom folders assigned right now. Use the open library above!"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {Object.entries(groupedBuckets).map(([folderName, folderBuckets]) => (
                            <div key={folderName} className="animate-in slide-in-from-bottom-2">
                                <div className="flex items-center gap-3 mb-2.5">
                                    <h3 className="text-[11px] font-black uppercase tracking-wider bg-[var(--text-main)] text-[var(--bg-canvas)] px-3 py-1 rounded-md shadow-xs">
                                        {folderName}
                                    </h3>
                                    <div className="h-px bg-[var(--border-strong)] opacity-30 flex-1 rounded-full" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 items-stretch">
                                    {folderBuckets.map(bucket => {
                                        const isFocused = bucket.is_focused;
                                        
                                        return (
                                            <button
                                                key={bucket.id}
                                                onClick={() => onSelectBucket(bucket)}
                                                className={`group relative text-left border rounded-xl p-3 transition-all duration-200 flex items-center justify-between gap-3 overflow-hidden active:scale-[0.98] h-full
                                                    ${isFocused 
                                                        ? 'theme-amber bg-[var(--brand-bg)] border-[var(--brand-solid)] shadow-[0_3px_0_0_var(--brand-solid)]' 
                                                        : 'bg-[var(--bg-card)] border-[var(--border-main)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-hover)] shadow-[0_2px_0_0_var(--border-main)]'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-inner shrink-0 transition-transform group-hover:scale-105
                                                        ${isFocused ? 'bg-[var(--brand-solid)] text-white' : 'bg-[var(--text-main)] text-[var(--bg-card)]'}
                                                    `}>
                                                        <Layers size={17} />
                                                    </div>
                                                    
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-start gap-1.5 flex-wrap">
                                                            <h4 className="font-black text-xs sm:text-sm tracking-tight text-[var(--text-main)] leading-snug break-words hyphens-auto">
                                                                {bucket.name}
                                                            </h4>
                                                            {isFocused && (
                                                                <span className="bg-[var(--brand-solid)] text-white text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded shrink-0 flex items-center gap-0.5 self-center">
                                                                    <Star size={9} fill="currentColor" /> {lang === 'sv' ? "Fokus" : "Focus"}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider block mt-0.5 ${isFocused ? 'text-[var(--brand-text)]' : 'text-[var(--text-muted)]'}`}>
                                                            {(bucket.payload || []).length} {lang === 'sv' ? "Nivåer" : "Levels"}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-all
                                                    ${isFocused ? 'bg-[var(--brand-solid)] text-white group-hover:opacity-85' : 'bg-[var(--bg-surface)] text-[var(--text-muted)] group-hover:bg-[var(--text-main)] group-hover:text-white'}
                                                `}>
                                                    <ChevronRight size={14} />
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}