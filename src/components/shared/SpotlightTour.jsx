// src/components/shared/SpotlightTour.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react';

export default function SpotlightTour({
    steps = [],
    isOpen = false,
    onClose,
    lang = 'sv'
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [targetRect, setTargetRect] = useState(null);
    const popoverRef = useRef(null);

    const activeStep = steps[currentIndex] || null;

    useEffect(() => {
        if (isOpen) setCurrentIndex(0);
    }, [isOpen]);

    const measureTarget = useCallback(() => {
        if (!isOpen || !activeStep?.selector) {
            setTargetRect(null);
            return;
        }
        const el = document.querySelector(activeStep.selector);
        if (!el) {
            setTargetRect(null);
            return;
        }
        const rect = el.getBoundingClientRect();
        setTargetRect({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
        });
    }, [isOpen, activeStep]);

    useEffect(() => {
        if (!isOpen) return;

        if (typeof activeStep?.onEnter === 'function') {
            activeStep.onEnter();
        }

        const el = activeStep?.selector ? document.querySelector(activeStep.selector) : null;
        if (el) {
            // Scroll gently so the top of tall elements (like the topic matrix) stays visible
            const rect = el.getBoundingClientRect();
            const isAlreadyMostlyVisible =
                rect.top >= 16 && rect.top < window.innerHeight * 0.65;

            if (!isAlreadyMostlyVisible) {
                el.scrollIntoView({
                    behavior: 'smooth',
                    block: rect.height > window.innerHeight * 0.7 ? 'start' : 'center'
                });
            }
        }

        const timer = setTimeout(measureTarget, 200);
        window.addEventListener('resize', measureTarget);
        window.addEventListener('scroll', measureTarget, true);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', measureTarget);
            window.removeEventListener('scroll', measureTarget, true);
        };
    }, [isOpen, currentIndex, activeStep, measureTarget]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose?.();
            if (e.key === 'ArrowRight') {
                if (currentIndex < steps.length - 1) setCurrentIndex(i => i + 1);
                else onClose?.();
            }
            if (e.key === 'ArrowLeft' && currentIndex > 0) {
                setCurrentIndex(i => i - 1);
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, currentIndex, steps.length, onClose]);

    if (!isOpen || !activeStep) return null;

    const t = {
        sv: {
            stepOf: (curr, total) => `Steg ${curr} av ${total}`,
            next: "Nästa",
            prev: "Tillbaka",
            done: "Kom igång!",
            skip: "Stäng guide"
        },
        en: {
            stepOf: (curr, total) => `Step ${curr} of ${total}`,
            next: "Next",
            prev: "Back",
            done: "Get Started!",
            skip: "Close guide"
        }
    }[lang] || {};

    const pad = 8;
    const spotlightStyle = targetRect
        ? {
              top: Math.max(8, targetRect.top - pad),
              left: Math.max(8, targetRect.left - pad),
              width: targetRect.width + pad * 2,
              height: targetRect.height + pad * 2
          }
        : null;

    const getPopoverStyle = () => {
        if (!spotlightStyle || typeof window === 'undefined') {
            return {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: Math.min(380, (typeof window !== 'undefined' ? window.innerWidth : 400) - 32)
            };
        }

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const popoverWidth = Math.min(370, vw - 32);
        const estimatedPopoverHeight = popoverRef.current?.offsetHeight || 220;
        const margin = 16;

        const clampTop = (rawTop) =>
            Math.min(Math.max(margin, rawTop), Math.max(margin, vh - estimatedPopoverHeight - margin));

        const clampLeft = (rawLeft) =>
            Math.min(Math.max(margin, rawLeft), Math.max(margin, vw - popoverWidth - margin));

        const spaceRight = vw - (spotlightStyle.left + spotlightStyle.width);
        const spaceLeft = spotlightStyle.left;
        const spaceBelow = vh - (spotlightStyle.top + spotlightStyle.height);
        const spaceAbove = spotlightStyle.top;

        // 1. Wide screens: place beside narrow sidebar targets if there's room
        if (vw >= 1024 && spotlightStyle.width < 440) {
            if (spaceRight >= popoverWidth + 24) {
                return {
                    top: clampTop(spotlightStyle.top),
                    left: spotlightStyle.left + spotlightStyle.width + 16,
                    width: popoverWidth
                };
            }
            if (spaceLeft >= popoverWidth + 24) {
                return {
                    top: clampTop(spotlightStyle.top),
                    left: spotlightStyle.left - popoverWidth - 16,
                    width: popoverWidth
                };
            }
        }

        // 2. If enough room below the target, place directly below
        if (spaceBelow >= estimatedPopoverHeight + 20) {
            return {
                top: clampTop(spotlightStyle.top + spotlightStyle.height + 14),
                left: clampLeft(spotlightStyle.left),
                width: popoverWidth
            };
        }

        // 3. If enough room above the target, place directly above
        if (spaceAbove >= estimatedPopoverHeight + 20) {
            return {
                top: clampTop(spotlightStyle.top - estimatedPopoverHeight - 14),
                left: clampLeft(spotlightStyle.left),
                width: popoverWidth
            };
        }

        // 4. Tall target (e.g., full topic matrix): dock cleanly at bottom-right inside the viewport
        return {
            top: clampTop(vh - estimatedPopoverHeight - 24),
            left: clampLeft(vw - popoverWidth - 24),
            width: popoverWidth
        };
    };

    const isLast = currentIndex === steps.length - 1;

    const overlay = (
        <div className="fixed inset-0 z-[9999] pointer-events-auto font-sans">
            {/* Click-anywhere-outside backdrop to dismiss */}
            <div
                className={`fixed inset-0 transition-opacity ${
                    spotlightStyle ? 'bg-transparent' : 'bg-slate-950/70 backdrop-blur-[1px]'
                }`}
                onClick={onClose}
            />

            {/* Spotlight Cutout Ring */}
            {spotlightStyle && (
                <div
                    className="fixed rounded-2xl border-2 border-emerald-400 transition-all duration-300 ease-out pointer-events-none"
                    style={{
                        ...spotlightStyle,
                        boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.70)'
                    }}
                />
            )}

            {/* Floating Callout Card (Guaranteed inside viewport bounds) */}
            <div
                ref={popoverRef}
                style={getPopoverStyle()}
                onClick={(e) => e.stopPropagation()}
                className="fixed z-10 bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-strong)] rounded-2xl p-4 sm:p-5 shadow-2xl transition-all duration-300 ease-out space-y-3"
            >
                <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        <Sparkles size={13} />
                        {t.stepOf(currentIndex + 1, steps.length)}
                    </span>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
                        title={t.skip}
                    >
                        <X size={15} />
                    </button>
                </div>

                <div className="space-y-1">
                    <h4 className="text-base font-extrabold tracking-tight text-[var(--text-main)]">
                        {activeStep.title[lang] || activeStep.title.sv}
                    </h4>
                    <p className="text-xs sm:text-[13px] text-[var(--text-muted)] leading-relaxed">
                        {activeStep.description[lang] || activeStep.description.sv}
                    </p>
                </div>

                <div className="pt-2 border-t border-[var(--border-main)] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                        {steps.map((_, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                    idx === currentIndex
                                        ? 'w-5 bg-emerald-600'
                                        : 'w-1.5 bg-[var(--border-strong)] hover:bg-[var(--text-muted)]'
                                }`}
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-1.5">
                        {currentIndex > 0 && (
                            <button
                                type="button"
                                onClick={() => setCurrentIndex(i => i - 1)}
                                className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-main)] text-xs font-bold text-[var(--text-main)] inline-flex items-center gap-1 cursor-pointer"
                            >
                                <ChevronLeft size={14} />
                                <span>{t.prev}</span>
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => (isLast ? onClose?.() : setCurrentIndex(i => i + 1))}
                            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                            <span>{isLast ? t.done : t.next}</span>
                            {!isLast && <ChevronRight size={14} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(overlay, document.body) : overlay;
}