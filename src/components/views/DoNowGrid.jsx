import React, { useState } from 'react';
import MathText from '../ui/MathText';
import { GraphCanvas, VolumeVisualization, GeometryVisual } from '../visuals/GeometryComponents';

const DoNowCard = ({ q, index, showAnswer, onToggle, lang }) => {
    const desc = typeof q.renderData.description === 'object' ? q.renderData.description[lang] : q.renderData.description;
    const latex = q.renderData.latex;

    // --- Adaptive Layout Logic ---
    // Hide visuals for word problems to maximize text space
    const isTextOnly = 
        (q.topic === 'equation' && (q.level === 5 || q.level === 6)) ||
        (q.topic === 'simplify' && q.level === 5);

    // --- Dynamic Text Scaling ---
    const getDescSize = (text) => {
        if (!text) return 'text-xl md:text-3xl';
        const len = text.length;
        if (isTextOnly) {
            if (len > 200) return 'text-base md:text-xl leading-relaxed';
            if (len > 100) return 'text-lg md:text-2xl leading-relaxed';
            if (len > 50) return 'text-xl md:text-3xl leading-relaxed';
            return 'text-2xl md:text-4xl leading-relaxed';
        } else {
            if (len > 80) return 'text-sm md:text-base leading-snug';
            if (len > 40) return 'text-base md:text-xl leading-normal';
            return 'text-lg md:text-2xl font-medium';
        }
    };

    // --- Strict Visual Rendering Logic ---
    const hasVisualData = (q.renderData.geometry || q.renderData.graph) && !isTextOnly;

    const renderVisual = () => {
        if (!hasVisualData) return null;

        // 1. Graph (Linear Functions)
        if (q.renderData.graph) {
            return <GraphCanvas data={q.renderData.graph} width={300} height={200} />;
        }

        const geom = q.renderData.geometry;
        if (!geom) return null;

        // 2. 3D Volume Visuals (Canvas based)
        const volumeTypes = ['cuboid', 'cylinder', 'cone', 'sphere', 'hemisphere', 'pyramid', 'triangular_prism', 'silo', 'ice_cream'];
        if (volumeTypes.includes(geom.type)) {
            return <VolumeVisualization data={geom} width={300} height={200} />;
        }

        // 3. 2D Geometry Visuals (SVG based)
        return <GeometryVisual data={geom} />;
    };

    return (
        <div 
            onClick={onToggle}
            className={`
                relative flex flex-col justify-between 
                bg-white rounded-2xl shadow-sm border-2 transition-all duration-300 cursor-pointer overflow-hidden group
                ${showAnswer ? 'border-indigo-500 ring-4 ring-indigo-500/20 scale-[1.02]' : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'}
            `}
        >
            {/* Card Content */}
            <div className="p-5 flex flex-col flex-1 h-full">
                
                {/* Visual Container - ONLY renders if data exists */}
                {hasVisualData && (
                    <div className="mb-4 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden flex justify-center items-center py-4 min-h-[160px]">
                        {renderVisual()}
                    </div>
                )}

                {/* Text Content */}
                <div className="flex-1 flex flex-col justify-center items-center text-center">
                    <p className={`font-medium text-slate-700 mb-3 ${getDescSize(desc)}`}>
                        {desc}
                    </p>
                    
                    {latex && (
                        <div className="mt-2 text-2xl md:text-4xl font-black text-slate-800 tracking-wide">
                            <MathText text={latex} />
                        </div>
                    )}
                </div>
            </div>

            {/* Answer Overlay */}
            {showAnswer && (
                <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2">
                        {lang === 'sv' ? 'FACIT' : 'ANSWER'}
                    </div>
                    <div className="text-3xl md:text-5xl font-black text-indigo-900 text-center break-words w-full">
                        {/* Decode Base64 Token for display */}
                        {tryDecode(q.token)} <span className="text-xl text-slate-400 font-medium ml-1">{q.renderData.suffix}</span>
                    </div>
                </div>
            )}

            {/* Number Badge */}
            <div className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${showAnswer ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                {index + 1}
            </div>
        </div>
    );
};

// Helper to safely decode the Base64 token for the Answer Key
const tryDecode = (str) => {
    try {
        return atob(str);
    } catch (e) {
        return "Error";
    }
};

const DoNowGrid = ({ questions, ui, lang, onBack }) => {
    const [revealed, setRevealed] = useState({});
    const [showAll, setShowAll] = useState(false);

    const toggleOne = (idx) => {
        setRevealed(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    const toggleAll = () => {
        if (showAll) {
            setRevealed({});
            setShowAll(false);
        } else {
            const all = {};
            questions.forEach((_, i) => all[i] = true);
            setRevealed(all);
            setShowAll(true);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm z-20 sticky top-0">
                <button onClick={onBack} className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 transition-colors">
                    <span className="text-xl">←</span> 
                    <span>{ui.backBtn || "Back"}</span>
                </button>
                
                <h2 className="text-lg font-black text-slate-800 hidden md:block tracking-tight">
                    {ui.donow_title}
                </h2>

                <button 
                    onClick={toggleAll} 
                    className={`
                        px-5 py-2 rounded-full font-bold text-sm transition-all shadow-sm flex items-center gap-2
                        ${showAll 
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md'}
                    `}
                >
                    <span>{showAll ? '👁️‍🗨️' : '👁️'}</span>
                    {showAll ? (ui.donow_hide_all || "Hide All") : (ui.donow_show_all || "Show All")}
                </button>
            </header>

            {/* Scrollable Grid Area */}
            <div className="flex-1 p-4 md:p-8 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-8xl mx-auto pb-10">
                    {questions.map((q, i) => (
                        <DoNowCard
                            key={i}
                            index={i}
                            q={q}
                            showAnswer={!!revealed[i]}
                            onToggle={() => toggleOne(i)}
                            lang={lang}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DoNowGrid;