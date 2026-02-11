import React, { useState, useEffect, useRef } from 'react';
import MathText from '../ui/MathText';
import { GraphCanvas, VolumeVisualization, GeometryVisual, StaticGeometryVisual } from '../visuals/GeometryComponents';
import CluePanel from '../practice/CluePanel';
import HistoryList from '../practice/HistoryList';
import LevelUpModal from '../modals/LevelUpModal';
import { LEVEL_DESCRIPTIONS, CATEGORIES } from '../../constants/localization'; 
import { FractionInput } from '../ui/InputComponents';

// --- SECURITY HELPERS ---
const isValidInput = (val, type) => {
    if (val === '') return true;
    const numericRegex = /^-?[\d\s]*([.,:]\d*)?$/;
    
    if (type === 'numeric' || type === 'scale' || type === 'range' || type === 'fraction') {
        return numericRegex.test(val) || (type === 'fraction' && val.includes('/'));
    }
    
    const dangerousRegex = /[<>{}]/g;
    return !dangerousRegex.test(val);
};

const sanitize = (val) => {
    return val.replace(/[<>{}]/g, "");
};

const PracticeView = ({ 
    lang, 
    ui, 
    question, 
    loading, 
    feedback, 
    input, 
    setInput, 
    handleSubmit, 
    handleHint, 
    handleSolution, 
    handleSkip, 
    handleChangeLevel, 
    revealedClues, 
    uiState, 
    actions, 
    levelUpAvailable, 
    setLevelUpAvailable, 
    isSolutionRevealed, 
    timerSettings, 
    formatTime, 
    setMobileHistoryOpen 
}) => {
    // --- STATE FOR STRUCTURED INPUTS ---
    const [scaleInputLeft, setScaleInputLeft] = useState('');
    const [scaleInputRight, setScaleInputRight] = useState('');
    const [powerBase, setPowerBase] = useState('');
    const [powerExp, setPowerExp] = useState('');
    const [sciMantissa, setSciMantissa] = useState('');
    const [sciExp, setSciExp] = useState('');
    const [rangeLower, setRangeLower] = useState('');
    const [rangeUpper, setRangeUpper] = useState('');

    const inputRef = useRef(null);
    const [shake, setShake] = useState(false);

    // Auto-advance logic
    const retryRef = useRef(actions.retry);
    useEffect(() => { retryRef.current = actions.retry; }, [actions.retry]);
    
    useEffect(() => {
        if (feedback === 'correct' && isSolutionRevealed) {
            const timer = setTimeout(() => {
                retryRef.current(); 
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [feedback, isSolutionRevealed]);

    // Focus & Reset logic: Detects mobile to prevent keyboard pop-up blocking the question
    useEffect(() => {
        if (question && !loading) {
            // Reset local states
            setScaleInputLeft(''); setScaleInputRight('');
            setPowerBase(question.renderData.prefillBase || '');
            setPowerExp('');
            setSciMantissa('');
            setSciExp('');
            setRangeLower('');
            setRangeUpper('');
            
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // QUALITY OF LIFE: Only auto-focus on desktop
            const isMobile = window.innerWidth < 768;
            if (!isMobile && !feedback && !levelUpAvailable && inputRef.current) {
                setTimeout(() => inputRef.current?.focus(), 50);
            }
        }
    }, [question, loading, feedback, levelUpAvailable]);

    const descriptionText = typeof question?.renderData?.description === 'object' ? question.renderData.description[lang] : question?.renderData?.description;
    
    const handleChoiceClick = (choice) => { 
        if (feedback === 'correct') return; 
        setInput(choice); 
        handleSubmit({ preventDefault: () => { } }, choice); 
    };
    
    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (feedback === 'correct') {
            actions.retry(true);
            return;
        }

        let finalInput = input;
        const type = question.renderData.answerType;

        if (type === 'scale') {
            if (scaleInputLeft === '' || scaleInputRight === '') return;
            finalInput = `${scaleInputLeft}:${scaleInputRight}`;
        } 
        else if (type === 'structured_power') {
            if (powerBase === '' || powerExp === '') return;
            finalInput = `${powerBase}^${powerExp}`;
        }
        else if (type === 'structured_scientific') {
            if (sciMantissa === '' || sciExp === '') return;
            finalInput = `${sciMantissa}*10^${sciExp}`;
        }
        else if (type === 'structured_range') {
            if (rangeLower === '' || rangeUpper === '') return;
            finalInput = `${rangeLower}:${rangeUpper}`;
        }
        else if (type === 'fraction') {
             if (!input) return;
             finalInput = input; 
        }
        else {
            if (!isValidInput(input, type === 'numeric' ? 'numeric' : 'text')) {
                setShake(true);
                setTimeout(() => setShake(false), 500);
                return;
            }
            if (type !== 'numeric') finalInput = sanitize(input);
        }

        if (!finalInput || finalInput.trim() === '') return;
        handleSubmit(e, finalInput);
    };

    const handleInputChange = (e, setter, type) => {
        const val = e.target.value;
        if (isValidInput(val, type)) {
            setter(val);
        }
    };

    const maxLevels = Object.keys(LEVEL_DESCRIPTIONS[uiState.topic] || {}).length;

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
             return <div className="text-2xl sm:text-4xl font-mono text-gray-800 my-4 text-center overflow-x-auto py-2"><MathText text={`$$${question.renderData.latex}$$`} large={true} /></div>;
        }
        return null;
    };

    const getSubmitLabel = () => {
        if (feedback === 'correct') return ui.btnNext || (lang === 'sv' ? "Nästa ➡" : "Next ➡");
        if (feedback === 'incorrect') return ui.tagWrong || "Incorrect";
        return ui.btnCheck || (lang === 'sv' ? "Svara" : "Submit");
    };

    const isDisabled = feedback === 'correct';

    if (!question && !loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <p className="text-red-400 mb-4">{ui.error || "Error loading question"}</p>
                <button onClick={() => actions.retry(true)} className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition">Retry</button>
            </div>
        );
    }

    return (
        <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8 flex flex-col lg:flex-row gap-8 items-start fade-in relative min-h-screen">
            
            <LevelUpModal visible={levelUpAvailable} ui={ui} onNext={() => { handleChangeLevel(1); setLevelUpAvailable(false); }} onStay={() => { setLevelUpAvailable(false); actions.retry(true); }} lang={lang} />
            
            <div className="flex-1 w-full min-w-0">
                {/* HEADER - Updated with Pill Design and Shadows */}
                <div className="flex justify-between items-center mb-8 bg-white/80 backdrop-blur-md p-4 rounded-[2rem] shadow-xl border border-white sticky top-4 z-20">
                    <button onClick={actions.goBack} className="flex items-center gap-2 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 font-black text-xs uppercase tracking-widest px-5 py-2.5 rounded-2xl transition-all active:scale-95">
                        <span>←</span> {ui.backBtn}
                    </button>

                    <div className="flex items-center gap-4">
                        {timerSettings.isActive && (
                            <div className={`font-mono text-sm font-black px-4 py-2 rounded-2xl border hidden sm:block shadow-inner ${timerSettings.remaining < 60 ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                                {formatTime(timerSettings.remaining)}
                            </div>
                        )}
                        <div className="flex items-center gap-2 bg-indigo-50 rounded-2xl p-1.5 border border-indigo-100 shadow-sm">
                            <button onClick={() => handleChangeLevel(-1)} disabled={uiState.level <= 1} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white hover:text-indigo-600 disabled:opacity-30 transition-all text-indigo-400 font-black">&lt;</button>
                            <span className="text-[10px] font-black uppercase tracking-tighter text-indigo-700 min-w-[90px] text-center italic">
                                {uiState.level < maxLevels ? `Lv ${uiState.level}` : 'MAX LEVEL'}
                            </span>
                            <button onClick={() => handleChangeLevel(1)} disabled={uiState.level >= maxLevels} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white hover:text-indigo-600 disabled:opacity-30 transition-all text-indigo-400 font-black">&gt;</button>
                        </div>
                        
                        <button onClick={() => setMobileHistoryOpen(true)} className="lg:hidden w-10 h-10 flex items-center justify-center bg-white rounded-2xl text-slate-400 shadow-sm border border-slate-100 transition-colors active:bg-slate-50">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </button>
                    </div>
                </div>

                {/* MAIN QUESTION CARD - Updated with Smooth Corners and Deep Shadows */}
                <main className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 relative">
                    {loading ? (
                        <div className="p-32 text-center flex flex-col items-center gap-6">
                            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Anpassar uppgift...</span>
                        </div>
                    ) : question ? (
                        <div className="p-6 sm:p-10">
                            {/* Visual Container */}
                            <div className="mb-8 flex justify-center bg-slate-50 rounded-[2rem] p-6 min-h-[200px] items-center border border-slate-100 shadow-inner relative overflow-hidden">
                                {renderVisual()}
                            </div>
                            
                            {/* Question Text */}
                            <div className="mb-8 text-center px-4">
                                <h2 className="text-xl sm:text-3xl font-black text-slate-800 leading-tight tracking-tight uppercase italic">
                                    <MathText text={descriptionText} />
                                </h2>
                            </div>
                            
                            {/* Interactive Input Form */}
                            {question.renderData.answerType === 'multiple_choice' ? (
                                <div className="max-w-md mx-auto grid grid-cols-1 gap-4">
                                    {(question.renderData.options || question.renderData.choices || []).map((choice, idx) => (
                                        <button 
                                            key={idx} 
                                            onClick={() => handleChoiceClick(choice)} 
                                            className={`group relative p-5 rounded-2xl font-black text-lg transition-all active:scale-95 border-2 text-left flex items-center gap-4
                                                ${feedback === 'correct' && choice === input ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100' : 
                                                  feedback === 'incorrect' && choice === input ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-100' : 
                                                  'bg-white border-slate-100 text-slate-700 hover:border-indigo-500 hover:text-indigo-600 hover:shadow-md'}`} 
                                            disabled={feedback !== null}
                                        >
                                            <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-colors
                                                ${feedback === 'correct' && choice === input ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                                                {String.fromCharCode(65 + idx)}
                                            </span>
                                            <MathText text={choice} />
                                        </button>
                                    ))}
                                    {feedback === 'correct' && (
                                        <div className="mt-4 animate-in fade-in zoom-in duration-300">
                                            <button onClick={() => actions.retry(true)} className="w-full py-5 rounded-2xl font-black text-xl text-white shadow-2xl transition-all active:scale-95 bg-emerald-500 hover:bg-emerald-600 uppercase tracking-tighter italic">
                                                {ui.btnNext || (lang === 'sv' ? "Nästa ➡" : "Next ➡")}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <form onSubmit={handleFormSubmit} className="max-w-md mx-auto space-y-6">
                                    <div className={`relative transition-transform ${shake ? 'animate-shake' : ''}`}>
                                        {question.renderData.answerType === 'fraction' && (
                                            <div className="flex justify-center py-4 scale-110">
                                                <FractionInput 
                                                    value={input} 
                                                    onChange={setInput} 
                                                    allowMixed={true}
                                                    autoFocus={false} // Refined for mobile
                                                />
                                            </div>
                                        )}

                                        {question.renderData.answerType === 'scale' && (
                                            <div className="flex items-center justify-center gap-3">
                                                <input type="text" value={scaleInputLeft} onChange={(e) => handleInputChange(e, setScaleInputLeft, 'numeric')} className="w-28 p-5 text-center text-2xl font-black border-2 rounded-2xl outline-none transition-all shadow-sm focus:border-indigo-500" placeholder="X" disabled={isDisabled} />
                                                <span className="text-3xl font-black text-slate-300">:</span>
                                                <input type="text" value={scaleInputRight} onChange={(e) => handleInputChange(e, setScaleInputRight, 'numeric')} className="w-28 p-5 text-center text-2xl font-black border-2 rounded-2xl outline-none transition-all shadow-sm focus:border-indigo-500" placeholder="X" disabled={isDisabled} />
                                            </div>
                                        )}

                                        {/* Standard Text/Numeric Inputs */}
                                        {!['scale', 'structured_power', 'structured_scientific', 'structured_range', 'fraction'].includes(question.renderData.answerType) && (
                                            <div className="relative group">
                                                <input 
                                                    ref={inputRef} 
                                                    type="text" 
                                                    inputMode={question.renderData.answerType === 'numeric' ? 'decimal' : 'text'}
                                                    value={input} 
                                                    onChange={(e) => handleInputChange(e, setInput, question.renderData.answerType)} 
                                                    className={`w-full p-5 text-center text-3xl font-black border-2 rounded-3xl outline-none transition-all shadow-lg
                                                        ${feedback === 'correct' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-emerald-50' : 
                                                          feedback === 'incorrect' ? 'border-rose-500 bg-rose-50 text-rose-700' : 
                                                          'border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5'}`} 
                                                    placeholder={ui.placeholder || "?"} 
                                                    disabled={isDisabled} 
                                                />
                                                {question.renderData.suffix && (
                                                    <span className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 font-black text-xl pointer-events-none italic uppercase">
                                                        {question.renderData.suffix}
                                                    </span>
                                                )}
                                                {feedback === 'correct' && <div className="absolute -right-4 -top-4 text-4xl animate-bounce-in">✅</div>}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <button 
                                        type="submit" 
                                        className={`w-full py-5 rounded-2xl font-black text-xl text-white shadow-2xl transition-all active:scale-95 uppercase tracking-tighter italic
                                            ${feedback === 'correct' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}
                                        disabled={loading}
                                    >
                                        {getSubmitLabel()}
                                    </button>
                                </form>
                            )}

                            {/* Help Actions - Puffy Pill Buttons */}
                            <div className="mt-10 flex gap-3 justify-center flex-wrap">
                                <button type="button" onClick={handleHint} disabled={!question.clues || revealedClues.length >= question.clues.length} className="px-6 py-3 text-xs font-black uppercase tracking-widest rounded-2xl bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100 disabled:opacity-30 transition-all flex items-center gap-2 shadow-sm active:scale-95">
                                    <span>💡</span> {ui.btnHint}
                                </button>
                                <button type="button" onClick={handleSolution} disabled={!question.clues || isSolutionRevealed} className="px-6 py-3 text-xs font-black uppercase tracking-widest rounded-2xl bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 disabled:opacity-30 transition-all shadow-sm active:scale-95">
                                    <span>🔑</span> {ui.btnSolution}
                                </button>
                                <button type="button" onClick={handleSkip} className="px-6 py-3 text-xs font-black uppercase tracking-widest rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 transition-all flex items-center gap-2 shadow-sm active:scale-95">
                                    <span>⏭️</span> {ui.btnSkip}
                                </button>
                            </div>
                        </div>
                    ) : null}
                </main>

                {/* Mobile Clue Panel Area */}
                <div className="lg:hidden mt-8 w-full">
                    {(revealedClues.length > 0 || isSolutionRevealed) && (
                        <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-slate-100">
                            <CluePanel revealedClues={revealedClues} question={question} ui={ui} isSolutionRevealed={isSolutionRevealed} />
                        </div>
                    )}
                </div>
            </div>
            
            {/* DESKTOP SIDE PANEL - Refined matching the Dashboard vibe */}
            <div className="lg:w-80 w-full shrink-0 flex flex-col gap-6 hidden lg:flex">
                <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-black">💡</div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Ledtrådar</h3>
                    </div>
                    <CluePanel revealedClues={revealedClues} question={question} ui={ui} isSolutionRevealed={isSolutionRevealed} />
                </div>
                
                <div className="flex-1 bg-white rounded-[2rem] p-6 shadow-xl border border-slate-100 overflow-hidden flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black">📜</div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Historik</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                        <HistoryList history={uiState.history} ui={ui} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PracticeView;