import React, { useState, useEffect, useRef } from 'react';
import MathText from '../ui/MathText';
import { GraphCanvas, VolumeVisualization, GeometryVisual, StaticGeometryVisual } from '../visuals/GeometryComponents';
import CluePanel from '../practice/CluePanel';
import HistoryList from '../practice/HistoryList';
import LevelUpModal from '../modals/LevelUpModal';
import StreakModal from '../modals/StreakModal'; 
import { LEVEL_DESCRIPTIONS } from '../../constants/localization'; 

// --- SECURITY HELPERS ---

const isValidInput = (val, type) => {
    if (val === '') return true;
    const numericRegex = /^-?[\d\s]*([.,:]\d*)?$/;
    if (type === 'numeric' || type === 'scale') {
        return numericRegex.test(val);
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
    const [scaleInputLeft, setScaleInputLeft] = useState('');
    const [scaleInputRight, setScaleInputRight] = useState('');
    const inputRef = useRef(null);

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

    const descriptionText = typeof question?.renderData?.description === 'object' ? question.renderData.description[lang] : question?.renderData?.description;
    
    const handleChoiceClick = (choice) => { 
        if (feedback === 'correct') return; 
        setInput(choice); 
        handleSubmit({ preventDefault: () => { } }, choice); 
    };
    
    // --- SUBMIT HANDLER ---
    const handleFormSubmit = (e) => {
        e.preventDefault();
        
        let finalInput = input;
        const answerType = question.renderData.answerType;

        if (answerType === 'scale') {
            if (scaleInputLeft === '' || scaleInputRight === '' || 
                !isValidInput(scaleInputLeft, 'numeric') || !isValidInput(scaleInputRight, 'numeric')) {
                return; 
            }
            finalInput = `${scaleInputLeft}:${scaleInputRight}`;
        } else {
            if (!isValidInput(input, answerType === 'numeric' ? 'numeric' : 'text')) {
                return;
            }
            if (answerType !== 'numeric') {
                finalInput = sanitize(input);
            }
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

    useEffect(() => {
        if (question && !loading) {
            setScaleInputLeft('');
            setScaleInputRight('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            const isMobile = window.innerWidth < 768;
            if (!isMobile && inputRef.current) {
                inputRef.current.focus();
            }
        }
    }, [question, loading]);

    const maxLevels = Object.keys(LEVEL_DESCRIPTIONS[uiState.topic] || {}).length;

    const renderVisual = () => {
        if (!question?.renderData) return null;

        if (question.renderData.graph) {
            return <GraphCanvas data={question.renderData.graph} />;
        } 
        
        const geom = question.renderData.geometry;
        if (geom) {
            const volumeTypes = ['cuboid', 'triangular_prism', 'pyramid', 'sphere', 'hemisphere', 'ice_cream', 'cone', 'cylinder', 'silo'];
            if (volumeTypes.includes(geom.type)) {
                return <VolumeVisualization data={geom} />;
            }
            return <GeometryVisual data={geom} />;
        }

        if (uiState.topic === 'geometry') {
            return <StaticGeometryVisual description={descriptionText} />;
        }

        if (question.renderData.latex) {
             return <div className="text-2xl sm:text-4xl font-mono text-gray-800 my-4 text-center"><MathText text={`$${question.renderData.latex}$`} large={true} /></div>;
        }

        return <div className="flex flex-col items-center justify-center w-full min-h-[100px]"></div>;
    };

    return (
        <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 flex flex-col lg:flex-row gap-8 items-start fade-in">
            
            <LevelUpModal 
                visible={levelUpAvailable} 
                ui={ui} 
                onNext={() => { 
                    handleChangeLevel(1); 
                    setLevelUpAvailable(false); 
                }} 
                onStay={() => { 
                    setLevelUpAvailable(false); 
                    actions.retry(true); 
                }} 
                lang={lang} 
            />

            <StreakModal visible={showStreakModal} onClose={() => setShowStreakModal(false)} streak={streak} ui={ui} />
            
            <div className="flex-1 w-full min-w-0">
                {/* HEADER BAR */}
                <div className="flex justify-between items-center mb-6 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                    <button onClick={actions.goBack} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm px-4 py-2 rounded-lg shadow-sm border border-gray-300 transition-all active:scale-95"><span>←</span> {ui.backBtn}</button>

                    <div className="flex items-center gap-3">
                        {timerSettings.duration > 0 && (
                            <div className={`font-mono text-sm font-bold px-3 py-1.5 rounded-lg border hidden sm:block ${timerSettings.remaining < 60 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-white text-gray-700 border-gray-200'}`}>
                                {formatTime(timerSettings.remaining)}
                            </div>
                        )}

                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-200">
                            <button onClick={() => handleChangeLevel(-1)} disabled={uiState.level <= 1} className="w-8 h-8 flex items-center justify-center rounded hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all text-gray-600 font-bold" title={ui.prevLevel || "<"}>&lt;</button>
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 min-w-[80px] text-center">{uiState.topic} • Lvl {uiState.level}</span>
                            <button onClick={() => handleChangeLevel(1)} disabled={uiState.level >= maxLevels} className="w-8 h-8 flex items-center justify-center rounded hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all text-gray-600 font-bold" title={ui.nextLevel || ">"}>&gt;</button>
                        </div>

                        <button onClick={() => setMobileHistoryOpen(true)} className="lg:hidden p-2 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </button>
                    </div>
                </div>

                <main className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 relative">
                    {loading ? (
                        <div className="p-20 text-center flex flex-col items-center gap-4">
                            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        </div>
                    ) : question ? (
                        <div className="p-4 sm:p-6">
                            <div className="mb-4 flex justify-center bg-gray-50 rounded-xl p-4 min-h-[160px] items-center border border-gray-100 relative">
                                {renderVisual()}
                            </div>
                            
                            <div className="mb-4 text-center"><h2 className="text-lg sm:text-xl font-medium text-gray-700 leading-relaxed"><MathText text={descriptionText} /></h2></div>
                            
                            {question.renderData.answerType === 'multiple_choice' ? (
                                <div className="max-w-md mx-auto grid grid-cols-2 gap-4">
                                    {question.renderData.options && question.renderData.options.map((choice, idx) => (
                                        <button 
                                            key={idx} 
                                            onClick={() => handleChoiceClick(choice)} 
                                            className={`py-4 rounded-xl font-bold text-lg shadow-sm transition-all active:scale-95 border-2 ${feedback === 'correct' && choice === input ? 'bg-green-500 border-green-500 text-white' : feedback === 'incorrect' && choice === input ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-500 hover:text-indigo-600'}`} 
                                            disabled={feedback !== null}
                                        >
                                            {choice}
                                        </button>
                                    ))}
                                    {question.renderData.choices && question.renderData.choices.map((choice, idx) => (
                                        <button 
                                            key={idx} 
                                            onClick={() => handleChoiceClick(choice)} 
                                            className={`py-4 rounded-xl font-bold text-lg shadow-sm transition-all active:scale-95 border-2 ${feedback === 'correct' && choice === input ? 'bg-green-500 border-green-500 text-white' : feedback === 'incorrect' && choice === input ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-500 hover:text-indigo-600'}`} 
                                            disabled={feedback !== null}
                                        >
                                            {choice}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <form onSubmit={handleFormSubmit} className="max-w-md mx-auto space-y-4">
                                    {question.renderData.answerType === 'scale' ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <input type="text" value={scaleInputLeft} onChange={(e) => handleInputChange(e, setScaleInputLeft, 'numeric')} className={`w-24 p-4 text-center text-xl font-medium border-2 rounded-xl outline-none transition-all shadow-sm ${feedback === 'correct' ? 'border-green-500 bg-green-50 text-green-700' : feedback === 'incorrect' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50'}`} placeholder="X" disabled={feedback === 'correct'} />
                                            <span className="text-2xl font-bold text-gray-400">:</span>
                                            <input type="text" value={scaleInputRight} onChange={(e) => handleInputChange(e, setScaleInputRight, 'numeric')} className={`w-24 p-4 text-center text-xl font-medium border-2 rounded-xl outline-none transition-all shadow-sm ${feedback === 'correct' ? 'border-green-500 bg-green-50 text-green-700' : feedback === 'incorrect' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50'}`} placeholder="X" disabled={feedback === 'correct'} />
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <input ref={inputRef} type="text" value={input} onChange={(e) => handleInputChange(e, setInput, question.renderData.answerType)} className={`w-full p-4 text-center text-xl font-medium border-2 rounded-xl outline-none transition-all shadow-sm ${feedback === 'correct' ? 'border-green-500 bg-green-50 text-green-700' : feedback === 'incorrect' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50'}`} placeholder={ui.placeholder || "..."} disabled={feedback === 'correct'} />
                                        </div>
                                    )}
                                    <button 
                                        type="submit" 
                                        className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-md transition-all active:scale-95 ${feedback === 'correct' ? 'bg-primary-500 shadow-green-200 cursor-default' : 'bg-accent-500 hover:bg-accent-600 shadow-orange-200 hover:shadow-lg'}`}
                                    >
                                        {feedback === 'correct' ? (ui.tagCorrect || "Correct") : feedback === 'incorrect' ? (ui.tagWrong || "Incorrect") : (ui.btnCheck || (lang === 'sv' ? "Svara" : "Submit"))}
                                    </button>
                                </form>
                            )}

                            <div className="mt-6 flex gap-3 justify-center flex-wrap">
                                <button type="button" onClick={handleHint} disabled={!question.clues || revealedClues.length >= question.clues.length} className="px-4 py-2 text-sm font-semibold rounded-lg bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"><span>💡</span> {ui.btnHint}</button>
                                <button type="button" onClick={handleSolution} disabled={!question.clues || isSolutionRevealed} className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{ui.btnSolution}</button>
                                <button type="button" onClick={handleSkip} className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors flex items-center gap-2"><span>⏭️</span> {ui.btnSkip}</button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 text-center text-red-400">
                            <p>{ui.error || "Failed to load question."}</p>
                            <button onClick={() => actions.retry(true)} className="text-indigo-600 underline text-sm mt-2">Retry</button>
                        </div>
                    )}
                </main>

                {/* --- MOBILE CLUES FIX: Visible only on small screens when needed --- */}
                <div className="lg:hidden mt-6 w-full">
                    {(revealedClues.length > 0 || isSolutionRevealed) && (
                        <CluePanel 
                            revealedClues={revealedClues} 
                            question={question} 
                            ui={ui} 
                            isSolutionRevealed={isSolutionRevealed} 
                        />
                    )}
                </div>

            </div>
            
            {/* Desktop Sidebar (unchanged) */}
            <div className="lg:w-80 w-full shrink-0 flex flex-col gap-4 hidden lg:flex">
                <CluePanel revealedClues={revealedClues} question={question} ui={ui} isSolutionRevealed={isSolutionRevealed} />
                <div className="flex-1 min-h-0"><HistoryList history={uiState.history} ui={ui} /></div>
            </div>
        </div>
    );
};

export default PracticeView;