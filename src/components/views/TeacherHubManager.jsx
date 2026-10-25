import React, { useState, useEffect, useMemo } from 'react';
import { 
    Plus, Star, Eye, EyeOff, Copy, Trash2, 
    Calendar as CalendarIcon, FolderOpen, Layers, Loader2,
    ChevronDown, ChevronUp, Folder, X, Check, Edit2, 
    ChevronLeft, ChevronRight, BookOpen, Target, ArrowUp, ArrowDown,
    Bookmark, SplitSquareVertical, Beaker
} from 'lucide-react';
import ContentModal from '../modals/ContentModal'; 
import { supabase } from '../../lib/supabaseClient';
import SheetLibraryModal from '../modals/SheetLibraryModal';
import { CONTENT_MAP } from '../../constants/content_map.generated';
import MathDisplay from '../shared/MathDisplay';
import { CATEGORIES, LEVEL_DESCRIPTIONS } from '../../constants/localization';
import CheckpointModal from '../modals/CheckpointModal';

//  Helper to get localized topic names
const getTopicName = (topicId, lang = 'sv') => {
    if (!topicId) return "";
    for (const catKey in CATEGORIES) {
        const found = CATEGORIES[catKey]?.topics?.find(t => t.id === topicId);
        if (found) return found.label[lang] || found.label.sv || topicId;
    }
    return topicId.replace(/_/g, ' ');
};

