// components/ui/PreferencesToggle.jsx
import React, { useState, useContext, useEffect, useRef } from 'react';
import { Sun, Moon, Globe, Settings } from 'lucide-react';
import { PreferencesContext } from '../../App';

export default function PreferencesToggle() {
    const { 
        theme = 'light', 
        toggleTheme = () => {}, 
        lang = 'sv', 
        toggleLang = () => {} 
    } = useContext(PreferencesContext) || {};

    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef(null);

    // Close popover when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative" ref={popoverRef}>
            {/* Gear Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                title={lang === 'sv' ? "Inställningar" : "Preferences"}
                aria-label={lang === 'sv' ? "Inställningar" : "Preferences"}
                className={`p-2 rounded-[var(--radius-btn)] border transition-all cursor-pointer flex items-center justify-center shadow-2xs ${
                    isOpen 
                        ? 'bg-[var(--brand-bg)] border-[var(--brand-solid)] text-[var(--brand-text)]' 
                        : 'bg-[var(--bg-surface)] border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]'
                }`}
            >
                <Settings size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`} />
            </button>

            {/* Lightweight Popover Menu */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 z-100 w-44 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-xl p-1.5 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                    {/* Theme Toggle Row */}
                    <button
                        type="button"
                        onClick={() => {
                            toggleTheme();
                            setIsOpen(false);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-[var(--text-main)] hover:bg-[var(--bg-surface)] transition-colors flex items-center justify-between cursor-pointer"
                    >
                        <span className="flex items-center gap-2">
                            {theme === 'dark' ? (
                                <Sun size={14} className="text-amber-500" />
                            ) : (
                                <Moon size={14} className="text-indigo-500" />
                            )}
                            <span>
                                {theme === 'dark' 
                                    ? (lang === 'sv' ? 'Ljust läge' : 'Light mode') 
                                    : (lang === 'sv' ? 'Mörkt läge' : 'Dark mode')}
                            </span>
                        </span>
                    </button>

                    {/* Language Toggle Row */}
                    <button
                        type="button"
                        onClick={() => {
                            toggleLang();
                            setIsOpen(false);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-[var(--text-main)] hover:bg-[var(--bg-surface)] transition-colors flex items-center justify-between cursor-pointer"
                    >
                        <span className="flex items-center gap-2">
                            <Globe size={14} className="text-emerald-500" />
                            <span>{lang === 'sv' ? 'Språk' : 'Language'}</span>
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-main)] text-[var(--text-muted)]">
                            {lang.toUpperCase()}
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
}