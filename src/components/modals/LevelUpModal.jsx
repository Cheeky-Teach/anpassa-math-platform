import React from 'react';

const LevelUpModal = ({ visible, ui, onNext, onStay }) => {
    if (!visible) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-bounce-in border border-gray-100">
                <div className="text-center mb-6">
                    <div className="text-5xl mb-4">🔥</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{ui.levelUpTitle}</h3>
                    <p className="text-gray-600">{ui.levelUpDesc}</p>
                </div>
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={onNext} 
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition-all active:scale-95 text-lg"
                    >
                        {ui.levelUpYes}
                    </button>
                    <button 
                        onClick={onStay} 
                        className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all active:scale-95"
                    >
                        {ui.levelUpNo}
                    </button>
                </div>
                <p className="text-xs text-gray-400 text-center mt-6 italic">{ui.levelUpHint}</p>
            </div>
        </div>
    );
};

export default LevelUpModal;