import React, { useState } from 'react';
import MathText from '../ui/MathText';
import { GraphCanvas } from '../visuals/GraphCanvas';
import { VolumeVisualization } from '../visuals/VolumeVisualization';
import { GeometryVisual } from '../visuals/GeometryVisual';
import { UI_TEXT } from '../../constants/localization';

// Helper for static visual fallback
const StaticGeometryVisual = ({ description }) => { 
    if (!description) return null; 
    const d = description.toLowerCase(); 
    if (d.includes("rect") || d.includes("rektangel")) return <div className="flex justify-center my-4 opacity-80"><div className="w-28 h-16 border-2 border-primary-500 bg-primary-50 rounded-sm"></div></div>; 
    return null; 
};

const DoNowCard = ({ q, index, showAnswer, onToggle, lang }) => {
    // Determine description text
    const desc = q.renderData && q.renderData.description 
        ? (typeof q.renderData.description === 'object' ? q.renderData.description[lang] : q.renderData.description)
        : "";

    const renderVisual = () => {
        if (!q.renderData) return null;
        if (q.renderData.graph) return <GraphCanvas visual={q.renderData.graph} />; // Changed prop name 'data' to 'visual' to match new components if needed, or stick to legacy 'data' if wrapper handles it. 
        // Note: New components use 'visual' prop usually. 
        // Legacy used 'data'. We will map 'visual'={q.renderData.graph} assuming new components.
        
        if (q.renderData.geometry) {
             const type = q.renderData.geometry.type;
             if (['cuboid', 'triangular_prism', 'pyramid', 'sphere', 'hemisphere', 'ice_cream', 'cone', 'cylinder', 'silo'].includes(type)) {
                 return <VolumeVisualization visual={q.renderData.geometry} />;
             }
             return <GeometryVisual visual={q.renderData.geometry} />;
        }
        
        // Fallback
        if (q.topic === 'geometry') return <StaticGeometryVisual description={desc} />;
        return <div className="text-4xl text-slate-200 font-bold select-none opacity-20">#</div>;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden print-break-inside-avoid relative">
            {/* Card Header */}
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex justify-between items-center shrink-0">
                <span className="text-xs font-bold text-slate-400 uppercase">
                    Q{index + 1} • {q.topic.replace('Gen', '')} L{q.level}
                </span>
            </div>

            <div className="p-4 flex-1 flex flex-col gap-4 relative">
                {/* 1. VISUALIZATION ZONE */}
                <div className="flex-1 bg-slate-50/50 rounded-lg border border-slate-100 flex items-center justify-center min-h-[150px] p-2 relative overflow-hidden">
                    <div className="scale-90 origin-center w-full flex justify-center">
                        {renderVisual()}
                    </div>
                </div>

                {/* 2. TEXT ZONE */}
                <div className="shrink-0 text-center space-y-3 min-h-[6rem] flex flex-col justify-center py-2">
                    {q.renderData && q.renderData.latex && (
                        <div className="text-3xl md:text-5xl font-mono text-slate-900 font-bold tracking-wider">
                            <MathText text={`$${q.renderData.latex}$`} />
                        </div>
                    )}
                    {desc && (
                        <div className="text-lg md:text-2xl font-medium text-slate-700 leading-snug max-w-prose mx-auto">
                            <MathText text={desc} />
                        </div>
                    )}
                </div>

                {/* ANSWER OVERLAY */}
                <div className={`absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex items-center justify-center transition-opacity duration-300 ${showAnswer ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <div className="text-center transform scale-110">
                        <div className="text-sm text-slate-400 uppercase font-bold mb-2">Facit</div>
                        <div className="text-4xl font-bold text-emerald-600 font-mono px-4">
                            {q.displayAnswer}
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={onToggle}
                className="w-full py-4 bg-slate-50 hover:bg-slate-100 border-t border-slate-100 text-sm font-bold text-slate-500 transition-colors shrink-0 z-20"
            >
                {showAnswer 
                    ? (lang === 'sv' ? "Dölj" : "Hide") 
                    : (lang === 'sv' ? "Visa svar" : "Show Answer")}
            </button>
        </div>
    );
};

export const DoNowGrid = ({ questions, onBack, lang = 'sv' }) => {
    const [revealed, setRevealed] = useState({});
    const [showAll, setShowAll] = useState(false);
    const ui = UI_TEXT;

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
        <div className="h-screen flex flex-col bg-slate-100 fade-in">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm z-20 shrink-0">
                <button 
                    onClick={onBack} 
                    className="flex items-center gap-2 text-slate-600 font-bold hover:text-slate-900"
                >
                    <span>←</span> {ui.donow_title ? ui.donow_title[lang] : "Do Now Activity"}
                </button>
                <div className="flex gap-4">
                    <button 
                        onClick={toggleAll} 
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-sm transition-colors"
                    >
                        {showAll 
                            ? (ui.donow_hide_all ? ui.donow_hide_all[lang] : "Hide All") 
                            : (ui.donow_show_all ? ui.donow_show_all[lang] : "Show All")}
                    </button>
                </div>
            </header>

            {/* Scrollable Grid Area */}
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full auto-rows-fr">
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