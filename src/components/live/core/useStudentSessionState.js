// src/components/live/core/useStudentSessionState.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { extractDecodedAnswer, evaluateAnswer } from './liveAnswerUtils';
import { evaluateStudentAdvance } from '../../../lib/livePacingEngine.js';
import { syncProgress } from '../../../lib/progressSync';

// Helper to reliably unwrap packet regardless of structure
function normalizePacket(rawPacket) {
    if (Array.isArray(rawPacket)) return rawPacket;
    if (Array.isArray(rawPacket?.livePacket)) return rawPacket.livePacket;
    if (Array.isArray(rawPacket?.packet)) return rawPacket.packet;
    if (Array.isArray(rawPacket?.tiles)) return rawPacket.tiles;
    return [];
}

function prepareStudentPacket(rawPacket, settings, isPresentation) {
    const safe = normalizePacket(rawPacket);
    let mapped = safe.map((item, idx) => ({ ...item, originalIndex: idx }));

    const isTeacherPacing = settings?.pacing === 'teacher';
    const isRandomized = settings?.order === 'randomized';

    if (isRandomized && !isTeacherPacing && !isPresentation) {
        for (let i = mapped.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [mapped[i], mapped[j]] = [mapped[j], mapped[i]];
        }
    }
    return mapped;
}

