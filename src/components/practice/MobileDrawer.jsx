import React from 'react';
import { HistoryList } from './HistoryList';
import { UI_TEXT } from '../../constants/localization';

export const MobileDrawer = ({ open, onClose, history, lang }) => {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm lg:hidden" 
          onClick={onClose}
        ></div>
      )}
      
      {/* Drawer */}
      <div className={`fixed inset-y-0 left-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 z-50 flex flex-col lg:hidden ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-gray-700">{UI_TEXT.history[lang]}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <HistoryList history={history} lang={lang} />
        </div>
      </div>
    </>
  );
};