const getLevelMetadata = (topicId, level, lang = 'sv') => {
    if (!topicId || level === undefined || level === null) {
        return { description: "", mathExample: "" };
    }

    // Defensive check ensuring LEVEL_DESCRIPTIONS exists and doesn't throw
    const descriptionsObj = typeof LEVEL_DESCRIPTIONS !== 'undefined' ? LEVEL_DESCRIPTIONS : {};
    const topicDesc = descriptionsObj[topicId]?.[level];
    const description = typeof topicDesc === 'object' 
        ? (topicDesc[lang] || topicDesc.sv || "") 
        : (topicDesc || "");

    let mathExample = "";
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

//  Normalizer: Converts any flat legacy payload into our structured "Del / Part" array
export const normalizePartsPayload = (rawPayload = [], lang = 'sv') => {
    if (!Array.isArray(rawPayload) || rawPayload.length === 0) return [];

    // If it's already using the structured "part / section" schema:
    if (rawPayload[0]?.type === 'part' || rawPayload[0]?.type === 'section') {
        return rawPayload.map((part, pIdx) => ({
            ...part,
            type: 'part',
            id: part.id || `part_${pIdx}_${Date.now()}`,
            title: part.title || `${lang === 'sv' ? 'Del' : 'Part'} ${pIdx + 1}`,
            steps: Array.isArray(part.steps) ? part.steps : []
        }));
    }

    // Auto-Group legacy flat array by topic (Option A default)
    const grouped = {};
    const parts = [];

    rawPayload.forEach((item, idx) => {
        const topic = item.topic || item.topicId || 'generic';
        if (!grouped[topic]) {
            const partIndex = parts.length + 1;
            const topicLabel = getTopicName(topic, lang);
            const partTitle = `${lang === 'sv' ? 'Del' : 'Part'} ${partIndex}: ${topicLabel}`;

            // In normalizePartsPayload:
            const newPart = {
                id: `part_${topic}_${Date.now()}_${idx}`,
                type: 'part',
                topicId: topic,
                customTitle: null, //  No hardcoded "Del" or "Part"
                steps: []
            };
            grouped[topic] = newPart;
            parts.push(newPart);
        }

        grouped[topic].steps.push({
            id: item.id || `step_${idx}_${Date.now()}`,
            type: item.type || (item.sheetId ? 'instruction' : 'practice'),
            ...item
        });
    });

    return parts;
};

export default function TeacherHubManager({ lang = 'sv', teacherId }) {
    const [buckets, setBuckets] = useState([]);
    const [activeTab, setActiveTab] = useState('active'); 
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [collapsedFolders, setCollapsedFolders] = useState({});

    // --- Sequencer & Instructional Presentations State ---
    const [isInstructionPickerOpen, setIsInstructionPickerOpen] = useState(false);
    const [targetPartContext, setTargetPartContext] = useState(null); // { bucketId, partId }
    const [expandedSequencerBucketId, setExpandedSequencerBucketId] = useState(null);

    //  NEW: Checkpoint Modal State
    const [isCheckpointModalOpen, setIsCheckpointModalOpen] = useState(false);

    // --- Inline Part Title Editing ---
    const [editingPartId, setEditingPartId] = useState(null);
    const [editPartTitleValue, setEditPartTitleValue] = useState('');

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
    const [activeContentModalBucketId, setActiveContentModalBucketId] = useState(null);

    // --- Inline Bucket Title / Date Editing ---
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
                const { data, error } = await supabase
                    .from('teacher_buckets')
                    .select('*')
                    .eq('teacher_id', teacherId)
                    .order('created_at', { ascending: false });
                    
                if (error) throw error;
                const fetchedBuckets = (data || []).map(b => ({
                    ...b,
                    folder: b.folder || 'Okategoriserad',
                    payload: normalizePartsPayload(b.payload, lang)
                }));
                setBuckets(fetchedBuckets);

                const { data: profileData } = await supabase.from('profiles').select('folder_order').eq('id', teacherId).single();
                if (profileData && profileData.folder_order) {
                    setFolderOrder(profileData.folder_order);
                }
            } catch (err) { console.error("Error fetching buckets:", err); } 
            finally { setIsLoading(false); }
        };
        fetchBuckets();
    }, [teacherId, lang]);

    const getPartDisplayTitle = (part, partIndex, lang = 'sv') => {
        // 1. If teacher manually renamed this specific part, honor their custom text
        if (part.customTitle && part.customTitle.trim()) {
            return part.customTitle;
        }

        // 2. Otherwise, construct it dynamically using the active language
        const prefix = lang === 'sv' ? 'Del' : 'Part';
        const topicLabel = getTopicName(part.topicId, lang);

        if (topicLabel) {
            return `${prefix} ${partIndex + 1}: ${topicLabel}`;
        }

        return `${prefix} ${partIndex + 1}`;
    };

    // Save full parts array of a bucket to Supabase
    const persistBucketPayload = async (bucketId, newParts) => {
        setBuckets(prev => prev.map(b => b.id === bucketId ? { ...b, payload: newParts } : b));
        try {
            await supabase.from('teacher_buckets').update({ payload: newParts }).eq('id', bucketId);
        } catch (err) {
            console.error("Error persisting bucket payload:", err);
        }
    };

    //  Insert an instruction presentation into a specific "Del"
    const handleAddInstructionSlideToPart = async (bucketId, partId, sheet) => {
        const bucket = buckets.find(b => b.id === bucketId);
        if (!bucket) return;

        const slides = sheet.packet?.slides || [];
        const firstInstructionSlideIdx = slides.findIndex(s => s.layout === 'instruction_template');
        const slideIdx = firstInstructionSlideIdx !== -1 ? firstInstructionSlideIdx : 0;
        const targetSlide = slides[slideIdx];

        const newStep = {
            id: `step_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            type: 'instruction',
            sheetId: sheet.id,
            sheetTitle: sheet.title || (lang === 'sv' ? "Namnlös genomgång" : "Untitled Walkthrough"),
            slideIndex: slideIdx,
            slideData: targetSlide
        };

        const updatedParts = (bucket.payload || []).map(part => {
            if (part.id !== partId) return part;
            return {
                ...part,
                steps: [...part.steps, newStep]
            };
        });

        await persistBucketPayload(bucketId, updatedParts);
    };

    //  Insert a TestLab checkpoint step into a specific "Del"
    const handleAddCheckpointToPart = async (bucketId, partId, checkpointData) => {
        const bucket = buckets.find(b => b.id === bucketId);
        if (!bucket) return;

        const updatedParts = (bucket.payload || []).map(part => {
            if (part.id !== partId) return part;
            return {
                ...part,
                steps: [...part.steps, checkpointData]
            };
        });

        await persistBucketPayload(bucketId, updatedParts);
    };

    //  Reorder steps strictly inside a "Del"
    const moveStepInsidePart = async (bucketId, partId, stepIndex, direction) => {
        const bucket = buckets.find(b => b.id === bucketId);
        if (!bucket) return;

        const updatedParts = (bucket.payload || []).map(part => {
            if (part.id !== partId) return part;
            const targetIdx = stepIndex + direction;
            if (targetIdx < 0 || targetIdx >= part.steps.length) return part;

            const newSteps = [...part.steps];
            const [moved] = newSteps.splice(stepIndex, 1);
            newSteps.splice(targetIdx, 0, moved);

            return { ...part, steps: newSteps };
        });

        await persistBucketPayload(bucketId, updatedParts);
    };

    //  Remove a step from a "Del"
    const removeStepFromPart = async (bucketId, partId, stepIndex) => {
        const bucket = buckets.find(b => b.id === bucketId);
        if (!bucket) return;

        const updatedParts = (bucket.payload || []).map(part => {
            if (part.id !== partId) return part;
            return {
                ...part,
                steps: part.steps.filter((_, idx) => idx !== stepIndex)
            };
        });

        await persistBucketPayload(bucketId, updatedParts);
    };

    //  Add a new custom "Del" (Part) to the unit
    const handleAddNewPart = async (bucketId) => {
        const bucket = buckets.find(b => b.id === bucketId);
        if (!bucket) return;

        const currentParts = bucket.payload || [];
        const nextPartNumber = currentParts.length + 1;
        const newPart = {
            id: `part_custom_${Date.now()}`,
            type: 'part',
            topicId: null,
            customTitle: null, // Renders dynamically as "Del X" / "Part X"
            steps: []
        };

        const updatedParts = [...currentParts, newPart];
        await persistBucketPayload(bucketId, updatedParts);
    };

    //  Save custom title for a "Del"
    const savePartTitleEdit = async (bucketId, partId) => {
    const bucket = buckets.find(b => b.id === bucketId);
        if (!bucket) return;

        const trimmed = editPartTitleValue.trim();

        const updatedParts = (bucket.payload || []).map(part => {
            if (part.id !== partId) return part;
            return {
                ...part,
                // If they cleared the input, revert customTitle to null (resuming auto Del/Part)
                customTitle: trimmed.length > 0 ? trimmed : null
            };
        });

        setEditingPartId(null);
        await persistBucketPayload(bucketId, updatedParts);
    };

    //  Reorder whole "Del" sections
    const movePartSection = async (bucketId, partIndex, direction) => {
        const bucket = buckets.find(b => b.id === bucketId);
        if (!bucket) return;

        const targetIdx = partIndex + direction;
        if (targetIdx < 0 || targetIdx >= bucket.payload.length) return;

        const newParts = [...bucket.payload];
        const [moved] = newParts.splice(partIndex, 1);
        newParts.splice(targetIdx, 0, moved);

        await persistBucketPayload(bucketId, newParts);
    };

    //  Delete a whole "Del" section
    const deletePartSection = async (bucketId, partId) => {
        if (!window.confirm(lang === 'sv' ? "Vill du ta bort denna Del och alla dess steg?" : "Delete this Part and all its steps?")) return;

        const bucket = buckets.find(b => b.id === bucketId);
        if (!bucket) return;

        const updatedParts = bucket.payload.filter(p => p.id !== partId);
        await persistBucketPayload(bucketId, updatedParts);
    };

    // Sync from ContentModal selections
    const handleToggleItem = (topicId, level) => {
    setBuckets(prev => prev.map(b => {
        if (b.id !== activeContentModalBucketId) return b;

        const parts = (b.payload || []).map(part => ({
            ...part,
            steps: [...(part.steps || [])]
        }));

        // 1. Check if this level exists anywhere across ANY part in this unit
        const alreadyExists = parts.some(part => 
            part.steps.some(s => 
                s.type === 'practice' && 
                (s.topic === topicId || s.topicId === topicId) && 
                Number(s.level) === Number(level)
            )
        );

        if (alreadyExists) {
            // 🟢 DESELECT: Remove from every part where it is found
            const cleanedParts = parts.map(part => ({
                ...part,
                steps: part.steps.filter(s => 
                    !(s.type === 'practice' && 
                      (s.topic === topicId || s.topicId === topicId) && 
                      Number(s.level) === Number(level))
                )
            }));
            return { ...b, payload: cleanedParts };
        } else {
            // 🟢 SELECT: Find or create the matching part, then append step
            let targetPart = parts.find(p => p.topicId === topicId);
            if (!targetPart) {
                targetPart = {
                    id: `part_${topicId}_${Date.now()}`,
                    type: 'part',
                    topicId: topicId,
                    customTitle: null,
                    steps: []
                };
                parts.push(targetPart);
            }

            targetPart.steps.push({
                id: `step_${topicId}_${level}_${Date.now()}`,
                type: 'practice',
                topic: topicId,
                level: Number(level)
            });

            return { ...b, payload: parts };
        }
    }));
};

    const handleCloseContentModal = async () => {
        setIsContentModalOpen(false);
        if (activeContentModalBucketId) {
            // Read fresh from current state reference
            setBuckets(currentBuckets => {
                const bucketToSave = currentBuckets.find(b => b.id === activeContentModalBucketId);
                if (bucketToSave) {
                    supabase
                        .from('teacher_buckets')
                        .update({ payload: bucketToSave.payload })
                        .eq('id', activeContentModalBucketId)
                        .then(({ error }) => {
                            if (error) console.error("Error saving updated parts from modal:", error);
                        });
                }
                return currentBuckets;
            });
            setActiveContentModalBucketId(null);
        }
    };

    // --- Folder Handlers ---
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
        existingFolders.forEach(f => { if (!currentOrder.includes(f)) currentOrder.push(f); });
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

        const newBucket = { 
            teacher_id: teacherId, 
            folder: finalFolderName || 'Okategoriserad', 
            name: newBucketName.trim(), 
            color: newBucketColor, 
            is_focused: false, 
            is_visible: true, 
            expires_at: end.toISOString(), 
            payload: [] 
        };

        try {
            const { data, error } = await supabase.from('teacher_buckets').insert([newBucket]).select().single();
            if (error) throw error;
            setBuckets([{ ...data, payload: [] }, ...buckets]);
            setNewBucketName('');
            if (isAddingNewFolder) { setIsAddingNewFolder(false); setSelectedFolder(finalFolderName); setNewFolderName(''); }
            setCollapsedFolders(prev => ({ ...prev, [finalFolderName]: false }));
            
            if (isAddingNewFolder && !folderOrder.includes(finalFolderName)) {
                const newOrder = [finalFolderName, ...folderOrder];
                setFolderOrder(newOrder);
                supabase.from('profiles').update({ folder_order: newOrder }).eq('id', teacherId).then();
            }
        } catch (err) { alert("Kunde inte skapa enheten."); } 
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
        const clonedBucket = { 
            teacher_id: teacherId, 
            folder: bucket.folder, 
            name: `${bucket.name} (Kopia)`, 
            color: bucket.color, 
            is_focused: false, 
            is_visible: false, 
            expires_at: end.toISOString(), 
            payload: bucket.payload || [] 
        };
        try {
            const { data, error } = await supabase.from('teacher_buckets').insert([clonedBucket]).select().single();
            if (error) throw error;
            setBuckets([{ ...data, payload: bucket.payload || [] }, ...buckets]); 
            setActiveTab('active'); 
        } catch (err) {}
    };

    const deleteBucket = async (id) => { 
        if (!window.confirm(lang === 'sv' ? 'Är du säker på att du vill radera denna enhet?' : 'Are you sure you want to delete this unit?')) return;
        setBuckets(prev => prev.filter(b => b.id !== id));
        try { await supabase.from('teacher_buckets').delete().eq('id', id); } catch (err) {}
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

    const activeContentBucket = buckets.find(b => b.id === activeContentModalBucketId);
    // Flat selected items for ContentModal checkbox sync
    const flatSelectedItems = useMemo(() => {
        if (!activeContentBucket) return [];
        return (activeContentBucket.payload || []).flatMap(part => part.steps.filter(s => s.type === 'practice'));
    }, [activeContentBucket]);

    const todayStr = new Date().toISOString().split('T')[0]; 

    if (isLoading) return <div className="w-full flex justify-center py-20"><Loader2 className="animate-spin text-[var(--brand-solid)]" size={32} /></div>;

    return (
        <div className="w-full max-w-5xl mx-auto font-sans animate-in fade-in">
            
            {/* Header & Creation Strip */}
            <div className="bg-[var(--bg-card)] rounded-3xl p-6 shadow-sm border border-[var(--border-main)] mb-6 transition-colors">
                <h2 className="text-xl font-black uppercase italic tracking-tight text-[var(--text-main)] mb-4">
                    {lang === 'sv' ? "Grupper & Enheter" : "Groups & Units"}
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
                            {lang === 'sv' ? "Enhetens namn" : "Unit Name"}
                        </label>
                        <input 
                            type="text" value={newBucketName} onChange={(e) => setNewBucketName(e.target.value)} placeholder={lang === 'sv' ? "t.ex. Ekvationer & Bråk" : "e.g. Equations & Fractions"}
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
                        className="h-[46px] px-6 bg-[var(--text-main)] text-[var(--bg-canvas)] rounded-xl font-black uppercase tracking-widest text-[11px] hover:opacity-80 transition-all disabled:opacity-30 shadow-sm flex items-center gap-2 cursor-pointer"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} 
                        {lang === 'sv' ? "Skapa" : "Create"}
                    </button>
                </div>
            </div>

            {/* High-Contrast Toggle Tabs */}
            <div className="flex gap-2 mb-4">
                <button onClick={() => setActiveTab('active')} className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer ${activeTab === 'active' ? 'bg-[var(--text-main)] text-[var(--bg-canvas)] shadow-md' : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)] border border-transparent'}`}>
                    {lang === 'sv' ? `Aktiva (${activeBuckets.length})` : `Active (${activeBuckets.length})`}
                </button>
                <button onClick={() => setActiveTab('archive')} className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer ${activeTab === 'archive' ? 'bg-[var(--text-main)] text-[var(--bg-canvas)] shadow-md' : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)] border border-transparent'}`}>
                    {lang === 'sv' ? `Arkiv (${archivedBuckets.length})` : `Archive (${archivedBuckets.length})`}
                </button>
            </div>

            {/* Grouped Bucket List */}
            <div className="space-y-6">
                {sortedFolderNames.length === 0 ? (
                    <div className="py-12 text-center border-2 border-dashed border-[var(--border-main)] rounded-3xl bg-[var(--bg-surface)]">
                        <FolderOpen size={32} className="mx-auto text-[var(--text-muted)] opacity-50 mb-3" />
                        <p className="text-[var(--text-muted)] font-bold text-sm">
                            {activeTab === 'active' ? (lang === 'sv' ? "Du har inga aktiva enheter just nu." : "You have no active units right now.") : (lang === 'sv' ? "Arkivet är tomt." : "The archive is empty.")}
                        </p>
                    </div>
                ) : (
                    sortedFolderNames.map((folderName, index) => {
                        const folderBuckets = groupedBuckets[folderName];
                        const isCollapsed = collapsedFolders[folderName];
                        const isFolderVisible = folderBuckets.some(b => b.is_visible);
                        
                        return (
                            <div key={folderName} className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-main)] shadow-sm overflow-hidden transition-colors">
                                
                                {/* Folder Header */}
                                <div className="bg-[var(--bg-surface)] px-3 sm:px-5 py-4 border-b border-[var(--border-main)] flex items-center justify-between group">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <button onClick={() => setCollapsedFolders(prev => ({ ...prev, [folderName]: !prev[folderName] }))} className="p-1 hover:bg-[var(--bg-surface-hover)] rounded-md text-[var(--text-main)] cursor-pointer">
                                            {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                                        </button>
                                        <Folder size={18} className="opacity-50 text-[var(--text-main)] shrink-0" />
                                        
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
                                        <div className="flex items-center bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg overflow-hidden shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button disabled={index === 0} onClick={(e) => moveFolder(folderName, -1, e)} className="p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)] disabled:opacity-30 disabled:cursor-not-allowed border-r border-[var(--border-main)] cursor-pointer">
                                                <ChevronUp size={14} />
                                            </button>
                                            <button disabled={index === sortedFolderNames.length - 1} onClick={(e) => moveFolder(folderName, 1, e)} className="p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
                                                <ChevronDown size={14} />
                                            </button>
                                        </div>

                                        {activeTab === 'active' && (
                                            <button onClick={() => toggleFolderVisibility(folderName, folderBuckets)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${!isFolderVisible ? 'bg-[var(--bg-surface-hover)] text-[var(--text-muted)] shadow-inner' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--bg-surface)] border border-[var(--border-main)] shadow-sm'}`}>
                                                {isFolderVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                                                <span className="hidden sm:inline-block">{lang === 'sv' ? "Synlighet" : "Visibility"}</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Folder Contents */}
                                {!isCollapsed && (
                                    <div className="p-4 space-y-4 bg-[var(--bg-surface)] opacity-95">
                                        {folderBuckets.map(bucket => {
                                            const isExpired = new Date(bucket.expires_at) <= now;
                                            const daysLeft = Math.ceil((new Date(bucket.expires_at) - now) / (1000 * 60 * 60 * 24));
                                            const isSequencerOpen = expandedSequencerBucketId === bucket.id;
                                            const parts = bucket.payload || [];
                                            const totalStepsCount = parts.reduce((acc, p) => acc + (p.steps?.length || 0), 0);

                                            return (
                                                <div 
                                                    key={bucket.id} 
                                                    className={`theme-${bucket.color || 'indigo'} bg-[var(--bg-card)] border-2 rounded-2xl p-4 flex flex-col gap-4 transition-all shadow-sm ${bucket.is_focused ? 'border-[var(--brand-solid)] shadow-md' : 'border-[var(--border-subtle)] hover:border-[var(--border-main)]'}`}
                                                >
                                                    {/* Top Row: Meta & Primary Actions */}
                                                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner transition-colors ${isExpired ? 'bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-muted)]' : 'bg-[var(--brand-solid)] text-white'} ${!bucket.is_visible && !isExpired ? 'opacity-50' : ''}`}>
                                                                <Layers size={20} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                                    {editingTitleId === bucket.id ? (
                                                                        <div className="flex items-center gap-2 w-full max-w-sm">
                                                                            <input 
                                                                                autoFocus type="text" value={editTitleValue} onChange={(e) => setEditTitleValue(e.target.value)}
                                                                                onBlur={() => saveTitleEdit(bucket.id)} onKeyDown={(e) => { if (e.key === 'Enter') saveTitleEdit(bucket.id); if (e.key === 'Escape') setEditingTitleId(null); }}
                                                                                className="flex-1 bg-[var(--bg-surface)] border-2 border-[var(--brand-border)] focus:border-[var(--brand-solid)] text-[var(--text-main)] rounded-lg px-3 py-1.5 text-base font-black outline-none transition-all shadow-inner"
                                                                            />
                                                                            <button onMouseDown={(e) => { e.preventDefault(); saveTitleEdit(bucket.id); }} className="p-2 bg-[var(--brand-bg)] text-[var(--brand-solid)] border border-[var(--brand-border)] rounded-lg hover:bg-[var(--brand-solid)] hover:text-white transition-colors cursor-pointer"><Check size={16}/></button>
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
                                                                    {editingDateId === bucket.id ? (
                                                                         <div className="flex items-center gap-2">
                                                                            <input 
                                                                                autoFocus type="date" value={editDateValue} onChange={(e) => setEditDateValue(e.target.value)}
                                                                                onBlur={() => saveDateEdit(bucket.id)} onKeyDown={(e) => { if (e.key === 'Enter') saveDateEdit(bucket.id); if (e.key === 'Escape') setEditingDateId(null); }}
                                                                                className="bg-[var(--bg-surface)] border-2 border-[var(--brand-border)] focus:border-[var(--brand-solid)] text-[var(--text-main)] rounded-lg px-2 py-1 outline-none transition-all shadow-inner"
                                                                            />
                                                                            <button onMouseDown={(e) => { e.preventDefault(); saveDateEdit(bucket.id); }} className="p-1.5 bg-[var(--brand-bg)] text-[var(--brand-solid)] border border-[var(--brand-border)] rounded-lg hover:bg-[var(--brand-solid)] hover:text-white transition-colors cursor-pointer"><Check size={14}/></button>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="flex items-center gap-1 group cursor-pointer hover:text-[var(--text-main)] transition-colors" onClick={() => startEditingDate(bucket)}>
                                                                            <CalendarIcon size={12} /> 
                                                                            {isExpired ? (lang === 'sv' ? "Utgånget" : "Expired") : (lang === 'sv' ? `${daysLeft} dagar kvar` : `${daysLeft} days left`)}
                                                                            <Edit2 size={10} className="opacity-0 group-hover:opacity-50 ml-1" />
                                                                        </span>
                                                                    )}
                                                                    <span>•</span>
                                                                    <span>{parts.length} {lang === 'sv' ? "delar" : "parts"}</span>
                                                                    <span>•</span>
                                                                    <span>{totalStepsCount} {lang === 'sv' ? "steg totalt" : "total steps"}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Right Side: Action Pod */}
                                                        <div className="flex items-center gap-2 bg-[var(--bg-surface)] p-1.5 rounded-xl border border-[var(--border-main)] shrink-0 w-full xl:w-auto overflow-x-auto custom-scrollbar">
                                                            {!isExpired ? (
                                                                <>
                                                                    {/*  TOGGLE PLAN SEQUENCER ACCORDION */}
                                                                    <button 
                                                                        onClick={() => setExpandedSequencerBucketId(isSequencerOpen ? null : bucket.id)}
                                                                        className={`flex-1 xl:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                                                                            isSequencerOpen 
                                                                                ? 'bg-[var(--brand-solid)] text-white' 
                                                                                : 'bg-[var(--bg-card)] hover:bg-[var(--brand-bg)] text-[var(--brand-solid)] border border-[var(--border-main)]'
                                                                        }`}
                                                                    >
                                                                        <span>{lang === 'sv' ? "Ordna Delar & Steg" : "Sequence Parts & Steps"}</span>
                                                                        {isSequencerOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                                    </button>

                                                                    <div className="w-px h-6 bg-[var(--border-strong)] mx-1" />
                                                                    
                                                                    <button onClick={() => toggleFocus(bucket.id)} className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-lg transition-all cursor-pointer ${bucket.is_focused ? 'theme-amber bg-[var(--brand-bg)] text-[var(--brand-solid)] border border-[var(--brand-border)] shadow-inner' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-main)] border border-[var(--border-main)]'}`} title={lang === 'sv' ? "Markera som Dagens Fokus" : "Mark as Today's Focus"}>
                                                                        <Star size={16} fill={bucket.is_focused ? "currentColor" : "none"} />
                                                                    </button>
                                                                    
                                                                    <button onClick={() => toggleVisibility(bucket.id)} className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-lg transition-all cursor-pointer ${!bucket.is_visible ? 'bg-[var(--bg-surface-hover)] text-[var(--text-muted)] shadow-inner border border-[var(--border-main)]' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)] border border-[var(--border-main)] shadow-sm'}`} title={lang === 'sv' ? "Dölj/Visa för elever" : "Hide/Show for students"}>
                                                                        {bucket.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <button onClick={() => duplicateBucket(bucket)} className="flex-1 xl:flex-none px-4 py-2 bg-[var(--bg-card)] hover:bg-[var(--brand-bg)] text-[var(--brand-solid)] border border-[var(--border-main)] hover:border-[var(--brand-border)] rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer">
                                                                    <Copy size={14} /> {lang === 'sv' ? "Återanvänd (Kopiera)" : "Reuse (Duplicate)"}
                                                                </button>
                                                            )}
                                                            <div className="w-px h-6 bg-[var(--border-strong)] mx-1 shrink-0" />
                                                            <button onClick={() => deleteBucket(bucket.id)} className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--theme-rose-bg)] hover:text-[var(--theme-rose-text)] hover:border-[var(--theme-rose-border)] border border-[var(--border-main)] transition-all cursor-pointer" title={lang === 'sv' ? "Radera" : "Delete"}>
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/*  EXPANDABLE SEQUENCER DRAWER: "DEL"-BASED ROADMAP */}
                                                    {isSequencerOpen && (
                                                        <div className="mt-2 pt-4 border-t border-[var(--border-main)] space-y-4 animate-in fade-in duration-200">
                                                            
                                                            {/* Top Strip */}
                                                            <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-surface)] p-3 rounded-xl border border-[var(--border-main)]">
                                                                <div className="flex items-center gap-2">
                                                                    <Bookmark size={15} className="text-[var(--brand-solid)]" />
                                                                    <span className="text-xs font-black uppercase tracking-widest text-[var(--text-main)]">
                                                                        {lang === 'sv' ? "Planering: Delar & Steg" : "Plan: Parts & Steps"}
                                                                    </span>
                                                                </div>

                                                                <div className="flex items-center gap-2">
                                                                    <button 
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setActiveContentModalBucketId(bucket.id);
                                                                            setIsContentModalOpen(true);
                                                                        }}
                                                                        className="px-3 py-1.5 bg-[var(--brand-bg)] hover:bg-[var(--brand-solid)] text-[var(--brand-text)] hover:text-white border border-[var(--brand-border)] rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                                                                    >
                                                                        <Target size={13} />
                                                                        <span>{lang === 'sv' ? "+ Välj Övningsnivåer" : "+ Select Practice Levels"}</span>
                                                                    </button>

                                                                    <button 
                                                                        type="button"
                                                                        onClick={() => handleAddNewPart(bucket.id)}
                                                                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                                                                    >
                                                                        <Plus size={13} />
                                                                        <span>{lang === 'sv' ? "+ Ny Del" : "+ New Part"}</span>
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Render Each "Del" (Part) Container */}
                                                            {parts.length === 0 ? (
                                                                <div className="p-8 text-center border-2 border-dashed border-[var(--border-main)] rounded-2xl text-xs font-bold text-[var(--text-muted)] italic">
                                                                    {lang === 'sv' 
                                                                        ? "Inga delar tillagda ännu. Klicka på '+ Välj Övningsnivåer' för att automatiskt skapa delar per ämnesområde." 
                                                                        : "No parts created yet. Click '+ Select Practice Levels' to auto-create parts by topic."}
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-4">
                                                                    {parts.map((part, pIdx) => (
                                                                        <div 
                                                                            key={part.id || pIdx} 
                                                                            className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-main)] p-4 space-y-3 shadow-xs"
                                                                        >
                                                                            {/* Part Header Strip */}
                                                                            <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
                                                                                
                                                                                {/* Inline Part Title Editing */}
                                                                                {editingPartId === part.id ? (
                                                                                    <div className="flex items-center gap-2 flex-1 max-w-md">
                                                                                        <input 
                                                                                            autoFocus
                                                                                            type="text" 
                                                                                            value={editPartTitleValue} 
                                                                                            onChange={(e) => setEditPartTitleValue(e.target.value)}
                                                                                            onBlur={() => savePartTitleEdit(bucket.id, part.id)}
                                                                                            onKeyDown={(e) => { 
                                                                                                if (e.key === 'Enter') savePartTitleEdit(bucket.id, part.id);
                                                                                                if (e.key === 'Escape') setEditingPartId(null);
                                                                                            }}
                                                                                            className="flex-1 bg-[var(--bg-card)] border-2 border-[var(--brand-border)] text-[var(--text-main)] rounded-lg px-2.5 py-1 text-xs font-black uppercase tracking-wider outline-none shadow-inner"
                                                                                        />
                                                                                        <button 
                                                                                            onMouseDown={(e) => { e.preventDefault(); savePartTitleEdit(bucket.id, part.id); }}
                                                                                            className="p-1.5 bg-[var(--brand-solid)] text-white rounded-lg hover:opacity-90"
                                                                                        >
                                                                                            <Check size={13} />
                                                                                        </button>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div 
                                                                                        className="flex items-center gap-2 cursor-pointer group"
                                                                                        onClick={() => {
                                                                                            setEditingPartId(part.id);
                                                                                            // If they already have a custom title, pre-fill it; otherwise start blank so they can type a new one
                                                                                            setEditPartTitleValue(part.customTitle || "");
                                                                                        }}
                                                                                    >
                                                                                        <span className="w-5 h-5 rounded-md bg-[var(--brand-solid)] text-white text-[10px] font-black flex items-center justify-center shrink-0">
                                                                                            {pIdx + 1}
                                                                                        </span>
                                                                                        {/* After: Fully reactive to language switches */}
                                                                                        <h4 className="font-black text-xs uppercase tracking-wider text-[var(--text-main)]">
                                                                                            {getPartDisplayTitle(part, pIdx, lang)}
                                                                                        </h4>
                                                                                        <Edit2 size={11} className="opacity-0 group-hover:opacity-50 text-[var(--text-muted)] transition-opacity" />
                                                                                    </div>
                                                                                )}

                                                                                {/* Part Actions: Reorder Whole Part, Add Instruction to this Part, Delete Part */}
                                                                                <div className="flex items-center gap-1.5 shrink-0">
                                                                                    <button 
                                                                                        type="button"
                                                                                        onClick={() => {
                                                                                            setTargetPartContext({ bucketId: bucket.id, partId: part.id });
                                                                                            setIsInstructionPickerOpen(true);
                                                                                        }}
                                                                                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs"
                                                                                    >
                                                                                        <BookOpen size={11} />
                                                                                        <span>{lang === 'sv' ? "+ Infoga Genomgång" : "+ Insert Walkthrough"}</span>
                                                                                    </button>
                                                                                    
                                                                                    {/* Add Checkpoint Button */}
                                                                                    <button 
                                                                                        type="button"
                                                                                        onClick={() => {
                                                                                            setTargetPartContext({ bucketId: bucket.id, partId: part.id, part });
                                                                                            setIsCheckpointModalOpen(true);
                                                                                        }}
                                                                                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs"
                                                                                    >
                                                                                        <Beaker size={11} />
                                                                                        <span>{lang === 'sv' ? "+ Delprov" : "+ Checkpoint"}</span>
                                                                                    </button>

                                                                                    <div className="flex items-center bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg overflow-hidden ml-1">
                                                                                        <button 
                                                                                            disabled={pIdx === 0} 
                                                                                            onClick={() => movePartSection(bucket.id, pIdx, -1)} 
                                                                                            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] disabled:opacity-20 cursor-pointer"
                                                                                            title={lang === 'sv' ? "Flytta Del uppåt" : "Move Part up"}
                                                                                        >
                                                                                            <ArrowUp size={12} />
                                                                                        </button>
                                                                                        <button 
                                                                                            disabled={pIdx === parts.length - 1} 
                                                                                            onClick={() => movePartSection(bucket.id, pIdx, 1)} 
                                                                                            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] disabled:opacity-20 cursor-pointer"
                                                                                            title={lang === 'sv' ? "Flytta Del nedåt" : "Move Part down"}
                                                                                        >
                                                                                            <ArrowDown size={12} />
                                                                                        </button>
                                                                                    </div>

                                                                                    <button 
                                                                                        onClick={() => deletePartSection(bucket.id, part.id)}
                                                                                        className="p-1 text-[var(--text-muted)] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer ml-0.5"
                                                                                        title={lang === 'sv' ? "Radera Del" : "Delete Part"}
                                                                                    >
                                                                                        <Trash2 size={13} />
                                                                                    </button>
                                                                                </div>
                                                                            </div>

                                                                            {/* Part Steps Sequence */}
                                                                            {(part.steps || []).length === 0 ? (
                                                                                <div className="py-4 text-center border border-dashed border-[var(--border-subtle)] rounded-xl text-[11px] font-bold text-[var(--text-muted)] italic">
                                                                                    {lang === 'sv' ? "Inga steg i denna del ännu. Infoga en genomgång ovan eller välj nivåer." : "No steps in this part yet. Insert a walkthrough above or select levels."}
                                                                                </div>
                                                                            ) : (
                                                                                <div className="space-y-1.5">
                                                                                    {part.steps.map((step, sIdx) => {
                                                                                        const isInstruction = step.type === 'instruction' || !!step.sheetId;
                                                                                        const isTest = step.type === 'test';
                                                                                        const { description, mathExample } = !isInstruction 
                                                                                            ? getLevelMetadata(step.topic || step.topicId, step.level, lang)
                                                                                            : { description: "", mathExample: "" };

                                                                                        return (
                                                                                            <div 
                                                                                                key={step.id || sIdx}
                                                                                                className={`p-3.5 rounded-xl border-2 flex items-center justify-between gap-4 transition-all ${
                                                                                                    isInstruction 
                                                                                                        ? 'bg-indigo-50/80 border-indigo-200 text-slate-800' 
                                                                                                        : 'bg-[var(--bg-card)] border-[var(--border-main)] text-[var(--text-main)] hover:border-[var(--border-strong)]'
                                                                                                }`}
                                                                                            >
                                                                                                {/* Stegnummer & Innehållsdetaljer */}
                                                                                                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                                                                                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                                                                                                        isInstruction 
                                                                                                            ? 'bg-indigo-600 text-white shadow-xs' 
                                                                                                            : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
                                                                                                    }`}>
                                                                                                        {sIdx + 1}
                                                                                                    </div>

                                                                                                    {isInstruction ? (
                                                                                                        /* GENOMGÅNGSKORT */
                                                                                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                                                                                            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded shrink-0">
                                                                                                                {lang === 'sv' ? "Genomgång" : "Walkthrough"}
                                                                                                            </span>
                                                                                                            <BookOpen size={14} className="text-indigo-600 shrink-0" />
                                                                                                            <span className="font-black text-s text-slate-800 truncate">
                                                                                                                {step.sheetTitle}
                                                                                                            </span>
                                                                                                        </div>
                                                                                                    ) : isTest ? (
                                                                                                        /*  CHECKPOINT TEST CARD */
                                                                                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                                                                            <span className="bg-amber-200 text-amber-900 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded shrink-0">
                                                                                                                {step.testMode === 'exam' ? (lang === 'sv' ? "Prov" : "Exam") : (lang === 'sv' ? "Delprov" : "Checkpoint")}
                                                                                                            </span>
                                                                                                            <Beaker size={14} className="text-amber-600 shrink-0" />
                                                                                                            <span className="font-black text-m text-[var(--text-main)] truncate">
                                                                                                                {step.title}
                                                                                                            </span>
                                                                                                            <span className="text-[11px] font-black tracking-tight text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md border border-indigo-200/80 dark:border-indigo-800/60 shrink-0">
                                                                                                                {step.questionCount} {lang === 'sv' ? "frågor" : "questions"}
                                                                                                            </span>
                                                                                                        </div>
                                                                                                    ) : (
                                                                                                        /* ÖVNINGSKORT MED MATTE-EXEMPEL & BESKRIVNING */
                                                                                                        <div className="flex items-center gap-3 min-w-0 flex-1 flex-wrap sm:flex-nowrap">
                                                                                                            <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shrink-0 border border-emerald-300 dark:border-emerald-800">
                                                                                                                {lang === 'sv' ? `Nivå ${step.level}` : `Level ${step.level}`}
                                                                                                            </span>

                                                                                                            <div className="flex flex-col min-w-0 flex-1">
                                                                                                                <div className="flex items-center gap-2">
                                                                                                                    <span className="font-black text-m text-[var(--text-main)] truncate">
                                                                                                                        {getTopicName(step.topic || step.topicId, lang)}
                                                                                                                    </span>
                                                                                                                    {description && (
                                                                                                                        <>
                                                                                                                            <span className="text-[var(--text-muted)] opacity-40 hidden md:inline">•</span>
                                                                                                                            <span className="text-s font-semibold text-[var(--text-muted)] truncate hidden md:inline">
                                                                                                                                {description}
                                                                                                                            </span>
                                                                                                                        </>
                                                                                                                    )}
                                                                                                                </div>

                                                                                                                {/* 🟢 ENLARGED CONTRAST-SAFE MATH PREVIEW */}
                                                                                                                {mathExample && (
                                                                                                                    <div className="mt-1 text-sm sm:text-base text-indigo-600 dark:text-indigo-400 font-serif italic truncate flex items-center gap-2">
                                                                                                                        <span className="text-[9px] font-sans font-black uppercase tracking-widest text-[var(--text-muted)] not-italic bg-[var(--bg-surface)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">
                                                                                                                            Ex
                                                                                                                        </span>
                                                                                                                        <MathDisplay content={mathExample} />
                                                                                                                    </div>
                                                                                                                )}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>

                                                                                                {/* Knappar för att flytta upp/ned och ta bort */}
                                                                                                <div className="flex items-center gap-1 shrink-0">
                                                                                                    <button 
                                                                                                        type="button"
                                                                                                        disabled={sIdx === 0}
                                                                                                        onClick={() => moveStepInsidePart(bucket.id, part.id, sIdx, -1)}
                                                                                                        className="p-1.5 rounded-lg bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-main)] disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed border border-[var(--border-subtle)]"
                                                                                                        title={lang === 'sv' ? "Flytta upp" : "Move up"}
                                                                                                    >
                                                                                                        <ArrowUp size={12} />
                                                                                                    </button>
                                                                                                    <button 
                                                                                                        type="button"
                                                                                                        disabled={sIdx === part.steps.length - 1}
                                                                                                        onClick={() => moveStepInsidePart(bucket.id, part.id, sIdx, 1)}
                                                                                                        className="p-1.5 rounded-lg bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-main)] disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed border border-[var(--border-subtle)]"
                                                                                                        title={lang === 'sv' ? "Flytta ned" : "Move down"}
                                                                                                    >
                                                                                                        <ArrowDown size={12} />
                                                                                                    </button>
                                                                                                    <button 
                                                                                                        type="button"
                                                                                                        onClick={() => removeStepFromPart(bucket.id, part.id, sIdx)}
                                                                                                        className="p-1.5 hover:bg-rose-50 text-[var(--text-muted)] hover:text-rose-600 rounded-lg transition-colors ml-1 cursor-pointer"
                                                                                                        title={lang === 'sv' ? "Ta bort steg" : "Remove step"}
                                                                                                    >
                                                                                                        <X size={14} />
                                                                                                    </button>
                                                                                                </div>
                                                                                            </div>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
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

            {/*  CHECKPOINT MODAL */}
            <CheckpointModal
                isOpen={isCheckpointModalOpen}
                onClose={() => {
                    setIsCheckpointModalOpen(false);
                    setTargetPartContext(null);
                }}
                targetPart={targetPartContext?.part}
                bucket={buckets.find(b => b.id === targetPartContext?.bucketId)}
                lang={lang}
                onSaveCheckpoint={(checkpointData) => {
                    if (targetPartContext) {
                        handleAddCheckpointToPart(targetPartContext.bucketId, targetPartContext.partId, checkpointData);
                    }
                    setIsCheckpointModalOpen(false);
                    setTargetPartContext(null);
                }}
            />

            {/* CONTENT MODAL (Practice Level Checklist) */}
            <ContentModal 
                visible={isContentModalOpen} 
                onClose={handleCloseContentModal}
                lang={lang}
                selectionMode={true}
                selectedItems={flatSelectedItems}
                onToggleItem={handleToggleItem}
            />

            {/*  INSTRUCTIONAL SLIDE PICKER (Drops slide into target Part) */}
            {isInstructionPickerOpen && (
                <SheetLibraryModal
                    isOpen={isInstructionPickerOpen}
                    onClose={() => {
                        setIsInstructionPickerOpen(false);
                        setTargetPartContext(null);
                    }}
                    filterType="board"
                    showCreationActions={false}
                    lang={lang}
                    onSelectSheet={(sheet) => {
                        if (targetPartContext) {
                            handleAddInstructionSlideToPart(targetPartContext.bucketId, targetPartContext.partId, sheet);
                        }
                        setIsInstructionPickerOpen(false);
                        setTargetPartContext(null);
                    }}
            />
            
            )}
        </div>
    );
}