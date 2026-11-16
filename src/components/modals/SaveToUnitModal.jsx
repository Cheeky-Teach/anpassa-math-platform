import React, { useState, useEffect } from 'react';
import { 
    X, Check, Layers, Loader2, Bookmark, 
    BookOpen, Target, Beaker, ChevronDown, ChevronUp, ArrowDown
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { CATEGORIES, LEVEL_DESCRIPTIONS } from '../../constants/localization';
import { CONTENT_MAP } from '../../constants/content_map.generated';
import MathDisplay from '../shared/MathDisplay';

// Helper to look up localized topic names
const getTopicName = (topicId, lang = 'sv') => {
    if (!topicId) return "";
    for (const catKey in CATEGORIES) {
        const found = CATEGORIES[catKey]?.topics?.find(t => t.id === topicId);
        if (found) return found.label[lang] || found.label.sv || topicId;
    }
    return topicId.replace(/_/g, ' ');
};

// Helper to look up level description & math preview
const getLevelMetadata = (topicId, level, lang = 'sv') => {
    if (!topicId || level === undefined || level === null) {
        return { description: '', mathExample: '' };
    }
    const descriptionsObj = typeof LEVEL_DESCRIPTIONS !== 'undefined' ? LEVEL_DESCRIPTIONS : {};
    const topicDesc = descriptionsObj[topicId]?.[level];
    const description = typeof topicDesc === 'object' 
        ? (topicDesc[lang] || topicDesc.sv || '') 
        : (topicDesc || '');

    let mathExample = '';
    if (typeof CONTENT_MAP !== 'undefined' && Array.isArray(CONTENT_MAP)) {
        for (const cat of CONTENT_MAP) {
            const foundTopic = cat.topics?.find(t => t.id === topicId);
            if (foundTopic) {
                const foundLevel = foundTopic.levels?.find(l => l.lvl === level);
                if (foundLevel?.ex) {
                    mathExample = foundLevel.ex;
                    break;
                }
            }
        }
    }
    return { description, mathExample };
};

const getPartDisplayTitle = (part, partIndex, lang = 'sv') => {
    if (part.customTitle && part.customTitle.trim()) {
        return part.customTitle;
    }
    const prefix = lang === 'sv' ? 'Del' : 'Part';
    const topicLabel = getTopicName(part.topicId, lang);
    if (topicLabel) {
        return `${prefix} ${partIndex + 1}: ${topicLabel}`;
    }
    return `${prefix} ${partIndex + 1}`;
};

export default function SaveToUnitModal({
    isOpen,
    onClose,
    onConfirmSave,
    testTitle,
    teacherId,
    lang = 'sv'
}) {
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUnitId, setSelectedUnitId] = useState('');
    const [selectedPartId, setSelectedPartId] = useState('');
    const [targetIndex, setTargetIndex] = useState(null);
    const [customTitle, setCustomTitle] = useState(testTitle || '');
    const [isSaving, setIsSaving] = useState(false);
    const [expandedParts, setExpandedParts] = useState({});

    useEffect(() => {
        if (!isOpen || !teacherId) return;

        const fetchUnits = async () => {
            setLoading(true);
            try {
                const now = new Date().toISOString();
                const { data, error } = await supabase
                    .from('teacher_buckets')
                    .select('id, name, folder, color, payload, expires_at')
                    .eq('teacher_id', teacherId)
                    .gt('expires_at', now)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                const activeUnits = data || [];
                setUnits(activeUnits);

                if (activeUnits.length > 0) {
                    const firstUnit = activeUnits[0];
                    setSelectedUnitId(firstUnit.id);
                    const parts = firstUnit.payload || [];
                    if (parts.length > 0) {
                        const firstPart = parts[0];
                        setSelectedPartId(firstPart.id);
                        setTargetIndex((firstPart.steps || []).length);
                        setExpandedParts({ [firstPart.id]: true });
                    }
                }
            } catch (err) {
                console.error("Error fetching units:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUnits();
    }, [isOpen, teacherId]);

    const activeUnit = units.find(u => u.id === selectedUnitId);
    const activeParts = Array.isArray(activeUnit?.payload) ? activeUnit.payload : [];

    useEffect(() => {
        if (activeParts.length > 0) {
            const firstPart = activeParts[0];
            setSelectedPartId(firstPart.id);
            setTargetIndex((firstPart.steps || []).length);
            setExpandedParts({ [firstPart.id]: true });
        } else {
            setSelectedPartId('');
            setTargetIndex(null);
        }
    }, [selectedUnitId]);

    const selectPartAndPosition = (partId, defaultPos = null) => {
        setSelectedPartId(partId);
        const part = activeParts.find(p => p.id === partId);
        const stepCount = (part?.steps || []).length;
        setTargetIndex(defaultPos !== null ? defaultPos : stepCount);
        setExpandedParts(prev => ({ ...prev, [partId]: true }));
    };

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!selectedUnitId || !selectedPartId) {
            alert(lang === 'sv' ? "Välj både enhet och del." : "Please select both a unit and a part.");
            return;
        }

        setIsSaving(true);
        try {
            await onConfirmSave({
                unitId: selectedUnitId,
                partId: selectedPartId,
                insertIndex: targetIndex,
                title: customTitle.trim() || testTitle
            });
            onClose();
        } catch (err) {
            console.error("Failed to save to unit:", err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150 select-none font-sans">
            <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-[var(--text-main)]">
                
                {/* 1. Modal Header */}
                <div className="px-6 py-4 border-b border-[var(--border-main)] flex justify-between items-center bg-[var(--bg-surface)] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-2xs shrink-0">
                            <Bookmark size={20} />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block leading-tight">
                                {lang === 'sv' ? "Precisionsplacering i planering" : "Precision Placement in Roadmap"}
                            </span>
                            <h3 className="text-base font-extrabold text-[var(--text-main)] truncate mt-0.5">
                                {lang === 'sv' ? "Spara delprov till enhet / modul" : "Save checkpoint to module"}
                            </h3>
                        </div>
                    </div>
                    <button 
                        type="button"
                        onClick={onClose} 
                        className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-xl hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* 2. Modal Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5 bg-[var(--bg-card)]">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-3">
                            <Loader2 size={32} className="animate-spin text-emerald-600" />
                            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                                {lang === 'sv' ? "Laddar dina enheter..." : "Loading your units..."}
                            </span>
                        </div>
                    ) : units.length === 0 ? (
                        <div className="py-16 text-center border border-dashed border-[var(--border-strong)] rounded-2xl p-8 bg-[var(--bg-surface)]">
                            <Layers size={36} className="mx-auto text-[var(--text-muted)] opacity-50 mb-3" />
                            <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--text-main)] mb-1">
                                {lang === 'sv' ? "Inga aktiva enheter hittades" : "No active units found"}
                            </h4>
                            <p className="text-xs text-[var(--text-muted)] font-medium max-w-sm mx-auto leading-relaxed">
                                {lang === 'sv' 
                                    ? "Gå till 'Grupper' i dashboarden för att skapa en enhet innan du kan lägga till delprov." 
                                    : "Create a unit in the Groups tab on the dashboard before adding checkpoints."}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Checkpoint Title Input */}
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1.5">
                                    {lang === 'sv' ? "Delprovets Titel" : "Checkpoint Title"}
                                </label>
                                <input 
                                    type="text"
                                    value={customTitle}
                                    onChange={(e) => setCustomTitle(e.target.value)}
                                    placeholder={testTitle}
                                    className="w-full bg-[var(--bg-card)] border border-[var(--border-strong)] focus:border-emerald-600 rounded-xl px-3.5 py-2 text-xs font-semibold text-[var(--text-main)] outline-none transition-colors shadow-inner"
                                />
                            </div>

                            {/* Unit Picker Grid */}
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1.5">
                                    {lang === 'sv' ? "1. Välj Grupp / Enhet" : "1. Select Group / Unit"}
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {units.map(u => {
                                        const isSelected = u.id === selectedUnitId;
                                        const partsCount = (u.payload || []).length;

                                        return (
                                            <div
                                                key={u.id}
                                                onClick={() => setSelectedUnitId(u.id)}
                                                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                                    isSelected 
                                                        ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-600 shadow-2xs' 
                                                        : 'bg-[var(--bg-surface)] border-[var(--border-main)] hover:border-[var(--border-strong)]'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                                        isSelected ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-main)]'
                                                    }`}>
                                                        <Layers size={15} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        {u.folder && u.folder !== 'Okategoriserad' && (
                                                            <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] block truncate">
                                                                {u.folder}
                                                            </span>
                                                        )}
                                                        <h4 className="text-xs font-bold text-[var(--text-main)] truncate">
                                                            {u.name}
                                                        </h4>
                                                        <span className="text-[10px] font-semibold font-mono text-emerald-700 dark:text-emerald-400 block">
                                                            {partsCount} {lang === 'sv' ? "delar" : "parts"}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                                                    isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-[var(--border-strong)] bg-[var(--bg-card)]'
                                                }`}>
                                                    {isSelected && <Check size={10} strokeWidth={3} />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 2. Parts Roadmap & Step Slots with Math Previews */}
                            <div className="space-y-2.5 pt-2 border-t border-[var(--border-main)]">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                                        <Bookmark size={14} className="text-amber-600 dark:text-amber-400" />
                                        {lang === 'sv' ? "2. Välj Del & Exakt Placering i Stegföljden" : "2. Select Part & Exact Position in Sequence"}
                                    </span>
                                </div>

                                {activeParts.length === 0 ? (
                                    <div className="p-5 text-center border border-dashed border-[var(--border-strong)] rounded-xl text-xs text-[var(--text-muted)] font-medium">
                                        {lang === 'sv' 
                                            ? "Den valda enheten har inga delar ännu." 
                                            : "This unit has no parts yet."}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {activeParts.map((part, pIdx) => {
                                            const isPartSelected = part.id === selectedPartId;
                                            const isExpanded = !!expandedParts[part.id] || isPartSelected;
                                            const steps = part.steps || [];

                                            return (
                                                <div 
                                                    key={part.id || pIdx}
                                                    className={`rounded-xl border transition-all overflow-hidden ${
                                                        isPartSelected 
                                                            ? 'border-amber-500 bg-amber-50/30 dark:bg-amber-950/20 shadow-2xs' 
                                                            : 'bg-[var(--bg-surface)] border-[var(--border-main)] hover:border-[var(--border-strong)]'
                                                    }`}
                                                >
                                                    {/* Part Strip */}
                                                    <div 
                                                        onClick={() => selectPartAndPosition(part.id)}
                                                        className="p-3 flex items-center justify-between gap-3 cursor-pointer bg-[var(--bg-card)] border-b border-[var(--border-subtle)]"
                                                    >
                                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold font-mono text-xs shrink-0 ${
                                                                isPartSelected 
                                                                    ? 'bg-amber-600 text-white shadow-2xs' 
                                                                    : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-strong)]'
                                                            }`}>
                                                                {pIdx + 1}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <h5 className="font-bold text-xs uppercase tracking-wide text-[var(--text-main)] truncate">
                                                                    {getPartDisplayTitle(part, pIdx, lang)}
                                                                </h5>
                                                                <span className="text-[10px] font-semibold font-mono text-[var(--text-muted)]">
                                                                    {steps.length} {lang === 'sv' ? "steg i denna del" : "steps in this part"}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setExpandedParts(prev => ({ ...prev, [part.id]: !prev[part.id] }));
                                                                }}
                                                                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
                                                            >
                                                                {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                                                            </button>

                                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                                                isPartSelected ? 'border-amber-600 bg-amber-600 text-white' : 'border-[var(--border-strong)] bg-[var(--bg-card)]'
                                                            }`}>
                                                                {isPartSelected && <Check size={10} strokeWidth={3} />}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Interactive Stepper & Insertion Slots with Math Previews */}
                                                    {isExpanded && (
                                                        <div className="p-3 space-y-2 bg-[var(--bg-surface)]">
                                                            
                                                            {/* SLOT 0: At beginning (Diagnostic) */}
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedPartId(part.id);
                                                                    setTargetIndex(0);
                                                                }}
                                                                className={`w-full py-2 px-3 rounded-xl border border-dashed transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer ${
                                                                    isPartSelected && targetIndex === 0
                                                                        ? 'bg-amber-600 border-amber-600 text-white shadow-2xs'
                                                                        : 'border-[var(--border-strong)] text-[var(--text-muted)] hover:border-amber-500 hover:text-amber-700 bg-[var(--bg-card)]'
                                                                }`}
                                                            >
                                                                <ArrowDown size={13} />
                                                                <span>{lang === 'sv' ? "Placera här som Förtest / Diagnos (Först i delen)" : "Place as Pre-test (First in Part)"}</span>
                                                            </button>

                                                            {/* STEPS LIST */}
                                                            {steps.map((st, sIdx) => {
                                                                const isInst = st.type === 'instruction' || !!st.sheetId;
                                                                const isChk = st.type === 'test';
                                                                const { description, mathExample } = (!isInst && !isChk)
                                                                    ? getLevelMetadata(st.topic || st.topicId, st.level, lang)
                                                                    : { description: '', mathExample: '' };

                                                                const isSlotAfterSelected = isPartSelected && targetIndex === sIdx + 1;

                                                                return (
                                                                    <React.Fragment key={st.id || sIdx}>
                                                                        {/* Existing Step Card with Math Example */}
                                                                        <div className="p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] flex items-center justify-between gap-3 shadow-2xs">
                                                                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                                                <span className="w-5 h-5 rounded-md bg-[var(--bg-surface)] text-[var(--text-muted)] font-mono text-[10px] font-bold flex items-center justify-center shrink-0 border border-[var(--border-subtle)]">
                                                                                    {sIdx + 1}
                                                                                </span>

                                                                                {isInst ? (
                                                                                    <div className="flex items-center gap-2 truncate">
                                                                                        <span className="bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 text-[9px] font-bold uppercase px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800 shrink-0">
                                                                                            {lang === 'sv' ? "Genomgång" : "Walkthrough"}
                                                                                        </span>
                                                                                        <BookOpen size={13} className="text-sky-600 shrink-0" />
                                                                                        <span className="text-xs font-semibold text-[var(--text-main)] truncate">
                                                                                            {st.sheetTitle}
                                                                                        </span>
                                                                                    </div>
                                                                                ) : isChk ? (
                                                                                    <div className="flex items-center gap-2 truncate">
                                                                                        <span className="bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[9px] font-bold uppercase px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800 shrink-0">
                                                                                            {st.testMode === 'exam' ? "Prov" : "Delprov"}
                                                                                        </span>
                                                                                        <Beaker size={13} className="text-amber-600 shrink-0" />
                                                                                        <span className="text-xs font-semibold text-[var(--text-main)] truncate">
                                                                                            {st.title}
                                                                                        </span>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="flex flex-col min-w-0 flex-1">
                                                                                        <div className="flex items-center gap-2">
                                                                                            <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold uppercase px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 shrink-0">
                                                                                                {lang === 'sv' ? `Nivå ${st.level}` : `Level ${st.level}`}
                                                                                            </span>
                                                                                            <span className="text-xs font-bold text-[var(--text-main)] truncate">
                                                                                                {getTopicName(st.topic || st.topicId, lang)}
                                                                                            </span>
                                                                                            {description && (
                                                                                                <span className="text-[11px] font-medium text-[var(--text-muted)] truncate hidden sm:inline">
                                                                                                    • {description}
                                                                                                </span>
                                                                                            )}
                                                                                        </div>

                                                                                        {/* Math Example from Content Map */}
                                                                                        {mathExample && (
                                                                                            <div className="mt-0.5 text-xs text-amber-700 dark:text-amber-300 font-serif italic truncate flex items-center gap-1.5 opacity-90">
                                                                                                <span className="text-[8px] font-sans font-bold uppercase tracking-wider text-[var(--text-muted)] not-italic">
                                                                                                    Ex:
                                                                                                </span>
                                                                                                <MathDisplay content={mathExample} />
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        {/* INTERMEDIATE OR FINAL INSERTION SLOT */}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setSelectedPartId(part.id);
                                                                                setTargetIndex(sIdx + 1);
                                                                            }}
                                                                            className={`w-full py-2 px-3 rounded-xl border border-dashed transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer ${
                                                                                isSlotAfterSelected
                                                                                    ? 'bg-amber-600 border-amber-600 text-white shadow-2xs'
                                                                                    : 'border-[var(--border-strong)] text-[var(--text-muted)] hover:border-amber-500 hover:text-amber-700 bg-[var(--bg-card)]'
                                                                            }`}
                                                                        >
                                                                            <ArrowDown size={13} />
                                                                            <span>
                                                                                {sIdx === steps.length - 1
                                                                                    ? (lang === 'sv' ? "Placera här som Slutprov i delen (Sist)" : "Place as Final Checkpoint (At End)")
                                                                                    : (lang === 'sv' ? `Placera mellan steg ${sIdx + 1} och ${sIdx + 2}` : `Place between step ${sIdx + 1} and ${sIdx + 2}`)}
                                                                            </span>
                                                                        </button>
                                                                    </React.Fragment>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* 3. Modal Footer */}
                <div className="px-6 py-3.5 border-t border-[var(--border-main)] flex justify-end gap-2.5 bg-[var(--bg-surface)] shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-card)] text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
                    >
                        {lang === 'sv' ? "Avbryt" : "Cancel"}
                    </button>
                    <button
                        type="button"
                        disabled={isSaving || units.length === 0 || !selectedPartId || targetIndex === null}
                        onClick={handleSave}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wider shadow-2xs transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1.5"
                    >
                        {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} strokeWidth={3} />}
                        <span>{lang === 'sv' ? "Infoga på vald plats" : "Insert at Position"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}