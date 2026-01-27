import React, { useState, useEffect, useRef } from 'react';
import { UI_TEXT } from '../../constants/localization';
import { Button } from '../ui/Button';
import MathText from '../ui/MathText';
import { GeometryVisual } from '../visuals/GeometryVisual';
import { VolumeVisualization } from '../visuals/VolumeVisualization';
import { GraphCanvas } from '../visuals/GraphCanvas';
import { ArrowLeft } from 'lucide-react';

export const PracticeView = ({ generatorId, initialLevel = 1, onBack, lang = 'sv' }) => {
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [streak, setStreak] = useState(0);
  
  // Use state to track level progression (starts at selected level)
  const [currentLevel, setCurrentLevel] = useState(initialLevel);

  const inputRef = useRef(null);

  // Updated Fetch to include Level
  const fetchQuestion = async (forceRetry = false) => {
    setLoading(true);
    setFeedback(null);
    setAnswer('');
    
    try {
      // Pass the level parameter to the API
      const res = await fetch(`/api/question?generator=${generatorId}&lang=${lang}&level=${currentLevel}`);
      if (!res.ok) throw new Error("API Error");
      const data = await res.json();
      setQuestion(data);
    } catch (err) {
      console.error("Failed to fetch", err);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, [generatorId, currentLevel]); // Re-fetch if Level changes

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer || !question) return;

    try {
      const res = await fetch('/api/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: question.id,
          userAnswer: answer,
          generatorId: generatorId
        })
      });
      
      const result = await res.json();
      
      setFeedback({
        isCorrect: result.correct,
        text: result.message || (result.correct ? UI_TEXT.correct[lang] : UI_TEXT.incorrect[lang])
      });

      if (result.correct) {
        setStreak(s => s + 1);
        // Basic progression logic (mockup for now)
        if (streak > 2) { 
            // In full app, backend decides level up, but we can simulate locally
            // setCurrentLevel(prev => Math.min(prev + 1, 5));
        }
      } else {
        setStreak(0);
      }

    } catch (err) {
      console.error("Answer submission error", err);
    }
  };

  const handleNext = () => {
    fetchQuestion();
  };

  const renderVisual = () => {
    if (!question || !question.visual) return null;
    if (question.visual.type === 'cube' || question.visual.type === 'cylinder') {
        return <VolumeVisualization visual={question.visual} />;
    }
    if (question.visual.type === 'graph_linear') {
        return <GraphCanvas visual={question.visual} />;
    }
    return <GeometryVisual visual={question.visual} />;
  };

  if (loading && !question) {
    return <div className="p-10 text-center">{UI_TEXT.loading[lang]}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft size={20} /> Back
        </Button>
        <div className="flex gap-4 text-sm font-semibold text-gray-500">
           <span>{UI_TEXT.level[lang]}: <span className="text-math-blue">{currentLevel}</span></span>
           <span>{UI_TEXT.streak[lang]}: <span className="text-math-green">{streak}</span></span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 bg-gray-50 border-b border-gray-100">
           <h2 className="text-lg font-medium text-gray-800">
             Problem
           </h2>
        </div>
        
        <div className="p-6">
          <div className="text-lg mb-6 text-gray-700">
            <MathText text={question?.text} />
          </div>

          {renderVisual()}

          <form onSubmit={handleSubmit} className="mt-8">
            <div className="flex gap-4">
               <input
                 ref={inputRef}
                 type="text"
                 value={answer}
                 onChange={(e) => setAnswer(e.target.value)}
                 placeholder="Answer..."
                 className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-math-blue focus:border-math-blue outline-none transition-all"
                 disabled={feedback !== null} 
                 autoComplete="off"
               />
               
               {feedback ? (
                 <Button 
                   type="button" 
                   onClick={handleNext} 
                   variant={feedback.isCorrect ? "success" : "primary"}
                 >
                   {UI_TEXT.next[lang]}
                 </Button>
               ) : (
                 <Button type="submit">
                   {UI_TEXT.check[lang]}
                 </Button>
               )}
            </div>
          </form>

          {feedback && (
            <div className={`mt-4 p-4 rounded-lg ${feedback.isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <div className="font-bold flex items-center gap-2">
                {feedback.isCorrect ? '✓ ' + UI_TEXT.correct[lang] : '✗ ' + UI_TEXT.incorrect[lang]}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};