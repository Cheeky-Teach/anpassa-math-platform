// src/components/activities/wizards/FourCornersSetupModal.jsx
import React, { useState, useMemo } from 'react';
import { 
    X, FileText, Zap, Loader2, Search, Layers, Play
} from 'lucide-react';
import { useLibrary } from '../../../hooks/useLibrary';
import { generateDistractors } from '../../../lib/distractorGenerator';
import { extractDecodedAnswer } from '../../live/core/liveAnswerUtils';

export default function FourCornersSetupModal({
    isOpen,
    onClose,
    onLaunch,
    sourcePacket = [],
    profile = null,
    lang = 'sv'
}) {
    const userRole = String(profile?.role || '').toLowerCase();
    const isTeacher = userRole === 'teacher' || userRole === 'super_admin';

    const t = {
        sv: {
            title: "Konfigurera 4 Hörn",
            start_mode_label: "1. Välj startmetod",
            mode_library: "Välj från Bibliotek",
            mode_library_sub: "Importera uppgifter från ett sparat arbetsblad eller board",
            mode_quick: "Snabbstart (Tom Omgång)",
            mode_quick_sub: "Öppna direkt och välj/skapa frågor inne i aktiviteten",
            search_placeholder: "Sök bland dina sparade material...",
            no_sheets_found: "Inga sparade arbetsblad eller boards hittades.",
            selected_sheet: "Valt material:",
            questions_count: "uppgifter",
            strat_label: "Strategi för frågor",
            strat_exact: "Behåll exakta uppgifter",
            strat_exact_sub: "Använder talen och figurerna direkt från materialet",
            strat_reroll: "Slumpa nya från samma område",
            strat_reroll_sub: "Hämtar samma matematiska teman med nya siffror",
            rounds_label: "2. Antal Omgångar",
            custom: "Eget:",
            pcs: "st",
            time_label: "Svarstid per fråga (Standard)",
            no_timer: "Ingen timer (Läraren styr)",
            seconds: "sekunder",
            score_label: "Poängsystem",
            score_formative: "Formativt (Inga poäng)",
            score_solo: "Solo-poäng till varje elev",
            cancel: "Avbryt",
            start: "Öppna Omgång",
            preparing: "Förbereder frågor...",
            current_active_material: "Aktivt Material (Nuvarande)",
            current_resource: "Nuvarande material",
            loading_files: "Laddar dina filer..."
        },
        en: {
            title: "Configure 4 Corners",
            start_mode_label: "1. Select Starting Mode",
            mode_library: "Pick from Library",
            mode_library_sub: "Import questions from a saved worksheet or board",
            mode_quick: "Quickstart (Blank Round)",
            mode_quick_sub: "Launch directly and summon/create questions in-engine",
            search_placeholder: "Search your saved resources...",
            no_sheets_found: "No saved worksheets or boards found.",
            selected_sheet: "Selected resource:",
            questions_count: "questions",
            strat_label: "Question Strategy",
            strat_exact: "Keep Exact Questions",
            strat_exact_sub: "Uses the numbers and visuals directly from the material",
            strat_reroll: "Shuffle New from Same Topics",
            strat_reroll_sub: "Uses the same mathematical skills with fresh numbers",
            rounds_label: "2. Number of Rounds",
            custom: "Custom:",
            pcs: "rounds",
            time_label: "Time Limit (Default)",
            no_timer: "No timer (Teacher controlled)",
            seconds: "seconds",
            score_label: "Scoring System",
            score_formative: "Formative (No scores)",
            score_solo: "Solo points to each student",
            cancel: "Cancel",
            start: "Open Activity",
            preparing: "Preparing questions...",
            current_active_material: "Active Resource (Current)",
            current_resource: "Current resource",
            loading_files: "Loading your files..."
        }
    }[lang] || {};

    const hasSourcePacket = Array.isArray(sourcePacket) && sourcePacket.length > 0;
    const { savedSheets, isLoading: isLoadingLibrary } = useLibrary(profile, lang);

    const [startMode, setStartMode] = useState(hasSourcePacket ? 'library' : 'quick');
    const [selectedSheetId, setSelectedSheetId] = useState(hasSourcePacket ? 'active_source_packet' : null);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [loadedSheet, setLoadedSheet] = useState(hasSourcePacket ? {
        id: 'active_source_packet',
        title: t.current_active_material,
        questions: sourcePacket
    } : null);

    const [importStrategy, setImportStrategy] = useState('exact');
    const [questionCount, setQuestionCount] = useState(hasSourcePacket ? sourcePacket.length : 8);
    const [timerSeconds, setTimerSeconds] = useState(30);
    const [scoringMode, setScoringMode] = useState('solo');
    const [isGenerating, setIsGenerating] = useState(false);

    const eligibleSheets = useMemo(() => {
        return (savedSheets || []).filter(sheet => {
            const matchesSearch = (sheet.title || '').toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });
    }, [savedSheets, searchTerm]);

    if (!isOpen) return null;

    const handleSelectSheetItem = (sheet) => {
        const questions = sheet.type === 'board'
            ? (sheet.packet?.livePacket || [])
            : Array.isArray(sheet.packet)
                ? sheet.packet
                : (sheet.packet?.questions || []);

        setSelectedSheetId(sheet.id);
        setLoadedSheet({
            id: sheet.id,
            title: sheet.title,
            questions: questions
        });
        setQuestionCount(questions.length > 0 ? questions.length : 8);
    };

    const handleLaunch = async () => {
        setIsGenerating(true);
        try {
            let preparedQuestions = [];

            if (startMode === 'library' && loadedSheet?.questions?.length > 0) {
                const rawList = loadedSheet.questions;

                if (importStrategy === 'exact') {
                    preparedQuestions = rawList.slice(0, questionCount).map((raw, idx) => {
                        const rd = raw.renderData || raw.resolvedData?.renderData || raw.data?.renderData || raw;
                        const resolved = raw.resolvedData || raw;
                        
                        const answer = extractDecodedAnswer(resolved) || 
                                       extractDecodedAnswer(rd) || 
                                       raw.answer || 
                                       rd.answer || 
                                       '';

                        const options = (rd.options && rd.options.length >= 4)
                            ? rd.options
                            : generateDistractors({
                                correctAnswer: answer,
                                topicId: raw.topicId || resolved.topicId || '',
                                renderData: rd,
                                resolvedData: resolved,
                                raw: raw
                            });

                        return {
                            id: raw.id || crypto.randomUUID(),
                            roundIndex: idx + 1,
                            name: raw.name || `${lang === 'sv' ? 'Uppgift' : 'Question'} ${idx + 1}`,
                            topicId: raw.topicId || resolved.topicId || raw.renderData?.topicId || (raw.topic_ids?.[0]) || 'imported',
                            variationKey: raw.variationKey || resolved.variationKey || null,
                            source: 'worksheet_exact',
                            renderData: { ...rd, options, answer },
                            responseSpec: { type: 'single_choice', answer, options }
                        };
                    });
                } else {
                    const seeds = rawList.map(q => ({
                        topicId: q.topicId || q.resolvedData?.topicId || 'basic_arithmetic',
                        variationKey: q.variationKey || q.resolvedData?.variationKey || null
                    }));
                    const effectiveSeeds = seeds.length > 0 ? seeds : [{ topicId: 'basic_arithmetic' }];

                    const promises = Array.from({ length: questionCount }).map(async (_, idx) => {
                        const seed = effectiveSeeds[idx % effectiveSeeds.length];
                        const url = `/api/question?topic=${seed.topicId}${seed.variationKey ? `&variation=${seed.variationKey}` : ''}&lang=${lang}`;
                        try {
                            const res = await fetch(url);
                            const data = await res.json();
                            const rd = data.renderData || {};
                            const answer = data.answer || rd.answer || '';
                            const options = generateDistractors({ correctAnswer: answer, topicId: seed.topicId, renderData: rd });
                            return {
                                id: crypto.randomUUID(),
                                roundIndex: idx + 1,
                                name: `${lang === 'sv' ? 'Runda' : 'Round'} ${idx + 1}`,
                                topicId: seed.topicId,
                                variationKey: seed.variationKey,
                                source: 'generator_reroll',
                                renderData: { ...rd, options, answer },
                                responseSpec: { type: 'single_choice', answer, options }
                            };
                        } catch {
                            return null;
                        }
                    });
                    const res = await Promise.all(promises);
                    preparedQuestions = res.filter(Boolean);
                }
            }

            onLaunch({
                initialQuestions: preparedQuestions,
                settings: {
                    deliveryMode: 'physical',
                    timerSeconds,
                    scoringMode,
                    questionCount
                }
            });
            onClose();
        } catch (err) {
            console.error("[FourCornersSetupModal] Error launching:", err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[550] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in select-none">
            <div 
                className="w-full max-w-xl rounded-[2.5rem] shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] transition-colors"
                style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-main)',
                    color: 'var(--text-main)'
                }}
            >
                {/* Header */}
                <header 
                    className="px-6 py-4 border-b flex items-center justify-between shrink-0"
                    style={{
                        backgroundColor: 'var(--bg-surface)',
                        borderColor: 'var(--border-main)'
                    }}
                >
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                            4H
                        </div>
                        <h2 className="text-base font-black tracking-tight text-inherit">{t.title}</h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-xl transition-colors cursor-pointer hover:bg-rose-500 hover:text-white"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        <X size={20} />
                    </button>
                </header>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                    
                    {/* 1. START METHOD */}
                    <div>
                        <label className="text-[11px] font-black uppercase tracking-wider block mb-2.5" style={{ color: 'var(--text-muted)' }}>
                            {t.start_mode_label}
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setStartMode('library')}
                                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                                    startMode === 'library'
                                        ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                                        : 'hover:border-indigo-400'
                                }`}
                                style={{
                                    backgroundColor: startMode === 'library' ? 'var(--bg-surface)' : 'var(--bg-card)',
                                    borderColor: startMode === 'library' ? 'var(--brand-solid)' : 'var(--border-main)'
                                }}
                            >
                                <FileText size={22} className={startMode === 'library' ? 'text-indigo-500' : 'opacity-40'} />
                                <div className="mt-4">
                                    <div className="text-xs font-black text-inherit">{t.mode_library}</div>
                                    <div className="text-[10px] leading-tight mt-0.5" style={{ color: 'var(--text-muted)' }}>{t.mode_library_sub}</div>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setStartMode('quick');
                                    setLoadedSheet(null);
                                    setSelectedSheetId(null);
                                }}
                                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                                    startMode === 'quick'
                                        ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                                        : 'hover:border-indigo-400'
                                }`}
                                style={{
                                    backgroundColor: startMode === 'quick' ? 'var(--bg-surface)' : 'var(--bg-card)',
                                    borderColor: startMode === 'quick' ? 'var(--brand-solid)' : 'var(--border-main)'
                                }}
                            >
                                <Zap size={22} className={startMode === 'quick' ? 'text-indigo-500' : 'opacity-40'} />
                                <div className="mt-4">
                                    <div className="text-xs font-black text-inherit">{t.mode_quick}</div>
                                    <div className="text-[10px] leading-tight mt-0.5" style={{ color: 'var(--text-muted)' }}>{t.mode_quick_sub}</div>
                                </div>
                            </button>
                        </div>

                        {/* Inline Library Selector */}
                        {startMode === 'library' && (
                            <div 
                                className="mt-3 p-4 border rounded-2xl space-y-3 animate-in fade-in"
                                style={{
                                    backgroundColor: 'var(--bg-surface)',
                                    borderColor: 'var(--border-main)'
                                }}
                            >
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 opacity-40" size={14} />
                                    <input
                                        type="text"
                                        placeholder={t.search_placeholder}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                                        style={{
                                            backgroundColor: 'var(--bg-card)',
                                            borderColor: 'var(--border-main)',
                                            color: 'var(--text-main)'
                                        }}
                                    />
                                </div>

                                <div className="max-h-44 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                                    {hasSourcePacket && (
                                        <div 
                                            onClick={() => {
                                                setSelectedSheetId('active_source_packet');
                                                setLoadedSheet({
                                                    id: 'active_source_packet',
                                                    title: t.current_active_material,
                                                    questions: sourcePacket
                                                });
                                                setQuestionCount(sourcePacket.length);
                                            }}
                                            className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                                                selectedSheetId === 'active_source_packet'
                                                    ? 'bg-indigo-600 text-white font-bold border-indigo-600 shadow-sm'
                                                    : 'hover:border-indigo-400'
                                            }`}
                                            style={selectedSheetId !== 'active_source_packet' ? {
                                                backgroundColor: 'var(--bg-card)',
                                                borderColor: 'var(--border-main)',
                                                color: 'var(--text-main)'
                                            } : {}}
                                        >
                                            <div className="flex items-center gap-2 truncate">
                                                <Layers size={14} className={selectedSheetId === 'active_source_packet' ? 'text-white' : 'text-indigo-500'} />
                                                <span className="truncate">{t.current_resource}</span>
                                            </div>
                                            <span className="text-[10px] opacity-80 shrink-0 font-mono">({sourcePacket.length} {t.questions_count})</span>
                                        </div>
                                    )}

                                    {isLoadingLibrary ? (
                                        <div className="py-6 text-center text-xs flex items-center justify-center gap-2" style={{ color: 'var(--text-muted)' }}>
                                            <Loader2 size={15} className="animate-spin text-indigo-500" />
                                            <span>{t.loading_files}</span>
                                        </div>
                                    ) : eligibleSheets.length > 0 ? (
                                        eligibleSheets.map(sheet => {
                                            const isSelected = selectedSheetId === sheet.id;
                                            return (
                                                <div
                                                    key={sheet.id}
                                                    onClick={() => handleSelectSheetItem(sheet)}
                                                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                                                        isSelected
                                                            ? 'bg-indigo-600 text-white font-bold border-indigo-600 shadow-sm'
                                                            : 'hover:border-indigo-400'
                                                    }`}
                                                    style={!isSelected ? {
                                                        backgroundColor: 'var(--bg-card)',
                                                        borderColor: 'var(--border-main)',
                                                        color: 'var(--text-main)'
                                                    } : {}}
                                                >
                                                    <div className="flex items-center gap-2 truncate pr-2">
                                                        <FileText size={14} className={isSelected ? 'text-white' : 'opacity-40'} />
                                                        <span className="truncate">{sheet.title}</span>
                                                    </div>
                                                    <span className={`text-[10px] shrink-0 font-mono ${isSelected ? 'text-white/80' : 'opacity-40'}`}>
                                                        {new Date(sheet.updated_at).toLocaleDateString(lang === 'sv' ? 'sv-SE' : 'en-US')}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="py-4 text-center text-xs italic" style={{ color: 'var(--text-muted)' }}>
                                            {t.no_sheets_found}
                                        </div>
                                    )}
                                </div>

                                {loadedSheet && (
                                    <div className="pt-3 border-t" style={{ borderColor: 'var(--border-main)' }}>
                                        <span className="text-[10px] font-black uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>
                                            {t.strat_label}
                                        </span>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setImportStrategy('exact')}
                                                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                                    importStrategy === 'exact'
                                                        ? 'border-indigo-600 text-indigo-500 font-bold shadow-xs'
                                                        : 'hover:border-indigo-400'
                                                }`}
                                                style={{
                                                    backgroundColor: 'var(--bg-card)',
                                                    borderColor: importStrategy === 'exact' ? 'var(--brand-solid)' : 'var(--border-main)',
                                                    color: importStrategy === 'exact' ? 'var(--brand-solid)' : 'var(--text-muted)'
                                                }}
                                            >
                                                <div className="text-xs font-black">{t.strat_exact}</div>
                                                <div className="text-[10px] opacity-70 leading-tight mt-0.5">{t.strat_exact_sub}</div>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setImportStrategy('reroll_domain')}
                                                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                                    importStrategy === 'reroll_domain'
                                                        ? 'border-indigo-600 text-indigo-500 font-bold shadow-xs'
                                                        : 'hover:border-indigo-400'
                                                }`}
                                                style={{
                                                    backgroundColor: 'var(--bg-card)',
                                                    borderColor: importStrategy === 'reroll_domain' ? 'var(--brand-solid)' : 'var(--border-main)',
                                                    color: importStrategy === 'reroll_domain' ? 'var(--brand-solid)' : 'var(--text-muted)'
                                                }}
                                            >
                                                <div className="text-xs font-black">{t.strat_reroll}</div>
                                                <div className="text-[10px] opacity-70 leading-tight mt-0.5">{t.strat_reroll_sub}</div>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 2. ROUND COUNT */}
                    <div>
                        <label className="text-[11px] font-black uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>
                            {t.rounds_label}
                        </label>
                        <div className="flex items-center gap-2">
                            {[5, 8, 10, 12].map(num => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => setQuestionCount(num)}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                                        questionCount === num
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                            : 'hover:border-indigo-400'
                                    }`}
                                    style={questionCount !== num ? {
                                        backgroundColor: 'var(--bg-surface)',
                                        borderColor: 'var(--border-main)',
                                        color: 'var(--text-main)'
                                    } : {}}
                                >
                                    {num}
                                </button>
                            ))}
                            <div className="flex items-center gap-1.5 ml-2">
                                <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{t.custom}</span>
                                <input
                                    type="number"
                                    min={1}
                                    max={25}
                                    value={questionCount}
                                    onChange={(e) => setQuestionCount(Math.max(1, Math.min(25, parseInt(e.target.value, 10) || 1)))}
                                    className="w-16 p-2 border rounded-xl text-xs font-black text-center outline-none focus:ring-2 focus:ring-indigo-500"
                                    style={{
                                        backgroundColor: 'var(--bg-surface)',
                                        borderColor: 'var(--border-main)',
                                        color: 'var(--text-main)'
                                    }}
                                />
                                <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{t.pcs}</span>
                            </div>
                        </div>
                    </div>

                    {/* 3. DEFAULT TIMER & SCORING */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-muted)' }}>
                                {t.time_label}
                            </label>
                            <select
                                value={timerSeconds}
                                onChange={(e) => setTimerSeconds(parseInt(e.target.value, 10))}
                                className="w-full p-2.5 border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                style={{
                                    backgroundColor: 'var(--bg-surface)',
                                    borderColor: 'var(--border-main)',
                                    color: 'var(--text-main)'
                                }}
                            >
                                <option value={0} style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>{t.no_timer}</option>
                                <option value={15} style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>15 {t.seconds}</option>
                                <option value={30} style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>30 {t.seconds}</option>
                                <option value={45} style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>45 {t.seconds}</option>
                                <option value={60} style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>60 {t.seconds}</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-muted)' }}>
                                {t.score_label}
                            </label>
                            <select
                                value={scoringMode}
                                onChange={(e) => setScoringMode(e.target.value)}
                                className="w-full p-2.5 border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                style={{
                                    backgroundColor: 'var(--bg-surface)',
                                    borderColor: 'var(--border-main)',
                                    color: 'var(--text-main)'
                                }}
                            >
                                <option value="solo" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>{t.score_solo}</option>
                                <option value="formative" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>{t.score_formative}</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer 
                    className="p-4 px-6 border-t flex items-center justify-between shrink-0"
                    style={{
                        backgroundColor: 'var(--bg-surface)',
                        borderColor: 'var(--border-main)'
                    }}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold transition-colors cursor-pointer"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        {t.cancel}
                    </button>

                    <button
                        type="button"
                        disabled={isGenerating || (startMode === 'library' && !loadedSheet)}
                        onClick={() => handleLaunch()}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                    >
                        {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                        <span>{t.start}</span>
                    </button>
                </footer>
            </div>
        </div>
    );
}