import React from 'react';

const AboutModal = ({ visible, onClose, ui }) => {
    if (!visible) return null;
    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-bounce-in border border-gray-100">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10 bg-white/80 rounded-full p-1">✕</button>

                <div className="mb-4 flex justify-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg border-4 border-white ring-1 ring-gray-100">
                        <img
                            src="https://lh3.googleusercontent.com/pw/AP1GczNVvq27uV0cE5nPctXb-5OET-vV57DYHQdI9CX4ODcthn4Dw-fxwULnK5G4u2Yy_7zzmo-SPNbsYglcKsiw_Omz7Q_rWwaiVCnL3e3tgge8hpoVypu8=w2400"
                            alt="Creator"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{ui.aboutTitle}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-6">{ui.aboutText}</p>
                    <hr className="my-4 border-gray-200" />
                    <a href="https://www.linkedin.com/in/charles-mejilla-4a2ba22b" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                        {ui.contactLink}
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AboutModal;