import React, { useState, useEffect, useRef } from 'react';
import MathText from '../ui/MathText';
import { GraphCanvas, VolumeVisualization, GeometryVisual, StaticGeometryVisual } from '../visuals/GeometryComponents';
import CluePanel from '../practice/CluePanel';
import HistoryList from '../practice/HistoryList';
import LevelUpModal from '../modals/LevelUpModal';
import StreakModal from '../modals/StreakModal'; 
import { LEVEL_DESCRIPTIONS } from '../../constants/localization'; 
// FIX: Import the specialized input components
import { FractionInput, ExponentInput } from '../ui/InputComponents';

// --- SECURITY HELPERS ---

const isValidInput = (val, type) => {
    if (val === '') return true;
    const numericRegex = /^-?[\d\s]*([.,:]\d*)?$/;
    
    // Add 'range' and 'fraction' to allowed types
    if (type === 'numeric' || type === 'scale' || type === 'range') {
        return numericRegex.test(val);
    }
    
    // Fractions/Exponents handle their own validation internally usually, 
    // but globally we just want to block scripts.
    const dangerousRegex = /[<>{}]/g;
    return !dangerousRegex.test(val);
};

const sanitize = (val) => {
    if (typeof val !== 'string') return val;
    return val.replace(/[<>{}]/g, "");
};

