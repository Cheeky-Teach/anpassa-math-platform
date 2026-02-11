import React, { useState, useEffect, useRef } from 'react';
// FIX: Lagt till .jsx filändelse och importerat alla nödvändiga komponenter från god-filen
import { GeometryVisual, GraphCanvas, VolumeVisualization } from '../visuals/GeometryComponents.jsx';
import { X, Maximize, Minimize, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

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
            else { 
                const i = setInterval(() => { 
                    if (window.renderMathInElement) { 
                        doRender(); 
                        clearInterval(i); 
                    } 
                }, 100); 
                return () => clearInterval(i); 
            }
        }
    }, [content]);
    return <div ref={containerRef} className={className}>{content}</div>;
};

// Tillgängliga textstorlekar för projektoroptimering
const TEXT_SIZES = ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl'];

const DoNowCard = ({ index, q, showAnswer, onToggle, lang, textSizeClass }) => {
    const decode = (str) => { try { return atob(str); } catch { return str; } };

    // --- REFINED VISUAL DISPATCHER ---
    const renderVisualContent = () => {
        if (!q.renderData) return null;

        // 1. Grafer
        if (q.renderData.graph) {
            return <GraphCanvas data={q.renderData.graph} />;
        }

        // 2. Geometri (inklusive Volym och Area)
        if (q.renderData.geometry) {
            const geom = q.renderData.geometry;
            
            // Hantera volym-visualiseringar specifikt (eftersom de är en egen komponent)
            const volumeTypes = ['cuboid', 'cylinder', 'cone', 'sphere', 'hemisphere', 'pyramid', 'triangular_prism', 'silo', 'ice_cream', 'volume'];
            if (volumeTypes.includes(geom.type)) {
                return <VolumeVisualization data={geom} />;
            }

            // Använd den centrala GeometryVisual för allt annat (Vinklar, Mönster, Sannolikhet, etc.)
            return <GeometryVisual data={geom} />;
        }

        return null;
    };

    const hasVisual = q.renderData?.graph || q.renderData?.geometry;

    return (
        <div 
            onClick={onToggle} 
            className={`relative rounded-[1.5rem] border-2 transition-all cursor-pointer flex flex-col overflow-hidden h-full select-none shadow-sm 
            ${showAnswer ? 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-500/10' : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md'}`}
        >
            {/* Header */}
            <div className={`px-4 py-2 flex justify-between items-center border-b transition-colors ${showAnswer ? 'bg-emerald-100/50 border-emerald-200' : 'bg-slate-50 border-slate-100'}`}>
                <span className={`text-[10px] font-black uppercase tracking-widest ${showAnswer ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {lang === 'sv' ? 'Uppgift' : 'Task'} {index + 1}
                </span>
                {q.topic && (
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter bg-white px-2 py-0.5 rounded-full border border-slate-200">
                        {q.topic.split('_')[0]}
                    </span>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 p-4 flex flex-col justify-center items-center text-center relative overflow-hidden">
                
                {/* 1. VISUALS - Skalat för projektor */}
                {hasVisual && (
                    <div className="mb-6 w-full flex justify-center items-center transition-transform duration-300">
                        <div className="transform scale-110 lg:scale-125 origin-center">
                            {renderVisualContent()}
                        </div>
                    </div>
                )}
                
                {/* 2. QUESTION TEXT */}
                <div className={`font-bold text-slate-800 leading-tight ${textSizeClass} transition-all my-auto px-2`}>
                    <MathDisplay content={q.renderData?.description} />
                    {q.renderData?.latex && (
                        <div className="mt-3 text-indigo-600 font-serif">
                            <MathDisplay content={`$$${q.renderData.latex}$$`} />
                        </div>
                    )}
                </div>
                
                {/* 3. OPTIONS */}
                {q.renderData?.options && q.renderData.options.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mt-6 w-full px-2 pb-2">
                        {q.renderData.options.map((opt, idx) => (
                            <div key={idx} className="bg-white border-2 border-slate-100 rounded-xl px-3 py-2 text-base font-bold text-left text-slate-700 shadow-sm flex items-center gap-3">
                                <span className="w-6 h-6 shrink-0 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center text-[10px] font-black">
                                    {String.fromCharCode(65 + idx)}
                                </span>
                                <MathDisplay className="truncate" content={opt} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Answer Footer */}
            {showAnswer && (
                <div className="bg-emerald-600 text-white py-3 text-center shrink-0 animate-in slide-in-from-bottom duration-300">
                    <div className="text-xs font-black uppercase tracking-[0.2em] mb-1 opacity-80">FACIT</div>
                    <div className="text-3xl font-black tracking-tighter leading-none">
                        <MathDisplay content={decode(q.token)} />
                        {q.renderData?.suffix && <span className="text-lg ml-2 opacity-90 uppercase">{q.renderData.suffix}</span>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function DoNowGrid({ questions, ui, onBack, onClose, lang, onRefreshAll }) {
    const [revealed, setRevealed] = useState({});
    const [showAll, setShowAll] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [textSizeIndex, setTextSizeIndex] = useState(3); // Standard: text-xl

    useEffect(() => {
        return () => {
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
            }
        };
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
                .then(() => setIsFullscreen(true))
                .catch(e => console.error(e));
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().then(() => setIsFullscreen(false));
            }
        }
    };

    const handleSafeExit = (callback) => {
        if (document.fullscreenElement) {
            document.exitFullscreen().finally(() => callback());
        } else {
            callback();
        }
    };

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

    const adjustText = (delta) => {
        setTextSizeIndex(prev => Math.max(0, Math.min(prev + delta, TEXT_SIZES.length - 1)));
    };

    const handleRefresh = () => {
        setRevealed({}); 
        setShowAll(false); 
        onRefreshAll();
    };

    return (
        <div className="h-screen w-screen bg-slate-200 flex flex-col overflow-hidden font-sans">
            <header className="bg-slate-900 text-white px-6 py-3 shrink-0 flex justify-between items-center shadow-2xl z-20">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => handleSafeExit(onBack)} 
                        className="group flex items-center gap-2 text-slate-400 hover:text-white font-black text-xs uppercase tracking-widest transition-all"
                    >
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">←</div>
                        STUDIO
                    </button>
                    <div className="h-6 w-px bg-slate-700"></div>
                    <div className="flex flex-col">
                        <h1 className="text-base font-black tracking-tighter italic text-indigo-400 leading-none">DO NOW GRID</h1>
                        <span className="text-[9px] font-bold text-slate-500 tracking-widest uppercase">Classroom Session</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/10 mr-4">
                        <button onClick={() => adjustText(-1)} className="p-2 hover:bg-white/10 rounded-lg text-slate-300 transition-colors"><ZoomOut size={18} /></button>
                        <div className="w-px h-4 bg-white/10 mx-1"></div>
                        <button onClick={() => adjustText(1)} className="p-2 hover:bg-white/10 rounded-lg text-slate-300 transition-colors"><ZoomIn size={18} /></button>
                    </div>

                    <button 
                        onClick={handleRefresh} 
                        className="px-5 py-2.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-xl text-xs font-black transition-all uppercase tracking-wider border border-indigo-500/30 flex items-center gap-2"
                    >
                        <RefreshCw size={14} /> NYTT SET
                    </button>

                    <button 
                        onClick={toggleAll} 
                        className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all shadow-lg flex items-center gap-2 uppercase tracking-widest ${showAll ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                    >
                        <span>{showAll ? '🙈' : '👁️'}</span>
                        {showAll ? "DÖLJ SVAR" : "VISA FACIT"}
                    </button>
                    
                    <div className="h-6 w-px bg-slate-700 mx-2"></div>

                    <button onClick={toggleFullscreen} className="text-slate-400 hover:text-white transition-colors p-2 bg-white/5 rounded-xl">
                        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>

                    <button onClick={() => handleSafeExit(onClose)} className="text-slate-400 hover:text-rose-500 transition-colors p-2 bg-white/5 rounded-xl"><X size={20} /></button>
                </div>
            </header>

            <main className="flex-1 p-6 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-rows-2 gap-6 h-full w-full max-w-[1800px] mx-auto">
                    {questions.slice(0, 6).map((q, i) => (
                        <div key={i} className="min-h-0 min-w-0">
                            <DoNowCard 
                                index={i} 
                                q={q} 
                                showAnswer={!!revealed[i]} 
                                onToggle={() => toggleOne(i)} 
                                lang={lang} 
                                textSizeClass={TEXT_SIZES[textSizeIndex]} 
                            />
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}