import React, { useState } from 'react';
import { 
    Search, Filter, Plus, Trash2, Layers, Building2, Globe, FileText, 
    Monitor, Grid3X3, Copy, X, Edit2, PanelLeftClose, ChevronDown, 
    ChevronRight, Loader2, Maximize2, HelpCircle, Gamepad2
} from 'lucide-react';
import { useLibrary } from '../../hooks/useLibrary';
import { SKILL_BUCKETS } from '../../constants/skillBuckets';
import VisualRenderer from '../visuals/VisualRenderer';
import MathDisplay from '../shared/MathDisplay';
import StudioTutorialModal from '../modals/StudioTutorialModal.jsx';

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

    // 🟢 Hook placed at the top (adhering to React Rules of Hooks)
    const [showTutorial, setShowTutorial] = useState(() => {
        return !localStorage.getItem('has_seen_studio_guide');
    });

    const handleCloseTutorial = () => {
        localStorage.setItem('has_seen_studio_guide', 'true');
        setShowTutorial(false);
    };

    if (!isOpen) return null;

    const toggleFolder = (folderId) => {
        setExpandedFolders(prev => prev.includes(folderId) ? prev.filter(id => id !== folderId) : [...prev, folderId]);
    };

    const handleMoveToFolder = async (folderId) => {
        if (!showMoveModal) return;
        await moveSheet(showMoveModal.id, folderId);
        setShowMoveModal(null);
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

    const getSheetIconStyle = (type = '', size = 16) => {
        const cleanType = String(type).toLowerCase();
        if (cleanType.startsWith('activity')) {
            return { 
                theme: 'theme-purple', 
                bg: 'bg-purple-50 text-purple-600 border-purple-200', 
                icon: <Gamepad2 size={size} /> 
            };
        }
        if (cleanType === 'board') {
            return { 
                theme: 'theme-amber', 
                bg: 'bg-amber-50 text-amber-600 border-amber-200', 
                icon: <Monitor size={size} /> 
            };
        }
        if (cleanType === 'donow') {
            return { 
                theme: 'theme-indigo', 
                bg: 'bg-indigo-50 text-indigo-600 border-indigo-200', 
                icon: <Grid3X3 size={size} /> 
            };
        }
        return { 
            theme: 'theme-emerald', 
            bg: 'bg-emerald-50 text-emerald-600 border-emerald-200', 
            icon: <FileText size={size} /> 
        };
    };
    return (
        <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-in fade-in select-none font-sans">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-7xl h-[88vh] flex flex-row overflow-hidden">
                
                {/* 1. LEFT SIDEBAR */}
                <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
                    <div className="p-6 border-b border-slate-200">
                        <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase italic mb-1">
                            {lang === 'sv' ? "Bibliotek" : "Library"}
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {lang === 'sv' ? "Sparat material" : "Saved Resources"}
                        </p>

                        {showCreationActions && onCreateNew && (
                            <div className="flex flex-col gap-2 mt-4">
                                <button 
                                    type="button"
                                    onClick={() => onCreateNew('board')} 
                                    className="w-full py-2.5 bg-amber-500 text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                                >
                                    <Plus size={14} /> {lang === 'sv' ? "Nytt Board" : "New Board"}
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => onCreateNew('donow')} 
                                    className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                                >
                                    <Plus size={14} /> {lang === 'sv' ? "Nytt Do Now" : "New Do Now"}
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => onCreateNew('worksheet')} 
                                    className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                                >
                                    <Plus size={14} /> {lang === 'sv' ? "Nytt Arbetsblad" : "New Worksheet"}
                                </button>
                                <button 
                                    type="button"
                                    onClick={onCreateActivity}
                                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-purple-500/40"
                                >
                                    <Gamepad2 size={14} /> {lang === 'sv' ? "Nytt Aktivitet" : "New Activity"}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-1">
                        <button 
                            onClick={() => { setLibraryTab('private'); setIsTrashView(false); }} 
                            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-3 cursor-pointer ${libraryTab === 'private' && !isTrashView ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/60'}`}
                        >
                            <FileText size={16} /> {lang === 'sv' ? "Mina sparade" : "My Saved"}
                        </button>
                        <button 
                            onClick={() => { setLibraryTab('school'); setIsTrashView(false); }} 
                            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-3 cursor-pointer ${libraryTab === 'school' && !isTrashView ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/60'}`}
                        >
                            <Building2 size={16} /> {lang === 'sv' ? "Min Skola" : "My School"}
                        </button>
                        <button 
                            onClick={() => { setLibraryTab('public'); setIsTrashView(false); }} 
                            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-3 cursor-pointer ${libraryTab === 'public' && !isTrashView ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/60'}`}
                        >
                            <Globe size={16} /> {lang === 'sv' ? "Globalt" : "Global"}
                        </button>

                        <div className="my-4 h-px bg-slate-200 mx-2" />
                        
                        <button 
                            onClick={() => { setLibraryTab('private'); setIsTrashView(true); }} 
                            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-3 cursor-pointer ${isTrashView ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:bg-rose-50 hover:text-rose-600'}`}
                        >
                            <Trash2 size={16} /> {lang === 'sv' ? "Papperskorg" : "Trash"}
                        </button>
                    </div>
                </div>

                {/* 2. MAIN TABLE VIEWPORT */}
                <div className="flex-1 flex flex-col min-w-0 bg-white">
                    <div className="px-8 py-5 border-b border-slate-200 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider">
                                {isTrashView ? (lang === 'sv' ? "Papperskorg" : "Trash") : libraryTab === 'private' ? (lang === 'sv' ? "Mina sparade filer" : "My Saved Files") : libraryTab === 'school' ? (lang === 'sv' ? "Skolans filer" : "School Files") : (lang === 'sv' ? "Globala resurser" : "Global Library")}
                            </h3>
                            <span className="text-xs font-bold text-slate-400">({filteredLibrary.length})</span>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* 🟢 Guide / Tutorial Button */}
                            <button
                                type="button"
                                onClick={() => setShowTutorial(true)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                                title={lang === 'sv' ? "Snabbguide & Hjälp" : "Quick Guide & Help"}
                            >
                                <HelpCircle size={15} className="text-amber-500" />
                                <span className="hidden sm:inline">{lang === 'sv' ? "Guide" : "Help"}</span>
                            </button>

                            {libraryTab === 'private' && !isTrashView && (
                                <button 
                                    onClick={() => setShowFolderModal(true)}
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                                >
                                    <Plus size={14} /> {lang === 'sv' ? "Ny mapp" : "New Folder"}
                                </button>
                            )}
                            <button 
                                onClick={onClose} 
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Filters Toolbar */}
                    <div className="px-8 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap justify-between items-center gap-3">
                        <div className="flex gap-1 p-0.5 bg-slate-200/80 rounded-xl border border-slate-300">
                            {[
                                { id: 'all', label: lang === 'sv' ? 'Alla' : 'All' },
                                { id: 'board', label: lang === 'sv' ? 'Presentation' : 'Board', icon: Monitor },
                                { id: 'worksheet', label: lang === 'sv' ? 'Arbetsblad' : 'Sheet', icon: FileText },
                                { id: 'donow', label: 'Grid', icon: Grid3X3 },
                                { id: 'activity', label: lang === 'sv' ? 'Spel' : 'Games', icon: Gamepad2 } // 🟢 Added
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setFilterDocType(tab.id)}
                                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1 cursor-pointer ${
                                        filterDocType === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    {tab.icon && <tab.icon size={12} />}
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative w-48 sm:w-60">
                                <Search className="absolute left-3 top-2 text-slate-400" size={14} />
                                <input 
                                    type="text"
                                    placeholder={lang === 'sv' ? "Sök..." : "Search..."}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 shadow-xs"
                                />
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-xs flex items-center gap-1">
                                <Filter size={12} className="text-slate-400" />
                                <select 
                                    value={filterTopic} 
                                    onChange={(e) => setFilterTopic(e.target.value)} 
                                    className="text-[10px] font-black uppercase bg-transparent border-none outline-none cursor-pointer text-slate-700"
                                >
                                    <option value="all">{lang === 'sv' ? "Alla Områden" : "All Topics"}</option>
                                    {availableTopics.map(tId => <option key={tId} value={tId}>{getTopicLabel(tId).toUpperCase()}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Table Viewport */}
                    <div className="flex-1 overflow-auto custom-scrollbar px-8 py-4">
                        {isLoading ? (
                            <div className="flex justify-center py-24"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <th className="pb-3 w-10 text-center"></th>
                                        <th className="pb-3 w-2/5">{lang === 'sv' ? "Titel" : "Title"}</th>
                                        <th className="pb-3 w-1/4">{lang === 'sv' ? "Innehåll" : "Content"}</th>
                                        <th className="pb-3 text-center w-24">{lang === 'sv' ? "Datum" : "Date"}</th>
                                        <th className="pb-3 text-right w-44 pr-4">{lang === 'sv' ? "Åtgärder" : "Actions"}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {/* FOLDERS */}
                                    {libraryTab === 'private' && !isTrashView && folders.map(folder => {
                                        const isExpanded = expandedFolders.includes(folder.id);
                                        const folderFiles = filteredLibrary.filter(sheet => sheet.folder_id === folder.id);

                                        return (
                                            <React.Fragment key={folder.id}>
                                                <tr onClick={() => toggleFolder(folder.id)} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                                                    <td className="py-3 text-center">
                                                        <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
                                                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 font-black text-slate-800 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <Layers size={14} className="text-indigo-600" />
                                                            <span>{folder.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{folderFiles.length} filer</td>
                                                    <td className="py-3 text-center text-slate-400 text-xs">{new Date(folder.created_at).toLocaleDateString()}</td>
                                                    <td className="py-3 text-right pr-4">
                                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); setEditingFolder(folder); setEditingFolderName(folder.name); }} 
                                                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                                            >
                                                                <Edit2 size={13} />
                                                            </button>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); deleteFolder(folder.id); }} 
                                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                            >
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* Files inside folder */}
                                                {isExpanded && folderFiles.map(sheet => {
                                                    const style = getSheetIconStyle(sheet.type);
                                                    return (
                                                        <tr key={sheet.id} className="hover:bg-indigo-50/30 transition-colors group bg-slate-50/50">
                                                            <td className="py-2.5 text-center relative">
                                                                <div className="w-4 h-px bg-slate-300 ml-6" />
                                                            </td>
                                                            <td className="py-2.5 font-bold text-slate-700 text-sm pl-4">
                                                                <div className="flex items-center gap-2 truncate">
                                                                    <span className={`p-1 rounded-md border ${style.bg}`}>{style.icon}</span>
                                                                    <span className="truncate">{sheet.title}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-2.5">
                                                                {sheet.type?.startsWith('activity') ? (
                                                                    <span className="text-[9px] font-black uppercase tracking-wider bg-purple-50 border border-purple-200 text-purple-700 px-2 py-0.5 rounded-md">
                                                                        🎮 {sheet.packet?.dimensions ? `${sheet.packet.dimensions.columns}×${sheet.packet.dimensions.rows} ` : ''}
                                                                        {sheet.type === 'activity_category_clash' ? (lang === 'sv' ? 'Poängjakten' : 'Category Clash') : 'Spel'}
                                                                    </span>
                                                                ) : (
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {sheet.auto_topics?.slice(0, 2).map(tag => (
                                                                            <span key={tag} className="text-[9px] font-black uppercase tracking-wider bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
                                                                                {tag}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="py-2.5 text-center text-slate-400 text-xs">{new Date(sheet.updated_at).toLocaleDateString()}</td>
                                                            <td className="py-2.5 text-right pr-4">
                                                                <div className="flex justify-end gap-1 items-center">
                                                                    <button 
                                                                        onClick={() => onSelectSheet(sheet)} 
                                                                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                                                                    >
                                                                        {lang === 'sv' ? "Öppna" : "Open"}
                                                                    </button>
                                                                    <button onClick={() => setPeekSheet(sheet)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg"><Maximize2 size={13} /></button>
                                                                    <button onClick={() => softDeleteSheet(sheet.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={13} /></button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </React.Fragment>
                                        );
                                    })}

                                    {/* ROOT FILES */}
                                    {filteredLibrary.filter(sheet => isTrashView || libraryTab !== 'private' || sheet.folder_id === null).map(sheet => {
                                        const style = getSheetIconStyle(sheet.type);
                                        return (
                                            <tr key={sheet.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="py-3 text-center">
                                                    <span className={`inline-flex p-1.5 rounded-xl border ${style.bg}`}>{style.icon}</span>
                                                </td>
                                                <td className="py-3 font-bold text-slate-800 text-sm max-w-0">
                                                    <div className="truncate" title={sheet.title}>{sheet.title}</div>
                                                </td>
                                                <td className="py-3">
                                                    {sheet.type?.startsWith('activity') ? (
                                                        <span className="text-[9px] font-black uppercase tracking-wider bg-purple-50 border border-purple-200 text-purple-700 px-2 py-0.5 rounded-md">
                                                            🎮 {sheet.packet?.dimensions ? `${sheet.packet.dimensions.columns}×${sheet.packet.dimensions.rows} ` : ''}
                                                            {sheet.type === 'activity_category_clash' ? (lang === 'sv' ? 'Poängjakten' : 'Category Clash') : 'Spel'}
                                                        </span>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-1">
                                                            {sheet.auto_topics?.slice(0, 2).map(tag => (
                                                                <span key={tag} className="text-[9px] font-black uppercase tracking-wider bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md">{tag}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {sheet.auto_topics?.slice(0, 2).map(tag => (
                                                            <span key={tag} className="text-[9px] font-black uppercase tracking-wider bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md">{tag}</span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="py-3 text-center text-slate-400 text-xs">{new Date(sheet.updated_at).toLocaleDateString()}</td>
                                                <td className="py-3 text-right pr-4">
                                                    <div className="flex justify-end gap-1 items-center">
                                                        <button 
                                                            onClick={() => onSelectSheet(sheet)} 
                                                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                                                        >
                                                            {sheet.type?.startsWith('activity') 
                                                                ? (lang === 'sv' ? "Spela" : "Play") 
                                                                : (lang === 'sv' ? "Öppna" : "Open")}
                                                        </button>
                                                        <button onClick={() => setPeekSheet(sheet)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"><Maximize2 size={14} /></button>
                                                        {isTrashView ? (
                                                            <>
                                                                <button onClick={() => restoreSheet(sheet.id)} className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-200">Återställ</button>
                                                                <button onClick={() => hardDeleteSheet(sheet.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={14} /></button>
                                                            </>
                                                        ) : libraryTab === 'private' ? (
                                                            <>
                                                                <button onClick={() => setShowMoveModal(sheet)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"><PanelLeftClose size={14} /></button>
                                                                <button onClick={() => duplicateSheet(sheet)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"><Copy size={14} /></button>
                                                                <button onClick={() => softDeleteSheet(sheet.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={14} /></button>
                                                            </>
                                                        ) : (
                                                            <button onClick={() => cloneSheet(sheet.id)} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase rounded-lg border border-indigo-200">Kopiera</button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {filteredLibrary.length === 0 && (
                                        <tr><td colSpan={5} className="text-center py-16 text-slate-400 font-bold text-xs uppercase tracking-widest">{isTrashView ? "Papperskorgen är tom" : "Inga filer hittades"}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* FOLDER CREATION MODAL */}
            {showFolderModal && (
                <div className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-900/60 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm">
                        <h4 className="text-sm font-black uppercase tracking-wider text-slate-800 mb-3">{lang === 'sv' ? "Ny mapp" : "New Folder"}</h4>
                        <input 
                            autoFocus
                            type="text" 
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder={lang === 'sv' ? "Mappnamn..." : "Folder name..."}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none mb-4"
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowFolderModal(false)} className="px-3 py-1.5 text-slate-500 font-bold text-xs">{lang === 'sv' ? "Avbryt" : "Cancel"}</button>
                            <button onClick={() => { createFolder(newFolderName); setNewFolderName(''); setShowFolderModal(false); }} className="px-4 py-1.5 bg-indigo-600 text-white font-black text-xs uppercase rounded-xl">{lang === 'sv' ? "Skapa" : "Create"}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* PEEK SHEET DRAWER */}
            {peekSheet && (
                <div className="fixed inset-0 z-[400] flex justify-end bg-slate-900/40 backdrop-blur-xs">
                    <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
                        {/* Header */}
                        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <div className="min-w-0 pr-2">
                                <h4 className="font-black text-slate-800 text-sm truncate">{peekSheet.title}</h4>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {peekSheet.type?.startsWith('activity')
                                        ? (lang === 'sv' ? 'Spelaktivitet' : 'Game Activity')
                                        : peekSheet.type}
                                </span>
                            </div>
                            <button onClick={() => setPeekSheet(null)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Content Body */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                            {peekSheet.type?.startsWith('activity') ? (
                                <div className="space-y-4">
                                    {/* Game Overview Banner */}
                                    <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-purple-950">
                                        <div className="text-xs font-black uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                            <Gamepad2 size={15} className="text-purple-600" />
                                            <span>
                                                {peekSheet.type === 'activity_category_clash'
                                                    ? (lang === 'sv' ? 'Poängjakten' : 'Category Clash')
                                                    : (lang === 'sv' ? 'Aktivitet' : 'Activity')}
                                            </span>
                                        </div>

                                        {peekSheet.packet?.dimensions && (
                                            <div className="text-xs font-bold text-purple-700">
                                                {peekSheet.packet.dimensions.columns} {lang === 'sv' ? 'kolumner' : 'columns'} × {peekSheet.packet.dimensions.rows} {lang === 'sv' ? 'rader' : 'rows'}
                                            </div>
                                        )}

                                        {/* Categories Chips */}
                                        {Array.isArray(peekSheet.packet?.categories) && (
                                            <div className="mt-3 flex flex-wrap gap-1">
                                                {peekSheet.packet.categories.map((c, i) => (
                                                    <span key={c.id || i} className="text-[10px] font-bold px-2 py-0.5 bg-white text-purple-800 rounded-lg border border-purple-200">
                                                        {c.name || c.topic}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Sample Tiles Preview (First 6 tiles) */}
                                    <div className="space-y-3">
                                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">
                                            {lang === 'sv' ? "Förhandsvisning av brickor" : "Tile Previews"}
                                        </div>

                                        {(peekSheet.packet?.tiles || []).slice(0, 6).map((tile, i) => {
                                            const renderData = tile.renderData || tile.resolvedData?.renderData || {};
                                            return (
                                                <div key={tile.slotId || tile.id || i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                                                    <div className="flex justify-between items-center mb-2 text-[10px] font-black uppercase text-slate-400">
                                                        <span className="font-mono text-indigo-600">{tile.slotId || `Tile ${i + 1}`}</span>
                                                        {tile.points && (
                                                            <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-black">
                                                                {tile.points} p
                                                            </span>
                                                        )}
                                                    </div>

                                                    {renderData.description && (
                                                        <div className="font-bold text-slate-800 mb-2 leading-relaxed">
                                                            <MathDisplay content={renderData.description} />
                                                        </div>
                                                    )}

                                                    {renderData.latex && (
                                                        <div className="py-2 text-center font-serif text-indigo-700 bg-white rounded-lg border border-slate-200 my-1">
                                                            <MathDisplay content={`$$${renderData.latex}$$`} />
                                                        </div>
                                                    )}

                                                    {renderData && (renderData.geometry || renderData.graph || renderData.pattern) && (
                                                        <div className="flex justify-center max-h-[120px] overflow-hidden my-2 scale-75 origin-top">
                                                            <VisualRenderer data={renderData} isWordProblem={tile.wordProblem} />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                /* Standard Worksheets / Presentation Boards */
                                (peekSheet.type === 'board' ? (peekSheet.packet?.livePacket || []) : (peekSheet.packet || [])).map((q, i) => (
                                    <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                                        <div className="font-bold text-slate-800 mb-2 leading-relaxed">
                                            <MathDisplay content={q.resolvedData?.renderData?.description || q.text} />
                                        </div>
                                        {q.resolvedData?.renderData?.latex && (
                                            <div className="py-2 text-center font-serif text-indigo-700 bg-white rounded-lg border border-slate-200 my-2">
                                                <MathDisplay content={`$$${q.resolvedData.renderData.latex}$$`} />
                                            </div>
                                        )}
                                        {q.resolvedData?.renderData && (
                                            <div className="flex justify-center max-h-[140px] overflow-hidden my-2 scale-75 origin-top">
                                                <VisualRenderer data={q.resolvedData.renderData} isWordProblem={false} />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer Action */}
                        <div className="p-4 border-t border-slate-200 bg-slate-50">
                            <button 
                                onClick={() => { onSelectSheet(peekSheet); setPeekSheet(null); }}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md cursor-pointer transition-all active:scale-[0.98]"
                            >
                                {peekSheet.type?.startsWith('activity')
                                    ? (lang === 'sv' ? "Starta detta spel" : "Launch this Game")
                                    : (lang === 'sv' ? "Öppna detta material" : "Open this Resource")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🟢 MOVE TO FOLDER MODAL */}
            {showMoveModal && (
                <div className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-900/60 p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-black uppercase tracking-wider text-slate-800">
                                {lang === 'sv' ? "Flytta till mapp" : "Move to Folder"}
                            </h4>
                            <button onClick={() => setShowMoveModal(null)} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
                                <X size={16} />
                            </button>
                        </div>
                        
                        <p className="text-xs text-slate-500 font-bold mb-4 truncate">
                            {showMoveModal.title}
                        </p>

                        <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar mb-4">
                            {/* Option to move to Root (No Folder) */}
                            <button
                                type="button"
                                onClick={() => handleMoveToFolder(null)}
                                className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2 cursor-pointer border border-slate-200"
                            >
                                <FileText size={14} className="text-slate-400" />
                                <span>{lang === 'sv' ? "Huvudmapp (Ingen mapp)" : "Root (No Folder)"}</span>
                            </button>

                            {/* List of user folders */}
                            {folders.map(folder => (
                                <button
                                    key={folder.id}
                                    type="button"
                                    onClick={() => handleMoveToFolder(folder.id)}
                                    className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100 transition-colors flex items-center gap-2 cursor-pointer border border-indigo-100"
                                >
                                    <Layers size={14} className="text-indigo-600" />
                                    <span className="truncate">{folder.name}</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-end">
                            <button 
                                type="button"
                                onClick={() => setShowMoveModal(null)} 
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                            >
                                {lang === 'sv' ? "Avbryt" : "Cancel"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            

            {/* 🟢 STUDIO TUTORIAL MODAL EMBEDDED DIRECTLY IN LIBRARY */}
            <StudioTutorialModal
                isOpen={showTutorial}
                onClose={handleCloseTutorial}
                lang={lang}
            />
        </div>
    );
}