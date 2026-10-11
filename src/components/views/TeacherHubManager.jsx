import React, { useState, useEffect, useMemo } from 'react';
import { 
    Plus, Star, Eye, EyeOff, Copy, Trash2, 
    Calendar as CalendarIcon, FolderOpen, Layers, Loader2,
    ChevronDown, ChevronUp, Folder, X, Check, Edit2, ChevronLeft, ChevronRight, GripVertical
} from 'lucide-react';
import ContentModal from '../modals/ContentModal'; 
import { supabase } from '../../lib/supabaseClient';

export default function TeacherHubManager({ lang = 'sv', teacherId }) {
    const [buckets, setBuckets] = useState([]);
    const [activeTab, setActiveTab] = useState('active'); 
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [collapsedFolders, setCollapsedFolders] = useState({});

    // --- Smart Folder State ---
    const [selectedFolder, setSelectedFolder] = useState('Okategoriserad');
    const [isAddingNewFolder, setIsAddingNewFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    
    // --- Folder Renaming & Reordering
    const [editingFolderId, setEditingFolderId] = useState(null);
    const [editFolderValue, setEditFolderValue] = useState('');
    const [folderOrder, setFolderOrder] = useState([]); 

    // --- Bucket Creation State ---
    const [newBucketName, setNewBucketName] = useState('');
    const [newBucketColor, setNewBucketColor] = useState('indigo');
    
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    const [newBucketDate, setNewBucketDate] = useState(defaultDate.toISOString().split('T')[0]); 

    // --- Content Selection State ---
    const [isContentModalOpen, setIsContentModalOpen] = useState(false);
    const [editingBucketId, setEditingBucketId] = useState(null);

    // --- Inline Editing State ---
    const [editingTitleId, setEditingTitleId] = useState(null);
    const [editTitleValue, setEditTitleValue] = useState('');
    const [editingDateId, setEditingDateId] = useState(null);
    const [editDateValue, setEditDateValue] = useState('');

    const themeColors = [
        { id: 'indigo', hex: 'bg-indigo-500' },
        { id: 'rose', hex: 'bg-rose-500' },
        { id: 'emerald', hex: 'bg-emerald-500' },
        { id: 'amber', hex: 'bg-amber-500' },
        { id: 'cyan', hex: 'bg-cyan-500' }
    ];

    const existingFolders = useMemo(() => {
        const folders = new Set(buckets.map(b => b.folder || 'Okategoriserad'));
        return Array.from(folders).sort();
    }, [buckets]);

    useEffect(() => {
        if (existingFolders.length > 0 && !existingFolders.includes(selectedFolder) && !isAddingNewFolder) {
            setSelectedFolder(existingFolders[0]);
        }
    }, [existingFolders, selectedFolder, isAddingNewFolder]);

    useEffect(() => {
        if (!teacherId) return;
        const fetchBuckets = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase.from('teacher_buckets').select('*').eq('teacher_id', teacherId).order('created_at', { ascending: false });
                if (error) throw error;
                const fetchedBuckets = (data || []).map(b => ({ ...b, folder: b.folder || 'Okategoriserad' }));
                setBuckets(fetchedBuckets);

                const { data: profileData } = await supabase.from('profiles').select('folder_order').eq('id', teacherId).single();
                if (profileData && profileData.folder_order) {
                    setFolderOrder(profileData.folder_order);
                }
            } catch (err) { console.error("Error fetching buckets:", err); } 
            finally { setIsLoading(false); }
        };
        fetchBuckets();
    }, [teacherId]);

    // --- Folder Management Handlers ---
    const startEditingFolder = (e, folderName) => {
        e.stopPropagation();
        setEditingFolderId(folderName);
        setEditFolderValue(folderName);
    };

    const saveFolderEdit = async (oldName) => {
        if (!editFolderValue.trim() || editFolderValue === oldName) {
            setEditingFolderId(null);
            return;
        }
        const newName = editFolderValue.trim();
        
        setBuckets(prev => prev.map(b => b.folder === oldName ? { ...b, folder: newName } : b));
        
        const newOrder = folderOrder.map(f => f === oldName ? newName : f);
        if (!newOrder.includes(newName)) newOrder.push(newName);
        setFolderOrder(newOrder);

        try {
            await supabase.from('teacher_buckets').update({ folder: newName }).eq('teacher_id', teacherId).eq('folder', oldName);
            await supabase.from('profiles').update({ folder_order: newOrder }).eq('id', teacherId);
        } catch (err) { console.error("Error renaming folder:", err); }
        
        setEditingFolderId(null);
    };

    const moveFolder = async (folderName, direction, e) => {
        e.stopPropagation();
        
        let currentOrder = [...folderOrder];
        existingFolders.forEach(f => {
            if (!currentOrder.includes(f)) currentOrder.push(f);
        });

        const currentIndex = currentOrder.indexOf(folderName);
        if (currentIndex === -1) return;

        const targetIndex = currentIndex + direction;
        if (targetIndex < 0 || targetIndex >= currentOrder.length) return;

        const newOrder = [...currentOrder];
        const temp = newOrder[currentIndex];
        newOrder[currentIndex] = newOrder[targetIndex];
        newOrder[targetIndex] = temp;

        setFolderOrder(newOrder);

        try {
            await supabase.from('profiles').update({ folder_order: newOrder }).eq('id', teacherId);
        } catch (err) { console.error("Error saving folder order:", err); }
    };

    const handleCreateBucket = async () => {
        if (!newBucketName.trim() || !teacherId) return;
        const finalFolderName = isAddingNewFolder ? newFolderName.trim() : selectedFolder;
        if (isAddingNewFolder && !finalFolderName) return alert(lang === 'sv' ? "Mappens namn kan inte vara tomt." : "Folder name cannot be empty.");

        setIsSaving(true);
        const end = new Date(newBucketDate);
        end.setHours(23, 59, 59, 999); 

        const newBucket = { teacher_id: teacherId, folder: finalFolderName || 'Okategoriserad', name: newBucketName.trim(), color: newBucketColor, is_focused: false, is_visible: true, expires_at: end.toISOString(), payload: [] };

        try {
            const { data, error } = await supabase.from('teacher_buckets').insert([newBucket]).select().single();
            if (error) throw error;
            setBuckets([data, ...buckets]);
            setNewBucketName('');
            if (isAddingNewFolder) { setIsAddingNewFolder(false); setSelectedFolder(finalFolderName); setNewFolderName(''); }
            setCollapsedFolders(prev => ({ ...prev, [finalFolderName]: false }));
            
            if (isAddingNewFolder && !folderOrder.includes(finalFolderName)) {
                const newOrder = [finalFolderName, ...folderOrder];
                setFolderOrder(newOrder);
                supabase.from('profiles').update({ folder_order: newOrder }).eq('id', teacherId).then();
            }
        } catch (err) { alert("Kunde inte skapa gruppen."); } 
        finally { setIsSaving(false); }
    };

    const startEditingTitle = (bucket) => { setEditingTitleId(bucket.id); setEditTitleValue(bucket.name); };
    const saveTitleEdit = async (id) => {
        if (!editTitleValue.trim()) return setEditingTitleId(null);
        try {
            await supabase.from('teacher_buckets').update({ name: editTitleValue.trim() }).eq('id', id);
            setBuckets(prev => prev.map(b => b.id === id ? { ...b, name: editTitleValue.trim() } : b));
        } catch (err) { console.error("Error updating title:", err); }
        setEditingTitleId(null);
    };

    const startEditingDate = (bucket) => { setEditingDateId(bucket.id); setEditDateValue(bucket.expires_at.split('T')[0]); };
    const saveDateEdit = async (id) => {
        if (!editDateValue) return setEditingDateId(null);
        try {
            const end = new Date(editDateValue); end.setHours(23, 59, 59, 999);
            const newIso = end.toISOString();
            await supabase.from('teacher_buckets').update({ expires_at: newIso }).eq('id', id);
            setBuckets(prev => prev.map(b => b.id === id ? { ...b, expires_at: newIso } : b));
        } catch (err) { console.error("Error updating date:", err); }
        setEditingDateId(null);
    };

    const toggleFocus = async (id) => { 
        const target = buckets.find(b => b.id === id);
        if (!target) return;
        const newValue = !target.is_focused;
        setBuckets(prev => prev.map(b => b.id === id ? { ...b, is_focused: newValue } : b));
        try { await supabase.from('teacher_buckets').update({ is_focused: newValue }).eq('id', id); } catch (err) { }
    };

    const toggleVisibility = async (id) => { 
        const target = buckets.find(b => b.id === id);
        if (!target) return;
        const newValue = !target.is_visible;
        setBuckets(prev => prev.map(b => b.id === id ? { ...b, is_visible: newValue } : b));
        try { await supabase.from('teacher_buckets').update({ is_visible: newValue }).eq('id', id); } catch (err) {}
    };

    const toggleFolderVisibility = async (folderName, folderBuckets) => { 
        const isAnyVisible = folderBuckets.some(b => b.is_visible);
        const newVisibility = !isAnyVisible;
        setBuckets(prev => prev.map(b => b.folder === folderName ? { ...b, is_visible: newVisibility } : b));
        try { await supabase.from('teacher_buckets').update({ is_visible: newVisibility }).eq('teacher_id', teacherId).eq('folder', folderName); } catch (err) {}
    };

    const duplicateBucket = async (bucket) => { 
        const end = new Date(); end.setDate(end.getDate() + 7); 
        const clonedBucket = { teacher_id: teacherId, folder: bucket.folder, name: `${bucket.name} (Kopia)`, color: bucket.color, is_focused: false, is_visible: false, expires_at: end.toISOString(), payload: bucket.payload || [] };
        try {
            const { data, error } = await supabase.from('teacher_buckets').insert([clonedBucket]).select().single();
            if (error) throw error;
            setBuckets([data, ...buckets]); setActiveTab('active'); 
        } catch (err) {}
    };

    const deleteBucket = async (id) => { 
        if (!window.confirm(lang === 'sv' ? 'Är du säker på att du vill radera denna grupp?' : 'Are you sure you want to delete this group?')) return;
        setBuckets(prev => prev.filter(b => b.id !== id));
        try { await supabase.from('teacher_buckets').delete().eq('id', id); } catch (err) {}
    };

    const openContentSelector = (id) => { setEditingBucketId(id); setIsContentModalOpen(true); };
    const handleToggleItem = (topicId, level) => { 
        setBuckets(prev => prev.map(b => {
            if (b.id !== editingBucketId) return b;
            const exists = b.payload.some(item => item.topic === topicId && item.level === level);
            const newPayload = exists ? b.payload.filter(item => !(item.topic === topicId && item.level === level)) : [...b.payload, { topic: topicId, level }];
            return { ...b, payload: newPayload };
        }));
    };
    const handleCloseModal = async () => { 
        setIsContentModalOpen(false);
        if (editingBucketId) {
            const bucketToSave = buckets.find(b => b.id === editingBucketId);
            if (bucketToSave) { try { await supabase.from('teacher_buckets').update({ payload: bucketToSave.payload }).eq('id', editingBucketId); } catch (err) {} }
            setEditingBucketId(null);
        }
    };

    const now = new Date();
    const activeBuckets = buckets.filter(b => new Date(b.expires_at) > now);
    const archivedBuckets = buckets.filter(b => new Date(b.expires_at) <= now);
    const displayBuckets = activeTab === 'active' ? activeBuckets : archivedBuckets;
    
    const groupedBuckets = displayBuckets.reduce((acc, bucket) => {
        const f = bucket.folder; if (!acc[f]) acc[f] = []; acc[f].push(bucket); return acc;
    }, {});

    const sortedFolderNames = Object.keys(groupedBuckets).sort((a, b) => {
        const indexA = folderOrder.indexOf(a);
        const indexB = folderOrder.indexOf(b);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
    });

    const editingBucket = buckets.find(b => b.id === editingBucketId);
    const todayStr = new Date().toISOString().split('T')[0]; 

    if (isLoading) return <div className="w-full flex justify-center py-20"><Loader2 className="animate-spin text-[var(--brand-solid)]" size={32} /></div>;

    return (
        <div className="w-full max-w-5xl mx-auto font-sans animate-in fade-in">
            
            {/* Header & Creation Strip */}
            <div className="bg-[var(--bg-card)] rounded-3xl p-6 shadow-sm border border-[var(--border-main)] mb-6 transition-colors">
                <h2 className="text-xl font-black uppercase italic tracking-tight text-[var(--text-main)] mb-4">
                    {lang === 'sv' ? "Grupper & Områden" : "Groups & Topics"}
                </h2>
                
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    
                    <div className="w-full md:w-1/4">
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block mb-1">
                            {lang === 'sv' ? "Mapp" : "Folder"}
                        </label>
                        {isAddingNewFolder ? (
                            <div className="relative">
                                <input 
                                    type="text" autoFocus value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder={lang === 'sv' ? "Nytt mappnamn..." : "New folder name..."}
                                    className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-strong)] focus:border-[var(--brand-solid)] rounded-xl pl-4 pr-10 py-[10px] font-bold text-[var(--text-main)] outline-none transition-all h-[46px]" maxLength={30}
                                />
                                <button onClick={() => { setIsAddingNewFolder(false); setNewFolderName(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--theme-rose-text)]">
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <select
                                value={selectedFolder} onChange={(e) => { if (e.target.value === 'CREATE_NEW') setIsAddingNewFolder(true); else setSelectedFolder(e.target.value); }}
                                className="w-full bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl px-4 py-3 font-bold text-[var(--text-main)] outline-none focus:border-[var(--border-strong)] cursor-pointer h-[46px] appearance-none"
                            >
                                {existingFolders.map(folder => (<option key={folder} value={folder}>{folder}</option>))}
                                <option value="CREATE_NEW" className="text-[var(--brand-solid)]">+ {lang === 'sv' ? "Skapa ny mapp" : "Create new folder"}</option>
                            </select>
                        )}
                    </div>

                    <div className="flex-1 w-full">
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block mb-1">
                            {lang === 'sv' ? "Gruppens namn" : "Group Name"}
                        </label>
                        <input 
                            type="text" value={newBucketName} onChange={(e) => setNewBucketName(e.target.value)} placeholder={lang === 'sv' ? "t.ex. Geometri: Area" : "e.g. Geometry: Area"}
                            className="w-full bg-[var(--bg-surface)] border border-[var(--border-main)] focus:border-[var(--border-strong)] rounded-xl px-4 py-[10px] font-bold text-[var(--text-main)] outline-none transition-all h-[46px]" maxLength={40}
                        />
                    </div>
                    
                    <div>
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block mb-1">
                            {lang === 'sv' ? "Färgtema" : "Theme Color"}
                        </label>
                        <div className="flex gap-2 p-1.5 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl h-[46px] items-center">
                            {themeColors.map(color => (
                                <button key={color.id} onClick={() => setNewBucketColor(color.id)} className={`w-8 h-8 rounded-lg ${color.hex} border-2 transition-all ${newBucketColor === color.id ? 'border-[var(--text-main)] scale-110 shadow-sm' : 'border-transparent hover:scale-105'}`} />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block mb-1">
                            {lang === 'sv' ? "Slutdatum" : "End Date"}
                        </label>
                        <input 
                            type="date" min={todayStr} value={newBucketDate} onChange={(e) => setNewBucketDate(e.target.value)}
                            className="w-36 bg-[var(--bg-surface)] border border-[var(--border-main)] focus:border-[var(--border-strong)] rounded-xl px-3 py-[10px] font-bold text-[var(--text-main)] outline-none transition-all h-[46px] cursor-pointer"
                        />
                    </div>

                    <button 
                        onClick={handleCreateBucket} disabled={!newBucketName.trim() || isSaving || (isAddingNewFolder && !newFolderName.trim())}
                        className="h-[46px] px-6 bg-[var(--text-main)] text-[var(--bg-canvas)] rounded-xl font-black uppercase tracking-widest text-[11px] hover:opacity-80 transition-all disabled:opacity-30 shadow-sm flex items-center gap-2"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} 
                        {lang === 'sv' ? "Skapa" : "Create"}
                    </button>
                </div>
            </div>

            {/* High-Contrast Toggle Tabs */}
            <div className="flex gap-2 mb-4">
                <button onClick={() => setActiveTab('active')} className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'active' ? 'bg-[var(--text-main)] text-[var(--bg-canvas)] shadow-md' : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)] border border-transparent'}`}>
                    {lang === 'sv' ? `Aktiva (${activeBuckets.length})` : `Active (${activeBuckets.length})`}
                </button>
                <button onClick={() => setActiveTab('archive')} className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'archive' ? 'bg-[var(--text-main)] text-[var(--bg-canvas)] shadow-md' : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)] border border-transparent'}`}>
                    {lang === 'sv' ? `Arkiv (${archivedBuckets.length})` : `Archive (${archivedBuckets.length})`}
                </button>
            </div>

            {/* Grouped Bucket List */}
            <div className="space-y-6">
                {sortedFolderNames.length === 0 ? (
                    <div className="py-12 text-center border-2 border-dashed border-[var(--border-main)] rounded-3xl bg-[var(--bg-surface)]">
                        <FolderOpen size={32} className="mx-auto text-[var(--text-muted)] opacity-50 mb-3" />
                        <p className="text-[var(--text-muted)] font-bold text-sm">
                            {activeTab === 'active' ? (lang === 'sv' ? "Du har inga aktiva grupper just nu." : "You have no active groups right now.") : (lang === 'sv' ? "Arkivet är tomt." : "The archive is empty.")}
                        </p>
                    </div>
                ) : (
                    sortedFolderNames.map((folderName, index) => {
                        const folderBuckets = groupedBuckets[folderName];
                        const isCollapsed = collapsedFolders[folderName];
                        const isFolderVisible = folderBuckets.some(b => b.is_visible);
                        
                        return (
                            <div key={folderName} className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-main)] shadow-sm overflow-hidden transition-colors">
                                
                                {/* Folder Header with Edit & Order Tools */}
                                <div className="bg-[var(--bg-surface)] px-3 sm:px-5 py-4 border-b border-[var(--border-main)] flex items-center justify-between group">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <button onClick={() => setCollapsedFolders(prev => ({ ...prev, [folderName]: !prev[folderName] }))} className="p-1 hover:bg-[var(--bg-surface-hover)] rounded-md text-[var(--text-main)]">
                                            {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                                        </button>
                                        <Folder size={18} className="opacity-50 text-[var(--text-main)] shrink-0" />
                                        
                                        {/* Inline Folder Rename */}
                                        {editingFolderId === folderName ? (
                                            <div className="flex items-center gap-2 flex-1 max-w-sm mr-4">
                                                <input 
                                                    autoFocus type="text" value={editFolderValue} onChange={(e) => setEditFolderValue(e.target.value)}
                                                    onBlur={() => saveFolderEdit(folderName)} onKeyDown={(e) => { if (e.key === 'Enter') saveFolderEdit(folderName); if (e.key === 'Escape') setEditingFolderId(null); }}
                                                    className="flex-1 bg-[var(--bg-card)] border-2 border-[var(--border-strong)] text-[var(--text-main)] rounded-lg px-3 py-1.5 text-sm font-black uppercase tracking-widest outline-none shadow-inner"
                                                />
                                                <button onMouseDown={(e) => { e.preventDefault(); saveFolderEdit(folderName); }} className="p-1.5 bg-[var(--text-main)] text-[var(--bg-canvas)] rounded hover:opacity-80"><Check size={16}/></button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 cursor-pointer flex-1 min-w-0" onClick={(e) => startEditingFolder(e, folderName)}>
                                                <h3 className="font-black text-sm uppercase tracking-widest text-[var(--text-main)] hover:text-[var(--text-muted)] transition-colors truncate">{folderName}</h3>
                                                <Edit2 size={12} className="opacity-0 group-hover:opacity-50 text-[var(--text-muted)] transition-opacity shrink-0" />
                                            </div>
                                        )}
                                        
                                        <span className="text-[10px] font-bold bg-[var(--border-main)] text-[var(--text-muted)] px-2 py-0.5 rounded-full shrink-0">{folderBuckets.length}</span>
                                    </div>

                                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                                        {/* Reorder Arrows */}
                                        <div className="flex items-center bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg overflow-hidden shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button disabled={index === 0} onClick={(e) => moveFolder(folderName, -1, e)} className="p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)] disabled:opacity-30 disabled:cursor-not-allowed border-r border-[var(--border-main)]">
                                                <ChevronUp size={14} />
                                            </button>
                                            <button disabled={index === sortedFolderNames.length - 1} onClick={(e) => moveFolder(folderName, 1, e)} className="p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)] disabled:opacity-30 disabled:cursor-not-allowed">
                                                <ChevronDown size={14} />
                                            </button>
                                        </div>

                                        {activeTab === 'active' && (
                                            <button onClick={() => toggleFolderVisibility(folderName, folderBuckets)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!isFolderVisible ? 'bg-[var(--bg-surface-hover)] text-[var(--text-muted)] shadow-inner' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--bg-surface)] border border-[var(--border-main)] shadow-sm'}`}>
                                                {isFolderVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                                                <span className="hidden sm:inline-block">{lang === 'sv' ? "Synlighet" : "Visibility"}</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Folder Contents */}
                                {!isCollapsed && (
                                    <div className="p-4 space-y-3 bg-[var(--bg-surface)] opacity-95">
                                        {folderBuckets.map(bucket => {
                                            const isExpired = new Date(bucket.expires_at) <= now;
                                            const daysLeft = Math.ceil((new Date(bucket.expires_at) - now) / (1000 * 60 * 60 * 24));

                                            return (
                                                // 🟢 VITAL FIX: We assign theme-{bucket.color} directly to the wrapper so all brand variables resolve flawlessly!
                                                <div key={bucket.id} className={`theme-${bucket.color || 'indigo'} bg-[var(--bg-card)] border-2 rounded-2xl p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4 transition-all shadow-sm ${bucket.is_focused ? 'border-[var(--brand-solid)] shadow-md' : 'border-[var(--border-subtle)] hover:border-[var(--border-main)]'}`}>
                                                    
                                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner transition-colors ${isExpired ? 'bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-muted)]' : 'bg-[var(--brand-solid)] text-white'} ${!bucket.is_visible && !isExpired ? 'opacity-50' : ''}`}>
                                                            <Layers size={20} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                                
                                                                {/* Inline Title Editor */}
                                                                {editingTitleId === bucket.id ? (
                                                                    <div className="flex items-center gap-2 w-full max-w-sm">
                                                                        <input 
                                                                            autoFocus type="text" value={editTitleValue} onChange={(e) => setEditTitleValue(e.target.value)}
                                                                            onBlur={() => saveTitleEdit(bucket.id)} onKeyDown={(e) => { if (e.key === 'Enter') saveTitleEdit(bucket.id); if (e.key === 'Escape') setEditingTitleId(null); }}
                                                                            className="flex-1 bg-[var(--bg-surface)] border-2 border-[var(--brand-border)] focus:border-[var(--brand-solid)] text-[var(--text-main)] rounded-lg px-3 py-1.5 text-base font-black outline-none transition-all shadow-inner"
                                                                        />
                                                                        <button onMouseDown={(e) => { e.preventDefault(); saveTitleEdit(bucket.id); }} className="p-2 bg-[var(--brand-bg)] text-[var(--brand-solid)] border border-[var(--brand-border)] rounded-lg hover:bg-[var(--brand-solid)] hover:text-white transition-colors"><Check size={16}/></button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => startEditingTitle(bucket)}>
                                                                        <h4 className={`text-base font-black tracking-tight truncate ${!bucket.is_visible ? 'text-[var(--text-muted)] line-through decoration-2' : 'text-[var(--text-main)] group-hover:text-[var(--brand-text)] transition-colors'}`}>
                                                                            {bucket.name}
                                                                        </h4>
                                                                        <Edit2 size={12} className="opacity-0 group-hover:opacity-50 text-[var(--text-muted)] transition-opacity" />
                                                                    </div>
                                                                )}

                                                                {bucket.is_focused && !isExpired && (
                                                                    <span className="theme-amber bg-[var(--brand-bg)] text-[var(--brand-solid)] border border-[var(--brand-border)] text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                                                                        <Star size={10} fill="currentColor" /> {lang === 'sv' ? "Dagens Fokus" : "Today's Focus"}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center gap-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex-wrap">
                                                                {/* Inline Date Editor */}
                                                                {editingDateId === bucket.id ? (
                                                                     <div className="flex items-center gap-2">
                                                                        <input 
                                                                            autoFocus type="date" value={editDateValue} onChange={(e) => setEditDateValue(e.target.value)}
                                                                            onBlur={() => saveDateEdit(bucket.id)} onKeyDown={(e) => { if (e.key === 'Enter') saveDateEdit(bucket.id); if (e.key === 'Escape') setEditingDateId(null); }}
                                                                            className="bg-[var(--bg-surface)] border-2 border-[var(--brand-border)] focus:border-[var(--brand-solid)] text-[var(--text-main)] rounded-lg px-2 py-1 outline-none transition-all shadow-inner"
                                                                        />
                                                                        <button onMouseDown={(e) => { e.preventDefault(); saveDateEdit(bucket.id); }} className="p-1.5 bg-[var(--brand-bg)] text-[var(--brand-solid)] border border-[var(--brand-border)] rounded-lg hover:bg-[var(--brand-solid)] hover:text-white transition-colors"><Check size={14}/></button>
                                                                    </div>
                                                                ) : (
                                                                    <span className="flex items-center gap-1 group cursor-pointer hover:text-[var(--text-main)] transition-colors" onClick={() => startEditingDate(bucket)}>
                                                                        <CalendarIcon size={12} /> 
                                                                        {isExpired ? (lang === 'sv' ? "Utgånget" : "Expired") : (lang === 'sv' ? `${daysLeft} dagar kvar` : `${daysLeft} days left`)}
                                                                        <Edit2 size={10} className="opacity-0 group-hover:opacity-50 ml-1" />
                                                                    </span>
                                                                )}
                                                                <span>•</span>
                                                                <span>{(bucket.payload || []).length} {lang === 'sv' ? "valda nivåer" : "levels selected"}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Right Side: Controls */}
                                                    <div className="flex items-center gap-2 bg-[var(--bg-surface)] p-1.5 rounded-xl border border-[var(--border-main)] shrink-0 w-full xl:w-auto overflow-x-auto custom-scrollbar">
                                                        {!isExpired ? (
                                                            <>
                                                                <button onClick={() => openContentSelector(bucket.id)} className="flex-1 xl:flex-none px-4 py-2 bg-[var(--bg-card)] hover:bg-[var(--brand-bg)] text-[var(--brand-solid)] border border-[var(--border-main)] hover:border-[var(--brand-border)] rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-sm whitespace-nowrap text-center">
                                                                    {lang === 'sv' ? "Ändra Innehåll" : "Edit Content"}
                                                                </button>
                                                                <div className="w-px h-6 bg-[var(--border-strong)] mx-1" />
                                                                <button onClick={() => toggleFocus(bucket.id)} className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-lg transition-all ${bucket.is_focused ? 'theme-amber bg-[var(--brand-bg)] text-[var(--brand-solid)] border border-[var(--brand-border)] shadow-inner' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-main)] border border-[var(--border-main)]'}`} title={lang === 'sv' ? "Markera som Dagens Fokus" : "Mark as Today's Focus"}>
                                                                    <Star size={16} fill={bucket.is_focused ? "currentColor" : "none"} />
                                                                </button>
                                                                <button onClick={() => toggleVisibility(bucket.id)} className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-lg transition-all ${!bucket.is_visible ? 'bg-[var(--bg-surface-hover)] text-[var(--text-muted)] shadow-inner border border-[var(--border-main)]' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)] border border-[var(--border-main)] shadow-sm'}`} title={lang === 'sv' ? "Dölj/Visa för elever" : "Hide/Show for students"}>
                                                                    {bucket.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button onClick={() => duplicateBucket(bucket)} className="flex-1 xl:flex-none px-4 py-2 bg-[var(--bg-card)] hover:bg-[var(--brand-bg)] text-[var(--brand-solid)] border border-[var(--border-main)] hover:border-[var(--brand-border)] rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 whitespace-nowrap">
                                                                <Copy size={14} /> {lang === 'sv' ? "Återanvänd (Kopiera)" : "Reuse (Duplicate)"}
                                                            </button>
                                                        )}
                                                        <div className="w-px h-6 bg-[var(--border-strong)] mx-1 shrink-0" />
                                                        <button onClick={() => deleteBucket(bucket.id)} className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--theme-rose-bg)] hover:text-[var(--theme-rose-text)] hover:border-[var(--theme-rose-border)] border border-[var(--border-main)] transition-all" title={lang === 'sv' ? "Radera" : "Delete"}>
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <ContentModal 
                visible={isContentModalOpen} 
                onClose={handleCloseModal}
                lang={lang}
                selectionMode={true}
                selectedItems={editingBucket ? editingBucket.payload : []}
                onToggleItem={handleToggleItem}
            />
        </div>
    );
}