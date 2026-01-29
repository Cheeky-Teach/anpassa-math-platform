import React from 'react';
import { CATEGORIES, LEVEL_DESCRIPTIONS } from '../../constants/localization';

// ARCHITECTURAL FIX: Explicitly define all color classes so Tailwind JIT detects them.
// Dynamic interpolation (e.g., `bg-${color}-50`) causes styles to vanish.
const COLOR_VARIANTS = {
    pink: {
        cardBase: 'bg-pink-50 border-pink-100 hover:border-pink-300',
        iconBg: 'bg-pink-500',
        titleText: 'text-pink-900',
        badgeBase: 'bg-white text-pink-700 border-pink-200',
        selectedCard: 'ring-2 ring-pink-500 bg-pink-100 border-transparent',
        levelBtnActive: 'bg-pink-500 text-white shadow-md transform scale-105',
        levelBtnInactive: 'bg-white text-pink-700 border border-pink-200 hover:bg-pink-100'
    },
    indigo: {
        cardBase: 'bg-indigo-50 border-indigo-100 hover:border-indigo-300',
        iconBg: 'bg-indigo-500',
        titleText: 'text-indigo-900',
        badgeBase: 'bg-white text-indigo-700 border-indigo-200',
        selectedCard: 'ring-2 ring-indigo-500 bg-indigo-100 border-transparent',
        levelBtnActive: 'bg-indigo-500 text-white shadow-md transform scale-105',
        levelBtnInactive: 'bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
    },
    emerald: {
        cardBase: 'bg-emerald-50 border-emerald-100 hover:border-emerald-300',
        iconBg: 'bg-emerald-500',
        titleText: 'text-emerald-900',
        badgeBase: 'bg-white text-emerald-700 border-emerald-200',
        selectedCard: 'ring-2 ring-emerald-500 bg-emerald-100 border-transparent',
        levelBtnActive: 'bg-emerald-500 text-white shadow-md transform scale-105',
        levelBtnInactive: 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
    },
    purple: {
        cardBase: 'bg-purple-50 border-purple-100 hover:border-purple-300',
        iconBg: 'bg-purple-500',
        titleText: 'text-purple-900',
        badgeBase: 'bg-white text-purple-700 border-purple-200',
        selectedCard: 'ring-2 ring-purple-500 bg-purple-100 border-transparent',
        levelBtnActive: 'bg-purple-500 text-white shadow-md transform scale-105',
        levelBtnInactive: 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-100'
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
    
    // Safety fallback
    const getVariant = (color) => COLOR_VARIANTS[color] || COLOR_VARIANTS.emerald;

    return (
        <div className="max-w-6xl mx-auto w-full p-4 fade-in flex flex-col min-h-[calc(100vh-80px)]">
            
            {/* Hero / Header */}
            <div className="text-center py-10 md:py-16 border-b border-gray-200 mb-10">
                <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight">
                    {ui.hero_title}
                </h2>
                <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                    {ui.hero_subtitle}
                </p>

                {/* Timer Controls */}
                <div className="mt-8 flex justify-center gap-2">
                    {[5, 10, 15, 20].map(min => (
                        <button
                            key={min}
                            onClick={() => toggleTimer(min)}
                            className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                                timerSettings?.duration === min * 60 
                                    ? 'bg-orange-100 text-orange-700 border-orange-300' 
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-orange-300'
                            }`}
                        >
                            {min} min
                        </button>
                    ))}
                    {timerSettings?.isActive && (
                        <button onClick={resetTimer} className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100">
                            Stop
                        </button>
                    )}
                </div>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
                {CATEGORIES.map((cat) => {
                    const styles = getVariant(cat.color);
                    const isSelected = selectedTopic === cat.id;

                    return (
                        <div 
                            key={cat.id}
                            onClick={() => !isSelected && onSelect(cat.id, 1)}
                            className={`
                                relative rounded-2xl p-6 transition-all duration-300 border-2 cursor-pointer
                                ${isSelected ? styles.selectedCard : styles.cardBase}
                                ${isSelected ? 'shadow-xl scale-[1.02]' : 'shadow-sm hover:shadow-md'}
                            `}
                        >
                            {/* Card Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl text-white shadow-sm ${styles.iconBg}`}>
                                    {cat.icon}
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full border ${styles.badgeBase}`}>
                                    {cat.levels} {ui.levels}
                                </span>
                            </div>

                            <h3 className={`text-xl font-bold mb-2 ${styles.titleText}`}>
                                {cat.title[lang]}
                            </h3>
                            <p className="text-slate-500 text-sm mb-6 h-10 leading-snug">
                                {cat.desc[lang]}
                            </p>

                            {/* Level Selector */}
                            {isSelected ? (
                                <div className="grid grid-cols-5 gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                    {[...Array(cat.levels)].map((_, i) => {
                                        const lvl = i + 1;
                                        const isActive = selectedLevel === lvl;
                                        return (
                                            <button
                                                key={lvl}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSelect(cat.id, lvl);
                                                }}
                                                className={`
                                                    h-10 rounded-lg font-bold text-sm transition-all flex items-center justify-center
                                                    ${isActive ? styles.levelBtnActive : styles.levelBtnInactive}
                                                `}
                                            >
                                                {lvl}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="h-10 flex items-center text-slate-400 text-sm font-medium bg-white/50 rounded-lg px-3">
                                    {ui.clickToSelect}
                                </div>
                            )}

                            {/* Level Description Preview */}
                            {isSelected && LEVEL_DESCRIPTIONS[cat.id] && LEVEL_DESCRIPTIONS[cat.id][selectedLevel] && (
                                <div className="mt-4 pt-4 border-t border-black/5 text-xs text-slate-500 font-medium">
                                    <span className="uppercase tracking-wider opacity-50 block mb-1 text-[10px]">Level {selectedLevel}</span>
                                    {LEVEL_DESCRIPTIONS[cat.id][selectedLevel][lang]}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Start Button Overlay */}
            <div className="fixed bottom-8 left-0 right-0 flex justify-center pointer-events-none z-20 px-4">
                <button 
                    onClick={onStart} 
                    disabled={!selectedTopic}
                    className={`
                        px-8 py-4 rounded-full font-bold text-lg shadow-2xl transition-all transform pointer-events-auto flex items-center gap-3
                        ${selectedTopic 
                            ? 'bg-slate-900 text-white translate-y-0 opacity-100 hover:scale-105 hover:bg-black shadow-slate-400/50' 
                            : 'bg-slate-200 text-slate-400 translate-y-20 opacity-0 cursor-not-allowed'}
                    `}
                >
                    {ui.startBtn} 
                    <span>🚀</span>
                </button>
            </div>

            {/* Footer */}
            <footer className="mt-auto py-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 px-4">
                <button 
                    onClick={onDoNowOpen} 
                    className="w-full md:w-auto bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-6 rounded-full text-sm transition-colors shadow-sm order-2 md:order-1"
                >
                    {ui.donow_btn}
                </button>

                <div className="flex items-center gap-3 order-1 md:order-2 w-full md:w-auto justify-center md:justify-end">
                    <button 
                        onClick={onLgrOpen} 
                        className="text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors"
                    >
                        LGR22 Info
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default Dashboard;