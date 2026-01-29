import React, { useState, useEffect, useRef } from 'react';
import MathText from '../ui/MathText';
import { GraphCanvas, VolumeVisualization, GeometryVisual, StaticGeometryVisual } from '../visuals/GeometryComponents';
import CluePanel from '../practice/CluePanel';
import HistoryList from '../practice/HistoryList';
import LevelUpModal from '../modals/LevelUpModal';
import StreakModal from '../modals/StreakModal'; 
import { LEVEL_DESCRIPTIONS } from '../../constants/localization'; 

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

    // Safe Description Access
    const descriptionText = typeof question?.renderData?.description === 'object' 
        ? question.renderData.description[lang] 
        : question?.renderData?.description;
    
    // Auto-focus input on new question
    useEffect(() => {
        if (!loading && question && !feedback && inputRef.current) {
            inputRef.current.focus();
        }
    }, [question, loading, feedback]);

    // Handle "Enter" key
    const onKeyDown = (e) => {
        if (e.key === 'Enter' && !feedback) {
            handleSubmit(e);
        }
    };

    // Render Geometry
    const renderVisual = () => {
        if (!question?.renderData) return null;
        
        // 1. Graph
        if (question.renderData.graph) {
            return <GraphCanvas data={question.renderData.graph} />;
        }

        // 2. Geometry / Volume
        const geom = question.renderData.geometry;
        if (geom) {
            const volumeTypes = ['cuboid', 'cylinder', 'cone', 'sphere', 'hemisphere', 'pyramid', 'triangular_prism', 'silo', 'ice_cream'];
            if (volumeTypes.includes(geom.type)) {
                return <VolumeVisualization data={geom} />;
            }
            return <GeometryVisual data={geom} />;
        }

        // 3. Static Fallback
        if (question.renderData.staticVisual) {
            return <StaticGeometryVisual description={question.renderData.staticVisual} />;
        }
        
        return null;
    };

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50">
            {/* Modals */}
            <LevelUpModal visible={levelUpAvailable} onClose={() => setLevelUpAvailable(false)} onLevelUp={() => handleChangeLevel(1)} onStay={() => actions.retry(true)} lang={lang} />
            <StreakModal visible={showStreakModal} onClose={() => setShowStreakModal(false)} streak={streak} ui={ui} />
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                
                {/* Mobile History Toggle */}
                <div className="lg:hidden p-2 flex justify-end">
                    <button onClick={() => setMobileHistoryOpen(true)} className="text-sm font-bold text-slate-500 flex items-center gap-1">
                        <span>📜</span> {ui.menu_btn || "History"}
                    </button>
                </div>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
                    
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4 animate-pulse">
                            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                            <p className="text-slate-400 font-medium">Generating problem...</p>
                        </div>
                    ) : question ? (
                        <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                            
                            {/* Question Header */}
                            <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-700">{LEVEL_DESCRIPTIONS[uiState.topic]?.[uiState.level]?.[lang] || `Level ${uiState.level}`}</h2>
                                    {timerSettings.isActive && (
                                        <div className="text-xs font-mono text-orange-600 font-bold mt-1">
                                            ⏱ {formatTime(timerSettings.remaining)}
                                        </div>
                                    )}
                                </div>
                                <div className="text-sm font-bold px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-500 shadow-sm">
                                    Total: {totalCorrect}
                                </div>
                            </div>

                            {/* Visual Area */}
                            <div className="p-8 flex justify-center bg-white min-h-[200px] items-center">
                                {renderVisual()}
                            </div>

                            {/* Question Text */}
                            <div className="px-8 pb-4 text-center">
                                <p className="text-xl md:text-2xl text-slate-800 font-medium leading-relaxed">
                                    {descriptionText}
                                </p>
                                {question.renderData.latex && (
                                    <div className="mt-6 mb-2 text-3xl md:text-4xl text-indigo-900 font-bold">
                                        <MathText text={question.renderData.latex} />
                                    </div>
                                )}
                            </div>

                            {/* Input Area */}
                            <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col items-center gap-4">
                                {question.renderData.answerType === 'multiple_choice' ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                                        {question.renderData.options.map((opt, idx) => (
                                            <button
                                                key={idx}
                                                onClick={(e) => handleSubmit(e, opt)}
                                                disabled={feedback !== null}
                                                className={`
                                                    py-4 px-6 rounded-xl font-bold text-lg transition-all shadow-sm border-2
                                                    ${feedback 
                                                        ? (opt === (question.token ? atob(question.token) : "") 
                                                            ? 'bg-green-100 border-green-500 text-green-800' 
                                                            : 'bg-slate-100 border-slate-200 text-slate-400 opacity-50')
                                                        : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-500 hover:text-indigo-700 hover:shadow-md active:scale-98'
                                                    }
                                                `}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-4">
                                        <div className="relative">
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                disabled={feedback !== null}
                                                placeholder={question.renderData.placeholder || "..."}
                                                className={`
                                                    w-full px-6 py-4 text-2xl font-bold text-center rounded-2xl border-2 outline-none transition-all shadow-sm
                                                    ${feedback === 'correct' ? 'border-green-500 bg-green-50 text-green-900' : ''}
                                                    ${feedback === 'incorrect' ? 'border-red-500 bg-red-50 text-red-900' : ''}
                                                    ${!feedback ? 'border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10' : ''}
                                                `}
                                            />
                                            {question.renderData.suffix && (
                                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg pointer-events-none">
                                                    {question.renderData.suffix}
                                                </span>
                                            )}
                                        </div>

                                        {feedback && (
                                            <div className={`p-4 rounded-xl text-center font-bold animate-in slide-in-from-bottom-2 ${feedback === 'correct' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {feedback === 'correct' ? (
                                                    <span>🎉 {ui.tagCorrect || "Correct!"}</span>
                                                ) : (
                                                    <span>❌ {ui.tagWrong || "Try again"}</span>
                                                )}
                                            </div>
                                        )}

                                        {!feedback && (
                                            <button 
                                                type="submit" 
                                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-98 text-lg"
                                            >
                                                {ui.btnCheck || (lang === 'sv' ? "Svara" : "Submit")}
                                            </button>
                                        )}
                                    </form>
                                )}

                                {/* Action Bar */}
                                <div className="flex gap-4 mt-2">
                                    {feedback && (
                                        <button onClick={() => actions.retry(true)} className="flex-1 bg-slate-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-900 transition-all shadow-lg">
                                            Next ➡
                                        </button>
                                    )}
                                    {!feedback && (
                                        <>
                                            <button type="button" onClick={handleHint} disabled={isSolutionRevealed} className="px-4 py-2 text-sm font-semibold rounded-lg bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 transition-colors flex items-center gap-2">
                                                <span>💡</span> {ui.btnHint || "Hint"}
                                            </button>
                                            <button type="button" onClick={handleSolution} disabled={!question.clues || isSolutionRevealed} className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                                {ui.btnSolution || "Solution"}
                                            </button>
                                            <button type="button" onClick={handleSkip} className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors flex items-center gap-2">
                                                <span>⏭️</span> {ui.btnSkip || "Skip"}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 text-center text-red-400">
                            <p>{ui.error || "Failed to load question."}</p>
                            <button onClick={() => actions.retry(true)} className="text-indigo-600 underline text-sm mt-2">Retry</button>
                        </div>
                    )}
                </main>
            </div>
            
            <div className="lg:w-80 w-full shrink-0 flex flex-col gap-4 hidden lg:flex border-l border-slate-200 bg-white p-4">
                <CluePanel revealedClues={revealedClues} question={question} ui={ui} isSolutionRevealed={isSolutionRevealed} />
                <div className="flex-1 min-h-0"><HistoryList history={uiState.history} ui={ui} /></div>
            </div>
        </div>
    );
};

export default PracticeView;