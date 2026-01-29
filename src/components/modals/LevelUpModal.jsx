import React from 'react';

const LevelUpModal = ({ visible, ui, onNext, onStay, lang }) => {
    if (!visible) return null;

    // Fallback Logic: If UI keys are missing, use these defaults
    const title = ui.levelUpTitle || (lang === 'sv' ? "Nivå upp?" : "Level Up?");
    const desc = ui.levelUpDesc || (lang === 'sv' ? "Du verkar ha koll på detta! Vill du hoppa till nästa nivå?" : "You seem to know this! Do you want to skip to the next level?");
    const btnYes = ui.levelUpYes || (lang === 'sv' ? "Ja, kör!" : "Yes, let's go!");
    const btnNo = ui.levelUpNo || (lang === 'sv' ? "Nej, stanna här" : "No, stay here");

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-bounce-in border border-gray-100">
                <div className="text-center mb-6">
                    <div className="text-5xl mb-4">🚀</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
                    <p className="text-gray-600">{desc}</p>
                </div>
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={onNext} 
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition-all active:scale-95 text-lg"
                    >
                        {btnYes}
                    </button>
                    <button 
                        onClick={onStay} 
                        className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all active:scale-95"
                    >
                        {btnNo}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LevelUpModal;