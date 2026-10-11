import React, { useMemo } from 'react';
import { LogOut, Play, Star, Folder, Sparkles, Layers } from 'lucide-react';

export default function StudentGateway({ 
    classCode, 
    buckets = [], 
    onSelectFreePlay, 
    onSelectBucket, 
    onLeave, 
    lang = 'sv' 
}) {
    // 1. Extract the Priority "Starred" Bucket
    const priorityBucket = buckets.find(b => b.is_focused);

    // 2. Group the remaining buckets by their folder
    const groupedBuckets = useMemo(() => {
        return buckets
            .filter(b => !b.is_focused) // Don't show the priority bucket twice
            .reduce((acc, b) => {
                const folder = b.folder || (lang === 'sv' ? 'Okategoriserad' : 'Uncategorized');
                if (!acc[folder]) acc[folder] = [];
                acc[folder].push(b);
                return acc;
            }, {});
    }, [buckets, lang]);

    const themeColors = {
        indigo: 'bg-indigo-500',
        rose: 'bg-rose-500',
        emerald: 'bg-emerald-500',
        amber: 'bg-amber-500',
        cyan: 'bg-cyan-500'
    };

    return (
        <div className="min-h-screen bg-[var(--bg-surface)] font-sans animate-in fade-in duration-500 p-6 flex flex-col">
            
            {/* Header */}
            <header className="max-w-5xl mx-auto w-full flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl flex items-center justify-center shadow-sm">
                        <Sparkles className="text-indigo-500" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black uppercase italic tracking-tighter text-[var(--text-main)]">
                            Anpassa
                        </h1>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                            {lang === 'sv' ? `Klasskod: ${classCode}` : `Class Code: ${classCode}`}
                        </p>
                    </div>
                </div>

                <button 
                    onClick={onLeave}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-main)] hover:border-[var(--theme-rose-border)] text-[var(--text-muted)] hover:text-[var(--theme-rose-text)] rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-sm"
                >
                    <LogOut size={14} /> {lang === 'sv' ? "Logga ut" : "Log out"}
                </button>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto w-full flex-1 flex flex-col gap-10 pb-12">
                
                {/* PRIORITY ZONE: Dagens Fokus */}
                {priorityBucket && (
                    <section className="animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-2 mb-3 px-2">
                            <Star size={16} className="text-amber-500 fill-amber-500" />
                            <h2 className="text-xs font-black text-amber-500 uppercase tracking-widest">
                                {lang === 'sv' ? "Dagens Fokus" : "Today's Focus"}
                            </h2>
                        </div>
                        <div 
                            onClick={() => onSelectBucket(priorityBucket)}
                            className="bg-[var(--bg-card)] border-2 border-amber-400 p-6 sm:p-8 rounded-[2rem] shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                        >
                            <div className="flex items-center gap-5">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-inner ${themeColors[priorityBucket.color] || 'bg-indigo-500'}`}>
                                    <Layers size={28} />
                                </div>
                                <div>
                                    <h3 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] tracking-tight mb-2 group-hover:text-amber-500 transition-colors">
                                        {priorityBucket.name}
                                    </h3>
                                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                                        {(priorityBucket.payload || []).length} {lang === 'sv' ? "Nivåer" : "Levels"}
                                    </p>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <Play size={20} fill="currentColor" className="ml-1" />
                            </div>
                        </div>
                    </section>
                )}

                {/* FOLDER ZONES: The Grid */}
                {Object.keys(groupedBuckets).length > 0 && (
                    <section className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                        {Object.entries(groupedBuckets).map(([folderName, folderBuckets]) => (
                            <div key={folderName} className="space-y-4">
                                <div className="flex items-center gap-2 px-2">
                                    <Folder size={14} className="text-[var(--text-muted)] opacity-50" />
                                    <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                                        {folderName}
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {folderBuckets.map(bucket => (
                                        <div 
                                            key={bucket.id}
                                            onClick={() => onSelectBucket(bucket)}
                                            className="bg-[var(--bg-card)] border border-[var(--border-strong)] hover:border-[var(--brand-solid)] p-5 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-inner shrink-0 ${themeColors[bucket.color] || 'bg-indigo-500'}`}>
                                                    <Layers size={18} />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-black text-[var(--text-main)] text-sm truncate group-hover:text-[var(--brand-text)] transition-colors">
                                                        {bucket.name}
                                                    </h4>
                                                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5">
                                                        {(bucket.payload || []).length} {lang === 'sv' ? "Nivåer" : "Levels"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </section>
                )}

                {/* ESCAPE HATCH: Free Play */}
                <section className="mt-8 flex justify-center animate-in slide-in-from-bottom-10 duration-1000">
                    <button 
                        onClick={onSelectFreePlay}
                        className="px-8 py-4 bg-[var(--bg-card)] border-2 border-[var(--border-main)] hover:border-[var(--brand-solid)] text-[var(--text-main)] rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all hover:shadow-lg active:scale-95 flex items-center gap-3"
                    >
                        <Sparkles size={16} className="text-[var(--brand-text)]" />
                        {lang === 'sv' ? "Gå till Fri Träning" : "Go to Free Play"}
                    </button>
                </section>
            </main>
        </div>
    );
}