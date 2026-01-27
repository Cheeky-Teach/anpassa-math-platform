import React from 'react';

const StreakModal = ({ visible, streak, ui, onClose }) => {
    if (!visible) return null;

    let icon = "🥉";
    if (streak >= 50) icon = "👑";
    else if (streak >= 40) icon = "🏆";
    else if (streak >= 30) icon = "🥇";
    else if (streak >= 20) icon = "🥈";
    else if (streak >= 15) icon = "🥉";

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 relative animate-bounce-in border-4 border-yellow-400 text-center">
                <div className="text-6xl mb-4 animate-pulse">{icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{ui.streak_modal_title}</h3>
                <p className="text-lg text-gray-600 mb-6">{ui.streak_modal_msg.replace('{streak}', streak)}</p>
                <button 
                    onClick={onClose} 
                    className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold shadow-md transition-all active:scale-95 text-lg"
                >
                    {ui.btn_close_streak}
                </button>
            </div>
        </div>
    );
};

export default StreakModal;