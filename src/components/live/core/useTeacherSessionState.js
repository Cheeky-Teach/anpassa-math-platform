// src/components/live/core/useTeacherSessionState.js
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { syncProgress, syncBatchProgress } from '../../../lib/progressSync';

export function useTeacherSessionState({ session, packet, lang = 'sv', onKick, onEnd }) {
    const [livePacket, setLivePacket] = useState(packet);
    const [responses, setResponses] = useState([]);
    const [connStatus, setConnStatus] = useState('CONNECTING');
    const [isSyncing, setIsSyncing] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    // Filter & Privacy Controls
    const [isAnonymous, setIsAnonymous] = useState(true);
    const [hideCorrectness, setHideCorrectness] = useState(true);
    const [showActualAnswers, setShowActualAnswers] = useState(false);

    // Sorting
    const [sortMode, setSortMode] = useState('az');
    const [randomizedStudents, setRandomizedStudents] = useState([]);

    // Star & Compare
    const [starredStudents, setStarredStudents] = useState([]);
    const [isComparing, setIsComparing] = useState(false);

    const isMounted = useRef(true);
    const channelRef = useRef(null);

    const syncData = useCallback(async () => {
        if (!session?.id || !isMounted.current) return;
        setIsSyncing(true);
        try {
            const { data, error } = await supabase
                .from('responses')
                .select('*')
                .eq('room_id', session.id);
            if (!error && data && isMounted.current) {
                setResponses(data);
            }
        } catch (err) {
            console.error("Sync failed:", err);
        } finally {
            if (isMounted.current) setIsSyncing(false);
        }
    }, [session?.id]);

    useEffect(() => {
        isMounted.current = true;
        if (!session?.id) return;

        syncData();

        const channel = supabase.channel(`room_${session.id.slice(0, 8)}`)
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'responses', 
                filter: `room_id=eq.${session.id}` 
            }, (payload) => {
                if (isMounted.current) {
                    setResponses(prev => prev.some(r => r.id === payload.new.id) ? prev : [...prev, payload.new]);
                }
            })
            .on('postgres_changes', { 
                event: 'DELETE', 
                schema: 'public', 
                table: 'responses' 
            }, () => {
                syncData();
            })
            .subscribe((status) => {
                if (isMounted.current) setConnStatus(status);
            });

        channelRef.current = channel;

        return () => {
            isMounted.current = false;
            if (channelRef.current) supabase.removeChannel(channelRef.current);
        };
    }, [session?.id, syncData]);

    const handleRegenerateQuestion = async (targetIdx) => {
        const targetItem = livePacket[targetIdx];
        if (!targetItem || !session?.id) return;

        try {
            // 1. Fetch new variant from API exactly like the original code
            const isItemWP = targetItem.selectedStoryIndex !== null && targetItem.selectedStoryIndex !== undefined;
            let newResolvedData = targetItem.resolvedData;

            // Only fetch if it's a dynamic math question (not static free-text)
            if (targetItem.answerType !== 'free_text' && (targetItem.topicId || targetItem.variationKey)) {
                const res = await fetch(`/api/question?topic=${targetItem.topicId}&variation=${targetItem.variationKey}&lang=${lang}&wordProblem=${isItemWP}`);
                if (!res.ok) throw new Error("API request failed");
                newResolvedData = await res.json();
            }

            const updatedItem = {
                ...targetItem,
                resolvedData: newResolvedData,
                regenVersion: Date.now(),
                selectedStoryIndex: isItemWP ? targetItem.selectedStoryIndex : null
            };

            const updatedPacket = [...livePacket];
            updatedPacket[targetIdx] = updatedItem;

            // 2. Wipe existing responses in Supabase for this index
            await supabase
                .from('responses')
                .delete()
                .eq('room_id', session.id)
                .eq('question_index', targetItem.originalIndex ?? targetIdx);

            // 3. Update the room's active packet
            await supabase
                .from('rooms')
                .update({
                    active_question_data: {
                        ...session.active_question_data,
                        livePacket: updatedPacket,
                        packet: updatedPacket // Fallback for older formats
                    }
                })
                .eq('id', session.id);

            // 4. Update local UI state
            setLivePacket(updatedPacket);
            setResponses(prev => prev.filter(r => r.question_index !== (targetItem.originalIndex ?? targetIdx)));

            syncProgress('live_teacher_regenerated_question', {
                app_mode: 'teacher_live',
                question_index: targetIdx
            });
        } catch (err) {
            console.error("Error regenerating question:", err);
            alert(lang === 'sv' ? "Kunde inte generera om uppgiften." : "Could not regenerate question.");
        }
    };

    const students = useMemo(() => {
        const base = [...new Set(responses.map(r => r.student_alias))];
        if (sortMode === 'az') return base.sort((a, b) => a.localeCompare(b));
        if (sortMode === 'progress') {
            return base.sort((a, b) => {
                const countA = responses.filter(r => r.student_alias === a).length;
                const countB = responses.filter(r => r.student_alias === b).length;
                return countB - countA || a.localeCompare(b);
            });
        }
        if (sortMode === 'random') {
            const currentRandom = randomizedStudents.filter(s => base.includes(s));
            const missing = base.filter(s => !currentRandom.includes(s));
            return [...currentRandom, ...missing];
        }
        return base;
    }, [responses, sortMode, randomizedStudents]);

    const questionStats = useMemo(() => {
        return (livePacket || []).map((_, qIdx) => {
            const qResponses = responses.filter(r => r.question_index === qIdx);
            const total = students.length || 0;
            const correct = qResponses.filter(r => r.is_correct).length;
            const wrong = qResponses.filter(r => !r.is_correct).length;
            return {
                correctPct: total > 0 ? (correct / total) * 100 : 0,
                wrongPct: total > 0 ? (wrong / total) * 100 : 0,
                remaining: Math.max(0, total - qResponses.length)
            };
        });
    }, [livePacket, responses, students.length]);

    //  Telemetry: Kick Student
    const handleKickStudent = (alias) => {
        const confirmMsg = lang === 'sv' 
            ? `Vill du verkligen ta bort ${alias} från sessionen? All data raderas.` 
            : `Are you sure you want to kick ${alias}? All data for this student will be deleted.`;
        if (window.confirm(confirmMsg)) {
            syncProgress('live_student_kicked', { 
                app_mode: 'teacher_live',
                remaining_students: students.length - 1
            });
            if (onKick) onKick(alias);
            setResponses(prev => prev.filter(r => r.student_alias !== alias));
        }
    };

    //  Telemetry: Manual Correction
    const handleManualOverride = async (responseId, currentIsCorrect) => {
        const newStatus = !currentIsCorrect;
        const targetResponse = responses.find(r => r.id === responseId);
        const targetQuestion = targetResponse ? livePacket[targetResponse.question_index] : null;

        syncProgress('live_manual_correction', {
            app_mode: 'teacher_live',
            changed_to_correct: newStatus,
            topic: targetQuestion?.topicId || 'unknown',
            level: targetQuestion?.resolvedData?.level || targetQuestion?.metadata?.difficulty || 1,
            answer_type: targetQuestion?.answerType || 'unknown',
            student_answer: targetResponse?.answer || ''
        });

        const previous = [...responses];
        setResponses(prev => prev.map(r => r.id === responseId ? { ...r, is_correct: newStatus, is_manually_corrected: true } : r));

        try {
            const { error } = await supabase.from('responses').update({ is_correct: newStatus }).eq('id', responseId);
            if (error) throw error;
        } catch {
            setResponses(previous);
            alert(lang === 'sv' ? "Databasfel: Ändringen sparades inte." : "Database error: Update failed.");
        }
    };

    

    //  Telemetry & Broadcast: End Session
    const handleEndSession = async () => {
        if (isClosing) return;
        setIsClosing(true);

        const totalStudents = [...new Set(responses.map(r => r.student_alias))].length;
        const totalAnswers = responses.length;
        const totalCorrect = responses.filter(r => r.is_correct).length;

        syncBatchProgress('live_session_ended', livePacket, {
            app_mode: 'teacher_live',
            total_students_joined: totalStudents,
            final_class_accuracy: totalAnswers > 0 ? parseFloat((totalCorrect / totalAnswers).toFixed(2)) : 0
        });

        try {
            // 🟢 1. Database update ALWAYS runs first!
            const { error } = await supabase
                .from('rooms')
                .update({ status: 'closed' })
                .eq('id', session.id);

            if (error) throw error;

            // 🟢 2. Fire-and-forget WebSocket broadcast (never blocks or throws)
            try {
                if (channelRef.current) {
                    channelRef.current.send({
                        type: 'broadcast',
                        event: 'room_closed',
                        payload: { roomId: session.id }
                    });
                }
            } catch (broadcastErr) {
                console.warn("Broadcast notice failed, relying on postgres status update:", broadcastErr);
            }

            // 🟢 3. Trigger parent callback to exit/redirect teacher view
            if (onEnd) {
                await onEnd();
            }
        } catch (err) {
            console.error("Error ending session:", err);
            alert(lang === 'sv' ? "Kunde inte avsluta sessionen." : "Could not end session.");
            setIsClosing(false);
        }
    };

    const toggleStar = (alias) => {
        setStarredStudents(prev => {
            if (prev.includes(alias)) return prev.filter(s => s !== alias);
            if (prev.length >= 5) {
                alert(lang === 'sv' ? "Du kan bara jämföra upp till 5 elever." : "You can only compare up to 5 students.");
                return prev;
            }
            return [...prev, alias];
        });
    };

    

    return {
        livePacket, setLivePacket,
        responses, setResponses,
        students,
        questionStats,
        connStatus,
        isSyncing,
        syncData,
        handleRegenerateQuestion,
        isRegenerating, setIsRegenerating,
        isClosing,
        isAnonymous, setIsAnonymous,
        hideCorrectness, setHideCorrectness,
        showActualAnswers, setShowActualAnswers,
        sortMode, setSortMode,
        setRandomizedStudents,
        starredStudents, setStarredStudents,
        toggleStar,
        isComparing, setIsComparing,
        handleManualOverride,
        handleKickStudent,
        handleEndSession
    };
}