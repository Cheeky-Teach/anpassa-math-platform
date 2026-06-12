import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook to control the chronological playback state machine for Min Coach.
 * Treats the clues array as a standalone frame-by-frame whiteboard script.
 */
export const useMyCoach = (questionData, lang = 'sv') => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isAutoplayActive, setIsAutoplayActive] = useState(false);
    const [isCooldownActive, setIsCooldownActive] = useState(false);
    
    const autoplayTimerRef = useRef(null);

    // Normalize clues format to protect against legacy unrefactored generators
    const rawClues = questionData?.clues || questionData?.resolvedData?.clues || [];
    const normalizedSteps = useCallback(() => {
        return rawClues.map((clue) => {
            if (clue && typeof clue === 'object') {
                return {
                    text: clue[lang] || clue.text || '',
                    latex: clue.latex || null
                };
            }
            // Fallback safety net for legacy plain string elements
            return {
                text: String(clue),
                latex: null
            };
        });
    }, [rawClues, lang]);

    const steps = normalizedSteps();
    const totalSteps = steps.length;

    // Trigger input gate cooldown whenever a step transitions to pace physical note-taking
    useEffect(() => {
        if (!isOpen) return;
        setIsCooldownActive(true);
        const cooldown = setTimeout(() => {
            setIsCooldownActive(false);
        }, 1500); // 1.5 seconds cognitive breathing room lock
        return () => clearTimeout(cooldown);
    }, [currentStep, isOpen]);

    // Handle Autoplay Loop Sequencer
    useEffect(() => {
        if (isAutoplayActive) {
            autoplayTimerRef.current = setInterval(() => {
                setCurrentStep((prev) => {
                    if (prev >= totalSteps - 1) {
                        setIsAutoplayActive(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 5000); // 5 seconds per step window
        } else {
            if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
        }
        return () => {
            if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
        };
    }, [isAutoplayActive, totalSteps]);

    const openCoach = () => {
        setCurrentStep(0);
        setIsAutoplayActive(false);
        setIsOpen(true);
    };

    const closeCoach = () => {
        setIsAutoplayActive(false);
        setIsOpen(false);
    };

    const nextStep = () => {
        if (isCooldownActive || currentStep >= totalSteps - 1) return;
        setCurrentStep(prev => prev + 1);
    };

    const prevStep = () => {
        if (currentStep <= 0) return;
        setCurrentStep(prev => prev - 1);
    };

    const toggleAutoplay = () => {
        setIsAutoplayActive(prev => !prev);
    };

    // Calculate historical stacking lines up to the current position
    const historyStack = steps.slice(0, currentStep).filter(s => s.latex);
    const activeLine = steps[currentStep]?.latex || null;
    const activeExplanation = steps[currentStep]?.text || '';

    return {
        isOpen,
        openCoach,
        closeCoach,
        coachProps: {
            steps,
            currentStep,
            totalSteps,
            historyStack,
            activeLine,
            activeExplanation,
            isAutoplayActive,
            isCooldownActive,
            nextStep,
            prevStep,
            toggleAutoplay
        }
    };
};