// src/components/activities/engines/FourCornersEngine.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
    Play, RefreshCcw, Sparkles, Edit3, Trash2, Plus, 
    ArrowLeft, ArrowRight, Eye, CheckCircle2, Users, Save,
    ChevronRight, X, Loader2, Type, Calculator, Lightbulb, ChevronDown, ChevronUp
} from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import QuestionSummoner from '../../views/QuestionSummoner';
import VisualRenderer from '../../visuals/VisualRenderer';
import PreferencesToggle from '../../ui/PreferencesToggle';
import { generateDistractors } from '../../../lib/distractorGenerator';
import { extractDecodedAnswer } from '../../live/core/liveAnswerUtils.js';
import { liveCreateRoom } from '../../live/core/liveCreateRoom.js';
import { universalRegenerateQuestion, closeActiveRoom } from '../../live/core/activityQuestionUtils.js';
import { useLibrary } from '../../../hooks/useLibrary.js';

const MathDisplay = ({ content, className = "" }) => {
    const containerRef = useRef(null);
    const str = String(content || '').trim();
    const hasMath = /\\cdot|\^|_|\\frac|\\times|·/.test(str);
    const formattedContent = hasMath && !str.includes('$') ? `$${str}$` : str;

    useEffect(() => {
        if (!containerRef.current) return;
        containerRef.current.innerText = formattedContent;
        if (window.renderMathInElement) {
            window.renderMathInElement(containerRef.current, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false }
                ],
                throwOnError: false,
                trust: true
            });
        }
    }, [formattedContent]);

    return <span ref={containerRef} className={`math-content leading-relaxed whitespace-pre-wrap ${className}`} />;
};

