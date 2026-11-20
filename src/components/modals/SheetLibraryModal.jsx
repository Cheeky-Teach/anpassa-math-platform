// src/components/modals/SheetLibraryModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Filter, Plus, Trash2, Layers, Building2, Globe, FileText, 
    Monitor, Grid3X3, Copy, X, Edit2, FolderInput, ChevronDown, 
    ChevronRight, Loader2, Eye, HelpCircle, Gamepad2
} from 'lucide-react';
import { useLibrary } from '../../hooks/useLibrary';
import { SKILL_BUCKETS } from '../../constants/skillBuckets';
import VisualRenderer from '../visuals/VisualRenderer';
import MathDisplay from '../shared/MathDisplay';
import SpotlightTour from '../shared/SpotlightTour';

export default function SheetLibraryModal({
    isOpen = true,
    onClose,
    onSelectSheet,
    onCreateNew = null,
    onCreateActivity = null,
    showCreationActions = true,
    profile = null,
    lang = 'sv',
    filterType = 'all'
}) {
    const {
        savedSheets,
        folders,
        isLoading,
        libraryTab,
        setLibraryTab,
        isTrashView,
        setIsTrashView,
        createFolder,
        renameFolder,
        deleteFolder,
        moveSheet,
        softDeleteSheet,
        restoreSheet,
        hardDeleteSheet,
        duplicateSheet,
        cloneSheet
    } = useLibrary(profile, lang);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterTopic, setFilterTopic] = useState('all');
    const [filterDocType, setFilterDocType] = useState(filterType);
    const [expandedFolders, setExpandedFolders] = useState([]);
    
    // Modal sub-states
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [editingFolder, setEditingFolder] = useState(null);
    const [editingFolderName, setEditingFolderName] = useState('');
    const [showMoveModal, setShowMoveModal] = useState(null);
    const [peekSheet, setPeekSheet] = useState(null);

    // Interactive Spotlight Tour State (separate storage key from QuestionStudio)
    const [showTutorial, setShowTutorial] = useState(false);

    useEffect(() => {
        if (isOpen && !localStorage.getItem('has_seen_library_guide')) {
            const timer = setTimeout(() => setShowTutorial(true), 350);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleCloseTutorial = () => {
        localStorage.setItem('has_seen_library_guide', 'true');
        setShowTutorial(false);
    };

    const libraryTourSteps = useMemo(() => {
        const steps = [];

        if (showCreationActions && onCreateNew) {
            steps.push({
                selector: '[data-tour="library-create"]',
                title: {
                    sv: '1. Skapa nytt material',
                    en: '1. Create New Material'
                },
                description: {
                    sv: 'Starta från grunden med ett utskrivbart Arbetsblad, ett Do Now Grid för projektorn, en Presentation eller ett klassrumsspel.',
                    en: 'Start from scratch with a printable Worksheet, a projector Do Now Grid, a Presentation board, or a classroom Game.'
                }
            });
        }

        steps.push(
            {
                selector: '[data-tour="library-locations"]',
                title: {
                    sv: '2. Bläddra bland dina sparade filer & delade bibliotek',
                    en: '2. Browse Saved Files & Shared Libraries'
                },
                description: {
                    sv: 'Växla mellan "Mina sparade", material som kollegor på "Min Skola" delat, det "Globala" biblioteket eller "Papperskorgen".',
                    en: 'Switch between "My Saved", resources shared by colleagues in "My School", the "Global" library, or "Trash".'
                }
            },
            {
                selector: '[data-tour="library-filters"]',
                title: {
                    sv: '3. Filtrera på typ, ämne eller titel',
                    en: '3. Filter by Format, Topic, or Title'
                },
                description: {
                    sv: 'Filtrera snabbt fram enbart Presentationer, Arbetsblad, Grids eller Spel — och begränsa på kursplanens ämnesområden.',
                    en: 'Quickly filter by Presentations, Worksheets, Grids, or Games — and narrow down by curriculum topic.'
                }
            },
            {
                selector: '[data-tour="library-table"]',
                title: {
                    sv: '4. Öppna, förhandsgranska eller organisera',
                    en: '4. Open, Peek, or Organize'
                },
                description: {
                    sv: 'Klicka på valfri rad för att öppna materialet, använd ögat för att tjuvkika på innehållet, eller sortera dina filer i egna mappar.',
                    en: 'Click any row to open the resource, click the eye icon to peek inside, or organize your files into folders.'
                }
            }
        );

        return steps;
    }, [showCreationActions, onCreateNew]);

    if (!isOpen) return null;

    const toggleFolder = (folderId) => {
        setExpandedFolders(prev => prev.includes(folderId) ? prev.filter(id => id !== folderId) : [...prev, folderId]);
    };

    const handleMoveToFolder = async (folderId) => {
        if (!showMoveModal) return;
        await moveSheet(showMoveModal.id, folderId);
        setShowMoveModal(null);
    };

    const handleDuplicate = async (e, sheet) => {
        e?.stopPropagation();
        try {
            await duplicateSheet(sheet);
        } catch (err) {
            console.error("Duplicate error:", err);
            alert((lang === 'sv' ? "Kunde inte duplicera: " : "Failed to duplicate: ") + err.message);
        }
    };

    const getTopicLabel = (topicId) => {
        if (!topicId || topicId === 'all') return lang === 'sv' ? "Alla ämnen" : "All topics";
        for (const catKey in SKILL_BUCKETS) {
            const category = SKILL_BUCKETS[catKey];
            if (category.topics && category.topics[topicId]) {
                return category.topics[topicId].name[lang] || category.topics[topicId].name.sv || topicId;
            }
        }
        return topicId.charAt(0).toUpperCase() + topicId.slice(1).replace('_', ' ');
    };

    const allCurriculumTopicIds = Object.values(SKILL_BUCKETS).flatMap(cat => Object.keys(cat.topics || {}));
    const availableTopics = [...new Set([
        ...allCurriculumTopicIds,
        ...savedSheets.flatMap(s => s.auto_topics || [])
    ])].sort((a, b) => getTopicLabel(a).localeCompare(getTopicLabel(b), lang, { sensitivity: 'base' }));

    const filteredLibrary = savedSheets.filter(sheet => {
        const matchesSearch = (sheet.title || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTopic = filterTopic === 'all' || sheet.auto_topics?.includes(filterTopic);
        
        const rawType = (sheet.type || '').toLowerCase();
        const matchesType = filterDocType === 'all' 
            ? true
            : filterDocType === 'activity'
                ? rawType.startsWith('activity')
                : rawType.replace('_', '') === filterDocType.replace('_', '');

        return matchesSearch && matchesTopic && matchesType;
    });

    const getSheetIconStyle = (type = '', size = 15) => {
        const cleanType = String(type).toLowerCase();
        if (cleanType.startsWith('activity')) {
            return { 
                bg: 'bg-[var(--bg-surface)] border border-[var(--border-strong)] text-teal-900 dark:text-teal-400', 
                icon: <Gamepad2 size={size} /> 
            };
        }
        if (cleanType === 'board') {
            return { 
                bg: 'bg-[var(--bg-surface)] border border-[var(--border-strong)] text-amber-900 dark:text-amber-400', 
                icon: <Monitor size={size} /> 
            };
        }
        if (cleanType === 'donow') {
            return { 
                bg: 'bg-[var(--bg-surface)] border border-[var(--border-strong)] text-sky-900 dark:text-sky-400', 
                icon: <Grid3X3 size={size} /> 
            };
        }
        if (cleanType === 'poster_notes') {
            return { 
                bg: 'bg-[var(--bg-surface)] border border-[var(--border-strong)] text-purple-700 dark:text-purple-400', 
                icon: <FileText size={size} /> 
            };
        }
        return { 
            bg: 'bg-[var(--bg-surface)] border border-[var(--border-strong)] text-emerald-600 dark:text-emerald-400', 
            icon: <FileText size={size} /> 
        };
    };

    const renderFileRow = (sheet, isInsideFolder = false) => {
        const style = getSheetIconStyle(sheet.type);
        const isActivity = sheet.type?.startsWith('activity');

        return (
            <tr 
                key={sheet.id} 
                onClick={() => onSelectSheet(sheet)}
                className={`transition-colors group cursor-pointer ${
                    isInsideFolder 
                        ? 'bg-[var(--bg-surface)]/40 hover:bg-[var(--bg-surface)]' 
                        : 'hover:bg-[var(--bg-surface)]/70'
                }`}
            >
                <td className="py-2.5 text-center">
                    <span className={`inline-flex p-1.5 rounded-xl border ${style.bg}`}>
                        {style.icon}
                    </span>
                </td>

                <td className={`py-2.5 font-bold text-[var(--text-main)] text-xs sm:text-sm max-w-0 ${
                    isInsideFolder ? 'pl-3 border-l-2 border-emerald-500' : ''
                }`}>
                    <div className="truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors" title={sheet.title}>
                        {sheet.title}
                    </div>
                </td>

                <td className="py-2.5">
                    {isActivity ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[var(--bg-surface)] border border-[var(--border-main)] text-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-md">
                            <Gamepad2 size={11} />
                            {sheet.packet?.dimensions ? `${sheet.packet.dimensions.columns}×${sheet.packet.dimensions.rows} ` : ''}
                            {sheet.type === 'activity_category_clash' ? (lang === 'sv' ? 'Poängjakten' : 'Category Clash') : (lang === 'sv' ? 'Spel' : 'Game')}
                        </span>
                    ) : (
                        <div className="flex flex-wrap gap-1">
                            {sheet.auto_topics?.slice(0, 2).map(tag => (
                                <span key={tag} className="text-[11px] font-semibold bg-[var(--bg-surface)] border border-[var(--border-main)] text-[var(--text-muted)] px-2 py-0.5 rounded-md">
                                    {getTopicLabel(tag)}
                                </span>
                            ))}
                        </div>
                    )}
                </td>

                <td className="py-2.5 text-center text-[var(--text-muted)] text-xs font-mono">
                    {new Date(sheet.updated_at).toLocaleDateString()}
                </td>

                <td className="py-2.5 text-right pr-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1 items-center">
                        <button 
                            type="button"
                            onClick={() => onSelectSheet(sheet)} 
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                            {isActivity 
                                ? (lang === 'sv' ? "Spela" : "Play") 
                                : (lang === 'sv' ? "Öppna" : "Open")}
                        </button>
                        <button 
                            type="button"
                            onClick={() => setPeekSheet(sheet)} 
                            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] rounded-lg transition-colors cursor-pointer" 
                            title={lang === 'sv' ? "Förhandsgranska" : "Peek"}
                        >
                            <Eye size={14} />
                        </button>
                        {isTrashView ? (
                            <>
                                <button 
                                    type="button"
                                    onClick={() => restoreSheet(sheet.id)} 
                                    className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-lg border border-emerald-200 dark:border-emerald-800 cursor-pointer"
                                >
                                    {lang === 'sv' ? "Återställ" : "Restore"}
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => hardDeleteSheet(sheet.id)} 
                                    className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer"
                                    title={lang === 'sv' ? "Radera permanent" : "Delete permanently"}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </>
                        ) : libraryTab === 'private' ? (
                            <>
                                <button 
                                    type="button"
                                    onClick={() => setShowMoveModal(sheet)} 
                                    className="p-1.5 text-[var(--text-muted)] hover:text-sky-600 dark:hover:text-sky-400 hover:bg-[var(--bg-surface)] rounded-lg transition-colors cursor-pointer" 
                                    title={lang === 'sv' ? "Flytta till mapp" : "Move to folder"}
                                >
                                    <FolderInput size={14} />
                                </button>
                                <button 
                                    type="button"
                                    onClick={(e) => handleDuplicate(e, sheet)} 
                                    className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] rounded-lg transition-colors cursor-pointer" 
                                    title={lang === 'sv' ? "Duplicera" : "Duplicate"}
                                >
                                    <Copy size={14} />
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => softDeleteSheet(sheet.id)} 
                                    className="p-1.5 text-[var(--text-muted)] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer" 
                                    title={lang === 'sv' ? "Flytta till papperskorg" : "Move to trash"}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </>
                        ) : (
                            <button 
                                type="button"
                                onClick={() => cloneSheet(sheet.id)} 
                                className="px-2.5 py-1 bg-[var(--bg-surface)] hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-[var(--text-main)] hover:text-emerald-700 dark:hover:text-emerald-300 text-xs font-bold rounded-lg border border-[var(--border-strong)] transition-colors cursor-pointer"
                            >
                                {lang === 'sv' ? "Kopiera" : "Clone"}
                            </button>
                        )}
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-5 select-none font-sans">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-xs"
                    />

                    {/* Main Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.94, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 8 }}
                        transition={{ type: 'spring', stiffness: 480, damping: 32 }}
                        className="relative bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border-strong)] w-full max-w-[1400px] h-[90vh] flex flex-row overflow-hidden z-10"
                    >
                        
                        {/* 1. LEFT SIDEBAR */}
                        <div className="w-60 bg-[var(--bg-surface)] border-r border-[var(--border-main)] flex flex-col shrink-0">
                            <div className="p-4 border-b border-[var(--border-main)]">
                                <h2 className="text-base font-extrabold text-[var(--text-main)] tracking-tight leading-none">
                                    {lang === 'sv' ? "Bibliotek" : "Library"}
                                </h2>
                                <p className="text-[11px] font-medium text-[var(--text-muted)] mt-1">
                                    {lang === 'sv' ? "Skapa eller öppna material" : "Create or open resources"}
                                </p>

                                {showCreationActions && onCreateNew && (
                                    <div data-tour="library-create" className="flex flex-col gap-1.5 mt-3.5">
                                        <button 
                                            type="button"
                                            onClick={() => onCreateNew('worksheet')} 
                                            className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98] shadow-2xs"
                                        >
                                            <Plus size={14} /> <span>{lang === 'sv' ? "Nytt Arbetsblad" : "New Worksheet"}</span>
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => onCreateNew('donow')} 
                                            className="w-full py-2 px-3 bg-[var(--bg-card)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] border border-[var(--border-strong)] hover:border-sky-600 rounded-xl font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer"
                                        >
                                            <Grid3X3 size={14} className="text-sky-600 dark:text-sky-400" /> <span>{lang === 'sv' ? "Nytt Do Now Grid" : "New Do Now Grid"}</span>
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => onCreateNew('board')} 
                                            className="w-full py-2 px-3 bg-[var(--bg-card)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] border border-[var(--border-strong)] hover:border-amber-600 rounded-xl font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer"
                                        >
                                            <Monitor size={14} className="text-amber-600 dark:text-amber-400" /> <span>{lang === 'sv' ? "Ny Presentation" : "New Presentation"}</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onCreateNew('poster_notes')}
                                            className="w-full py-2 px-3 bg-[var(--bg-card)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] border border-[var(--border-strong)] hover:border-purple-600 rounded-xl font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer"
                                        >
                                            <FileText size={14} className="text-purple-600 dark:text-purple-400" />
                                            <span>{lang === 'sv' ? "Affischer & Anteckningar" : "Posters & Notes"}</span>
                                        </button>
                                        {onCreateActivity && (
                                            <button 
                                                type="button"
                                                onClick={onCreateActivity} 
                                                className="w-full py-2 px-3 bg-[var(--bg-card)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] border border-[var(--border-strong)] hover:border-teal-600 rounded-xl font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer"
                                            >
                                                <Gamepad2 size={14} className="text-teal-600 dark:text-teal-400" /> <span>{lang === 'sv' ? "Ny Aktivitet / Spel" : "New Activity / Game"}</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div data-tour="library-locations" className="flex-1 overflow-y-auto p-3 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-2.5 block mb-1">
                                    {lang === 'sv' ? "Platser" : "Locations"}
                                </span>
                                <button 
                                    type="button"
                                    onClick={() => { setLibraryTab('private'); setIsTrashView(false); }} 
                                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2.5 cursor-pointer ${
                                        libraryTab === 'private' && !isTrashView 
                                            ? 'bg-emerald-600 text-white shadow-2xs' 
                                            : 'text-[var(--text-main)] hover:bg-[var(--bg-card)]'
                                    }`}
                                >
                                    <FileText size={15} /> {lang === 'sv' ? "Mina sparade" : "My Saved"}
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => { setLibraryTab('school'); setIsTrashView(false); }} 
                                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2.5 cursor-pointer ${
                                        libraryTab === 'school' && !isTrashView 
                                            ? 'bg-emerald-600 text-white shadow-2xs' 
                                            : 'text-[var(--text-main)] hover:bg-[var(--bg-card)]'
                                    }`}
                                >
                                    <Building2 size={15} /> {lang === 'sv' ? "Min Skola" : "My School"}
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => { setLibraryTab('public'); setIsTrashView(false); }} 
                                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2.5 cursor-pointer ${
                                        libraryTab === 'public' && !isTrashView 
                                            ? 'bg-sky-600 text-white shadow-2xs' 
                                            : 'text-[var(--text-main)] hover:bg-[var(--bg-card)]'
                                    }`}
                                >
                                    <Globe size={15} /> {lang === 'sv' ? "Globalt" : "Global"}
                                </button>

                                <div className="my-3 h-px bg-[var(--border-main)] mx-2" />
                                
                                <button 
                                    type="button"
                                    onClick={() => { setLibraryTab('private'); setIsTrashView(true); }} 
                                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2.5 cursor-pointer ${
                                        isTrashView 
                                            ? 'bg-rose-600 text-white shadow-2xs' 
                                            : 'text-[var(--text-muted)] hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400'
                                    }`}
                                >
                                    <Trash2 size={15} /> {lang === 'sv' ? "Papperskorg" : "Trash"}
                                </button>
                            </div>
                        </div>

                        {/* 2. MAIN TABLE VIEWPORT */}
                        <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-card)]">
                            <div className="px-6 py-4 border-b border-[var(--border-main)] flex justify-between items-center gap-3">
                                <div className="flex items-center gap-2.5">
                                    <h3 className="text-base font-extrabold text-[var(--text-main)]">
                                        {isTrashView ? (lang === 'sv' ? "Papperskorg" : "Trash") : libraryTab === 'private' ? (lang === 'sv' ? "Mina sparade filer" : "My Saved Files") : libraryTab === 'school' ? (lang === 'sv' ? "Skolans filer" : "School Files") : (lang === 'sv' ? "Globala resurser" : "Global Library")}
                                    </h3>
                                    <span className="px-2 py-0.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs font-bold font-mono text-[var(--text-muted)]">
                                        {filteredLibrary.length}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowTutorial(true)}
                                        className="px-3 py-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] border border-[var(--border-main)] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                                        title={lang === 'sv' ? "Snabbguide & Hjälp" : "Quick Guide & Help"}
                                    >
                                        <HelpCircle size={14} className="text-amber-600 dark:text-amber-400" />
                                        <span className="hidden sm:inline">{lang === 'sv' ? "Guide" : "Help"}</span>
                                    </button>

                                    {libraryTab === 'private' && !isTrashView && (
                                        <button 
                                            type="button"
                                            onClick={() => setShowFolderModal(true)} 
                                            className="px-3 py-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-strong)] rounded-xl text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5 cursor-pointer transition-colors"
                                        >
                                            <Plus size={14} className="text-sky-600 dark:text-sky-400" /> <span>{lang === 'sv' ? "Ny mapp" : "New Folder"}</span>
                                        </button>
                                    )}
                                    <button 
                                        type="button"
                                        onClick={onClose} 
                                        className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] rounded-xl transition-colors cursor-pointer"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Filters Toolbar */}
                            <div
                                data-tour="library-filters"
                                className="px-6 py-2.5 bg-[var(--bg-surface)]/60 border-b border-[var(--border-main)] flex flex-wrap justify-between items-center gap-3"
                            >
                                <div className="flex gap-1 p-1 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-main)]">
                                    {[
                                        { id: 'all', label: lang === 'sv' ? 'Alla' : 'All' },
                                        { id: 'board', label: lang === 'sv' ? 'Presentation' : 'Board', icon: Monitor },
                                        { id: 'worksheet', label: lang === 'sv' ? 'Arbetsblad' : 'Sheet', icon: FileText },
                                        { id: 'donow', label: 'Grid', icon: Grid3X3 },
                                        { id: 'poster_notes', label: lang === 'sv' ? 'Affischer & Anteckningar' : 'Posters & Notes', icon: FileText },
                                        { id: 'activity', label: lang === 'sv' ? 'Spel' : 'Games', icon: Gamepad2 }
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => setFilterDocType(tab.id)}
                                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                                                filterDocType === tab.id 
                                                    ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-2xs border border-[var(--border-main)]' 
                                                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                            }`}
                                        >
                                            {tab.icon && <tab.icon size={12} />}
                                            <span>{tab.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="relative w-48 sm:w-60">
                                        <Search className="absolute left-3 top-2 text-[var(--text-muted)]" size={14} />
                                        <input 
                                            type="text" 
                                            placeholder={lang === 'sv' ? "Sök titel..." : "Search title..."} 
                                            value={searchTerm} 
                                            onChange={(e) => setSearchTerm(e.target.value)} 
                                            className="w-full pl-8 pr-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-main)] rounded-xl text-xs font-semibold outline-none focus:border-emerald-600 transition-colors"
                                        />
                                    </div>
                                    <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl px-2.5 py-1.5 flex items-center gap-1.5">
                                        <Filter size={12} className="text-[var(--text-muted)]" />
                                        <select 
                                            value={filterTopic} 
                                            onChange={(e) => setFilterTopic(e.target.value)} 
                                            className="text-xs font-bold bg-transparent border-none outline-none cursor-pointer text-[var(--text-main)]"
                                        >
                                            <option value="all">{lang === 'sv' ? "Alla områden" : "All Topics"}</option>
                                            {availableTopics.map(tId => <option key={tId} value={tId}>{getTopicLabel(tId)}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Table Viewport */}
                            <div
                                data-tour="library-table"
                                className="flex-1 overflow-auto custom-scrollbar px-6 py-3"
                            >
                                {isLoading ? (
                                    <div className="flex justify-center py-24"><Loader2 className="animate-spin text-emerald-600" size={32} /></div>
                                ) : (
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-[var(--border-main)] text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                                                <th className="pb-2.5 w-10 text-center"></th>
                                                <th className="pb-2.5 w-2/5">{lang === 'sv' ? "Titel" : "Title"}</th>
                                                <th className="pb-2.5 w-1/4">{lang === 'sv' ? "Innehåll" : "Content"}</th>
                                                <th className="pb-2.5 text-center w-24">{lang === 'sv' ? "Datum" : "Date"}</th>
                                                <th className="pb-2.5 text-right w-44 pr-3">{lang === 'sv' ? "Åtgärder" : "Actions"}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border-main)]">
                                            {/* FOLDERS */}
                                            {libraryTab === 'private' && !isTrashView && folders.map(folder => {
                                                const isExpanded = expandedFolders.includes(folder.id);
                                                const folderFiles = filteredLibrary.filter(sheet => sheet.folder_id === folder.id);

                                                return (
                                                    <React.Fragment key={folder.id}>
                                                        <tr onClick={() => toggleFolder(folder.id)} className="hover:bg-[var(--bg-surface)]/70 transition-colors group cursor-pointer">
                                                            <td className="py-2.5 text-center">
                                                                <div className="w-7 h-7 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-strong)] flex items-center justify-center mx-auto text-[var(--text-main)]">
                                                                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                                </div>
                                                            </td>
                                                            <td className="py-2.5 font-bold text-[var(--text-main)] text-xs sm:text-sm">
                                                                <div className="flex items-center gap-2">
                                                                    <Layers size={14} className="text-sky-600 dark:text-sky-400" />
                                                                    <span>{folder.name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-2.5 text-xs font-semibold font-mono text-[var(--text-muted)]">
                                                                {folderFiles.length} {lang === 'sv' ? 'filer' : 'files'}
                                                            </td>
                                                            <td className="py-2.5 text-center text-[var(--text-muted)] text-xs font-mono">
                                                                {new Date(folder.created_at).toLocaleDateString()}
                                                            </td>
                                                            <td className="py-2.5 text-right pr-3">
                                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button 
                                                                        type="button"
                                                                        onClick={(e) => { e.stopPropagation(); setEditingFolder(folder); setEditingFolderName(folder.name); }} 
                                                                        className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] rounded-lg transition-colors cursor-pointer"
                                                                    >
                                                                        <Edit2 size={13} />
                                                                    </button>
                                                                    <button 
                                                                        type="button"
                                                                        onClick={(e) => { e.stopPropagation(); deleteFolder(folder.id); }} 
                                                                        className="p-1.5 text-[var(--text-muted)] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                                                                    >
                                                                        <Trash2 size={13} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>

                                                        {isExpanded && folderFiles.map(sheet => renderFileRow(sheet, true))}
                                                    </React.Fragment>
                                                );
                                            })}

                                            {/* ROOT FILES */}
                                            {filteredLibrary
                                                .filter(sheet => isTrashView || libraryTab !== 'private' || sheet.folder_id === null)
                                                .map(sheet => renderFileRow(sheet, false))}

                                            {filteredLibrary.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="text-center py-16 text-[var(--text-muted)] font-semibold text-xs">
                                                        {isTrashView ? (lang === 'sv' ? "Papperskorgen är tom." : "Trash is empty.") : (lang === 'sv' ? "Inga filer hittades." : "No files found.")}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* FOLDER CREATION MODAL */}
                    <AnimatePresence>
                        {showFolderModal && (
                            <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setShowFolderModal(false)}
                                    className="absolute inset-0 bg-black/60 backdrop-blur-xs"
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.92, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                                    transition={{ type: 'spring', stiffness: 480, damping: 30 }}
                                    className="relative bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-2xl p-5 w-full max-w-sm z-10"
                                >
                                    <h4 className="text-sm font-extrabold text-[var(--text-main)] mb-3">{lang === 'sv' ? "Ny mapp" : "New Folder"}</h4>
                                    <input 
                                        autoFocus
                                        type="text" 
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        placeholder={lang === 'sv' ? "Mappnamn..." : "Folder name..."}
                                        className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-main)] text-[var(--text-main)] rounded-xl text-xs font-semibold outline-none focus:border-emerald-600 mb-4"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button type="button" onClick={() => setShowFolderModal(false)} className="px-3 py-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] font-bold text-xs cursor-pointer">{lang === 'sv' ? "Avbryt" : "Cancel"}</button>
                                        <button type="button" onClick={() => { createFolder(newFolderName); setNewFolderName(''); setShowFolderModal(false); }} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer">{lang === 'sv' ? "Skapa" : "Create"}</button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* RENAME FOLDER MODAL */}
                    <AnimatePresence>
                        {editingFolder && (
                            <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setEditingFolder(null)}
                                    className="absolute inset-0 bg-black/60 backdrop-blur-xs"
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.92, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                                    transition={{ type: 'spring', stiffness: 480, damping: 30 }}
                                    className="relative bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-2xl p-5 w-full max-w-sm z-10"
                                >
                                    <h4 className="text-sm font-extrabold text-[var(--text-main)] mb-3">{lang === 'sv' ? "Byt namn på mapp" : "Rename Folder"}</h4>
                                    <input 
                                        autoFocus
                                        type="text" 
                                        value={editingFolderName}
                                        onChange={(e) => setEditingFolderName(e.target.value)}
                                        className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-main)] text-[var(--text-main)] rounded-xl text-xs font-semibold outline-none focus:border-emerald-600 mb-4"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button type="button" onClick={() => setEditingFolder(null)} className="px-3 py-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] font-bold text-xs cursor-pointer">{lang === 'sv' ? "Avbryt" : "Cancel"}</button>
                                        <button 
                                            type="button" 
                                            onClick={async () => { 
                                                if (editingFolderName.trim()) {
                                                    await renameFolder(editingFolder.id, editingFolderName.trim()); 
                                                }
                                                setEditingFolder(null); 
                                            }} 
                                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                                        >
                                            {lang === 'sv' ? "Spara" : "Save"}
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* PEEK SHEET DRAWER */}
                    <AnimatePresence>
                        {peekSheet && (
                            <div className="fixed inset-0 z-[400] flex justify-end">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setPeekSheet(null)}
                                    className="absolute inset-0 bg-black/50 backdrop-blur-xs"
                                />
                                <motion.div
                                    initial={{ x: '100%' }}
                                    animate={{ x: 0 }}
                                    exit={{ x: '100%' }}
                                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                                    className="relative w-full max-w-md bg-[var(--bg-card)] border-l border-[var(--border-strong)] h-full shadow-2xl flex flex-col z-10"
                                >
                                    <div className="p-4 border-b border-[var(--border-main)] flex justify-between items-center bg-[var(--bg-surface)]">
                                        <div className="min-w-0 pr-2">
                                            <h4 className="font-extrabold text-[var(--text-main)] text-sm truncate">{peekSheet.title}</h4>
                                            <span className="text-[11px] font-semibold text-[var(--text-muted)]">
                                                {peekSheet.type?.startsWith('activity')
                                                    ? (lang === 'sv' ? 'Spelaktivitet' : 'Game Activity')
                                                    : peekSheet.type}
                                            </span>
                                        </div>
                                        <button type="button" onClick={() => setPeekSheet(null)} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-lg cursor-pointer">
                                            <X size={18} />
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
                                        {peekSheet.type?.startsWith('activity') ? (
                                            <div className="space-y-4">
                                                <div className="p-4 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800 text-teal-950 dark:text-teal-100">
                                                    <div className="text-xs font-extrabold mb-1 flex items-center gap-1.5">
                                                        <Gamepad2 size={15} className="text-teal-600 dark:text-teal-400" />
                                                        <span>
                                                            {peekSheet.type === 'activity_category_clash'
                                                                ? (lang === 'sv' ? 'Poängjakten' : 'Category Clash')
                                                                : (lang === 'sv' ? 'Aktivitet' : 'Activity')}
                                                        </span>
                                                    </div>

                                                    {peekSheet.packet?.dimensions && (
                                                        <div className="text-xs font-semibold font-mono text-teal-700 dark:text-teal-300">
                                                            {peekSheet.packet.dimensions.columns} × {peekSheet.packet.dimensions.rows}
                                                        </div>
                                                    )}

                                                    {Array.isArray(peekSheet.packet?.categories) && (
                                                        <div className="mt-2.5 flex flex-wrap gap-1">
                                                            {peekSheet.packet.categories.map((c, i) => (
                                                                <span key={c.id || i} className="text-[11px] font-semibold px-2 py-0.5 bg-[var(--bg-card)] text-teal-800 dark:text-teal-200 rounded-md border border-teal-200 dark:border-teal-800">
                                                                    {c.name || c.topic}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-2.5">
                                                    <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-1">
                                                        {lang === 'sv' ? "Förhandsvisning av brickor" : "Tile Previews"}
                                                    </div>

                                                    {(peekSheet.packet?.tiles || []).slice(0, 6).map((tile, i) => {
                                                        const renderData = tile.renderData || tile.resolvedData?.renderData || {};
                                                        return (
                                                            <div key={tile.slotId || tile.id || i} className="p-3.5 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-main)] text-xs">
                                                                <div className="flex justify-between items-center mb-2 text-[10px] font-bold text-[var(--text-muted)]">
                                                                    <span className="font-mono text-sky-600 dark:text-sky-400">{tile.slotId || `Tile ${i + 1}`}</span>
                                                                    {tile.points && (
                                                                        <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded font-bold font-mono">
                                                                            {tile.points} p
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {renderData.description && (
                                                                    <div className="font-semibold text-[var(--text-main)] mb-2 leading-relaxed">
                                                                        <MathDisplay content={renderData.description} />
                                                                    </div>
                                                                )}

                                                                {renderData.latex && (
                                                                    <div className="py-2 text-center font-sans text-[var(--text-main)] bg-[var(--bg-card)] rounded-lg border border-[var(--border-main)] my-1">
                                                                        <MathDisplay content={`$$${renderData.latex}$$`} />
                                                                    </div>
                                                                )}

                                                                {renderData && (renderData.geometry || renderData.graph || renderData.pattern) && (
                                                                    <div className="flex justify-center max-h-[120px] overflow-hidden my-2 scale-75 origin-top whiteboard-protect rounded-lg">
                                                                        <VisualRenderer data={renderData} isWordProblem={tile.wordProblem} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ) : (
                                            (peekSheet.type === 'board' ? (peekSheet.packet?.livePacket || []) : (peekSheet.packet || [])).map((q, i) => (
                                                <div key={i} className="p-3.5 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-main)] text-xs">
                                                    <div className="font-semibold text-[var(--text-main)] mb-2 leading-relaxed">
                                                        <MathDisplay content={q.resolvedData?.renderData?.description || q.text} />
                                                    </div>
                                                    {q.resolvedData?.renderData?.latex && (
                                                        <div className="py-2 text-center font-sans text-[var(--text-main)] bg-[var(--bg-card)] rounded-lg border border-[var(--border-main)] my-2">
                                                            <MathDisplay content={`$$${q.resolvedData.renderData.latex}$$`} />
                                                        </div>
                                                    )}
                                                    {q.resolvedData?.renderData && (
                                                        <div className="flex justify-center max-h-[140px] overflow-hidden my-2 scale-75 origin-top whiteboard-protect rounded-lg">
                                                            <VisualRenderer data={q.resolvedData.renderData} isWordProblem={false} />
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <div className="p-4 border-t border-[var(--border-main)] bg-[var(--bg-surface)]">
                                        <button 
                                            type="button"
                                            onClick={() => { onSelectSheet(peekSheet); setPeekSheet(null); }}
                                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer transition-colors active:scale-[0.98]"
                                        >
                                            {peekSheet.type?.startsWith('activity')
                                                ? (lang === 'sv' ? "Starta detta spel" : "Launch this Game")
                                                : (lang === 'sv' ? "Öppna detta material" : "Open this Resource")}
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* MOVE TO FOLDER MODAL */}
                    <AnimatePresence>
                        {showMoveModal && (
                            <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setShowMoveModal(null)}
                                    className="absolute inset-0 bg-black/60 backdrop-blur-xs"
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.92, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                                    transition={{ type: 'spring', stiffness: 480, damping: 30 }}
                                    className="relative bg-[var(--bg-card)] rounded-2xl shadow-2xl p-5 w-full max-w-sm border border-[var(--border-strong)] z-10"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-extrabold text-[var(--text-main)]">
                                            {lang === 'sv' ? "Flytta till mapp" : "Move to Folder"}
                                        </h4>
                                        <button type="button" onClick={() => setShowMoveModal(null)} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-lg cursor-pointer">
                                            <X size={16} />
                                        </button>
                                    </div>
                                    
                                    <p className="text-xs text-[var(--text-muted)] font-semibold mb-3.5 truncate">
                                        {showMoveModal.title}
                                    </p>

                                    <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar mb-4">
                                        <button
                                            type="button"
                                            onClick={() => handleMoveToFolder(null)}
                                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[var(--text-main)] hover:bg-[var(--bg-surface)] transition-colors flex items-center gap-2 cursor-pointer border border-[var(--border-main)]"
                                        >
                                            <FileText size={14} className="text-[var(--text-muted)]" />
                                            <span>{lang === 'sv' ? "Huvudmapp (Ingen mapp)" : "Root (No Folder)"}</span>
                                        </button>

                                        {folders.map(folder => (
                                            <button
                                                key={folder.id}
                                                type="button"
                                                onClick={() => handleMoveToFolder(folder.id)}
                                                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[var(--text-main)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] transition-colors flex items-center gap-2 cursor-pointer border border-[var(--border-main)]"
                                            >
                                                <Layers size={14} className="text-sky-600 dark:text-sky-400" />
                                                <span className="truncate">{folder.name}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex justify-end">
                                        <button 
                                            type="button"
                                            onClick={() => setShowMoveModal(null)} 
                                            className="px-4 py-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] font-bold text-xs rounded-xl cursor-pointer"
                                        >
                                            {lang === 'sv' ? "Avbryt" : "Cancel"}
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* INTERACTIVE SPOTLIGHT TOUR */}
                    <SpotlightTour
                        steps={libraryTourSteps}
                        isOpen={showTutorial}
                        onClose={handleCloseTutorial}
                        lang={lang}
                    />
                </div>
            )}
        </AnimatePresence>
    );
}