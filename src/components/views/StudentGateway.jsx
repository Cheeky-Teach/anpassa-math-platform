import React, { useMemo } from 'react';
import { Layers, Star, ChevronRight, LayoutGrid, LogOut, Sparkles, Map } from 'lucide-react';

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
        <div className="relative w-full min-h-screen bg-[var(--bg-canvas)] py-6 px-4 sm:px-6 font-sans overflow-hidden animate-in fade-in">
            
            {/* --- DECORATIVE AMBIENT BACKGROUND WAVES --- */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-emerald-300/30 dark:bg-emerald-900/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-300/30 dark:bg-indigo-900/20 blur-[120px]" />
                <div className="absolute top-[40%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-amber-300/20 dark:bg-amber-900/10 blur-[100px]" />
            </div>

            {/* --- MAIN CONTENT (Elevated above background) --- */}
            <div className="relative z-10 max-w-6xl mx-auto">
                
                {/* Vibrant Header Panel (Compacted & Solid) */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 bg-[var(--bg-card)] p-5 sm:p-6 rounded-2xl border border-[var(--border-main)] shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[var(--bg-surface)] text-[var(--text-main)] rounded-xl flex items-center justify-center rotate-3 shadow-sm border border-[var(--border-main)] shrink-0">
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black uppercase italic tracking-tight text-[var(--text-main)] leading-none">
                                {lang === 'sv' ? "Välj ditt område" : "Choose your topic"}
                            </h1>
                            <p className="text-[var(--text-muted)] font-bold mt-1.5 text-xs uppercase tracking-widest leading-none">
                                {lang === 'sv' ? `Klasskod: ${classCode}` : `Class Code: ${classCode}`}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                        <button 
                            onClick={onSelectFreePlay}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] text-[var(--text-main)] border-2 border-[var(--border-main)] hover:border-[var(--border-strong)] rounded-xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-[0_4px_0_0_var(--border-main)] active:translate-y-1 active:shadow-none"
                        >
                            <Map size={14} />
                            {lang === 'sv' ? "Träna Fritt" : "Free Play"}
                        </button>
                        <button 
                            onClick={onLeave}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--bg-card)] hover:bg-[var(--theme-rose-bg)] text-[var(--text-muted)] border-2 border-[var(--border-main)] hover:border-[var(--theme-rose-border)] rounded-xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-[0_4px_0_0_var(--border-main)] active:translate-y-1 active:shadow-none"
                        >
                            <LogOut size={14} />
                            {lang === 'sv' ? "Lämna" : "Leave"}
                        </button>
                    </div>
                </div>

                {Object.keys(groupedBuckets).length === 0 ? (
                    <div className="text-center py-16 bg-[var(--bg-card)] rounded-2xl border-2 border-dashed border-[var(--border-main)]">
                        <LayoutGrid size={40} className="mx-auto text-[var(--text-muted)] opacity-30 mb-4" />
                        <p className="text-[var(--text-muted)] font-bold text-base">
                            {lang === 'sv' ? "Din lärare har inte delat ut några uppgifter än." : "Your teacher hasn't assigned any tasks yet."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {Object.entries(groupedBuckets).map(([folderName, folderBuckets]) => (
                            <div key={folderName} className="animate-in slide-in-from-bottom-4">
                                
                                {/* FOLDER TITLE: Compacted */}
                                <div className="flex items-center gap-4 mb-5">
                                    <h2 className="text-sm font-black uppercase tracking-widest bg-[var(--text-main)] text-[var(--bg-canvas)] border-2 border-[var(--text-main)] px-5 py-1.5 rounded-full inline-block shadow-[0_3px_0_0_var(--text-muted)]">
                                        {folderName}
                                    </h2>
                                    <div className="h-1 bg-[var(--border-strong)] opacity-30 flex-1 rounded-full" />
                                </div>

                                {/* BUCKET GRID: Tighter Gap */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {folderBuckets.map(bucket => {
                                        const isFocused = bucket.is_focused;
                                        
                                        return (
                                            <button
                                                key={bucket.id}
                                                onClick={() => onSelectBucket(bucket)}
                                                // Removed transparency, solid backgrounds applied
                                                className={`group relative text-left border-2 rounded-2xl p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between overflow-hidden active:scale-[0.98] active:translate-y-1 active:shadow-none
                                                    ${isFocused 
                                                        ? 'theme-amber sm:col-span-2 lg:col-span-2 bg-[var(--brand-bg)] border-[var(--brand-solid)] shadow-[0_5px_0_0_var(--brand-solid)] hover:-translate-y-1' 
                                                        : 'bg-[var(--bg-card)] border-[var(--border-main)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-hover)] shadow-[0_4px_0_0_var(--border-main)] hover:shadow-[0_4px_0_0_var(--border-strong)]'
                                                    }`}
                                            >
                                                {/* Focus Badge & Glow */}
                                                {isFocused && (
                                                    <>
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand-solid)] opacity-10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                                                        <span className="absolute top-4 right-4 bg-[var(--brand-solid)] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                                                            <Star size={12} fill="currentColor" /> 
                                                            {lang === 'sv' ? "Dagens Fokus" : "Today's Focus"}
                                                        </span>
                                                    </>
                                                )}

                                                <div>
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner mb-4 transition-transform group-hover:scale-110 group-hover:rotate-3
                                                        ${isFocused ? 'bg-[var(--brand-solid)] text-white' : 'bg-[var(--text-main)] text-[var(--bg-card)]'}
                                                    `}>
                                                        <Layers size={isFocused ? 24 : 20} />
                                                    </div>
                                                    
                                                    <h3 className={`font-black tracking-tight text-[var(--text-main)] transition-colors mb-1 leading-tight
                                                        ${isFocused ? 'text-xl sm:text-2xl pr-28' : 'text-lg'}
                                                    `}>
                                                        {bucket.name}
                                                    </h3>
                                                </div>

                                                {/* Compacted Bottom Row */}
                                                <div className="flex items-center justify-between mt-5 pt-4 border-t-2 border-dashed border-[var(--border-main)]">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isFocused ? 'text-[var(--brand-text)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-main)]'}`}>
                                                        {(bucket.payload || []).length} {lang === 'sv' ? "Nivåer" : "Levels"}
                                                    </span>
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all
                                                        ${isFocused ? 'bg-[var(--brand-solid)] text-white group-hover:opacity-80' : 'bg-[var(--bg-surface)] text-[var(--text-muted)] group-hover:bg-[var(--text-main)] group-hover:text-white'}
                                                    `}>
                                                        <ChevronRight size={18} />
                                                    </div>
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