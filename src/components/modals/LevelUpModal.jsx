import React from 'react';
import { Brain, ArrowUpCircle, RotateCcw } from 'lucide-react';

const LevelUpModal = ({ visible, onNext, onStay, onWordProblems, supportsWordProblems, lang }) => {
    if (!visible) return null;

    const isSv = lang === 'sv';
    
    // Dynamic text depending on whether word problems are available
    const title = isSv ? "Nivå avklarad!" : "Level Mastered!";
    const desc = supportsWordProblems 
        ? (isSv ? "Du har bemästrat grunderna! Nu är det dags att testa dina kunskaper i verkliga situationer. Vad vill du göra näst?" : "You've mastered the basics! Now it's time to apply your skills in real-world scenarios. What do you want to do next?")
        : (isSv ? "Snyggt jobbat! Du verkar ha stenkoll på detta. Vad vill du göra näst?" : "Great job! You seem to have this down. What's next?");

    return (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm fade-in">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-6 sm:p-8 relative animate-bounce-in border border-slate-100 flex flex-col gap-6">
                
                {/* Header Section */}
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-pulse drop-shadow-md">🎓</div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">{title}</h3>
                    <p className="text-sm font-bold text-slate-500 leading-snug px-2">{desc}</p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                    
                    {/* 🟢 THE HERO BUTTON: Only shows if Word Problems are an option */}
                    {supportsWordProblems && (
                        <button 
                            onClick={onWordProblems} 
                            className="w-full py-4 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-4 border-b-4 border-indigo-800 group"
                        >
                            <div className="bg-white/20 p-2 rounded-xl group-hover:scale-110 transition-transform">
                                <Brain size={28} />
                            </div>
                            <div className="flex flex-col items-start text-left">
                                <span className="text-[10px] uppercase tracking-widest text-indigo-200">
                                    {isSv ? "Rekommenderas" : "Recommended"}
                                </span>
                                <span className="text-lg leading-none mt-0.5">
                                    {isSv ? "Testa problemlösning" : "Try word problems"}
                                </span>
                            </div>
                        </button>
                    )}

                    {/* Standard Next Level Button */}
                    <button 
                        onClick={onNext} 
                        className={`w-full py-4 px-5 rounded-2xl font-black transition-all active:scale-95 flex items-center justify-center gap-3 
                            ${supportsWordProblems 
                                ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200 hover:bg-emerald-100' 
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/20 border-b-4 border-emerald-800'}`}
                    >
                        <ArrowUpCircle size={22} />
                        <span className="text-[15px]">{isSv ? "Gå till nästa nivå" : "Move to next level"}</span>
                    </button>

                    {/* Stay on current level */}
                    <button 
                        onClick={onStay} 
                        className="w-full py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <RotateCcw size={16} />
                        <span className="text-[13px]">{isSv ? "Stanna på denna nivå" : "Stay on this level"}</span>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default LevelUpModal;