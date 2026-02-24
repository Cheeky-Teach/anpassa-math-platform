import React, { useState, useEffect, useRef } from 'react';
import { 
    ChevronLeft, Play, Timer, Zap, CheckCircle2, 
    RotateCcw, Award, Hash, Grid3X3, Target, Activity
} from 'lucide-react';

const TimesTable = ({ lang, onBack }) => {
    // --- 1. SETTINGS & SETUP STATE ---
    const [view, setView] = useState('setup'); 
    const [selectedNumbers, setSelectedNumbers] = useState([]);
    const [mode, setMode] = useState('shuffle'); 
    const [timeTrialLeft, setTimeTrialLeft] = useState(120);

    // --- 2. GAMEPLAY STATE ---
    const [question, setQuestion] = useState({ a: 0, b: 0 });
    const [userInput, setUserInput] = useState('');
    const [feedback, setFeedback] = useState(null); 
    const [stats, setStats] = useState({ correct: 0, total: 0 });
    const [questionPool, setQuestionPool] = useState([]);
    const [poolIndex, setPoolIndex] = useState(0);

    const timerRef = useRef(null);

    const t = {
        sv: {
            title: "Multiplikation",
            setup_h: "Välj tabeller",
            start_seq: "I ordning",
            start_shuf: "Blandat",
            start_trial: "Time Trial",
            all_btn: "Alla",
            none_btn: "Nollställ",
            correct_label: "Rätt svar",
            total_label: "Försök",
            accuracy_label: "Träffsäkerhet",
            time_left: "Tid kvar",
            results_h: "Session klar!",
            restart: "Träna igen",
            back: "Tillbaka",
        },
        en: {
            title: "Multiplication",
            setup_h: "Choose Tables",
            start_seq: "Sequential",
            start_shuf: "Shuffled",
            start_trial: "Time Trial",
            all_btn: "Select All",
            none_btn: "Clear",
            correct_label: "Correct",
            total_label: "Attempts",
            accuracy_label: "Accuracy",
            time_left: "Time Left",
            results_h: "Session Complete!",
            restart: "Practice Again",
            back: "Back",
        }
    }[lang];

    const startPractice = (selectedMode) => {
        if (selectedNumbers.length === 0) return;
        let pool = [];
        selectedNumbers.forEach(num => {
            for (let i = 0; i <= 10; i++) pool.push({ a: num, b: i });
        });
        if (selectedMode !== 'sequential') pool = pool.sort(() => Math.random() - 0.5);

        setMode(selectedMode);
        setQuestionPool(pool);
        setPoolIndex(0);
        setQuestion(pool[0]);
        setStats({ correct: 0, total: 0 });
        setView('playing');
        if (selectedMode === 'timeTrial') setTimeTrialLeft(120);
    };

    useEffect(() => {
        if (view === 'playing' && mode === 'timeTrial') {
            timerRef.current = setInterval(() => {
                setTimeTrialLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        setView('results');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [view, mode]);

    const handleInput = (val) => {
        if (feedback === 'correct') return;
        setUserInput(val);
        const expected = question.a * question.b;
        
        if (parseInt(val) === expected) {
            setFeedback('correct');
            setStats(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
            setTimeout(nextQuestion, 400);
        } else if (val.length >= expected.toString().length && parseInt(val) !== expected) {
            setFeedback('incorrect');
            setStats(prev => ({ ...prev, total: prev.total + 1 }));
            setTimeout(() => {
                setFeedback(null);
                setUserInput('');
            }, 800);
        }
    };

    const nextQuestion = () => {
        setFeedback(null);
        setUserInput('');
        const nextIdx = (poolIndex + 1) % questionPool.length;
        if (nextIdx === 0 && mode !== 'sequential') {
            setQuestionPool([...questionPool].sort(() => Math.random() - 0.5));
        }
        setQuestion(questionPool[nextIdx]);
        setPoolIndex(nextIdx);
    };

    // --- VIEW: SETUP ---
    if (view === 'setup') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in duration-500">
                <div className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-xl border border-emerald-50 p-6 sm:p-10 relative">
                    <button onClick={onBack} className="absolute top-6 left-6 p-2 text-slate-300 hover:text-emerald-600 transition-colors">
                        <ChevronLeft size={20} />
                    </button>

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">{t.setup_h}</h2>
                    </div>

                    <div className="grid grid-cols-5 gap-2 mb-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                            <button
                                key={n}
                                onClick={() => setSelectedNumbers(prev => 
                                    prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]
                                )}
                                className={`py-4 sm:py-5 rounded-xl font-black text-lg transition-all ${
                                    selectedNumbers.includes(n) 
                                    ? 'bg-emerald-600 text-white shadow-lg scale-105' 
                                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                }`}
                            >
                                {n}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2 mb-8">
                        <button onClick={() => setSelectedNumbers([1,2,3,4,5,6,7,8,9,10])} className="flex-1 py-2.5 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-200">{t.all_btn}</button>
                        <button onClick={() => setSelectedNumbers([])} className="flex-1 py-2.5 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-200">{t.none_btn}</button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button disabled={selectedNumbers.length === 0} onClick={() => startPractice('sequential')} className="flex-1 py-4 bg-slate-900 text-white rounded-xl font-bold uppercase text-[9px] tracking-widest hover:bg-emerald-600 disabled:opacity-20">{t.start_seq}</button>
                        <button disabled={selectedNumbers.length === 0} onClick={() => startPractice('shuffle')} className="flex-1 py-4 bg-slate-900 text-white rounded-xl font-bold uppercase text-[9px] tracking-widest hover:bg-emerald-600 disabled:opacity-20">{t.start_shuf}</button>
                        <button disabled={selectedNumbers.length === 0} onClick={() => startPractice('timeTrial')} className="flex-1 py-4 bg-orange-500 text-white rounded-xl font-bold uppercase text-[9px] tracking-widest hover:bg-orange-600 disabled:opacity-20">{t.start_trial}</button>
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW: PLAYING ---
    if (view === 'playing') {
        const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

        return (
            <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 animate-in zoom-in-95 duration-300">
                <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6 items-stretch">
                    
                    {/* LEFT: WORK AREA (The Problem) */}
                    <div className={`flex-[2] bg-white rounded-[3rem] shadow-xl p-8 sm:p-12 border-4 transition-all duration-300 flex flex-col items-center justify-center min-h-[320px] sm:min-h-[400px] ${
                        feedback === 'correct' ? 'border-emerald-500 bg-emerald-50/10' : 
                        feedback === 'incorrect' ? 'border-rose-500 animate-shake' : 'border-slate-50'
                    }`}>
                        <div className="text-6xl sm:text-7xl font-black tracking-tighter text-slate-800 mb-10 flex items-center justify-center gap-6 select-none">
                            <span>{question.a}</span>
                            <span className="text-emerald-500/50 leading-none">·</span>
                            <span>{question.b}</span>
                        </div>

                        <input
                            autoFocus
                            type="number"
                            inputMode="numeric"
                            value={userInput}
                            onChange={(e) => handleInput(e.target.value)}
                            className="w-full max-w-[160px] text-center text-5xl font-black py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-4 focus:ring-emerald-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="?"
                        />
                    </div>

                    {/* RIGHT: STATS PANEL */}
                    <div className="flex-1 flex flex-col gap-4">
                        {/* Time Left (Only in Time Trial) */}
                        {mode === 'timeTrial' && (
                            <div className="bg-orange-500 text-white rounded-[2rem] p-6 shadow-lg shadow-orange-100 flex flex-col items-center justify-center border-b-4 border-orange-700">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">{t.time_left}</span>
                                <span className="text-3xl font-black">{timeTrialLeft}s</span>
                            </div>
                        )}

                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex-1 flex flex-col justify-around gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600"><CheckCircle2 size={20}/></div>
                                <div>
                                    <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400">{t.correct_label}</span>
                                    <span className="text-xl font-black text-slate-700">{stats.correct}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600"><Activity size={20}/></div>
                                <div>
                                    <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400">{t.total_label}</span>
                                    <span className="text-xl font-black text-slate-700">{stats.total}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600"><Target size={20}/></div>
                                <div>
                                    <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400">{t.accuracy_label}</span>
                                    <span className="text-xl font-black text-slate-700">{accuracy}%</span>
                                </div>
                            </div>
                        </div>

                        <button onClick={() => setView('setup')} className="py-4 text-[14px] font-black uppercase tracking-[0.2em] text-slate-800 hover:text-rose-500 transition-colors">
                            {t.back}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW: RESULTS ---
    if (view === 'results') {
        const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
                <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl border border-emerald-50 p-10 text-center">
                    <Award className="mx-auto text-emerald-500 mb-4" size={56} />
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-800 mb-8">{t.results_h}</h2>
                    
                    <div className="grid grid-cols-2 gap-3 mb-8">
                        <div className="bg-slate-50 p-5 rounded-2xl">
                            <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{t.correct_label}</span>
                            <span className="text-2xl font-black text-slate-800">{stats.correct}</span>
                        </div>
                        <div className="bg-slate-50 p-5 rounded-2xl">
                            <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{t.accuracy_label}</span>
                            <span className="text-2xl font-black text-slate-800">{accuracy}%</span>
                        </div>
                    </div>

                    <button onClick={() => setView('setup')} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-3">
                        <RotateCcw size={16} /> {t.restart}
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

export default TimesTable;