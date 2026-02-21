import React, { useState, useEffect, useRef } from 'react';
import MathText from '../ui/MathText';
import { GraphCanvas, VolumeVisualization, GeometryVisual, StaticGeometryVisual } from '../visuals/GeometryComponents';
import CluePanel from '../practice/CluePanel';
import HistoryList from '../practice/HistoryList';
import LevelUpModal from '../modals/LevelUpModal';
import { LEVEL_DESCRIPTIONS, CATEGORIES } from '../../constants/localization'; 
import { FractionInput, ScientificInput } from '../ui/InputComponents';

const PracticeView = ({ 
    lang, ui, question, loading, feedback, input, setInput, 
    handleSubmit, handleHint, handleSolution, handleSkip, 
    handleChangeLevel, revealedClues, uiState, actions, 
    levelUpAvailable, setLevelUpAvailable, isSolutionRevealed, 
    timerSettings, formatTime
}) => {
    // Standard Input state (kept for reference if used by specific components)
    const [scaleInputLeft, setScaleInputLeft] = useState('');
    const [scaleInputRight, setScaleInputRight] = useState('');
    
    const inputRef = useRef(null);
    const [shake, setShake] = useState(false);
    const retryRef = useRef(actions.retry);

    // --- NEW: INPUT SANITIZER HELPER ---
    /**
     * Blocks malicious characters while allowing math symbols.
     * Allowed: Alpha-numeric, basic operators, ratios (:), decimals (.,), 
     * inequalities (><), parentheses, and powers (^).
     */
    const sanitizeMathInput = (val) => {
        // Regex allows: a-z, A-Z, 0-9, spaces, and +-/*:.,><=^()
        const clean = val.replace(/[^a-zA-Z0-9+\-*/:.,><=^()\s]/g, '');
        return clean;
    };

    const handleInputChange = (e) => {
        const sanitizedValue = sanitizeMathInput(e.target.value);
        setInput(sanitizedValue);
    };

    useEffect(() => { retryRef.current = actions.retry; }, [actions.retry]);
    
    useEffect(() => {
        if (feedback === 'correct' && isSolutionRevealed) {
            const timer = setTimeout(() => { retryRef.current(); }, 1500);
            return () => clearTimeout(timer);
        }
    }, [feedback, isSolutionRevealed]);

    useEffect(() => {
        if (feedback === 'incorrect') {
            setShake(true);
            const timer = setTimeout(() => setShake(false), 600);
            return () => clearTimeout(timer);
        }
    }, [feedback]);

    useEffect(() => {
        if (question && !loading) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            if (window.innerWidth >= 768 && !feedback && !levelUpAvailable && inputRef.current) {
                setTimeout(() => inputRef.current?.focus(), 50);
            }
        }
    }, [question, loading, feedback, levelUpAvailable]);

    const descriptionText = typeof question?.renderData?.description === 'object' ? question.renderData.description[lang] : question?.renderData?.description;
    
    const handleChoiceClick = (choice) => { 
        if (feedback === 'correct') return; 
        // We set input directly here as choices from the generator are trusted/safe
        setInput(choice); 
        handleSubmit({ preventDefault: () => { } }, choice); 
    };

    const renderVisual = () => {
        if (!question?.renderData) return null;
        if (question.renderData.graph) return <GraphCanvas data={question.renderData.graph} />;
        const geom = question.renderData.geometry;
        if (geom) {
            if (geom.type === 'frequency_table') return <GeometryVisual data={geom} />; 
            const volumeTypes = ['cuboid', 'triangular_prism', 'pyramid', 'sphere', 'hemisphere', 'ice_cream', 'cone', 'cylinder', 'silo'];
            if (volumeTypes.includes(geom.type)) return <VolumeVisualization data={geom} />;
            return <GeometryVisual data={geom} />;
        }
        if (uiState.topic === 'geometry') return <StaticGeometryVisual description={descriptionText} />;
        if (question.renderData.latex) {
             return <div className="text-2xl sm:text-4xl font-serif text-indigo-600 my-2 text-center overflow-x-auto py-1"><MathText text={`$$${question.renderData.latex}$$`} large={true} /></div>;
        }
        return null;
    };

    const getSubmitLabel = () => {
        if (feedback === 'correct') return ui.btnNext || (lang === 'sv' ? "Nästa ➡" : "Next ➡");
        if (feedback === 'incorrect') return ui.tagWrong || (lang === 'sv' ? "Fel svar" : "Incorrect");
        return ui.btnCheck || (lang === 'sv' ? "Svara" : "Submit");
    };

    const localizedTopic = CATEGORIES[uiState.topic] ? CATEGORIES[uiState.topic][lang] : uiState.topic;
    const cluesLabel = ui.hintsTitle || (lang === 'sv' ? "Ledtrådar" : "Hints");
    const historyLabel = ui.historyTitle || (lang === 'sv' ? "Historik" : "History");
    const maxLevels = Object.keys(LEVEL_DESCRIPTIONS[uiState.topic] || {}).length;

    return (
        <div className="max-w-7xl mx-auto w-full p-2 sm:p-4 fade-in min-h-screen">
            <LevelUpModal visible={levelUpAvailable} ui={ui} onNext={() => { handleChangeLevel(1); setLevelUpAvailable(false); }} onStay={() => { setLevelUpAvailable(false); actions.retry(true); }} lang={lang} />
            
            <header className="flex justify-between items-center mb-4 bg-white/90 backdrop-blur-md p-2 px-4 rounded-2xl shadow-sm border border-slate-100 sticky top-2 z-20">
                <div className="flex-shrink-0">
                    <button onClick={actions.goBack} className="text-slate-500 hover:text-indigo-600 font-bold text-[10px] uppercase tracking-wider transition-all">
                        <span>←</span> {ui.backBtn}
                    </button>
                </div>

                <div className="flex-1 text-center px-4 overflow-hidden">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic block truncate">
                        {localizedTopic}
                    </span>
                </div>

                <div className="flex-shrink-0 flex items-center gap-2">
                    {timerSettings.isActive && (
                        <div className={`font-mono text-[10px] font-bold px-2 py-1 rounded-lg border ${timerSettings.remaining < 60 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                            {formatTime(timerSettings.remaining)}
                        </div>
                    )}
                    <div className="flex items-center bg-indigo-50 rounded-xl p-1 border border-indigo-100">
                        <button onClick={() => handleChangeLevel(-1)} disabled={uiState.level <= 1} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white text-indigo-400 disabled:opacity-20 text-xs">&lt;</button>
                        <span className="text-[9px] font-black uppercase px-2 text-indigo-700 italic min-w-[50px] text-center">
                            {uiState.level < maxLevels ? `Lv ${uiState.level}` : 'MAX'}
                        </span>
                        <button onClick={() => handleChangeLevel(1)} disabled={uiState.level >= maxLevels} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white text-indigo-400 disabled:opacity-20 text-xs">&gt;</button>
                    </div>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row gap-4 items-start">
                <main className={`flex-1 w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 ${shake ? 'animate-shake' : ''}`}>
                    {loading ? (
                        <div className="py-20 text-center"><div className="w-8 h-8 border-4 border-t-indigo-600 rounded-full animate-spin mx-auto"></div></div>
                    ) : (
                        <div className="p-4 sm:p-6 lg:p-8">
                            <div className="mb-4 flex justify-center bg-slate-50 rounded-2xl p-4 min-h-[160px] max-h-[280px] items-center border border-slate-100 shadow-inner relative overflow-hidden">
                                {renderVisual()}
                            </div>
                            
                            <div className="mb-6 text-center max-w-xl mx-auto">
                                <h2 className="text-lg sm:text-xl font-medium text-slate-700 leading-snug">
                                    <MathText text={descriptionText} />
                                </h2>
                            </div>
                            
                            <div className="max-w-sm mx-auto">
                                {question.renderData.answerType === 'multiple_choice' ? (
                                    <div className="grid grid-cols-1 gap-2">
                                        {(question.renderData.options || []).map((choice, idx) => {
                                            const isSelected = choice === input;
                                            const isCorrect = feedback === 'correct' && isSelected;
                                            const isIncorrect = feedback === 'incorrect' && isSelected;
                                            return (
                                                <button 
                                                    key={idx} 
                                                    onClick={() => handleChoiceClick(choice)} 
                                                    className={`p-3 rounded-xl font-bold text-base transition-all border-2 text-left flex items-center gap-3 
                                                        ${isCorrect ? 'bg-emerald-500 border-emerald-500 text-white' : 
                                                          isIncorrect ? 'bg-rose-500 border-rose-500 text-white animate-shake' : 
                                                          'bg-white border-slate-100 text-slate-600 hover:border-indigo-400'}`} 
                                                    disabled={feedback === 'correct'}
                                                >
                                                    <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] 
                                                        ${(isCorrect || isIncorrect) ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                        {String.fromCharCode(65 + idx)}
                                                    </span>
                                                    <MathText text={choice} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <form onSubmit={(e) => { e.preventDefault(); if (feedback !== 'correct') handleSubmit(e, input); else actions.retry(true); }} className="space-y-4">
                                        <div className="relative">
                                            {question.renderData.answerType === 'fraction' ? (
                                                <div className="flex justify-center py-2 scale-90">
                                                    {/* Internal components should ideally also be sanitized or restricted */}
                                                    <FractionInput value={input} onChange={(val) => setInput(sanitizeMathInput(val))} allowMixed={true} autoFocus={false} />
                                                </div>
                                            ) : (
                                                <input 
                                                    ref={inputRef} 
                                                    type="text" 
                                                    value={input} 
                                                    onChange={handleInputChange} 
                                                    className={`w-full p-4 text-center text-2xl font-bold border-2 rounded-2xl outline-none transition-all ${feedback === 'incorrect' ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-100 bg-slate-50 focus:border-indigo-500'}`} 
                                                    placeholder="?" 
                                                    disabled={feedback === 'correct'} 
                                                />
                                            )}
                                            {question.renderData.answerType === 'structured_scientific' && (
                                                <div className="flex justify-center py-4">
                                                    <ScientificInput value={input} onChange={(val) => setInput(sanitizeMathInput(val))} autoFocus={true} />
                                                </div>
                                            )}
                                            {feedback === 'correct' && <div className="absolute -right-3 -top-3 text-2xl">✅</div>}
                                            {feedback === 'incorrect' && <div className="absolute -right-3 -top-3 text-2xl">❌</div>}
                                        </div>
                                        <button type="submit" className={`w-full py-3 rounded-xl font-bold text-lg text-white transition-all ${feedback === 'correct' ? 'bg-emerald-500' : feedback === 'incorrect' ? 'bg-rose-600' : 'bg-indigo-600 shadow-lg'}`}>
                                            {getSubmitLabel()}
                                        </button>
                                    </form>
                                )}
                            </div>

                            <div className="mt-6 flex gap-2 justify-center">
                                <button onClick={handleHint} disabled={!question.clues || revealedClues.length >= question.clues.length} className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg bg-amber-50 text-amber-700 border border-amber-100 disabled:opacity-30">💡 {ui.btnHint}</button>
                                <button onClick={handleSolution} disabled={!question.clues || isSolutionRevealed} className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg bg-slate-100 text-slate-500 border border-slate-200 disabled:opacity-30">🔑 {ui.btnSolution}</button>
                                <button onClick={handleSkip} className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">⏭️ {ui.btnSkip}</button>
                            </div>
                        </div>
                    )}
                </main>

                <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-4">
                    <div className="bg-white rounded-3xl p-5 shadow-lg border border-slate-100 flex-1 min-h-[140px]">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs">💡</span>
                            <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">
                                {cluesLabel}
                            </h3>
                        </div>
                        <CluePanel revealedClues={revealedClues} question={question} ui={ui} isSolutionRevealed={isSolutionRevealed} lang={lang} />
                    </div>
                    
                    <div className="bg-white rounded-3xl p-5 shadow-lg border border-slate-100 h-[240px] flex flex-col">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs">📜</span>
                            <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">
                                {historyLabel}
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                            <HistoryList history={uiState.history} ui={ui} />
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default PracticeView;