import React, { useState, useEffect } from 'react';

const LgrModal = ({ visible, onClose, ui }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && !data) {
            setLoading(true);
            fetch('/api/curriculum')
                .then(res => res.json())
                .then(d => { setData(d); setLoading(false); })
                .catch(err => { console.error(err); setLoading(false); });
        }
    }, [visible, data]);

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm fade-in">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl p-6 relative flex flex-col border-t-8 border-sky-200 overflow-hidden animate-bounce-in">
                <div className="flex justify-between items-start mb-6 shrink-0">
                    <h3 className="text-2xl font-bold text-slate-800">{data ? data.title : "Lgr22"}</h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors text-xl font-bold">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
                        </div>
                    ) : data ? (
                        <div className="space-y-8">
                            <p className="text-slate-600 italic border-l-4 border-sky-200 pl-4 py-1">{data.description}</p>
                            
                            {/* Syfte */}
                            <div>
                                <h4 className="font-bold text-sky-800 border-b border-sky-100 pb-2 mb-3">Syfte</h4>
                                <ul className="space-y-2">
                                    {data.syfte.map((item, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-slate-700">
                                            <span className="text-sky-500 font-bold">•</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Centralt Innehåll */}
                            <div>
                                <h4 className="font-bold text-sky-800 border-b border-sky-100 pb-2 mb-3">Centralt Innehåll (åk 7-9)</h4>
                                <div className="grid gap-6">
                                    {/* FIX: Changed data.mapping to data.centralt_innehall */}
                                    {data.centralt_innehall && Object.entries(data.centralt_innehall).map(([key, section]) => (
                                        <div key={key} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <h5 className="font-bold text-slate-900 mb-2 text-sm">{section.category}</h5>
                                            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
                                                {section.content.map((c, i) => <li key={i}>{c}</li>)}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-red-400">Kunde inte ladda informationen.</div>
                    )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 text-center shrink-0">
                    <a href="https://www.skolverket.se" target="_blank" rel="noreferrer" className="text-xs text-sky-600 hover:underline">Källa: Skolverket (Lgr22)</a>
                </div>
            </div>
        </div>
    );
};

export default LgrModal;