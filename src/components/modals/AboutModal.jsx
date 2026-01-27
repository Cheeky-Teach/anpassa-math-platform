import React from 'react';
import { UI_TEXT } from '../../constants/localization';

export const AboutModal = ({ visible, onClose, lang = 'sv' }) => {
  if (!visible) return null;

  const aboutTitle = "Om skaparen";
  const aboutText = "Charles är en speciallärare som arbetar i Sverige och brinner för att upptäcka nya sätt att undervisa i klassrummet.";
  
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-bounce-in border border-gray-100">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10 bg-white/80 rounded-full p-1"
        >
          ✕
        </button>

        <div className="mb-4 flex justify-center">
            <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg border-4 border-white ring-1 ring-gray-100 bg-gray-200">
                 <img 
                    src="https://lh3.googleusercontent.com/pw/AP1GczNVvq27uV0cE5nPctXb-5OET-vV57DYHQdI9CX4ODcthn4Dw-fxwULnK5G4u2Yy_7zzmo-SPNbsYglcKsiw_Omz7Q_rWwaiVCnL3e3tgge8hpoVypu8=w2400"
                    alt="Creator"
                    className="w-full h-full object-cover"
                 />
            </div>
        </div>

        <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{aboutTitle}</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">{aboutText}</p>
            <hr className="my-4 border-gray-200" />
            <a 
              href="https://www.linkedin.com/in/charles-mejilla-4a2ba22b" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold transition-colors"
            >
               Följ mig på LinkedIn
            </a>
        </div>
      </div>
    </div>
  );
};