export default function FourCornersEngine({
    initialConfig,
    sourcePacket = null,
    session = null,      
    isLiveHost = false,
    profile = null,
    onClose,
    lang = 'sv'
}) {
    const t = {
        sv: {
            title: "4 Hörn",
            curate_title: "Förbered Frågelista",
            round: "Runda",
            of: "av",
            start_game: "Starta Spel",
            rounds_word: "omgångar",
            reroll_numbers: "Slumpa Tal",
            quick_edit: "Redigera",
            review_list: "Frågelista",
            playlist_structure: "Omgångens Uppgifter",
            playlist_sub: "Granska svarsalternativ och ordning inför helklassgenomgång.",
            summon_more: "Hämta Frågor",
            create_custom: "Skapa Egen Fråga",
            empty_playlist: "Inga frågor i spellistan",
            empty_sub: "Hämta frågor från läroplanen eller skapa en egen uppgift.",
            correct_badge: "Rätt",
            votes_submitted: "röster inlämnade",
            corner: "Hörn",
            show_distribution: "Visa Fördelning",
            show_correct: "Visa Rätt Hörn",
            next_round: "Nästa Runda",
            room_pin: "RUMSKOD",
            modal_edit_title: "Redigera Fråga & Hörn",
            modal_new_title: "Skapa Egen Fråga",
            prompt_label: "Uppgiftstext",
            latex_label: "Formel (LaTeX)",
            corners_label: "Svarsalternativ i de 4 Hörnen",
            reroll_distractors: "Slumpa om felaktiga svar",
            cancel: "Avbryt",
            save_update: "Spara & Uppdatera",
            clues: "Ledtrådar",
            clue: "Ledtråd",
            show_clues: "Visa Ledtrådar",
            hide_clues: "Dölj Ledtrådar",
            no_clues: "Inga ledtrådar för denna uppgift."
        },
        en: {
            title: "4 Corners",
            curate_title: "Prepare Playlist",
            round: "Round",
            of: "of",
            start_game: "Start Game",
            rounds_word: "rounds",
            reroll_numbers: "Re-roll Numbers",
            quick_edit: "Edit",
            review_list: "Playlist",
            playlist_structure: "Round Questions",
            playlist_sub: "Review distractors and order before whole-class presentation.",
            summon_more: "Summon Questions",
            create_custom: "Create Question",
            empty_playlist: "Playlist is empty",
            empty_sub: "Summon from generators or write your own problem.",
            correct_badge: "Correct",
            votes_submitted: "votes submitted",
            corner: "Corner",
            show_distribution: "Show Distribution",
            show_correct: "Reveal Winner",
            next_round: "Next Round",
            room_pin: "ROOM PIN",
            modal_edit_title: "Edit Question & Corners",
            modal_new_title: "Create Question",
            prompt_label: "Prompt Text",
            latex_label: "Formula (LaTeX)",
            corners_label: "Options for the 4 Corners",
            reroll_distractors: "Re-roll Distractors",
            cancel: "Cancel",
            save_update: "Save & Update",
            clues: "Clues",
            clue: "Clue",
            show_clues: "Show Clues",
            hide_clues: "Hide Clues",
            no_clues: "No clues available for this problem."
        }
    }[lang] || {};

    const [viewMode, setViewMode] = useState(session?.active_question_data?.activeQuestion ? 'play' : 'curate');
    const [rounds, setRounds] = useState([]);
    const [activeRoundIndex, setActiveRoundIndex] = useState(0);
    const [revealedPhase, setRevealedPhase] = useState('commit');
    const [liveVotes, setLiveVotes] = useState({ A: 0, B: 0, C: 0, D: 0 });
    
    // Live Room State
    const [activeRoomId, setActiveRoomId] = useState(session?.id || initialConfig?.session?.id || null);
    const [activeClassCode, setActiveClassCode] = useState(
        session?.class_code || session?.room_code || 
        initialConfig?.session?.class_code || initialConfig?.session?.room_code || ''
    );

    // Title State (at the component level)
    const defaultTitle = initialConfig?.title || 
                         sourcePacket?.title || 
                         (lang === 'sv' ? "4 Hörn Aktivitet" : "4 Corners Activity");
    const [activityTitle, setActivityTitle] = useState(defaultTitle);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [sheetId, setSheetId] = useState(initialConfig?.sheetId || sourcePacket?.id || null);

    // Clue Accordion state
    const [showClues, setShowClues] = useState(false);
    const [revealedClueIndex, setRevealedClueIndex] = useState(0);

    const [isSummonerOpen, setIsSummonerOpen] = useState(false);
    const [editingRound, setEditingRound] = useState(null);
    const [isReRolling, setIsReRolling] = useState(false);
    const [isRegeneratingAll, setIsRegeneratingAll] = useState(false);

    const { saveWorksheet, saveToLibrary } = useLibrary();
    const saveFn = saveWorksheet || saveToLibrary;
    const [isSaving, setIsSaving] = useState(false);

    const deliveryMode = initialConfig?.settings?.deliveryMode || 
                        initialConfig?.deliveryMode || 
                        (session ? 'digital' : 'physical');

    const isDigitalMode = deliveryMode === 'digital' || Boolean(session);

    const CORNER_STYLES = {
        A: {
            bg: 'bg-indigo-500/10 border-indigo-500/40 text-indigo-900 dark:text-indigo-100',
            pill: 'bg-indigo-600 text-white',
            bar: 'bg-indigo-500'
        },
        B: {
            bg: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-100',
            pill: 'bg-emerald-600 text-white',
            bar: 'bg-emerald-500'
        },
        C: {
            bg: 'bg-amber-500/10 border-amber-500/40 text-amber-900 dark:text-amber-100',
            pill: 'bg-amber-600 text-white',
            bar: 'bg-amber-500'
        },
        D: {
            bg: 'bg-rose-500/10 border-rose-500/40 text-rose-900 dark:text-rose-100',
            pill: 'bg-rose-600 text-white',
            bar: 'bg-rose-500'
        }
    };

    const formatToCornerRound = (raw, roundNumber) => {
        const rd = raw.renderData || raw.resolvedData?.renderData || raw.data?.renderData || raw || {};
        const resolved = raw.resolvedData || raw;
        const isWp = Boolean(
            raw.wordProblem || 
            resolved.wordProblem || 
            rd.isWordProblemApplied || 
            resolved.metadata?.isWordProblemApplied
        );

        const correctAnswer = extractDecodedAnswer(resolved) || 
                              extractDecodedAnswer(rd) || 
                              extractDecodedAnswer(raw) || 
                              raw.answer || 
                              rd.answer || 
                              '';

        const options = (rd.options && rd.options.length >= 4)
            ? rd.options
            : generateDistractors({
                correctAnswer,
                topicId: raw.topicId || resolved.topicId || '',
                renderData: rd,
                resolvedData: resolved,
                raw
            });

        return {
            id: raw.id || crypto.randomUUID(),
            roundIndex: roundNumber,
            topicId: raw.topicId || resolved.topicId || raw.renderData?.topicId || (raw.topic_ids?.[0]) || 'custom',
            variationKey: raw.variationKey || resolved.variationKey || null,
            name: raw.name || `${t.round} ${roundNumber}`,
            source: raw.source || 'generator',
            wordProblem: isWp,
            showText: raw.showText !== false,
            showLatex: raw.showLatex !== undefined ? raw.showLatex : !isWp,
            showVisual: raw.showVisual !== false,
            renderData: { 
                ...rd, 
                options, 
                answer: correctAnswer,
                isWordProblemApplied: isWp 
            },
            responseSpec: { type: 'single_choice', answer: correctAnswer, options }
        };
    };

    // 🟢 Keep synchronous ref of room ID so teardown never misses it
    const roomIdRef = useRef(session?.id || initialConfig?.session?.id || null);
    const isCreatingRoomRef = useRef(false);

    // 1. Authorized Room Initializer (Strict Deduplication)
    // 🟢 1. Single-Point Live Room Provisioning (ONLY if digital delivery is selected)
    useEffect(() => {
        // If teacher chose Physical Movement (Projector), DO NOT create a live room
        if (!isDigitalMode) return;

        const existingSession = session || initialConfig?.session || initialConfig?.room;
        const existingId = existingSession?.id || activeRoomId || roomIdRef.current;
        const existingCode = existingSession?.class_code || existingSession?.room_code || activeClassCode;

        // If a room was already provided or created, adopt it
        if (existingId) {
            roomIdRef.current = existingId;
            if (!activeRoomId) setActiveRoomId(existingId);
            if (existingCode && !activeClassCode) setActiveClassCode(existingCode);
            return;
        }

        if (isCreatingRoomRef.current) return;
        isCreatingRoomRef.current = true;

        const initAuthorizedRoom = async () => {
            try {
                const newRoom = await liveCreateRoom({
                    title: activityTitle || "4 Hörn Live",
                    mode: 'activity_four_corners',
                    profile,
                    packet: rounds
                });

                if (newRoom) {
                    roomIdRef.current = newRoom.id;
                    setActiveRoomId(newRoom.id);
                    setActiveClassCode(newRoom.class_code || newRoom.room_code);
                }
            } catch (err) {
                console.error("[FourCornersEngine] Could not create authorized room:", err);
            } finally {
                isCreatingRoomRef.current = false;
            }
        };

        initAuthorizedRoom();
    }, [session, initialConfig, isDigitalMode]);

    const getEffectiveRoomId = () => {
        return (
            roomIdRef.current ||
            activeRoomId ||
            session?.id ||
            session?.roomId ||
            initialConfig?.session?.id ||
            initialConfig?.roomId ||
            initialConfig?.room?.id ||
            null
        );
    };

    // 🟢 2. Guaranteed Room Teardown on Close
    const handleCloseEngine = async () => {
        const targetRoomId = getEffectiveRoomId();

        if (targetRoomId) {
            await closeActiveRoom(targetRoomId);
            setActiveRoomId(null);
            setActiveClassCode('');
        }

        if (onClose) {
            onClose();
        }
    };

    // 🟢 3. Save to Library with dedicated table handling
    const handleSavePlaylist = async () => {
        if (rounds.length === 0) return;

        const finalTitle = activityTitle.trim() || (lang === 'sv' ? "4 Hörn Aktivitet" : "4 Corners Activity");
        setIsSaving(true);

        try {
            const { data: authData } = await supabase.auth.getUser();
            const teacherId = authData?.user?.id;
            if (!teacherId) throw new Error("Not authenticated");

            const payload = {
                title: finalTitle,
                type: 'activity_four_corners',
                user_id: teacherId,
                packet: rounds.map(r => ({
                    id: r.id,
                    topicId: r.topicId,
                    variationKey: r.variationKey,
                    name: r.name,
                    wordProblem: r.wordProblem,
                    showText: r.showText !== false,
                    showLatex: r.showLatex !== false,
                    showVisual: r.showVisual !== false,
                    renderData: r.renderData,
                    responseSpec: r.responseSpec
                })),
                config: {
                    questionCount: rounds.length
                }
            };

            let res;
            if (sheetId) {
                res = await supabase.from('saved_sheets').update(payload).eq('id', sheetId).select().single();
            } else {
                res = await supabase.from('saved_sheets').insert([payload]).select().single();
            }

            if (res.error) throw res.error;
            if (res.data?.id) setSheetId(res.data.id);

            alert(lang === 'sv' ? "Aktiviteten har sparats i ditt bibliotek!" : "Activity saved to your library!");
        } catch (err) {
            console.error("[FourCornersEngine] Save failed:", err);
            alert(lang === 'sv' ? "Kunde inte spara aktiviteten." : "Failed to save activity.");
        } finally {
            setIsSaving(false);
        }
    };

    // Hydrate initial questions
    useEffect(() => {
        const initialList = initialConfig?.initialQuestions || sourcePacket || [];
        if (initialList.length > 0) {
            setRounds(initialList.map((q, idx) => formatToCornerRound(q, idx + 1)));
        }
    }, []);

    const currentRound = rounds[activeRoundIndex] || null;

    useEffect(() => {
        setShowClues(false);
        setRevealedClueIndex(0);
    }, [activeRoundIndex, currentRound?.id]);

    const totalVotesSubmitted = useMemo(() => {
        return liveVotes.A + liveVotes.B + liveVotes.C + liveVotes.D;
    }, [liveVotes]);

    const activeClues = useMemo(() => {
        const raw = currentRound?.renderData?.clues || 
                    currentRound?.renderData?.hints || 
                    currentRound?.resolvedData?.clues || 
                    currentRound?.renderData?.solutionSteps || [];
        if (Array.isArray(raw)) return raw;
        if (typeof raw === 'string') return [raw];
        return [];
    }, [currentRound]);

    const broadcastRoomState = async (updatedRound, phase = 'commit') => {
        if (!isDigitalMode || !activeRoomId) return; // 🟢 Skip Supabase sync in projector mode

        try {
            await supabase
                .from('rooms')
                .update({
                    active_question_data: {
                        mode: 'activity_four_corners',
                        gameKey: 'four_corners',
                        activity_mode: 'activity_four_corners',
                        activeTile: updatedRound ? `round_${updatedRound.roundIndex}` : null,
                        activeQuestion: updatedRound,
                        revealedPhase: phase,
                        roundIndex: updatedRound?.roundIndex || 1,
                        updated_at: new Date().toISOString()
                    }
                })
                .eq('id', activeRoomId);
        } catch (err) {
            console.error("[FourCornersEngine] Broadcast error:", err);
        }
    };

    const commitAndBroadcastRound = async (updatedRound, phase = 'commit') => {
        setRounds(prev => prev.map(r => r.id === updatedRound.id ? updatedRound : r));
        setLiveVotes({ A: 0, B: 0, C: 0, D: 0 });
        setRevealedPhase(phase);
        await broadcastRoomState(updatedRound, phase);
    };

    const setPhaseAndBroadcast = async (phase) => {
        setRevealedPhase(phase);
        await broadcastRoomState(currentRound, phase);
    };

    // 🟢 Update line 294:
    useEffect(() => {
        if (!isDigitalMode || !activeRoomId || !currentRound) return;

        setLiveVotes({ A: 0, B: 0, C: 0, D: 0 });

        const fetchExistingVotes = async () => {
            const { data } = await supabase
                .from('responses')
                .select('answer')
                .eq('room_id', activeRoomId)
                .eq('question_index', currentRound.roundIndex);

            if (data && data.length > 0) {
                const tallies = { A: 0, B: 0, C: 0, D: 0 };
                data.forEach(r => {
                    const ans = r.answer?.toUpperCase();
                    if (tallies[ans] !== undefined) tallies[ans]++;
                });
                setLiveVotes(tallies);
            }
        };
        fetchExistingVotes();

        const channel = supabase.channel(`fc_live_${activeRoomId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'responses',
                filter: `room_id=eq.${activeRoomId}`
            }, (payload) => {
                const choice = payload.new?.answer?.toUpperCase();
                if (choice && ['A', 'B', 'C', 'D'].includes(choice)) {
                    setLiveVotes(prev => ({ ...prev, [choice]: prev[choice] + 1 }));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isDigitalMode, activeRoomId, activeRoundIndex, currentRound?.id]); // 🟢 Added isDigitalMode

    const handleRerollDistractors = (roundId) => {
        setRounds(prev => prev.map(r => {
            if (r.id !== roundId) return r;
            
            const cleanRenderData = { ...r.renderData, options: null };
            const freshOptions = generateDistractors({
                correctAnswer: r.responseSpec.answer || cleanRenderData.answer,
                topicId: r.topicId,
                renderData: cleanRenderData,
                resolvedData: r.resolvedData || r,
                raw: r
            });

            const updated = {
                ...r,
                renderData: { ...r.renderData, options: freshOptions },
                responseSpec: { ...r.responseSpec, options: freshOptions }
            };

            if (viewMode === 'play' && currentRound?.id === roundId) {
                commitAndBroadcastRound(updated, 'commit');
            }
            return updated;
        }));
    };

    const handleRegenerateQuestion = async (round) => {
        if (!round) return;

        const effectiveTopicId = round.topicId !== 'imported' && round.topicId !== 'custom' 
            ? round.topicId 
            : (round.resolvedData?.topicId || round.renderData?.topicId || null);

        if (!effectiveTopicId || effectiveTopicId === 'custom') {
            handleRerollDistractors(round.id);
            return;
        }

        setLiveVotes({ A: 0, B: 0, C: 0, D: 0 });
        setIsReRolling(true);

        try {
            const freshRound = await universalRegenerateQuestion({
                roomId: activeRoomId,
                questionIndex: round.roundIndex,
                topicId: effectiveTopicId,
                variationKey: round.variationKey || round.resolvedData?.variationKey || null,
                wordProblem: round.wordProblem,
                lang,
                formatFn: formatToCornerRound
            });

            if (freshRound) {
                const updated = {
                    ...freshRound,
                    id: round.id,
                    name: round.name,
                    topicId: effectiveTopicId
                };
                setRounds(prev => prev.map(r => r.id === round.id ? updated : r));
                if (viewMode === 'play' && currentRound?.id === round.id) {
                    await commitAndBroadcastRound(updated, 'commit');
                }
            }
        } catch (err) {
            console.error("[FourCornersEngine] Regenerate failed:", err);
        } finally {
            setIsReRolling(false);
        }
    };

    const handleRegenerateAll = async () => {
        const confirmMsg = lang === 'sv' 
            ? "Slumpa nya tal för alla frågor i listan?" 
            : "Re-roll numbers for all questions in the list?";
        if (!window.confirm(confirmMsg)) return;

        setIsRegeneratingAll(true);
        try {
            const updatedPromises = rounds.map(async (round, idx) => {
                const effectiveTopicId = round.topicId !== 'imported' && round.topicId !== 'custom' 
                    ? round.topicId 
                    : (round.resolvedData?.topicId || round.renderData?.topicId || null);

                if (!effectiveTopicId || effectiveTopicId === 'custom') {
                    const cleanRenderData = { ...round.renderData, options: null };
                    const freshOptions = generateDistractors({
                        correctAnswer: round.responseSpec.answer || cleanRenderData.answer,
                        topicId: round.topicId,
                        renderData: cleanRenderData,
                        raw: round
                    });
                    return {
                        ...round,
                        renderData: { ...round.renderData, options: freshOptions },
                        responseSpec: { ...round.responseSpec, options: freshOptions }
                    };
                }

                try {
                    const fresh = await universalRegenerateQuestion({
                        roomId: activeRoomId,
                        questionIndex: idx + 1,
                        topicId: effectiveTopicId,
                        variationKey: round.variationKey || round.resolvedData?.variationKey || null,
                        wordProblem: round.wordProblem,
                        lang,
                        formatFn: formatToCornerRound
                    });

                    return fresh ? { ...fresh, id: round.id, name: round.name, topicId: effectiveTopicId } : round;
                } catch {
                    return round;
                }
            });

            const refreshed = await Promise.all(updatedPromises);
            setRounds(refreshed);
            setLiveVotes({ A: 0, B: 0, C: 0, D: 0 });

            if (viewMode === 'play' && refreshed.length > 0) {
                await commitAndBroadcastRound(refreshed[activeRoundIndex], 'commit');
            }
        } catch (err) {
            console.error("[FourCornersEngine] Error regenerating all:", err);
        } finally {
            setIsRegeneratingAll(false);
        }
    };

    const isCurrentWordProblem = Boolean(
        currentRound?.wordProblem || 
        currentRound?.renderData?.isWordProblemApplied || 
        currentRound?.resolvedData?.metadata?.isWordProblemApplied
    );

    const effectiveShowLatex = currentRound?.showLatex !== undefined 
        ? Boolean(currentRound?.showLatex) 
        : (!isCurrentWordProblem);

    const effectiveShowVisual = currentRound?.showVisual !== false;

    return (
        <div 
            className="fixed inset-0 z-[500] flex flex-col overflow-hidden select-none font-sans animate-in fade-in transition-colors duration-200"
            style={{ backgroundColor: 'var(--bg-canvas)', color: 'var(--text-main)' }}
        >
            {/* Top Bar Header */}
            <header 
                className="px-6 py-3 flex items-center justify-between shrink-0 z-20 shadow-xs border-b transition-colors"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}
            >
                {/* LEFT: Room PIN + Branded Tag + Editable Title Box + Save Button */}
                <div className="flex items-center gap-3">
                    {activeClassCode && (
                        <div className="bg-rose-500/10 border-2 border-rose-500/40 px-3.5 py-1.5 rounded-2xl flex items-center gap-2.5 shadow-lg shadow-rose-950/20 shrink-0">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase tracking-widest text-rose-500 dark:text-rose-400 leading-none">
                                    {t.room_pin}
                                </span>
                                <span className="text-xl sm:text-2xl font-mono font-black tracking-widest leading-tight" style={{ color: 'var(--text-main)' }}>
                                    {activeClassCode}
                                </span>
                            </div>
                        </div>
                    )}

                    <span className="badge-brand font-black text-xs px-2.5 py-1 shrink-0">
                        {t.title}
                    </span>

                    {/* Dedicated Title Input */}
                    <div 
                        className="flex items-center rounded-xl border px-2.5 py-1 shadow-xs transition-all focus-within:ring-2 focus-within:ring-indigo-500/40"
                        style={{ 
                            backgroundColor: 'var(--bg-surface)', 
                            borderColor: 'var(--border-strong)' 
                        }}
                    >
                        <Edit3 size={13} className="mr-2 shrink-0 opacity-40" />
                        <input
                            type="text"
                            value={activityTitle}
                            onChange={(e) => setActivityTitle(e.target.value)}
                            placeholder={lang === 'sv' ? "Namnge aktiviteten..." : "Name the activity..."}
                            className="text-xs sm:text-sm font-bold tracking-tight outline-none bg-transparent w-44 sm:w-64"
                            style={{ color: 'var(--text-main)' }}
                        />
                        {rounds.length > 0 && (
                            <button
                                type="button"
                                onClick={handleSavePlaylist}
                                disabled={isSaving}
                                className="ml-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                                title={lang === 'sv' ? "Spara till biblioteket" : "Save to library"}
                            >
                                <Save size={12} className={isSaving ? "animate-spin" : ""} />
                                <span>{isSaving ? (lang === 'sv' ? "Sparar..." : "Saving...") : (lang === 'sv' ? "Spara" : "Save")}</span>
                            </button>
                        )}
                    </div>

                    {viewMode === 'play' && (
                        <span className="text-xs font-semibold shrink-0 hidden md:inline-block" style={{ color: 'var(--text-muted)' }}>
                            • {t.round} {activeRoundIndex + 1} {t.of} {rounds.length}
                        </span>
                    )}
                </div>

                {/* CENTER: Controls & Preferences */}
                <div className="flex items-center gap-3">
                    <PreferencesToggle />

                    {viewMode === 'curate' ? (
                        <button
                            onClick={() => {
                                if (rounds.length === 0) return;
                                setViewMode('play');
                                setActiveRoundIndex(0);
                                commitAndBroadcastRound(rounds[0], 'commit');
                            }}
                            disabled={rounds.length === 0}
                            className="btn-brand text-xs font-black uppercase tracking-wider px-5 py-2.5 shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
                        >
                            <Play size={16} /> {t.start_game} ({rounds.length} {t.rounds_word})
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            {currentRound?.renderData?.latex && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const next = !effectiveShowLatex;
                                        const updated = { ...currentRound, showLatex: next };
                                        commitAndBroadcastRound(updated, revealedPhase);
                                    }}
                                    className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border ${
                                        effectiveShowLatex 
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                                            : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400'
                                    }`}
                                    style={!effectiveShowLatex ? { backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)' } : {}}
                                >
                                    <Calculator size={14} />
                                    <span>{effectiveShowLatex ? "Formel På" : "Formel Av"}</span>
                                </button>
                            )}

                            <button
                                onClick={() => handleRegenerateQuestion(currentRound)}
                                disabled={isReRolling}
                                className="px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border transition-all cursor-pointer hover:border-amber-400"
                                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
                            >
                                <RefreshCcw size={14} className={isReRolling ? "animate-spin text-amber-500" : ""} /> {t.reroll_numbers}
                            </button>

                            <button
                                onClick={() => setEditingRound(currentRound)}
                                className="px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border transition-all cursor-pointer hover:border-indigo-400"
                                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
                            >
                                <Edit3 size={14} /> {t.quick_edit}
                            </button>

                            <button
                                onClick={() => setViewMode('curate')}
                                className="px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer"
                                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)', color: 'var(--text-muted)' }}
                            >
                                {t.review_list}
                            </button>
                        </div>
                    )}
                </div>

                {/* RIGHT: Close Button (Triggers Room Teardown) */}
                <div className="flex items-center">
                    <button 
                        onClick={handleCloseEngine} 
                        className="p-2 rounded-xl transition-colors cursor-pointer hover:bg-rose-500 hover:text-white"
                        style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)' }}
                        title={t.cancel}
                    >
                        <X size={18} />
                    </button>
                </div>
            </header>

            {/* Main Stage Viewport */}
            <main className="flex-1 overflow-hidden relative">
                {viewMode === 'curate' && (
                    <div className="h-full overflow-y-auto p-8 max-w-5xl mx-auto space-y-4 custom-scrollbar">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-black">{t.playlist_structure}</h2>
                                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{t.playlist_sub}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        const newQ = {
                                            id: crypto.randomUUID(),
                                            roundIndex: rounds.length + 1,
                                            topicId: 'custom',
                                            name: `${t.round} ${rounds.length + 1}`,
                                            source: 'custom',
                                            wordProblem: false,
                                            showText: true,
                                            showLatex: true,
                                            showVisual: true,
                                            renderData: {
                                                description: lang === 'sv' ? "Vad är värdet av x?" : "What is the value of x?",
                                                latex: "2x + 4 = 10",
                                                answer: "3",
                                                clues: [
                                                    lang === 'sv' ? "Börja med att subtrahera 4 från båda sidor." : "Start by subtracting 4 from both sides.",
                                                    lang === 'sv' ? "Dela sedan resultatet med 2." : "Then divide the result by 2."
                                                ],
                                                options: [
                                                    { id: 'A', label: '3', isCorrect: true },
                                                    { id: 'B', label: '7', isCorrect: false },
                                                    { id: 'C', label: '6', isCorrect: false },
                                                    { id: 'D', label: '2', isCorrect: false }
                                                ]
                                            },
                                            responseSpec: {
                                                type: 'single_choice',
                                                answer: "3",
                                                options: [
                                                    { id: 'A', label: '3', isCorrect: true },
                                                    { id: 'B', label: '7', isCorrect: false },
                                                    { id: 'C', label: '6', isCorrect: false },
                                                    { id: 'D', label: '2', isCorrect: false }
                                                ]
                                            }
                                        };
                                        setEditingRound(newQ);
                                    }}
                                    className="px-4 py-2 border rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xs"
                                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
                                >
                                    <Plus size={16} /> {t.create_custom}
                                </button>
                                {rounds.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleRegenerateAll}
                                        disabled={isRegeneratingAll}
                                        className="px-3.5 py-2 border rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs transition-all hover:border-amber-400 hover:text-amber-500"
                                        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
                                        title={lang === 'sv' ? "Slumpa nya tal för alla frågor" : "Randomize all numbers"}
                                    >
                                        <RefreshCcw size={14} className={isRegeneratingAll ? "animate-spin text-amber-500" : ""} />
                                        <span>{lang === 'sv' ? "Slumpa alla" : "Randomize all"}</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsSummonerOpen(true)}
                                    className="btn-brand px-4 py-2 text-xs font-black uppercase tracking-wider shadow-xs cursor-pointer"
                                >
                                    <Sparkles size={16} /> {t.summon_more}
                                </button>
                            </div>
                        </div>

                        {rounds.length === 0 ? (
                            <div 
                                className="border-2 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center"
                                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}
                            >
                                <Sparkles size={36} className="text-indigo-400 mb-3" />
                                <h3 className="text-base font-black mb-1">{t.empty_playlist}</h3>
                                <p className="text-xs max-w-sm mb-4" style={{ color: 'var(--text-muted)' }}>{t.empty_sub}</p>
                            </div>
                        ) : (
                            rounds.map((round, idx) => {
                                const rd = round.renderData || {};
                                const hasVisual = Boolean(rd.geometry || rd.graph || rd.pattern || rd.marbles || rd.diagram);

                                return (
                                    <div 
                                        key={round.id} 
                                        className="card border rounded-3xl p-6 shadow-sm transition-all"
                                    >
                                        <div className="flex items-start justify-between gap-4 mb-4">
                                            <div className="flex items-center gap-3">
                                                <span 
                                                    className="w-9 h-9 rounded-2xl font-black text-xs flex items-center justify-center border shrink-0"
                                                    style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)' }}
                                                >
                                                    {idx + 1}
                                                </span>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-xs font-black uppercase tracking-wider text-indigo-500">
                                                            {round.name}
                                                        </h4>
                                                        {round.wordProblem && (
                                                            <span className="badge-brand theme-amber text-[10px]">
                                                                {lang === 'sv' ? "Textuppgift" : "Word Problem"}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        const nextWp = !round.wordProblem;
                                                        const topic = round.topicId;
                                                        if (topic && topic !== 'custom' && topic !== 'imported') {
                                                            try {
                                                                const url = `/api/question?topic=${topic}${round.variationKey ? `&variation=${round.variationKey}` : ''}&lang=${lang}&wordProblem=${nextWp}`;
                                                                const res = await fetch(url);
                                                                const data = await res.json();
                                                                const formatted = formatToCornerRound(data, round.roundIndex);
                                                                setRounds(prev => prev.map(r => r.id === round.id ? { ...formatted, id: round.id } : r));
                                                            } catch (err) {
                                                                console.error("Failed to toggle word problem:", err);
                                                            }
                                                        } else {
                                                            setRounds(prev => prev.map(r => r.id === round.id ? {
                                                                ...r,
                                                                wordProblem: nextWp,
                                                                showLatex: !nextWp,
                                                                renderData: { ...r.renderData, isWordProblemApplied: nextWp }
                                                            } : r));
                                                        }
                                                    }}
                                                    className={`p-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                                                        round.wordProblem 
                                                            ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' 
                                                            : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                                                    }`}
                                                    style={!round.wordProblem ? { backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)' } : {}}
                                                    title={lang === 'sv' ? "Växla mellan formel och textuppgift" : "Toggle word problem / formula"}
                                                >
                                                    <Type size={14} />
                                                </button>

                                                <button 
                                                    onClick={() => handleRerollDistractors(round.id)} 
                                                    className="p-2 border rounded-xl cursor-pointer transition-colors hover:text-indigo-500"
                                                    style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)', color: 'var(--text-muted)' }}
                                                    title={t.reroll_distractors}
                                                >
                                                    <Sparkles size={15} />
                                                </button>

                                                <button 
                                                    onClick={() => handleRegenerateQuestion(round)} 
                                                    className="p-2 border rounded-xl cursor-pointer transition-colors hover:text-amber-500"
                                                    style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)', color: 'var(--text-muted)' }}
                                                    title={t.reroll_numbers}
                                                >
                                                    <RefreshCcw size={15} />
                                                </button>

                                                <button 
                                                    onClick={() => setEditingRound(round)} 
                                                    className="p-2 border rounded-xl cursor-pointer transition-colors hover:text-indigo-500"
                                                    style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)', color: 'var(--text-muted)' }}
                                                    title={t.quick_edit}
                                                >
                                                    <Edit3 size={15} />
                                                </button>

                                                <button 
                                                    onClick={() => setRounds(prev => prev.filter(r => r.id !== round.id))} 
                                                    className="p-2 border rounded-xl cursor-pointer transition-colors hover:text-rose-500"
                                                    style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)', color: 'var(--text-muted)' }}
                                                    title="Ta bort"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </div>

                                        {rd.description && (
                                            <div className="text-sm sm:text-base font-bold mb-3 leading-relaxed">
                                                <MathDisplay content={rd.description} />
                                            </div>
                                        )}

                                        {hasVisual && round.showVisual !== false && (
                                            <div 
                                                className="w-full flex justify-center py-4 border rounded-2xl overflow-hidden mb-3"
                                                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)' }}
                                            >
                                                <VisualRenderer data={rd} isWordProblem={round.wordProblem} />
                                            </div>
                                        )}

                                        {rd.latex && round.showLatex !== false && (
                                            <div 
                                                className="w-full border rounded-2xl p-4 text-center text-2xl font-serif font-bold mb-4 shadow-inner"
                                                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)', color: 'var(--brand-solid)' }}
                                            >
                                                <MathDisplay content={`$$${rd.latex}$$`} />
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-2.5 pt-3 border-t" style={{ borderColor: 'var(--border-main)' }}>
                                            {round.renderData.options?.map((opt) => (
                                                <div 
                                                    key={opt.id} 
                                                    className={`p-3 rounded-2xl border text-xs flex items-center justify-between transition-all ${
                                                        opt.isCorrect 
                                                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-800 dark:text-emerald-200 font-bold' 
                                                            : 'border-slate-200 dark:border-slate-800'
                                                    }`}
                                                    style={!opt.isCorrect ? { backgroundColor: 'var(--bg-surface)' } : {}}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[11px] ${
                                                            opt.isCorrect ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'
                                                        }`}>
                                                            {opt.id}
                                                        </span>
                                                        <MathDisplay content={String(opt.label)} className="text-sm font-bold" />
                                                    </div>
                                                    {opt.isCorrect && (
                                                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
                                                            {t.correct_badge}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* 2. PLAY MODE: Projector Stage with Left Clue Support */}
                {viewMode === 'play' && currentRound && (
                    <div className="h-full flex flex-col p-6 max-w-7xl mx-auto gap-4">
                        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                            <div 
                                className="lg:col-span-7 border-2 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl overflow-y-auto custom-scrollbar"
                                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="badge-brand font-black text-xs px-3 py-1">
                                            {t.round} {activeRoundIndex + 1}
                                        </span>

                                        <div className="flex items-center gap-2">
                                            {activeClues.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowClues(!showClues)}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border transition-all cursor-pointer ${
                                                        showClues 
                                                            ? 'bg-amber-500 text-slate-900 border-amber-500 shadow-md' 
                                                            : 'hover:border-amber-400'
                                                    }`}
                                                    style={!showClues ? { backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)', color: 'var(--text-main)' } : {}}
                                                >
                                                    <Lightbulb size={14} className={showClues ? "text-slate-900" : "text-amber-500"} />
                                                    <span>{showClues ? t.hide_clues : `${t.clues} (${activeClues.length})`}</span>
                                                    {showClues ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                </button>
                                            )}

                                            <div 
                                                className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border"
                                                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)' }}
                                            >
                                                <Users size={14} className="text-indigo-500" />
                                                <span>{totalVotesSubmitted} {t.votes_submitted}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-xl sm:text-2xl font-bold leading-relaxed">
                                        <MathDisplay content={currentRound.renderData.description} />
                                    </div>

                                    {showClues && activeClues.length > 0 && (
                                        <div className="p-4 rounded-2xl border-2 border-amber-500/40 bg-amber-500/10 space-y-3 animate-in fade-in duration-200">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                                                    <Lightbulb size={16} />
                                                    <span>{t.clues}</span>
                                                </div>
                                                {activeClues.length > 1 && (
                                                    <div className="flex gap-1">
                                                        {activeClues.map((_, i) => (
                                                            <button
                                                                key={i}
                                                                onClick={() => setRevealedClueIndex(i)}
                                                                className={`w-6 h-6 rounded-lg text-xs font-black cursor-pointer transition-all ${
                                                                    revealedClueIndex === i 
                                                                        ? 'bg-amber-500 text-slate-900 font-black shadow-xs' 
                                                                        : 'bg-black/10 text-slate-600 dark:text-slate-300'
                                                                }`}
                                                            >
                                                                {i + 1}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-sm font-semibold border border-amber-500/30">
                                                <MathDisplay content={activeClues[revealedClueIndex]} />
                                            </div>
                                        </div>
                                    )}

                                    {effectiveShowVisual && currentRound.renderData.geometry && (
                                        <div 
                                            className="w-full flex justify-center py-4 border rounded-2xl overflow-hidden shadow-inner"
                                            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)' }}
                                        >
                                            <VisualRenderer 
                                                data={currentRound.renderData} 
                                                isWordProblem={isCurrentWordProblem}
                                            />
                                        </div>
                                    )}

                                    {effectiveShowLatex && currentRound.renderData.latex && (
                                        <div 
                                            className="text-3xl sm:text-4xl font-serif font-black p-6 rounded-2xl border text-center my-3 shadow-inner"
                                            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)', color: 'var(--brand-solid)' }}
                                        >
                                            <MathDisplay content={`$$${currentRound.renderData.latex}$$`} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="lg:col-span-5 grid grid-cols-2 grid-rows-2 gap-4 h-full">
                                {['A', 'B', 'C', 'D'].map((quadId) => {
                                    const opt = currentRound.renderData.options?.find(o => o.id === quadId);
                                    const style = CORNER_STYLES[quadId];
                                    const votes = liveVotes[quadId] || 0;
                                    const pct = totalVotesSubmitted > 0 ? Math.round((votes / totalVotesSubmitted) * 100) : 0;
                                    const isWinner = revealedPhase === 'reveal' && opt?.isCorrect;
                                    const isDimmed = revealedPhase === 'reveal' && !opt?.isCorrect;

                                    return (
                                        <div 
                                            key={quadId}
                                            className={`rounded-3xl border-2 p-5 flex flex-col justify-between transition-all duration-300 ${
                                                isWinner 
                                                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-2xl scale-[1.02] ring-4 ring-emerald-400/40' 
                                                    : isDimmed 
                                                        ? 'opacity-30 grayscale border-slate-300 dark:border-slate-800' 
                                                        : style.bg
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm shadow-xs ${
                                                        isWinner ? 'bg-white text-emerald-600' : style.pill
                                                    }`}>
                                                        {quadId}
                                                    </span>
                                                    <span className="text-[11px] font-black uppercase tracking-wider opacity-70">
                                                        {t.corner} {quadId}
                                                    </span>
                                                </div>

                                                {revealedPhase !== 'commit' && (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xl font-black">{pct}%</span>
                                                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-black/10">
                                                            {votes}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="my-auto text-center py-4 text-2xl sm:text-3xl font-black">
                                                <MathDisplay content={String(opt?.label || '')} />
                                            </div>

                                            {revealedPhase !== 'commit' && (
                                                <div className="w-full bg-black/10 rounded-full h-2.5 overflow-hidden">
                                                    <div className={`h-full ${isWinner ? 'bg-white' : style.bar}`} style={{ width: `${pct}%` }} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <footer 
                            className="h-16 border rounded-2xl px-6 flex items-center justify-between shrink-0 shadow-xs z-30"
                            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}
                        >
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        if (activeRoundIndex > 0) {
                                            setActiveRoundIndex(prev => prev - 1);
                                            commitAndBroadcastRound(rounds[activeRoundIndex - 1], 'commit');
                                        }
                                    }}
                                    disabled={activeRoundIndex === 0}
                                    className="p-2 rounded-xl disabled:opacity-30 cursor-pointer"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    <ArrowLeft size={18} />
                                </button>
                                <span className="text-xs font-black uppercase tracking-widest px-2">
                                    {t.round} {activeRoundIndex + 1} / {rounds.length}
                                </span>
                                <button
                                    onClick={() => {
                                        if (activeRoundIndex < rounds.length - 1) {
                                            setActiveRoundIndex(prev => prev + 1);
                                            commitAndBroadcastRound(rounds[activeRoundIndex + 1], 'commit');
                                        }
                                    }}
                                    disabled={activeRoundIndex === rounds.length - 1}
                                    className="p-2 rounded-xl disabled:opacity-30 cursor-pointer"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    <ArrowRight size={18} />
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                {revealedPhase === 'commit' && (
                                    <button
                                        onClick={() => setPhaseAndBroadcast('distribution')}
                                        className="btn-brand px-6 py-2.5 text-xs font-black uppercase tracking-wider shadow-md cursor-pointer"
                                    >
                                        <Eye size={16} /> {t.show_distribution}
                                    </button>
                                )}

                                {revealedPhase === 'distribution' && (
                                    <button
                                        onClick={() => setPhaseAndBroadcast('reveal')}
                                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer transition-all"
                                    >
                                        <CheckCircle2 size={16} /> {t.show_correct}
                                    </button>
                                )}

                                {revealedPhase === 'reveal' && (
                                    <button
                                        onClick={() => {
                                            if (activeRoundIndex < rounds.length - 1) {
                                                setActiveRoundIndex(prev => prev + 1);
                                                commitAndBroadcastRound(rounds[activeRoundIndex + 1], 'commit');
                                            }
                                        }}
                                        disabled={activeRoundIndex === rounds.length - 1}
                                        className="btn-brand px-6 py-2.5 text-xs font-black uppercase tracking-wider shadow-md cursor-pointer disabled:opacity-50"
                                    >
                                        {t.next_round} <ChevronRight size={16} />
                                    </button>
                                )}
                            </div>
                        </footer>
                    </div>
                )}
            </main>

            {/* AD-HOC / CUSTOM QUESTION MODAL */}
            {editingRound && (
                <div className="fixed inset-0 z-[600] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
                    <div 
                        className="w-full max-w-xl rounded-3xl shadow-2xl p-6 border flex flex-col gap-4"
                        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
                    >
                        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-main)' }}>
                            <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                                <Edit3 size={16} className="text-indigo-500" /> 
                                {editingRound.source === 'custom' && !rounds.some(r => r.id === editingRound.id) 
                                    ? t.modal_new_title 
                                    : t.modal_edit_title}
                            </h3>
                            <button onClick={() => setEditingRound(null)} className="p-1 cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between py-1">
                            <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                                {lang === 'sv' ? "Typ av fråga" : "Question Type"}
                            </span>
                            <button
                                type="button"
                                onClick={() => setEditingRound(prev => ({
                                    ...prev,
                                    wordProblem: !prev.wordProblem,
                                    showLatex: prev.wordProblem,
                                    renderData: {
                                        ...prev.renderData,
                                        isWordProblemApplied: !prev.wordProblem
                                    }
                                }))}
                                className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer ${
                                    editingRound.wordProblem 
                                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-500' 
                                        : 'border-slate-300 dark:border-slate-700'
                                }`}
                                style={!editingRound.wordProblem ? { backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)' } : {}}
                            >
                                {editingRound.wordProblem ? (lang === 'sv' ? "Textuppgift" : "Word Problem") : (lang === 'sv' ? "Formel / Tal" : "Formula / Math")}
                            </button>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{t.prompt_label}</label>
                            <textarea
                                value={editingRound.renderData.description || ''}
                                onChange={(e) => setEditingRound({
                                    ...editingRound,
                                    renderData: { ...editingRound.renderData, description: e.target.value }
                                })}
                                className="w-full mt-1 p-3 border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
                                rows={2}
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{t.latex_label}</label>
                            <input
                                type="text"
                                value={editingRound.renderData.latex || ''}
                                onChange={(e) => setEditingRound({
                                    ...editingRound,
                                    renderData: { ...editingRound.renderData, latex: e.target.value }
                                })}
                                className="w-full mt-1 px-3 py-2 border rounded-xl text-xs font-mono font-bold text-indigo-500 outline-none focus:ring-2 focus:ring-indigo-500"
                                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)' }}
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{t.corners_label}</label>
                                <button
                                    onClick={() => {
                                        const fresh = generateDistractors({
                                            correctAnswer: editingRound.responseSpec.answer,
                                            topicId: editingRound.topicId,
                                            renderData: editingRound.renderData
                                        });
                                        setEditingRound({
                                            ...editingRound,
                                            renderData: { ...editingRound.renderData, options: fresh },
                                            responseSpec: { ...editingRound.responseSpec, options: fresh }
                                        });
                                    }}
                                    className="text-[10px] font-black text-indigo-500 hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                    <Sparkles size={12} /> {t.reroll_distractors}
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {editingRound.renderData.options?.map((opt, idx) => (
                                    <div 
                                        key={opt.id} 
                                        className="flex items-center gap-2 p-2 border rounded-xl"
                                        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)' }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const updated = editingRound.renderData.options.map(o => ({
                                                    ...o,
                                                    isCorrect: o.id === opt.id
                                                }));
                                                setEditingRound({
                                                    ...editingRound,
                                                    renderData: { ...editingRound.renderData, options: updated, answer: opt.label },
                                                    responseSpec: { ...editingRound.responseSpec, options: updated, answer: opt.label }
                                                });
                                            }}
                                            className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center cursor-pointer ${
                                                opt.isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                            }`}
                                            title="Mark as correct"
                                        >
                                            {opt.id}
                                        </button>
                                        <input
                                            type="text"
                                            value={opt.label}
                                            onChange={(e) => {
                                                const updated = [...editingRound.renderData.options];
                                                updated[idx] = { ...opt, label: e.target.value };
                                                setEditingRound({
                                                    ...editingRound,
                                                    renderData: { ...editingRound.renderData, options: updated },
                                                    responseSpec: {
                                                        ...editingRound.responseSpec,
                                                        options: updated,
                                                        answer: opt.isCorrect ? e.target.value : editingRound.responseSpec.answer
                                                    }
                                                });
                                            }}
                                            className="w-full bg-transparent text-xs font-bold outline-none"
                                            style={{ color: 'var(--text-main)' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2 border-t" style={{ borderColor: 'var(--border-main)' }}>
                            <button
                                onClick={() => setEditingRound(null)}
                                className="flex-1 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                                style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)' }}
                            >
                                {t.cancel}
                            </button>
                            <button
                                onClick={() => {
                                    const exists = rounds.some(r => r.id === editingRound.id);
                                    if (exists) {
                                        commitAndBroadcastRound(editingRound, revealedPhase);
                                    } else {
                                        setRounds(prev => [...prev, editingRound]);
                                    }
                                    setEditingRound(null);
                                }}
                                className="btn-brand flex-1 py-2.5 text-xs font-black uppercase tracking-wider shadow-md cursor-pointer"
                            >
                                {t.save_update}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isSummonerOpen && (
                <QuestionSummoner
                    lang={lang}
                    targetMode="activity_four_corners"
                    onClose={() => setIsSummonerOpen(false)}
                    onSummon={(summoned) => {
                        const newRounds = summoned.map((item, idx) => 
                            formatToCornerRound(item, rounds.length + idx + 1)
                        );
                        setRounds(prev => [...prev, ...newRounds]);
                        setIsSummonerOpen(false);
                    }}
                />
            )}
        </div>
    );
}