export function useStudentSessionState({ session, packet, studentAlias, lang = 'sv', onBack }) {
    // 🟢 1. Dynamic state for room settings so updates take effect live
    const extractEffectiveSettings = (sess) => {
        return sess?.active_question_data?.settings || sess?.settings || {};
    };

    const [liveSettings, setLiveSettings] = useState(() => extractEffectiveSettings(session));

    const allowScratchpad = liveSettings.allowScratchpad !== undefined
        ? Boolean(liveSettings.allowScratchpad)
        : (liveSettings.scratchpad !== undefined ? Boolean(liveSettings.scratchpad) : true);

    const allowCanvas = Boolean(liveSettings.allowCanvas || liveSettings.enableCanvas);
    const responseStyle = liveSettings.responseStyle || 'flexible';
    const isPresentationMode = session?.active_question_data?.mode === 'presentation';

    // 🟢 2. Initialize localPacket
    const [localPacket, setLocalPacket] = useState(() => {
        return prepareStudentPacket(packet, liveSettings, isPresentationMode);
    });

    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeSlideIndex, setActiveSlideIndex] = useState(session?.current_slide_index || 0);

    const [answers, setAnswers] = useState({});
    const [completed, setCompleted] = useState({});
    const [completedSlide, setCompletedSlide] = useState({});
    const [scratchpad, setScratchpad] = useState({});
    const [canvasElements, setCanvasElements] = useState({});
    const [slideExplanations, setSlideExplanations] = useState({});

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [roomActive, setRoomActive] = useState(true);
    const [showFinalReview, setShowFinalReview] = useState(false);

    const completedRef = useRef(completed);
    const localPacketRef = useRef(localPacket);
    const currentIndexRef = useRef(currentIndex);

    const onBackRef = useRef(onBack);
    const settingsRef = useRef(liveSettings);
    const isPresentationModeRef = useRef(isPresentationMode);
    const studentAliasRef = useRef(studentAlias);
    const langRef = useRef(lang);

    useEffect(() => {
        onBackRef.current = onBack;
        settingsRef.current = liveSettings;
        isPresentationModeRef.current = isPresentationMode;
        studentAliasRef.current = studentAlias;
        langRef.current = lang;
    }, [onBack, liveSettings, isPresentationMode, studentAlias, lang]);

    useEffect(() => {
        completedRef.current = completed;
        localPacketRef.current = localPacket;
        currentIndexRef.current = currentIndex;
    }, [completed, localPacket, currentIndex]);

    // 🟢 Auto-redirect timer when room closes (single, clean instance)
    useEffect(() => {
        if (!roomActive) {
            const timer = setTimeout(() => {
                if (typeof onBackRef.current === 'function') {
                    onBackRef.current();
                }
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [roomActive]);

    // 🟢 3. Sync localPacket whenever packet updates
    useEffect(() => {
        const safe = normalizePacket(packet);
        if (safe.length === 0) return;

        setLocalPacket(prev => {
            if (prev && prev.length === safe.length) return prev;
            return prepareStudentPacket(packet, settingsRef.current, isPresentationModeRef.current);
        });
    }, [packet]);

    // 🟢 4. Rehydration Effect
    useEffect(() => {
        if (!session?.id || !studentAlias) return;

        const initialize = async () => {
            try {
                // Query only real columns: status, settings, active_question_data
                const { data: roomData } = await supabase
                    .from('rooms')
                    .select('status, settings, active_question_data')
                    .eq('id', session.id)
                    .maybeSingle();

                if (roomData) {
                    if (roomData.status === 'closed') {
                        setRoomActive(false);
                        return;
                    }
                    const freshSettings = extractEffectiveSettings(roomData);
                    setLiveSettings(freshSettings);
                }

                const { data, error } = await supabase
                    .from('responses')
                    .select('*')
                    .eq('room_id', session.id)
                    .eq('student_alias', studentAlias);

                if (!error && Array.isArray(data) && data.length > 0) {
                    const restoredAns = {};
                    const restoredComp = {};
                    const restoredScratch = {};
                    const restoredCanvas = {};
                    const restoredSlides = {};

                    const currentPack = localPacketRef.current;

                    data.forEach(res => {
                        if (res.is_slide_submission) {
                            restoredSlides[res.question_index] = true;
                            if (res.canvas_state) restoredCanvas[res.question_index] = res.canvas_state;
                            return;
                        }

                        const localIdx = currentPack.findIndex(p => p.originalIndex === res.question_index);
                        const matchedIdx = localIdx !== -1 ? localIdx : res.question_index;

                        if (matchedIdx !== undefined && matchedIdx !== null) {
                            restoredAns[matchedIdx] = res.answer;
                            const isFreeText = currentPack[matchedIdx]?.answerType === 'free_text';
                            restoredComp[matchedIdx] = (isFreeText || res.is_correct) ? 'correct' : 'wrong';
                            restoredScratch[matchedIdx] = res.work_steps || [''];
                            if (res.canvas_state) restoredCanvas[matchedIdx] = res.canvas_state;
                        }
                    });

                    setAnswers(restoredAns);
                    setCompleted(restoredComp);
                    setScratchpad(restoredScratch);
                    setCanvasElements(restoredCanvas);
                    setCompletedSlide(restoredSlides);

                    const isProgressive = settingsRef.current?.pacing === 'progressive';
                    const answeredCount = Object.keys(restoredComp).length;

                    if (isProgressive && !isPresentationModeRef.current && currentPack.length > 0 && answeredCount < currentPack.length) {
                        const firstUnanswered = currentPack.findIndex((_, idx) => !restoredComp[idx]);
                        if (firstUnanswered !== -1) {
                            setCurrentIndex(firstUnanswered);
                        }
                    } else if (settingsRef.current?.pacing === 'teacher' || isPresentationModeRef.current) {
                        const target = session?.current_slide_index ?? session?.current_question_index ?? 0;
                        setCurrentIndex(target);
                    }

                    syncProgress('student_session_rehydrated', {
                        app_mode: 'student_live',
                        restored_answer_count: Object.keys(restoredComp).length
                    });
                }
            } catch (err) {
                console.error("Student session rehydration error:", err);
            }
        };

        initialize();
    }, [session?.id, studentAlias]);

    // 🟢 5. Master Realtime Sync + Fallback Polling
    useEffect(() => {
        if (!session?.id) return;

        let isSubscribed = true;
        const channelName = `student_realtime_${session.id.slice(0, 8)}_${studentAlias || 'anon'}_${Math.random().toString(36).substring(7)}`;

        const channel = supabase.channel(channelName)
            .on('postgres_changes', { 
                event: 'UPDATE', 
                schema: 'public', 
                table: 'rooms', 
                filter: `id=eq.${session.id}` 
            }, (payload) => {
                if (!isSubscribed) return;
                const updated = payload.new;
                const currentSettings = settingsRef.current;
                const currentIsPresentation = isPresentationModeRef.current;
                const currentAlias = studentAliasRef.current;
                const currentLang = langRef.current;

                // Room Closed by Teacher
                if (updated?.status === 'closed') {
                    setRoomActive(false);
                    return;
                }

                // Student Kicked
                if ((updated?.kicked_students || []).includes(currentAlias)) {
                    alert(currentLang === 'sv' ? "Du har blivit borttagen från sessionen." : "You were removed from the session.");
                    if (onBackRef.current) onBackRef.current();
                    return;
                }

                // Sync Updated Settings Live
                const incomingSettings = extractEffectiveSettings(updated);
                if (Object.keys(incomingSettings).length > 0) {
                    setLiveSettings(incomingSettings);
                }

                // Dynamic packet regeneration sync
                const incomingRaw = updated?.active_question_data?.livePacket || updated?.active_question_data?.packet;
                if (incomingRaw) {
                    const incomingPacket = normalizePacket(incomingRaw);
                    let hasChanges = false;
                    const changedIndices = [];
                    const newLocalPacket = [...localPacketRef.current];

                    incomingPacket.forEach((newItem, idx) => {
                        const oldItem = newLocalPacket[idx];
                        if (oldItem && newItem.regenVersion && newItem.regenVersion !== oldItem.regenVersion) {
                            hasChanges = true;
                            changedIndices.push(idx);
                            newLocalPacket[idx] = { ...newItem, originalIndex: idx };
                        } else if (!oldItem) {
                            newLocalPacket[idx] = { ...newItem, originalIndex: idx };
                            hasChanges = true;
                        }
                    });

                    if (hasChanges) {
                        setLocalPacket(newLocalPacket);
                        setAnswers(prev => { const next = { ...prev }; changedIndices.forEach(i => delete next[i]); return next; });
                        setScratchpad(prev => { const next = { ...prev }; changedIndices.forEach(i => delete next[i]); return next; });
                        setCanvasElements(prev => { const next = { ...prev }; changedIndices.forEach(i => delete next[i]); return next; });
                        setCompleted(prev => { const next = { ...prev }; changedIndices.forEach(i => delete next[i]); return next; });
                    }
                }

                // Slide Pacing
                if (updated?.current_slide_index !== null && updated?.current_slide_index !== undefined) {
                    const newSlideIdx = parseInt(updated.current_slide_index, 10);
                    setActiveSlideIndex(newSlideIdx);
                    if (isPresentationModeRef.current) setCurrentIndex(newSlideIdx);
                }

                // Teacher Question Pacing
                const isTeacherPacing = settingsRef.current?.pacing === 'teacher';
                if (updated?.current_question_index !== null && updated?.current_question_index !== undefined) {
                    const newTeacherIndex = parseInt(updated.current_question_index, 10);
                    const prevIndex = currentIndexRef.current;
                    const currentCompleted = completedRef.current;
                    const currentPacket = localPacketRef.current;

                    if (isTeacherPacing && newTeacherIndex > prevIndex && !currentCompleted[prevIndex] && currentPacket[prevIndex]) {
                        const timeoutAnswer = "[TIMEOUT]";
                        supabase.from('responses').insert([{
                            room_id: session.id,
                            student_alias: (currentAlias || "Anonym").replace(/<[^>]*>?/gm, '').substring(0, 25),
                            question_index: currentPacket[prevIndex].originalIndex,
                            answer: timeoutAnswer,
                            is_correct: false,
                            is_manually_corrected: false
                        }]).then(() => {
                            setAnswers(prev => ({ ...prev, [prevIndex]: timeoutAnswer }));
                            setCompleted(prev => ({ ...prev, [prevIndex]: 'wrong' }));
                        });
                    }

                    if (isTeacherPacing || isPresentationModeRef.current) {
                        setCurrentIndex(newTeacherIndex);
                    }
                }
            })
            .on('broadcast', { event: 'room_closed' }, () => {
                if (isSubscribed) setRoomActive(false);
            })
            .subscribe();

        // 🟢 Robust Polling: Only mark closed if explicitly returned as closed
        const pollInterval = setInterval(async () => {
            if (!isSubscribed) return;
            try {
                const { data, error } = await supabase
                    .from('rooms')
                    .select('status')
                    .eq('id', session.id)
                    .maybeSingle();

                if (!error && data?.status === 'closed') {
                    setRoomActive(false);
                }
            } catch {
                // Ignore transient network errors
            }
        }, 3000);

        return () => {
            isSubscribed = false;
            clearInterval(pollInterval);
            supabase.removeChannel(channel);
        };
    }, [session?.id, studentAlias]);

    // 🟢 6. Submission logic with strict room-open verification
    const submitAnswer = useCallback(async (forcedIdx = null, passedCanvas = null) => {
        const targetIdx = forcedIdx !== null ? forcedIdx : currentIndex;
        const currentItem = localPacket[targetIdx];
        if (!currentItem || isSubmitting || !session?.id) return;

        // Fast bail-out
        if (!roomActive || completed[targetIdx]) return;

        setIsSubmitting(true);
        try {
            // 🟢 STRICT PREFLIGHT: Require status to explicitly be active/open
            const { data: roomCheck, error: roomErr } = await supabase
                .from('rooms')
                .select('status')
                .eq('id', session.id)
                .maybeSingle();

            // If query fails, room row is missing, or status is NOT 'active' / 'open' (or explicitly 'closed')
            const isRoomClosed = roomErr || !roomCheck || roomCheck.status === 'closed' || roomCheck.status === 'archived';

            if (isRoomClosed) {
                console.warn("[StudentLive] Attempted submission to closed room. Aborting write.");
                setRoomActive(false);
                setIsSubmitting(false);
                return; // ⛔ Abort immediately. Nothing is written to the responses table.
            }

            const isFreeText = currentItem.answerType === 'free_text';
            const rawAnswer = answers[targetIdx];
            const canvasData = passedCanvas || canvasElements[targetIdx] || [];
            const scratchpadSteps = (scratchpad[targetIdx] || []).filter(s => s && s.trim().length > 0);

            let isCorrect = true;
            let finalAnswer = rawAnswer;

            if (isFreeText) {
                finalAnswer = rawAnswer || "[DISKUSSION]";
                isCorrect = true;
            } else if (rawAnswer !== undefined && String(rawAnswer).trim() !== "") {
                const correctAnswer = extractDecodedAnswer(currentItem.resolvedData);
                isCorrect = evaluateAnswer(rawAnswer, correctAnswer);
            } else {
                finalAnswer = "[CANVAS_SUBMISSION]";
                isCorrect = true;
            }

            const payload = {
                room_id: session.id,
                student_alias: (studentAlias || "Anonym").replace(/<[^>]*>?/gm, '').substring(0, 25),
                question_index: currentItem.originalIndex,
                answer: String(finalAnswer).substring(0, 1500),
                work_steps: scratchpadSteps,
                canvas_state: canvasData,
                is_correct: isCorrect
            };

            const { error } = await supabase.from('responses').insert([payload]);
            if (error && error.code !== '23505') throw error;

            const updatedCompleted = { ...completed, [targetIdx]: isCorrect ? 'correct' : 'wrong' };
            setCompleted(updatedCompleted);

            // Progressive auto-advance
            if (liveSettings.pacing === 'open' || liveSettings.pacing === 'progressive') {
                setTimeout(() => {
                    const advance = evaluateStudentAdvance({
                        currentIdx: targetIdx,
                        totalQuestions: localPacket.length,
                        settings: liveSettings,
                        updatedCompleted
                    });

                    if (advance.showSummary) setShowFinalReview(true);
                    else setCurrentIndex(advance.nextIndex);
                }, 400);
            }
        } catch (err) {
            console.error("Submission error:", err);
        } finally {
            setIsSubmitting(false);
        }
    }, [currentIndex, localPacket, isSubmitting, roomActive, completed, answers, canvasElements, scratchpad, session?.id, studentAlias, liveSettings]);

    return {
        settings: liveSettings,
        allowScratchpad,
        allowCanvas,
        responseStyle,
        localPacket,
        currentIndex, setCurrentIndex,
        activeSlideIndex, setActiveSlideIndex,
        answers, setAnswers,
        completed, setCompleted,
        completedSlide, setCompletedSlide,
        scratchpad, setScratchpad,
        canvasElements, setCanvasElements,
        slideExplanations, setSlideExplanations,
        isSubmitting,
        roomActive,
        showFinalReview, setShowFinalReview,
        submitAnswer
    };
}