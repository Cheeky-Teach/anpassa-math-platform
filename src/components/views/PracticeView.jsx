import React, { useState, useEffect, useRef } from 'react';
import { UI_TEXT } from '../../constants/localization';
import { LEVEL_DESCRIPTIONS } from '../../constants/curriculum';
import MathText from '../ui/MathText';
import { GeometryVisual } from '../visuals/GeometryVisual';
import { VolumeVisualization } from '../visuals/VolumeVisualization';
import { GraphCanvas } from '../visuals/GraphCanvas';
import { CluePanel } from '../practice/CluePanel';
import { HistoryList } from '../practice/HistoryList';
import { MobileDrawer } from '../practice/MobileDrawer';

export const PracticeView = ({ 
  generatorId, 
  initialLevel = 1, 
  onBack, 
  lang = 'sv',
  streak,
  setStreak,
  setTotalCorrect
}) => {
  // --- State ---
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState(null);
  
  // Progression State
  const [currentLevel, setCurrentLevel] = useState(initialLevel);
  const [history, setHistory] = useState([]);
  
  // Interaction State
  const [input, setInput] = useState('');
  const [scaleLeft, setScaleLeft] = useState('');
  const [scaleRight, setScaleRight] = useState('');
  const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect' | null
  
  // Clue State
  const [revealedClues, setRevealedClues] = useState([]);
  const [isSolutionRevealed, setIsSolutionRevealed] = useState(false);
  
  // UI State
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);
  const inputRef = useRef(null);

  const ui = UI_TEXT;

  // --- Actions ---

  const fetchQuestion = async (lvl = currentLevel) => {
    setLoading(true);
    setFeedback(null);
    setInput('');
    setScaleLeft('');
    setScaleRight('');
    setRevealedClues([]);
    setIsSolutionRevealed(false);
    
    try {
      const res = await fetch(`/api/question?generator=${generatorId}&lang=${lang}&level=${lvl}`);
      const data = await res.json();
      setQuestion(data);
    } catch (err) {
      console.error("Failed to fetch", err);
    } finally {
      setLoading(false);
      // Auto-focus logic
      setTimeout(() => {
          if(window.innerWidth > 768) inputRef.current?.focus();
      }, 100);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchQuestion(initialLevel);
  }, []); // Run once on mount

  const handleChangeLevel = (delta) => {
    const newLvl = currentLevel + delta;
    // Check bounds (1 to 9 generally, or based on curriculum)
    // We can loosely check if the level exists in descriptions
    const maxLevel = 9; 
    if (newLvl >= 1 && newLvl <= maxLevel) {
        setCurrentLevel(newLvl);
        setStreak(0); // Reset streak on manual level change
        fetchQuestion(newLvl);
    }
  };

  const handleHint = () => {
    if (question && question.clues) {
        const nextIndex = revealedClues.length;
        if (nextIndex < question.clues.length) {
            setRevealedClues([...revealedClues, question.clues[nextIndex]]);
        }
    }
  };

  const handleSolution = () => {
    if (question && question.clues) {
        setRevealedClues(question.clues);
        setIsSolutionRevealed(true);
        setStreak(0); // Forfeit streak
    }
  };

  const handleSkip = () => {
    if (!question) return;
    
    // Add skipped entry to history
    const entry = {
        topic: generatorId.replace('Gen', '').replace('Generator', ''),
        level: currentLevel,
        correct: false,
        skipped: true,
        text: question.text, // Or renderData.latex if available
        clueUsed: revealedClues.length > 0,
        time: Date.now(),
        correctAnswer: question.displayAnswer || "Skipped"
    };
    setHistory(prev => [entry, ...prev]);
    setStreak(0);
    fetchQuestion();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (feedback === 'correct' || !question) return;

    // Combine input for scale type
    let answerToSubmit = input;
    if (question.renderData?.answerType === 'scale') {
        if (!scaleLeft || !scaleRight) return;
        answerToSubmit = `${scaleLeft}:${scaleRight}`;
    } else {
        if (!input) return;
    }

    try {
        // Send to API
        const res = await fetch('/api/answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                questionId: question.id,
                userAnswer: answerToSubmit,
                generatorId: generatorId
            })
        });
        const result = await res.json();

        if (result.correct) {
            setFeedback('correct');
            setStreak(s => s + 1);
            setTotalCorrect(t => t + 1);
            
            // Add to history
            const entry = {
                topic: generatorId.replace('Gen', '').replace('Generator', ''),
                level: currentLevel,
                correct: true,
                skipped: false,
                text: question.text,
                clueUsed: revealedClues.length > 0 || isSolutionRevealed,
                time: Date.now()
            };
            setHistory(prev => [entry, ...prev]);

            // Delay for "Correct!" message then next
            setTimeout(() => {
                // Check for level up logic here if needed, otherwise:
                fetchQuestion();
            }, 1500);

        } else {
            setFeedback('incorrect');
            setStreak(0);
            // In a real app, we might allow retries. 
            // For this legacy restoration, incorrect usually resets streak but lets you try again 
            // UNLESS you used "Show Solution" which essentially skips it.
        }

    } catch (err) {
        console.error("Submission Error", err);
    }
  };

  // --- Rendering Helpers ---

  const renderVisual = () => {
    if (!question || !question.visual) return null;
    const v = question.visual;
    
    // Dispatch to specific visual components
    if (v.type === 'cube' || v.type === 'cylinder' || v.type === 'cuboid' || v.type === 'pyramid' || v.type === 'cone' || v.type === 'sphere') {
        return <VolumeVisualization visual={v} />;
    }
    if (v.type === 'graph_linear') {
        return <GraphCanvas visual={v} />;
    }
    // Default 2D geometry
    return <GeometryVisual visual={v} />;
  };

  // Safe description accessor
  const getDescription = () => {
      if (!question?.renderData?.description) return null;
      const d = question.renderData.description;
      return typeof d === 'object' ? d[lang] : d;
  };

  if (loading && !question) {
      return (
        <div className="flex-1 flex items-center justify-center p-20">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 flex flex-col lg:flex-row gap-8 items-start fade-in">
        <MobileDrawer open={mobileHistoryOpen} onClose={() => setMobileHistoryOpen(false)} history={history} lang={lang} />

        {/* --- LEFT COLUMN: Main Interaction --- */}
        <div className="flex-1 w-full min-w-0">
            
            {/* Header: Back & Level Controls */}
            <div className="flex justify-between items-center mb-6 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                <button onClick={onBack} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm px-4 py-2 rounded-lg shadow-sm border border-gray-300 transition-all active:scale-95">
                    <span>←</span> {ui.backBtn[lang]}
                </button>

                <div className="flex items-center gap-3">
                    {/* Level Navigator */}
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-200">
                        <button 
                            onClick={() => handleChangeLevel(-1)} 
                            disabled={currentLevel <= 1}
                            className="w-8 h-8 flex items-center justify-center rounded hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all text-gray-600 font-bold"
                        >
                            &lt;
                        </button>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 min-w-[80px] text-center">
                            {generatorId.replace('Gen', '').replace('Generator', '')} • Lvl {currentLevel}
                        </span>
                        <button 
                            onClick={() => handleChangeLevel(1)} 
                            disabled={currentLevel >= 9}
                            className="w-8 h-8 flex items-center justify-center rounded hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all text-gray-600 font-bold"
                        >
                            &gt;
                        </button>
                    </div>

                    {/* Mobile History Toggle */}
                    <button onClick={() => setMobileHistoryOpen(true)} className="lg:hidden p-2 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </button>
                </div>
            </div>

            {/* Question Card */}
            <main className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 relative">
                <div className="p-4 sm:p-6">
                    
                    {/* Visualization Area */}
                    <div className="mb-4 flex justify-center bg-gray-50 rounded-xl p-4 min-h-[160px] items-center border border-gray-100 relative overflow-hidden">
                        {renderVisual()}
                        {/* Fallback text if no visual but we have latex */}
                        {!question.visual && question.text && (
                             <div className="text-2xl sm:text-4xl font-mono text-gray-800 my-4 text-center">
                                 <MathText text={question.text} />
                             </div>
                        )}
                    </div>

                    {/* Description Text */}
                    {getDescription() && (
                        <div className="mb-4 text-center">
                            <h2 className="text-lg sm:text-xl font-medium text-gray-700 leading-relaxed">
                                <MathText text={getDescription()} />
                            </h2>
                        </div>
                    )}

                    {/* Answer Input Form */}
                    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 mt-8">
                        {question.renderData?.answerType === 'scale' ? (
                            <div className="flex items-center justify-center gap-2">
                                <input 
                                    type="text" 
                                    value={scaleLeft} 
                                    onChange={(e) => setScaleLeft(e.target.value)} 
                                    className={`w-24 p-4 text-center text-xl font-medium border-2 rounded-xl outline-none transition-all shadow-sm ${feedback === 'correct' ? 'border-primary-500 bg-primary-50 text-primary-700' : feedback === 'incorrect' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 focus:border-accent-500 focus:ring-4 focus:ring-accent-50'}`} 
                                    placeholder="X" 
                                    disabled={feedback === 'correct'} 
                                />
                                <span className="text-2xl font-bold text-gray-400">:</span>
                                <input 
                                    type="text" 
                                    value={scaleRight} 
                                    onChange={(e) => setScaleRight(e.target.value)} 
                                    className={`w-24 p-4 text-center text-xl font-medium border-2 rounded-xl outline-none transition-all shadow-sm ${feedback === 'correct' ? 'border-primary-500 bg-primary-50 text-primary-700' : feedback === 'incorrect' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 focus:border-accent-500 focus:ring-4 focus:ring-accent-50'}`} 
                                    placeholder="Y" 
                                    disabled={feedback === 'correct'} 
                                />
                            </div>
                        ) : (
                            <div className="relative">
                                <input 
                                    ref={inputRef}
                                    type="text" 
                                    value={input} 
                                    onChange={(e) => setInput(e.target.value)} 
                                    className={`w-full p-4 text-center text-xl font-medium border-2 rounded-xl outline-none transition-all shadow-sm ${feedback === 'correct' ? 'border-primary-500 bg-primary-50 text-primary-700' : feedback === 'incorrect' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 focus:border-accent-500 focus:ring-4 focus:ring-accent-50'}`} 
                                    placeholder={ui.placeholder[lang]} 
                                    autoComplete="off"
                                    disabled={feedback === 'correct'} 
                                />
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-md transition-all active:scale-95 ${feedback === 'correct' ? 'bg-primary-500 shadow-green-200 cursor-default' : 'bg-accent-500 hover:bg-accent-600 shadow-orange-200 hover:shadow-lg'}`}
                        >
                            {feedback === 'correct' ? ui.correct[lang].split('!')[0] + '!' : (feedback === 'incorrect' ? ui.incorrect[lang].split(',')[0] : ui.submit[lang])}
                        </button>
                    </form>

                    {/* Action Buttons (Hint, Skip, Solve) */}
                    <div className="mt-6 flex gap-3 justify-center flex-wrap">
                        <button 
                            type="button" 
                            onClick={handleHint} 
                            disabled={!question.clues || revealedClues.length >= question.clues.length} 
                            className="px-4 py-2 text-sm font-semibold rounded-lg bg-accent-50 text-accent-700 border border-accent-200 hover:bg-accent-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            <span>💡</span> {ui.btnHint[lang]}
                        </button>
                        
                        <button 
                            type="button" 
                            onClick={handleSolution} 
                            disabled={!question.clues || isSolutionRevealed} 
                            className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {ui.btnSolution[lang]}
                        </button>
                        
                        <button 
                            type="button" 
                            onClick={handleSkip} 
                            className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors flex items-center gap-2"
                        >
                            <span>⏭️</span> {ui.btnSkip[lang]}
                        </button>
                    </div>
                </div>
            </main>
        </div>

        {/* --- RIGHT COLUMN: Sidebar (Desktop) --- */}
        <div className="lg:w-80 w-full shrink-0 flex flex-col gap-4 hidden lg:flex self-start sticky top-24">
            <CluePanel 
                revealedClues={revealedClues} 
                totalClues={question?.clues?.length || 0} 
                ui={ui} 
                lang={lang}
                isSolutionRevealed={isSolutionRevealed}
            />
            <div className="flex-1 min-h-0 max-h-[calc(100vh-200px)]">
                <HistoryList history={history} lang={lang} />
            </div>
        </div>

    </div>
  );
};