const PracticeView = ({ 
    lang, 
    ui, 
    question, 
    loading, 
    feedback, 
    streak, 
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
    showStreakModal, 
    setShowStreakModal, 
    showTotalModal, 
    setShowTotalModal, 
    totalCorrect, 
    timerSettings, 
    formatTime, 
    setMobileHistoryOpen 
}) => {
    const inputRef = useRef(null);
    const [shake, setShake] = useState(false);

    // Auto-focus input when question changes or loads
    useEffect(() => {
        if (!loading && question && inputRef.current) {
            // Small timeout to ensure DOM is ready
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [loading, question]);

    // Shake effect on wrong answer
    useEffect(() => {
        if (feedback === false) {
            setShake(true);
            const timer = setTimeout(() => setShake(false), 500);
            return () => clearTimeout(timer);
        }
    }, [feedback]);

    const onSubmit = (e) => {
        e.preventDefault();
        handleSubmit(e);
    };

    // --- RENDER HELPERS ---

    const renderVisual = () => {
        if (!question || !question.renderData) return null;
        const { renderData } = question;

        // 1. Interactive Graph
        if (renderData.graph) {
            return <GraphCanvas data={renderData.graph} />;
        }
        
        // 2. 3D Volume / Geometry
        if (renderData.geometry) {
            if (['cuboid', 'prism', 'cylinder', 'cone', 'sphere', 'composite'].includes(renderData.geometry.type)) {
                return <VolumeVisualization data={renderData.geometry} />;
            }
            // 2D Shapes (Rectangle, Triangle, etc)
            return <GeometryVisual data={renderData.geometry} />;
        }

        // 3. Static Legacy Visuals
        if (renderData.visual) {
            return <StaticGeometryVisual description={renderData.visual} />;
        }

        return null;
    };

    // FIX: Specialized Input Renderer with Defensive Checks
    const renderInput = () => {
        const type = question?.renderData?.answerType || 'text';

        // Case 1: Fraction Input (Numerator/Denominator)
        // Guard clause: Ensure FractionInput is loaded before rendering
        if (type === 'fraction' && FractionInput) {
            return (
                <div className="flex justify-center my-6">
                    <FractionInput 
                        value={input} 
                        onChange={setInput} 
                        autoFocus={true}
                        allowMixed={true} // Allow mixed numbers (e.g. "1 1/2")
                    />
                </div>
            );
        }

        // Case 2: Exponent Input (Base^Power)
        // Guard clause: Ensure ExponentInput is loaded before rendering
        if (type === 'structured_power' && ExponentInput) {
            return (
                <div className="flex justify-center my-6">
                    <ExponentInput 
                        value={input} 
                        onChange={setInput} 
                        autoFocus={true}
                    />
                </div>
            );
        }

        // Case 3: Standard Text/Numeric Input (Fallback)
        return (
            <div className="relative">
                <input
                    ref={inputRef}
                    type={type === 'numeric' ? 'tel' : 'text'}
                    value={input}
                    onChange={(e) => {
                        if (isValidInput(e.target.value, type)) {
                            setInput(e.target.value);
                        }
                    }}
                    placeholder={ui.placeholder}
                    className={`
                        w-full p-4 pr-12 text-lg rounded-xl border-2 outline-none transition-all shadow-sm
                        ${feedback === false 
                            ? 'border-red-400 bg-red-50 text-red-900 placeholder-red-300' 
                            : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 bg-white text-slate-800'
                        }
                        ${shake ? 'animate-shake' : ''}
                    `}
                    disabled={feedback === true || isSolutionRevealed}
                    autoComplete="off"
                />
                <button 
                    type="submit"
                    disabled={!input || feedback === true}
                    className={`
                        absolute right-2 top-2 bottom-2 aspect-square rounded-lg flex items-center justify-center transition-all
                        ${input 
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transform hover:scale-105' 
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }
                    `}
                >
                    ➜
                </button>
            </div>
        );
    };

    return (
        <div className="flex flex-col lg:flex-row h-screen bg-slate-50 overflow-hidden">
            
            {/* --- Modals --- */}
            <LevelUpModal 
                visible={levelUpAvailable} 
                ui={ui} 
                lang={lang}
                onNext={() => handleChangeLevel(1)} 
                onStay={() => setLevelUpAvailable(false)} 
            />
            <StreakModal 
                visible={showStreakModal}
                streak={streak}
                ui={ui}
                onClose={() => setShowStreakModal(false)}
            />

            {/* --- Main Content Area --- */}
            <div className="flex-1 flex flex-col h-full relative z-0 overflow-hidden">
                
                {/* Header / Top Bar */}
                <header className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shrink-0 shadow-sm z-20">
                    <div className="flex items-center gap-4">
                        <button onClick={actions.goBack} className="text-slate-400 hover:text-slate-700 transition-colors">
                            <span className="font-bold text-lg">✕</span> {ui.backBtn}
                        </button>
                        
                        <div className="hidden md:flex flex-col">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                {CATEGORIES[uiState.topic.toUpperCase()]?.label[lang] || uiState.topic}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800">
                                    {ui.level} {uiState.level}
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full truncate max-w-[150px]">
                                    {LEVEL_DESCRIPTIONS[uiState.topic]?.[uiState.level]?.[lang]}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Timer Display */}
                        {timerSettings && timerSettings.enabled && (
                            <div className={`font-mono font-bold text-lg ${timerSettings.timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-slate-600'}`}>
                                {formatTime(timerSettings.timeLeft)}
                            </div>
                        )}

                        {/* Streak Badge */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-full border border-orange-100 font-bold text-sm">
                            <span>🔥</span> {streak}
                        </div>
                        
                        {/* Mobile History Toggle */}
                        <button 
                            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                            onClick={() => setMobileHistoryOpen(true)}
                        >
                            📜
                        </button>
                    </div>
                </header>

                {/* Scrollable Question Area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 flex flex-col items-center">
                    
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : question ? (
                        <div className="w-full max-w-2xl animate-fade-in pb-20">
                            
                            {/* Question Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                                {/* Visual Area */}
                                <div className="bg-slate-50 border-b border-slate-100 relative">
                                    {renderVisual()}
                                    {/* Suffix/Unit Badge */}
                                    {question.renderData.suffix && (
                                        <div className="absolute top-4 right-4 bg-white/90 px-2 py-1 rounded text-xs font-bold text-slate-500 shadow-sm border border-slate-200">
                                            {question.renderData.suffix}
                                        </div>
                                    )}
                                </div>

                                {/* Text & Input Area */}
                                <div className="p-6 md:p-8">
                                    <h2 className="text-xl md:text-2xl font-medium text-slate-800 mb-6 text-center leading-relaxed">
                                        <MathText text={question.renderData.description} />
                                    </h2>
                                    
                                    {/* LaTeX Expression (if separate from description) */}
                                    {question.renderData.latex && (
                                        <div className="mb-8 text-center">
                                            <MathText text={`$${question.renderData.latex}$`} large={true} className="text-3xl md:text-4xl text-slate-900 font-math" />
                                        </div>
                                    )}

                                    {/* Input Form */}
                                    <form onSubmit={onSubmit} className="max-w-md mx-auto">
                                        {renderInput()}
                                    </form>

                                    {/* Feedback Message */}
                                    {feedback !== null && (
                                        <div className={`mt-4 text-center font-bold text-lg animate-fade-in ${feedback ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {feedback ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    🎉 {ui.correct}
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center gap-2">
                                                    ❌ {ui.incorrect}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <button 
                                    type="button" 
                                    onClick={handleHint} 
                                    disabled={isSolutionRevealed}
                                    className="px-4 py-3 bg-white border border-slate-200 hover:bg-orange-50 hover:border-orange-200 text-slate-600 hover:text-orange-700 font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <span>💡</span> {ui.btnHint}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={handleSolution} 
                                    disabled={isSolutionRevealed}
                                    className="px-4 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <span>🔓</span> {ui.btnSolution}
                                </button>
                            </div>

                            {/* Solution / Skip Area */}
                            <div className="flex justify-center">
                                {isSolutionRevealed ? (
                                    <button onClick={handleSkip} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2 animate-bounce-in">
                                        {ui.btnNext} <span>➡</span>
                                    </button>
                                ) : (
                                    <button type="button" onClick={handleSkip} className="text-slate-400 hover:text-slate-600 text-sm font-semibold transition-colors">
                                        {ui.btnSkip}
                                    </button>
                                )}
                            </div>

                        </div>
                    ) : (
                        <div className="p-12 text-center text-red-400">
                            <p>{ui.error || "Failed to load question."}</p>
                            <button onClick={() => actions.retry(true)} className="text-indigo-600 underline text-sm mt-2">Retry</button>
                        </div>
                    )}
                </main>

                {/* Mobile Clue Panel (Only shows when content exists) */}
                <div className="lg:hidden mt-auto px-4 w-full">
                    {(revealedClues.length > 0) && (
                        <CluePanel revealedClues={revealedClues} question={question} ui={ui} isSolutionRevealed={isSolutionRevealed} />
                    )}
                </div>

            </div>
            
            {/* --- Desktop Sidebar (Clues & History) --- */}
            <div className="w-80 shrink-0 bg-white border-l border-slate-200 hidden lg:flex flex-col">
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-slate-700">{ui.history}</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
                    {/* Clues appear here on desktop */}
                    <CluePanel revealedClues={revealedClues} question={question} ui={ui} isSolutionRevealed={isSolutionRevealed} />
                    
                    <div className="flex-1">
                        <HistoryList history={uiState.history} ui={ui} />
                    </div>
                </div>
            </div>

        </div>
    );
};

export default PracticeView;