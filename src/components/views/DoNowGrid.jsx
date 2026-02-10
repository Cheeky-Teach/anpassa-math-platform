import React, { useState, useEffect, useRef } from 'react';
import { GraphCanvas, VolumeVisualization, GeometryVisual } from '../visuals/GeometryComponents';
import { X } from 'lucide-react';

/**
 * PROJECTOR-OPTIMIZED MATH RENDERER
 */
const MathDisplay = ({ content, className }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        const doRender = () => {
            if (window.renderMathInElement && containerRef.current) {
                window.renderMathInElement(containerRef.current, {
                    delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '$', right: '$', display: false },
                    ],
                    throwOnError: false
                });
            }
        };

        if (content) {
            if (window.renderMathInElement) {
                doRender();
            } else {
                const interval = setInterval(() => {
                    if (window.renderMathInElement) {
                        doRender();
                        clearInterval(interval);
                    }
                }, 100);
                return () => clearInterval(interval);
            }
        }
    }, [content]);

    return <div ref={containerRef} className={className}>{content}</div>;
};

const DoNowCard = ({ index, q, showAnswer, onToggle, lang }) => {
    const decode = (str) => { try { return atob(str); } catch { return str; } };

    return (
        <div 
            onClick={onToggle}
            className={`relative rounded-xl border transition-all cursor-pointer flex flex-col overflow-hidden h-full select-none ${
                showAnswer 
                    ? 'bg-emerald-50 border-emerald-400 shadow-md' 
                    : 'bg-white border-slate-300 hover:border-indigo-400 hover:shadow-sm'
            }`}
        >
            {/* Compact Header */}
            <div className={`px-3 py-1.5 flex justify-between items-center border-b ${showAnswer ? 'bg-emerald-100/50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`text-[10px] font-black uppercase tracking-widest ${showAnswer ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {lang === 'sv' ? 'Uppgift' : 'Task'} {index + 1}
                </span>
                {q.topic_id && (
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {q.topic_id.split('_')[0]}
                    </span>
                )}
            </div>

            {/* Content Area - Flex Grow to center content vertically */}
            <div className="flex-1 p-2 flex flex-col justify-center items-center text-center relative overflow-hidden">
                {/* Visuals - Auto scale */}
                {q.renderData?.geometry && (
                    <div className="mb-1 scale-[0.8] origin-center max-h-[100px]">
                        <GeometryVisual type={q.renderData.geometry.type} data={q.renderData.geometry} />
                    </div>
                )}
                {q.renderData?.graph && (
                    <div className="mb-1 w-full h-[100px]">
                        <GraphCanvas data={q.renderData.graph} />
                    </div>
                )}

                {/* Question Text */}
                <div className={`font-semibold text-slate-800 leading-tight ${q.renderData?.latex ? 'text-base' : 'text-sm'}`}>
                    <MathDisplay content={q.renderData?.description} />
                    {q.renderData?.latex && (
                        <div className="mt-1 text-indigo-700 font-serif text-lg">
                            <MathDisplay content={`$$${q.renderData.latex}$$`} />
                        </div>
                    )}
                </div>
                
                {/* Options */}
                {q.renderData?.options && (
                    <div className="grid grid-cols-2 gap-2 mt-2 w-full px-2">
                        {q.renderData.options.map((opt, idx) => (
                            <div key={idx} className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px] font-bold text-left text-slate-600">
                                {String.fromCharCode(65+idx)}. {opt}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Answer Footer */}
            {showAnswer && (
                <div className="bg-emerald-600 text-white py-1.5 text-center shrink-0">
                    <div className="text-lg font-black tracking-tight leading-none">
                        <MathDisplay content={decode(q.token)} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default function DoNowGrid({ questions, ui, onBack, onClose, lang, onRefreshAll }) {
    const [revealed, setRevealed] = useState({});
    const [showAll, setShowAll] = useState(false);

    const toggleOne = (i) => setRevealed(prev => ({ ...prev, [i]: !prev[i] }));

    const toggleAll = () => {
        if (showAll) {
            setRevealed({});
        } else {
            const all = {};
            questions.forEach((_, i) => all[i] = true);
            setRevealed(all);
        }
        setShowAll(!showAll);
    };

    return (
        <div className="h-screen w-screen bg-slate-100 flex flex-col overflow-hidden font-sans">
            {/* Ultra-Compact Header (approx 48-50px) */}
            <header className="bg-slate-900 text-white px-4 py-2 shrink-0 flex justify-between items-center shadow-md z-10 h-12">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onBack}
                        className="text-slate-400 hover:text-white font-bold text-[10px] uppercase tracking-widest flex items-center gap-1 transition-colors"
                    >
                        <span>←</span> {lang === 'sv' ? 'STUDIO' : 'STUDIO'}
                    </button>
                    <div className="h-3 w-px bg-slate-700"></div>
                    <h1 className="text-sm font-black tracking-tighter italic text-indigo-400">DO NOW</h1>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={onRefreshAll}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-md text-[10px] font-bold text-slate-300 transition-all uppercase tracking-wider border border-white/10 flex items-center gap-1"
                    >
                        <span>🔄</span> {lang === 'sv' ? 'NYTT SET' : 'NEW SET'}
                    </button>

                    <button 
                        onClick={toggleAll} 
                        className={`px-4 py-1.5 rounded-md font-black text-[10px] transition-all shadow-sm flex items-center gap-2 uppercase tracking-widest ${showAll ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                    >
                        <span>{showAll ? '🙈' : '👁️'}</span>
                        {showAll ? (ui.donow_hide_all || "DÖLJ SVAR") : (ui.donow_show_all || "VISA FACIT")}
                    </button>

                    <div className="h-3 w-px bg-slate-700 mx-2"></div>

                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-red-400 transition-colors p-1"
                        title={lang === 'sv' ? "Stäng" : "Close"}
                    >
                        <X size={18} strokeWidth={3} />
                    </button>
                </div>
            </header>

            {/* Grid Container - Forces 6 cards to fit screen height */}
            <div className="flex-1 p-3 h-[calc(100vh-3rem)]">
                <div className="grid grid-cols-3 grid-rows-2 gap-3 h-full w-full max-w-[1600px] mx-auto">
                    {questions.slice(0, 6).map((q, i) => (
                        <div key={i} className="min-h-0 min-w-0">
                            <DoNowCard
                                index={i}
                                q={q}
                                showAnswer={!!revealed[i]}
                                onToggle={() => toggleOne(i)}
                                lang={lang}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}