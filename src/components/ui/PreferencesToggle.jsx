// components/ui/PreferencesToggle.jsx
import React, { useContext } from 'react';
import { Sun, Moon, Globe } from 'lucide-react';
import { PreferencesContext } from '../../App'; // Adjust import path

export default function PreferencesToggle() {
    const { theme, toggleTheme, lang, toggleLang } = useContext(PreferencesContext);

    return (
        <div className="flex items-center gap-1 bg-[var(--bg-surface)] border border-[var(--border-main)] p-1 rounded-[var(--radius-btn)] shadow-sm">
            {/* Theme Toggle */}
            <button 
                onClick={toggleTheme}
                title={lang === 'sv' ? "Ändra tema" : "Toggle theme"}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-all"
            >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            
            <div className="w-px h-4 bg-[var(--border-strong)] opacity-50 mx-1"></div>

            {/* Language Toggle */}
            <button 
                onClick={toggleLang}
                title={lang === 'sv' ? "Byt språk" : "Change language"}
                className="px-2 py-0 flex items-center gap-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-all"
            >
                <Globe size={12} /> {lang}
            </button>
        </div>
    );
}