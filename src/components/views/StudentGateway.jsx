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
                    className="w-full text-left bg-gradient-to-r from-[var(--bg-card)] via-[var(--bg-surface)] to-[var(--bg-card)] hover:to-[var(--bg-surface-hover)] border border-emerald-600/40 hover:border-emerald-600 rounded-2xl p-4 sm:p-5 shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group cursor-pointer"
                >
                    <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 group-hover:rotate-3 transition-transform">
                            <Compass size={22} />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                    {lang === 'sv' ? "Öppen träning" : "Open access"}
                                </span>
                            </div>
                            <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-[var(--text-main)] mt-1">
                                {lang === 'sv' ? "Hela Matematikbiblioteket" : "All Topics & Full Curriculum"}
                            </h2>
                            <p className="text-xs font-semibold text-[var(--text-muted)] truncate">
                                {lang === 'sv' 
                                    ? "Träna fritt på alla moment & nivåer utanför tilldelade mappar" 
                                    : "Explore the full curriculum with complete freedom"}
                            </p>
                            
                            {/* Class Code Pill */}
                            <div className="flex items-center gap-2 mt-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                    {lang === 'sv' ? "Klasskod:" : "Class:"} <span className="text-[var(--text-main)] font-mono tracking-widest font-extrabold">{classCode}</span>
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
                            className="flex items-center gap-1.5 px-3 py-2 bg-[var(--bg-card)] hover:bg-rose-50 dark:hover:bg-rose-950/30 text-[var(--text-muted)] hover:text-rose-600 dark:hover:text-rose-400 border border-[var(--border-strong)] hover:border-rose-200 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer shadow-2xs"
                        >
                            <LogOut size={14} />
                            <span>{lang === 'sv' ? "Lämna" : "Leave"}</span>
                        </button>

                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelectFreePlay();
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-2xs active:scale-[0.98]"
                        >
                            <span>{lang === 'sv' ? "Öppna" : "Explore"}</span>
                            <ArrowRight size={14} />
                        </button>
                    </div>
                </div>

                {/* 3. VÄLJ DITT OMRÅDE SECTION DIVIDER */}
                <div className="flex items-center gap-3 pt-2">
                    <div className="flex items-center gap-2">
                        <FolderKanban size={15} className="text-[var(--text-muted)]" />
                        <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-tight text-[var(--text-main)]">
                            {lang === 'sv' ? "Välj ditt område" : "Assigned Topics"}
                        </h2>
                    </div>
                    <div className="h-px bg-[var(--border-main)] flex-1" />
                </div>

                {/* 4. ASSIGNED FOLDERS & BUCKETS */}
                {Object.keys(groupedBuckets).length === 0 ? (
                    <div className="text-center py-10 bg-[var(--bg-card)] rounded-xl border border-dashed border-[var(--border-strong)]">
                        <LayoutGrid size={32} className="mx-auto text-[var(--text-muted)] opacity-30 mb-2" />
                        <p className="text-[var(--text-muted)] font-semibold text-xs">
                            {lang === 'sv' ? "Inga specifika grupper utdelade just nu. Klicka ovan för att träna fritt!" : "No custom folders assigned right now. Use the open library above!"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {Object.entries(groupedBuckets).map(([folderName, folderBuckets]) => (
                            <div key={folderName} className="animate-in slide-in-from-bottom-2">
                                <div className="flex items-center gap-3 mb-2.5">
                                    <h3 className="text-[11px] font-bold uppercase tracking-wider bg-[var(--text-main)] text-[var(--bg-card)] px-2.5 py-0.5 rounded-lg shadow-2xs">
                                        {folderName}
                                    </h3>
                                    <div className="h-px bg-[var(--border-main)] flex-1 rounded-full" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 items-stretch">
                                    {folderBuckets.map(bucket => {
                                        const isFocused = bucket.is_focused;
                                        
                                        return (
                                            <button
                                                key={bucket.id}
                                                type="button"
                                                onClick={() => onSelectBucket(bucket)}
                                                className={`group relative text-left border rounded-xl p-3 transition-colors duration-150 flex items-center justify-between gap-3 overflow-hidden active:scale-[0.98] h-full cursor-pointer ${
                                                    isFocused 
                                                        ? 'bg-amber-50/60 dark:bg-amber-950/40 border-amber-500 shadow-2xs' 
                                                        : 'bg-[var(--bg-card)] border-[var(--border-main)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface)] shadow-2xs'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                                                        isFocused ? 'bg-amber-600 text-white shadow-2xs' : 'bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border-strong)]'
                                                    }`}>
                                                        <Layers size={15} />
                                                    </div>
                                                    
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-start gap-1.5 flex-wrap">
                                                            <h4 className="font-bold text-xs sm:text-sm tracking-tight text-[var(--text-main)] leading-snug break-words hyphens-auto">
                                                                {bucket.name}
                                                            </h4>
                                                            {isFocused && (
                                                                <span className="bg-amber-600 text-white text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded shrink-0 flex items-center gap-0.5 self-center">
                                                                    <Star size={9} fill="currentColor" /> {lang === 'sv' ? "Fokus" : "Focus"}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className={`text-[10px] font-semibold font-mono block mt-0.5 ${isFocused ? 'text-amber-800 dark:text-amber-300' : 'text-[var(--text-muted)]'}`}>
                                                            {(bucket.payload || []).length} {lang === 'sv' ? "Nivåer" : "Levels"}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                                    isFocused ? 'bg-amber-600 text-white' : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-strong)] group-hover:text-[var(--text-main)]'
                                                }`}>
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