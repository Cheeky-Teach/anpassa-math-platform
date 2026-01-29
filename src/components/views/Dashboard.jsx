import React from 'react';
import { CATEGORIES, LEVEL_DESCRIPTIONS } from '../../constants/localization';

// ARCHITECTURAL FIX: 
// We explicitly define all color classes here.
// This allows Tailwind's JIT compiler to see them and include them in the CSS.
const COLOR_VARIANTS = {
    pink: {
        bgLight: 'bg-pink-50',
        bgDark: 'bg-pink-500',
        border: 'border-pink-100',
        text: 'text-pink-700',
        ring: 'ring-pink-500',
        borderSolid: 'border-pink-500',
        selectFocus: 'focus:ring-pink-500'
    },
    indigo: {
        bgLight: 'bg-indigo-50',
        bgDark: 'bg-indigo-500',
        border: 'border-indigo-100',
        text: 'text-indigo-700',
        ring: 'ring-indigo-500',
        borderSolid: 'border-indigo-500',
        selectFocus: 'focus:ring-indigo-500'
    },
    emerald: {
        bgLight: 'bg-emerald-50',
        bgDark: 'bg-emerald-500',
        border: 'border-emerald-100',
        text: 'text-emerald-700',
        ring: 'ring-emerald-500',
        borderSolid: 'border-emerald-500',
        selectFocus: 'focus:ring-emerald-500'
    },
    purple: {
        bgLight: 'bg-purple-50',
        bgDark: 'bg-purple-500',
        border: 'border-purple-100',
        text: 'text-purple-700',
        ring: 'ring-purple-500',
        borderSolid: 'border-purple-500',
        selectFocus: 'focus:ring-purple-500'
    }
};

const Dashboard = ({ 
    lang, 
    selectedTopic, 
    selectedLevel, 
    onSelect, 
    onStart, 
    timerSettings, 
    toggleTimer, 
    resetTimer, 
    ui, 
    onLgrOpen, 
    onDoNowOpen, 
    toggleLang 
}) => {
    
    // Helper to get the correct style object
    const getStyles = (category) => {
        const color = category.color || 'emerald';
        return COLOR_VARIANTS[color] || COLOR_VARIANTS.emerald;
    };

    return (
        <div className="max-w-6xl mx-auto w-full p-4 fade-in flex flex-col min-h-[calc(100vh-80px)]">
            
            {/* Hero / Header Section (Preserved from Stable Version) */}
            <div className="text-center py-10 md:py-16 border-b border-gray-200 mb-12 bg-emerald-50/50 rounded-3xl mx-4 relative overflow-hidden">
                <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-4 tracking-tight relative z-10">Anpassa</h1>
                <p className="text-xl md:text-2xl text-gray-500 font-medium tracking-wide relative z-10">{ui.tagline}</p>

                {/* Timer Control */}
                <div className="mt-8 flex justify-center relative z-10">
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2 px-4 shadow-sm border border-gray-100 flex items-center gap-3">
                        <span className="font-bold text-gray-700 text-xs uppercase tracking-wider">{ui.timer_title}</span>
                        <div className="relative group">
                            <select
                                value={timerSettings.duration / 60}
                                onChange={(e) => toggleTimer(Number(e.target.value))}
                                className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-1 pl-3 pr-8 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                            >
                                <option value="0">{ui.timer_off}</option>
                                {[5, 10, 15, 20, 30, 45, 60].map(m => <option key={m} value={m}>{m} {ui.timer_min}</option>)}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                        {timerSettings.duration > 0 && (
                            <button onClick={resetTimer} className="text-xs text-red-500 hover:text-red-700 font-medium underline">{ui.timer_reset}</button>
                        )}
                    </div>
                </div>
            </div>

            <div className="text-center mb-10">
                <p className="text-gray-500 text-lg leading-relaxed max-w-2xl mx-auto">{ui.progressionInfo}</p>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
                {Object.entries(CATEGORIES).map(([catKey, category]) => {
                    const styles = getStyles(category);
                    
                    return (
                        <div key={catKey} className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full`}>
                            {/* Card Header with Static Color Classes */}
                            <div className={`${styles.bgLight} p-4 border-b ${styles.border}`}>
                                <h3 className={`text-lg font-bold ${styles.text} uppercase tracking-wide flex items-center gap-2`}>
                                    <span className={`w-3 h-3 rounded-full ${styles.bgDark}`}></span>
                                    {category.label[lang]}
                                </h3>
                            </div>
                            
                            {/* Topics List */}
                            <div className="p-4 space-y-4 flex-1">
                                {category.topics.map(topic => {
                                    return (
                                        <div key={topic.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                            <div className="font-semibold text-gray-700 mb-3 ml-1">{topic.label[lang]}</div>
                                            <div className="relative">
                                                <select 
                                                    value={selectedTopic === topic.id ? selectedLevel : 0} 
                                                    onChange={(e) => onSelect(topic.id, Number(e.target.value))} 
                                                    className={`
                                                        w-full p-2 pl-3 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none appearance-none cursor-pointer
                                                        ${selectedTopic === topic.id ? `ring-2 ${styles.ring} ${styles.borderSolid}` : styles.selectFocus}
                                                    `}
                                                >
                                                    <option value={0} disabled>{ui.selectLevel}</option>
                                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(lvl => {
                                                        if (!LEVEL_DESCRIPTIONS[topic.id]?.[lvl]) return null;
                                                        return (
                                                            <option key={lvl} value={lvl}>
                                                                {lang === 'sv' ? `Nivå ${lvl}` : `Level ${lvl}`} - {LEVEL_DESCRIPTIONS[topic.id]?.[lvl]?.[lang] || ""}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                                    <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Start Button Overlay */}
            <div className="fixed bottom-8 left-0 right-0 flex justify-center pointer-events-none z-20">
                <button 
                    onClick={onStart} 
                    className={`
                        px-8 py-4 rounded-full font-bold text-lg shadow-2xl transition-all transform pointer-events-auto flex items-center gap-3 
                        ${selectedTopic 
                            ? 'bg-orange-500 text-white translate-y-0 opacity-100 hover:scale-105 hover:bg-orange-600 shadow-orange-200' 
                            : 'bg-gray-300 text-gray-500 translate-y-20 opacity-0 cursor-not-allowed'}
                    `}
                >
                    {ui.startBtn} <span>🚀</span>
                </button>
            </div>

            {/* Footer */}
            <footer className="mt-auto py-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center px-4 gap-4">
                <button onClick={onDoNowOpen} className="w-full md:w-auto bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-6 rounded-full text-sm transition-colors shadow-sm order-2 md:order-1">
                    {ui.donow_btn}
                </button>

                <div className="flex items-center gap-3 order-1 md:order-2 w-full md:w-auto justify-center md:justify-end">
                    <button onClick={onLgrOpen} className="bg-sky-100 hover:bg-sky-200 text-sky-700 font-bold py-2 px-6 rounded-full text-sm transition-colors border border-sky-200 shadow-sm">
                        {ui.lgr_btn}
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default Dashboard;