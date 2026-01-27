import React from 'react';
import HistoryList from './HistoryList';

const MobileDrawer = ({ open, onClose, history, ui }) => {
    return (
        <>
            {open && <div className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm lg:hidden" onClick={onClose}></div>}
            <div className={`fixed inset-y-0 left-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 z-50 flex flex-col lg:hidden ${open ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="font-bold text-gray-700">{ui.history}</h2>
                    <button onClick={onClose} className="text-gray-400">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <HistoryList history={history} ui={ui} />
                </div>
            </div>
        </>
    );
};

export default MobileDrawer;