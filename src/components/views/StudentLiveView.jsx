import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import MathDisplay from '../ui/MathDisplay'; // Assuming you exported the one from earlier

export default function StudentLiveView({ session, packet, lang = 'sv' }) {
    const [answers, setAnswers] = useState({});
    const [completed, setCompleted] = useState({});

    const handleSolve = async (idx, val) => {
        // Logic to check answer against packet[idx].resolvedData.answer
        const isCorrect = val.trim() === packet[idx].resolvedData.answer.toString();
        
        if (isCorrect) {
            setCompleted(prev => ({ ...prev, [idx]: true }));
            // Push to Supabase student_responses for teacher to see
            await supabase.from('student_responses').upsert({
                session_id: session.id,
                student_alias: localStorage.getItem('student_name'),
                question_index: idx,
                is_correct: true
            });
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 p-4 pb-20">
            <header className="max-w-4xl mx-auto mb-8 flex justify-between items-center">
                <h1 className="text-2xl font-black uppercase italic text-slate-900">{session.title}</h1>
                <div className="bg-white px-4 py-1 rounded-full shadow-sm text-xs font-bold text-slate-400">
                    Kod: {session.class_code}
                </div>
            </header>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                {packet.map((item, idx) => (
                    <div key={item.id} className={`bg-white p-8 rounded-[2.5rem] shadow-xl transition-all ${completed[idx] ? 'ring-4 ring-emerald-500' : ''}`}>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-black uppercase text-slate-300">Uppgift {idx + 1}</span>
                            {completed[idx] && <CheckCircle2 className="text-emerald-500" size={20} />}
                        </div>
                        
                        <div className="text-xl font-bold text-center mb-6">
                            <MathDisplay content={item.resolvedData.renderData.description} />
                            {item.resolvedData.renderData.latex && (
                                <div className="mt-4 text-3xl text-indigo-600">
                                    <MathDisplay content={`$$${item.resolvedData.renderData.latex}$$`} />
                                </div>
                            )}
                        </div>

                        {!completed[idx] && (
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-center font-bold text-xl outline-none focus:border-indigo-500 transition-all"
                                    placeholder="Svar..."
                                    onChange={(e) => setAnswers({...answers, [idx]: e.target.value})}
                                />
                                <button 
                                    onClick={() => handleSolve(idx, answers[idx])}
                                    className="bg-indigo-600 text-white p-4 rounded-2xl hover:bg-indigo-700 transition-all"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}