import React, { useState, useEffect, useRef } from 'react';
import { GraphCanvas, VolumeVisualization, GeometryVisual } from '../visuals/GeometryComponents';
import { X, Maximize, Minimize, ZoomIn, ZoomOut } from 'lucide-react';

const MathDisplay = ({ content, className }) => {
    const containerRef = useRef(null);
    useEffect(() => {
        const doRender = () => {
            if (window.renderMathInElement && containerRef.current) {
                window.renderMathInElement(containerRef.current, {
                    delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }],
                    throwOnError: false
                });
            }
        };
        if (content) {
            if (window.renderMathInElement) doRender();
            else { const i = setInterval(() => { if (window.renderMathInElement) { doRender(); clearInterval(i); } }, 100); return () => clearInterval(i); }
        }
    }, [content]);
    return <div ref={containerRef} className={className}>{content}</div>;
};

// Available Text Sizes
const TEXT_SIZES = ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'];

const DoNowCard = ({ index, q, showAnswer, onToggle, lang, textSizeClass }) => {
    const decode = (str) => { try { return atob(str); } catch { return str; } };

    return (
        <div onClick={onToggle} className={`relative rounded-xl border transition-all cursor-pointer flex flex-col overflow-hidden h-full select-none ${showAnswer ? 'bg-emerald-50 border-emerald-400 shadow-md' : 'bg-white border-slate-300 hover:border-indigo-400 hover:shadow-sm'}`}>
            {/* Header */}
            <div className={`px-3 py-1.5 flex justify-between items-center border-b ${showAnswer ? 'bg-emerald-100/50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`text-[10px] font-black uppercase tracking-widest ${showAnswer ? 'text-emerald-700' : 'text-slate-500'}`}>{lang === 'sv' ? 'Uppgift' : 'Task'} {index + 1}</span>
                {q.topic_id && <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter bg-white px-1.5 py-0.5 rounded border border-slate-200">{q.topic_id.split('_')[0]}</span>}
            </div>

            {/* Content Area */}
            <div className="flex-1 p-3 flex flex-col justify-center items-center text-center relative overflow-hidden">
                
                {/* 1. VISUALS - Scaled Up significantly */}
                {q.renderData?.geometry && (
                    <div className="mb-4 scale-110 origin-center max-h-[200px] w-full flex justify-center items-center">
                        <GeometryVisual type={q.renderData.geometry.type} data={q.renderData.geometry} />
                    </div>
                )}
                {q.renderData?.graph && (
                    <div className="mb-4 w-full h-[180px]">
                        <GraphCanvas data={q.renderData.graph} />
                    </div>
                )}
                
                {/* 2. QUESTION TEXT - Centered & Dynamic Size */}
                <div className={`font-semibold text-slate-800 leading-tight ${textSizeClass} transition-all my-auto`}>
                    <MathDisplay content={q.renderData?.description} />
                    {q.renderData?.latex && <div className="mt-2 text-indigo-700 font-serif text-lg"><MathDisplay content={`$$${q.renderData.latex}$$`} /></div>}
                </div>
                
                {/* 3. OPTIONS - Scaled Up Text Size */}
                {q.renderData?.options && (
                    <div className="grid grid-cols-2 gap-3 mt-4 w-full px-1">
                        {q.renderData.options.map((opt, idx) => (
                            <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-left text-slate-700 shadow-sm">
                                <span className="text-slate-400 mr-2">{String.fromCharCode(65+idx)}.</span>
                                <MathDisplay className="inline" content={opt} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Answer Footer */}
            {showAnswer && <div className="bg-emerald-600 text-white py-1.5 text-center shrink-0"><div className="text-lg font-black tracking-tight leading-none"><MathDisplay content={decode(q.token)} /></div></div>}
        </div>
    );
};

export default function DoNowGrid({ questions, ui, onBack, onClose, lang, onRefreshAll }) {
    const [revealed, setRevealed] = useState({});
    const [showAll, setShowAll] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    // Default to 'text-lg' (index 2) for better visibility
    const [textSizeIndex, setTextSizeIndex] = useState(2); 

    // --- FULLSCREEN MANAGEMENT ---
    // Cleanup on unmount to ensure we don't get stuck in fullscreen
    useEffect(() => {
        return () => {
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(err => console.log("Exit fullscreen error:", err));
            }
        };
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(e => console.log(e));
        } else {
            if (document.exitFullscreen) document.exitFullscreen().then(() => setIsFullscreen(false));
        }
    };

    // Wrappers to ensure we exit fullscreen before navigating
    const handleSafeExit = (callback) => {
        if (document.fullscreenElement) {
            document.exitFullscreen()
                .then(() => callback())
                .catch(() => callback()); // Call anyway even if error
        } else {
            callback();
        }
    };

    const toggleOne = (i) => setRevealed(prev => ({ ...prev, [i]: !prev[i] }));
    const toggleAll = () => {
        if (showAll) setRevealed({});
        else { const all = {}; questions.forEach((_, i) => all[i] = true); setRevealed(all); }
        setShowAll(!showAll);
    };

    const adjustText = (delta) => {
        setTextSizeIndex(prev => {
            const next = prev + delta;
            if (next < 0) return 0;
            if (next >= TEXT_SIZES.length) return TEXT_SIZES.length - 1;
            return next;
        });
    };

    // Handle refresh logic properly
    const handleRefresh = () => {
        setRevealed({}); 
        setShowAll(false); 
        onRefreshAll();
    };

    return (
        <div className="h-screen w-screen bg-slate-100 flex flex-col overflow-hidden font-sans">
            {/* Header */}
            <header className="bg-slate-900 text-white px-4 py-2 shrink-0 flex justify-between items-center shadow-md z-10 h-12">
                <div className="flex items-center gap-4">
                    <button onClick={() => handleSafeExit(onBack)} className="text-slate-400 hover:text-white font-bold text-[10px] uppercase tracking-widest flex items-center gap-1 transition-colors"><span>←</span> {lang === 'sv' ? 'STUDIO' : 'STUDIO'}</button>
                    <div className="h-3 w-px bg-slate-700"></div>
                    <h1 className="text-sm font-black tracking-tighter italic text-indigo-400">DO NOW</h1>
                </div>

                <div className="flex items-center gap-2">
                    {/* Text Scaling Controls */}
                    <div className="flex items-center bg-white/5 rounded-md border border-white/10 mr-2">
                        <button onClick={() => adjustText(-1)} className="p-1.5 hover:bg-white/10 text-slate-300 transition-colors" title="Mindre text"><ZoomOut size={14} /></button>
                        <div className="w-px h-3 bg-white/10"></div>
                        <button onClick={() => adjustText(1)} className="p-1.5 hover:bg-white/10 text-slate-300 transition-colors" title="Större text"><ZoomIn size={14} /></button>
                    </div>

                    <button onClick={handleRefresh} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-md text-[10px] font-bold text-slate-300 transition-all uppercase tracking-wider border border-white/10 flex items-center gap-1"><span>🔄</span> {lang === 'sv' ? 'NYTT SET' : 'NEW SET'}</button>
                    <button onClick={toggleAll} className={`px-4 py-1.5 rounded-md font-black text-[10px] transition-all shadow-sm flex items-center gap-2 uppercase tracking-widest ${showAll ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}><span>{showAll ? '🙈' : '👁️'}</span>{showAll ? (ui.donow_hide_all || "DÖLJ SVAR") : (ui.donow_show_all || "VISA FACIT")}</button>
                    
                    <div className="h-3 w-px bg-slate-700 mx-2"></div>

                    {/* Fullscreen Toggle */}
                    <button onClick={toggleFullscreen} className="text-slate-400 hover:text-white transition-colors p-1" title={isFullscreen ? "Avsluta helskärm" : "Helskärm"}>
                        {isFullscreen ? <Minimize size={18} strokeWidth={2} /> : <Maximize size={18} strokeWidth={2} />}
                    </button>

                    {/* Close Button */}
                    <button onClick={() => handleSafeExit(onClose)} className="text-slate-400 hover:text-red-400 transition-colors p-1" title={lang === 'sv' ? "Stäng" : "Close"}><X size={18} strokeWidth={3} /></button>
                </div>
            </header>

            {/* Grid Container */}
            <div className="flex-1 p-3 h-[calc(100vh-3rem)]">
                <div className="grid grid-cols-3 grid-rows-2 gap-3 h-full w-full max-w-[1600px] mx-auto">
                    {questions.slice(0, 6).map((q, i) => (
                        <div key={i} className="min-h-0 min-w-0">
                            <DoNowCard index={i} q={q} showAnswer={!!revealed[i]} onToggle={() => toggleOne(i)} lang={lang} textSizeClass={TEXT_SIZES[textSizeIndex]} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}