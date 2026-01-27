import React, { useState } from 'react';
import { CATEGORIES, LEVEL_DESCRIPTIONS, getColorClasses } from '../../constants/curriculum';
import { UI_TEXT } from '../../constants/localization';

export const Dashboard = ({ 
  onStartPractice, 
  lang = 'sv', 
  timerSettings, 
  toggleTimer, 
  resetTimer, 
  onLgrOpen, 
  toggleLang 
}) => {
  const [selectedGenId, setSelectedGenId] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(0);

  const handleSelection = (genId, level) => {
    setSelectedGenId(genId);
    setSelectedLevel(level);
  };

  const handleStartClick = () => {
    if (selectedGenId && selectedLevel > 0) {
      onStartPractice(selectedGenId, selectedLevel);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full p-4 fade-in flex flex-col min-h-[85vh]">
      
      {/* --- HERO HEADER --- */}
      <div className="text-center py-10 md:py-16 border-b border-gray-200 mb-12 bg-primary-50 rounded-3xl mx-4 relative overflow-hidden">
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-4 tracking-tight relative z-10">
            Anpassa
        </h1>
        <p className="text-xl md:text-2xl text-gray-500 font-medium tracking-wide relative z-10">
            {UI_TEXT.dashboard_title[lang]}
        </p>

        {/* Timer Selector */}
        <div className="mt-8 flex justify-center relative z-10">
           <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2 px-4 shadow-sm border border-gray-100 flex items-center gap-3">
              <span className="font-bold text-gray-700 text-xs uppercase tracking-wider">
                  {lang === 'sv' ? 'Tid' : 'Timer'}
              </span>
              <div className="relative group">
                 <select 
                    value={timerSettings?.duration / 60 || 0}
                    onChange={(e) => toggleTimer(Number(e.target.value))}
                    className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-1 pl-3 pr-8 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                 >
                    <option value="0">{lang === 'sv' ? 'Av' : 'Off'}</option>
                    {[5, 10, 15, 20, 30, 45, 60].map(m => <option key={m} value={m}>{m} min</option>)}
                 </select>
              </div>
           </div>
        </div>
      </div>

      {/* --- CATEGORY CARDS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-8 mb-20">
        {Object.values(CATEGORIES).map((cat) => {
          const bgLight = getColorClasses(cat.color, 'bg-light');
          const border = getColorClasses(cat.color, 'border');
          const text = getColorClasses(cat.color, 'text');
          const bgDark = getColorClasses(cat.color, 'bg-dark');
          const ring = getColorClasses(cat.color, 'ring');
          const borderSolid = getColorClasses(cat.color, 'border-solid');

          return (
            <div key={cat.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
               <div className={`${bgLight} p-4 border-b ${border}`}>
                  <h3 className={`text-lg font-bold ${text} uppercase tracking-wide flex items-center gap-2`}>
                      <span className={`w-3 h-3 rounded-full ${bgDark}`}></span>
                      {cat.label[lang]}
                  </h3>
               </div>

               <div className="p-4 space-y-4 flex-1">
                 {/* Generator List Loop */}
                 {cat.generators.map(gen => {
                    const isSelected = selectedGenId === gen.id;
                    
                    // Retrieve levels specifically for this generator ID
                    const levels = LEVEL_DESCRIPTIONS[gen.id] || {};
                    const levelKeys = Object.keys(levels).map(Number).sort((a,b) => a - b);

                    return (
                        <div key={gen.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                           <div className="font-semibold text-gray-700 mb-3 ml-1">
                               {gen.label[lang]}
                           </div>
                           <div className="relative">
                              <select 
                                value={isSelected ? selectedLevel : 0}
                                onChange={(e) => handleSelection(gen.id, Number(e.target.value))}
                                className={`w-full p-2 pl-3 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 appearance-none cursor-pointer ${isSelected ? `ring-2 ${ring} ${borderSolid}` : `focus:${ring}`}`}
                              >
                                 <option value={0} disabled>{lang === 'sv' ? "Välj nivå:" : "Select Level:"}</option>
                                 {levelKeys.map(lvl => (
                                     <option key={lvl} value={lvl}>
                                        {lang === 'sv' ? `Nivå ${lvl}` : `Level ${lvl}`} - {levels[lvl][lang]}
                                     </option>
                                 ))}
                              </select>
                           </div>
                        </div>
                    );
                 })}
               </div>
            </div>
          );
        })}
      </div>

      {/* --- START BUTTON --- */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center pointer-events-none z-20">
         <button 
           onClick={handleStartClick}
           className={`px-8 py-4 rounded-full font-bold text-lg shadow-2xl transition-all transform pointer-events-auto flex items-center gap-3 ${selectedGenId && selectedLevel > 0 ? 'bg-accent-500 text-white translate-y-0 opacity-100 hover:scale-105 hover:bg-accent-600' : 'bg-gray-300 text-gray-500 translate-y-20 opacity-0 cursor-not-allowed'}`}
         >
            {UI_TEXT.dashboard_title[lang] === 'Matematikpanel' ? 'Börja öva' : 'Start Practice'} <span>🚀</span>
         </button>
      </div>

      {/* --- FOOTER --- */}
      <footer className="mt-auto py-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center px-4 gap-4">
          <button className="w-full md:w-auto bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-6 rounded-full text-sm transition-colors shadow-sm order-2 md:order-1">
              Do Now (Coming Soon)
          </button>

          <div className="flex items-center gap-3 order-1 md:order-2 w-full md:w-auto justify-center md:justify-end">
             <button onClick={toggleLang} className="px-4 py-2 rounded-full text-sm font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
                <span className="text-lg">{lang === 'sv' ? '🇸🇪' : '🇬🇧'}</span>
                <span>{lang === 'sv' ? 'SE' : 'ENG'}</span>
             </button>
             <button onClick={onLgrOpen} className="bg-sky-100 hover:bg-sky-200 text-sky-700 font-bold py-2 px-6 rounded-full text-sm transition-colors border border-sky-200 shadow-sm">
                LGR22
             </button>
          </div>
      </footer>

    </div>
  );
};