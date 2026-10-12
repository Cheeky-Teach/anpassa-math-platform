import React from 'react';

/**
 * Side-by-side comparison bar for two percentage metrics (e.g., Scratchpad vs No Scratchpad)
 */
export const RatioComparisonBar = ({ labelA, valueA, labelB, valueB, title, description }) => {
    // Ensure we don't pass NaN to the UI
    const safeA = isNaN(valueA) ? 0 : Math.round(valueA);
    const safeB = isNaN(valueB) ? 0 : Math.round(valueB);

    return (
        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 space-y-4 shadow-sm">
            <div>
                <h5 className="text-xs font-black uppercase tracking-widest text-slate-800">{title}</h5>
                {description && <p className="text-[10px] font-bold text-slate-500 mt-1">{description}</p>}
            </div>
            
            <div className="space-y-5 pt-2">
                {/* Bar A */}
                <div>
                    <div className="flex justify-between text-xs mb-2">
                        <span className="font-bold text-slate-700 uppercase tracking-wide">{labelA}</span>
                        <span className="font-mono font-black text-indigo-700">{safeA}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
                        <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${safeA}%` }}></div>
                    </div>
                </div>
                
                {/* Bar B */}
                <div>
                    <div className="flex justify-between text-xs mb-2">
                        <span className="font-bold text-slate-700 uppercase tracking-wide">{labelB}</span>
                        <span className="font-mono font-black text-emerald-700">{safeB}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
                        <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${safeB}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Funnel visualization for drop-offs (e.g., At what question do students abandon tests?)
 */
export const FunnelDistribution = ({ data = {}, title, description, emptyMessage = "Ingen data än" }) => {
    const dataKeys = Object.keys(data);
    const maxVal = Math.max(...Object.values(data), 1);
    
    return (
        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 space-y-4 shadow-sm">
            <div>
                <h5 className="text-xs font-black uppercase tracking-widest text-slate-800">{title}</h5>
                {description && <p className="text-[10px] font-bold text-slate-500 mt-1">{description}</p>}
            </div>
            
            {dataKeys.length === 0 ? (
                <div className="py-8 bg-white rounded-2xl border border-slate-100 flex items-center justify-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{emptyMessage}</p>
                </div>
            ) : (
                <div className="space-y-3 pt-2">
                    {Object.entries(data)
                        .sort(([a], [b]) => Number(a) - Number(b))
                        .map(([key, count]) => {
                            const width = Math.max((count / maxVal) * 100, 2); // Minimum 2% width so it's visible
                            return (
                                <div key={key} className="flex items-center gap-4 group">
                                    <span className="text-[10px] font-black text-slate-400 w-14 text-right uppercase tracking-widest group-hover:text-slate-700 transition-colors">
                                        Q {key}
                                    </span>
                                    <div className="flex-1 bg-slate-200 rounded-full h-5 overflow-hidden shadow-inner relative">
                                        <div className="bg-rose-400 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${width}%` }}></div>
                                    </div>
                                    <span className="text-xs font-mono font-black text-rose-600 w-8">{count}</span>
                                </div>
                            );
                    })}
                </div>
            )}
        </div>
    );
};