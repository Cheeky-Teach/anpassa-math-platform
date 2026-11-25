// src/components/views/PresentationView.jsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
    X, ChevronLeft, ChevronRight, ChevronDown, Monitor, PanelLeftClose, 
    PanelLeftOpen, ZoomIn, ZoomOut, Layers, FileText, List, Plus,
    RefreshCw, Presentation, FileQuestion, Save, Download, Trash2, 
    MessageSquare, Copy, GripVertical, Menu, FolderOpen, BookmarkPlus, UploadCloud,
    Gamepad2, HelpCircle
} from 'lucide-react';

import VisualRenderer from '../visuals/VisualRenderer';
import InteractiveCanvas from '../whiteboard/InteractiveCanvas';
import QuestionSummoner from './QuestionSummoner';
import { supabase } from '../../lib/supabaseClient'; 
import { useMyCoach } from '../../hooks/useMyCoach';
import MyCoachModal from '../modals/MyCoachModal';
import PreferencesToggle from '../ui/PreferencesToggle';
import LiveLaunchModal from '../modals/LiveLaunchModal';
import WhiteboardDrawer from '../whiteboard/WhiteboardDrawer';
import SpotlightTour from '../shared/SpotlightTour';
import { getToolDefinition } from '../whiteboard/tools/registry';
import SheetLibraryModal from '../modals/SheetLibraryModal';
import SaveToUnitModal from '../modals/SaveToUnitModal';
import { PRESENTATION_THEMES } from '../../constants/presentationThemes';

import { syncProgress, syncBatchProgress } from '../../lib/progressSync';

// Imported extracted modular functions
import MathDisplay from '../shared/MathDisplay';
import { compileAnchoredStory } from '../../core/utils/storyCompiler';
import SlideRenderer from '../shared/SlideRenderer';
import SlideViewerCore from '../shared/SlideViewerCore';

// activities
import ActivityHubModal from '../activities/modals/ActivityHubModal';
import CategoryClashEngine from '../activities/engines/CategoryClashEngine';

export default function PresentationView({ 
    packet, sheetTitle, lang = 'sv', onClose, initialSlides, boardId: initialBoardId, onLaunchLive,
    initialSettings }) {
    
    // --- MASTER SLIDE & TAB STATE ---
    const [sidebarTab, setSidebarTab] = useState(initialSlides?.length ? 'slides' : 'questions');
    const [slides, setSlides] = useState(initialSlides || [{ id: `slide_${Date.now()}`, elements: [], scrollX: 0, scrollY: 0, title: 'Slide 1', activeIds: [] }]);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const [editingSlideIndex, setEditingSlideIndex] = useState(null);
    const [presentationTheme, setPresentationTheme] = useState(initialSettings?.theme || packet?.settings?.theme || 'clean');

    // --- MODAL STATES ---
    const [showNamingModal, setShowNamingModal] = useState(false);
    const [tempTitleInput, setTempTitleInput] = useState('');
    const [activeDrawer, setActiveDrawer] = useState(null);
    const [showLibraryModal, setShowLibraryModal] = useState(false);
    
    // File Menu & Save to Unit States
    const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
    const [showSaveToUnitModal, setShowSaveToUnitModal] = useState(false);
    const [teacherId, setTeacherId] = useState(null);

    const storageKey = `has_seen_presentation_guide`;
    const [showTutorial, setShowTutorial] = useState(false);

    const [isDirty, setIsDirty] = useState(false);
    const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
    const [showSaveChoiceModal, setShowSaveChoiceModal] = useState(false);

    // 1. Guard against browser refresh or tab close
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    // 2. Guard for the in-app "Stäng" (Close) button
    const handleAppClose = () => {
        if (isDirty) {
            setShowUnsavedChangesModal(true);
        } else {
            onClose();
        }
    };

    // Fetch Teacher ID on mount for the SaveToUnitModal
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data?.user) setTeacherId(data.user.id);
        });
    }, []);

    // Auto-open interactive spotlight tour on first visit
    useEffect(() => {
        if (!localStorage.getItem(storageKey)) {
            const timer = setTimeout(() => setShowTutorial(true), 350);
            return () => clearTimeout(timer);
        }
    }, [storageKey]);

    const handleCloseTutorial = () => {
        localStorage.setItem(storageKey, 'true');
        setShowTutorial(false);
    };

    const handleToggleDrawer = (drawerKey) => {
        setActiveDrawer(prev => (prev === drawerKey ? null : drawerKey));
    };

    const handleUniversalSpawn = (type, payload = {}) => {
        const toolModes = ['pen', 'highlighter', 'eraser', 'line', 'select'];
        if (toolModes.includes(type)) {
            return;
        }

        const toolDef = getToolDefinition(type);
        if (!toolDef || typeof toolDef.createDefault !== 'function') return;

        const id = `el_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        updateCurrentSlideElements(prev => {
            const safePrev = Array.isArray(prev) ? prev : [];
            const newEl = toolDef.createDefault(id, '#059669', {
                type,
                ...payload,
                existingElements: safePrev
            });
            return [...safePrev, newEl];
        });
    };

    const [draggedSlideIndex, setDraggedSlideIndex] = useState(null);

    const handleSlideDragStart = (e, index) => {
        setDraggedSlideIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        const img = new Image();
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        e.dataTransfer.setDragImage(img, 0, 0);
    };

    const handleSlideDragOver = (e, index) => {
        e.preventDefault();
        if (draggedSlideIndex === null || draggedSlideIndex === index) return;
        
        setSlides(prev => {
            const newSlides = [...prev];
            const [moved] = newSlides.splice(draggedSlideIndex, 1);
            newSlides.splice(index, 0, moved);
            return newSlides;
        });
        
        setActiveSlideIndex(prev => {
            if (prev === draggedSlideIndex) return index;
            if (draggedSlideIndex < prev && index >= prev) return prev - 1;
            if (draggedSlideIndex > prev && index <= prev) return prev + 1;
            return prev;
        });
        
        setDraggedSlideIndex(index);
    };

    const handleSlideDragEnd = () => {
        setDraggedSlideIndex(null);
        setIsSaving(false);
    };

    const handleDuplicateSlide = (e, index) => {
        e.stopPropagation();
        const sourceSlide = slides[index];
        const clonedElements = sourceSlide.elements.map(el => ({
            ...el,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5)
        }));
        
        const newSlide = { 
            ...sourceSlide, 
            id: `slide_${Date.now()}`, 
            title: `${sourceSlide.title} (Kopia)`,
            elements: clonedElements
        };
        
        setSlides(prev => {
            const next = [...prev];
            next.splice(index + 1, 0, newSlide);
            return next;
        });
        setActiveSlideIndex(index + 1);
        setIsSaving(false);
    };

    // --- SAVE & EXPORT STATES ---
    const [boardId, setBoardId] = useState(initialBoardId || null); 
    const [isSaving, setIsSaving] = useState(false);
    const [localTitle, setLocalTitle] = useState(sheetTitle || (lang === 'sv' ? "Min Presentation" : "My Presentation"));

    const [activeIds, setActiveIds] = useState(
        initialSlides?.[0]?.activeIds || []
    );
    const [clueProgress, setClueProgress] = useState({});
    const [presentationIndex, setPresentationIndex] = useState(0);

    const [isLeftCollapsed, setIsLeftCollapsed] = useState(false); 
    const [isRightCollapsed, setIsRightCollapsed] = useState(true);
    const [showLiveModal, setShowLiveModal] = useState(false);
    
    const [globalZoom, setGlobalZoom] = useState(initialSettings?.globalZoom || 2);
    const [viewMode, setViewMode] = useState(initialSettings?.viewMode || 'list'); 
    const [bgType, setBgType] = useState(initialSettings?.bgType || 'blank');
    const [clueViewMode, setClueViewMode] = useState('steps');

    const [livePacket, setLivePacket] = useState(packet || []);
    const [isSummonerOpen, setIsSummonerOpen] = useState(false);

    const [isPromptBuilderOpen, setIsPromptBuilderOpen] = useState(false);
    const [customPromptText, setCustomPromptText] = useState('');
    const [openAlignMenuId, setOpenAlignMenuId] = useState(null);

    const currentFocusedQuestion = livePacket.find(p => activeIds.includes(p.id)) || livePacket[presentationIndex] || null;
    const { coachProps } = useMyCoach(currentFocusedQuestion, lang);
    const presentationBoardEndRef = useRef(null);
    const [spotlightVisual, setSpotlightVisual] = useState(null);

    // --- ACTIVITY / GAME STATES ---
    const [showActivityHub, setShowActivityHub] = useState(false);
    const [activeGameConfig, setActiveGameConfig] = useState(null);

    // Interactive Spotlight Tour Steps
    const presentationTourSteps = useMemo(() => [
        {
            selector: '[data-tour="pres-sidebar"]',
            onEnter: () => setIsLeftCollapsed(false),
            title: {
                sv: '1. Slides, uppgifter & diskussionsfrågor',
                en: '1. Slides, Questions & Discussion Prompts'
            },
            description: {
                sv: 'Skapa nya slides, hämta matteuppgifter via "Uppgift" eller lägg till öppna textfrågor. Under "Uppgifter" kan du även fördela 1 uppgift per slide med ett klick.',
                en: 'Create new slides, summon math problems via "Math", or add open prompts. Under "Questions", distribute 1 question per slide in a single click.'
            }
        },
        {
            selector: '[data-tour="pres-stage"]',
            onEnter: () => setViewMode('list'),
            title: {
                sv: '2. Interaktiv 16:9-tavla & verktygslådor',
                en: '2. Interactive 16:9 Stage & Tool Drawers'
            },
            description: {
                sv: 'Rita, skriv och dra ut laborativa verktyg (algebrabrickor, bråkmodeller, 2D/3D-figurer och koordinatsystem) från verktygslisten längst ned.',
                en: 'Draw, annotate, and spawn manipulatives (algebra tiles, fraction bars, 2D/3D shapes, and coordinate axes) from the bottom toolbar.'
            }
        },
        {
            selector: '[data-tour="pres-clues-panel"]',
            onEnter: () => setIsRightCollapsed(false),
            title: {
                sv: '3. Lösningssteg, Coach & Facit',
                en: '3. Solution Steps, Coach & Answer Key'
            },
            description: {
                sv: 'Visa steg-för-steg-ledtrådar, öppna Coach-läget på stora skärmen eller infoga lösningsrutor direkt på sliden under genomgången.',
                en: 'Reveal step-by-step clues, launch Coach mode on the main stage, or push dynamic solution boxes onto the slide during instruction.'
            }
        },
        {
            selector: '[data-tour="pres-file-menu"]',
            title: {
                sv: '4. Arkiv, teman & spara i modul',
                en: '4. File Menu, Themes & Save to Unit'
            },
            description: {
                sv: 'Under Arkiv kan du spara presentationen i molnet, byta färgtema eller lägga in den som en genomgång i en planering/modul.',
                en: 'Open File to save your deck to the cloud, switch presentation themes, or attach it as a walkthrough inside a curriculum unit.'
            }
        },
        {
            selector: '[data-tour="pres-launch-actions"]',
            title: {
                sv: '5. Presentera i helskärm eller Gå Live',
                en: '5. Present Fullscreen or Go Live'
            },
            description: {
                sv: 'Klicka "Presentera" (tangent P) för helskärm, eller "Gå Live" så eleverna ansluter med klasskod och ritar sina svar i realtid (sparas i 7 dagar).',
                en: 'Click "Present" (key P) for fullscreen, or "Go Live" so students join via class code and submit live boards (stored for 7 days).'
            }
        }
    ], []);

    const currentPinnedIds = JSON.stringify(slides[activeSlideIndex]?.activeIds || []);
    useEffect(() => {
        if (sidebarTab === 'slides') setActiveIds(JSON.parse(currentPinnedIds));
    }, [activeSlideIndex, sidebarTab, currentPinnedIds]);

    useEffect(() => {
        setIsDirty(true);
    }, [slides, livePacket, localTitle, presentationTheme, bgType, viewMode]);

    useEffect(() => {
        if (clueViewMode === 'coach' && presentationBoardEndRef.current) {
            presentationBoardEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [coachProps.currentStep, clueViewMode]);

    const handleRegenerateQuestion = async (targetId) => {
        const targetItem = livePacket.find(q => q.id === targetId);
        if (!targetItem) return;
        try {
            const topic = targetItem.topicId || targetItem.topic || targetItem.topic_id || targetItem.metadata?.topic || 'algebraic_geometry';
            const level = targetItem.level || targetItem.metadata?.level || 1;
            const variation = targetItem.variationKey || targetItem.variation_key || targetItem.metadata?.variation_key;

            let url = `/api/question?topic=${topic}&level=${level}&lang=${lang}`;
            if (variation && variation !== 'generic') url += `&variation=${variation}`;

            const res = await fetch(url);
            const freshData = await res.json();

            if (freshData.error || !freshData.renderData) return;

            setLivePacket(prev => prev.map(q => {
                if (q.id === targetId) {
                    return {
                        ...q,
                        resolvedData: {
                            renderData: freshData.renderData,
                            token: freshData.token,
                            clues: freshData.clues,
                            level: freshData.level || level
                        }
                    };
                }
                return q;
            }));
            setClueProgress(prev => ({ ...prev, [targetId]: 0 }));
        } catch (err) {
            console.error("Error cycling question parameters:", err);
        }
    };

    // --- SLIDE MANAGEMENT ---
    const handleAddSlide = () => {
        const newSlide = { id: `slide_${Date.now()}`, elements: [], scrollX: 0, scrollY: 0, title: `Slide ${slides.length + 1}`, activeIds: [] };
        setSlides([...slides, newSlide]);
        setActiveSlideIndex(slides.length); 
        setSidebarTab('slides'); 
    };

    const handleRenameSlide = (index, newName) => {
        setSlides(prev => prev.map((s, i) => i === index ? { ...s, title: newName.trim() || `Slide ${i + 1}` } : s));
    };

    const handleToggleSlideLayout = (index, layoutType) => {
        setSlides(prev => prev.map((s, i) => i === index ? { ...s, layout: layoutType } : s));
    };

    const handleDeleteSlide = (e, index) => {
        e.stopPropagation();
        if (slides.length <= 1) {
            alert(lang === 'sv' ? "Kan inte ta bort den sista sliden." : "Cannot delete the last slide.");
            return;
        }
        if (window.confirm(lang === 'sv' ? "Är du säker på att du vill ta bort denna slide?" : "Are you sure you want to delete this slide?")) {
            const newSlides = slides.filter((_, i) => i !== index);
            setSlides(newSlides);
            if (activeSlideIndex >= index && activeSlideIndex > 0) setActiveSlideIndex(activeSlideIndex - 1);
        }
    };

    const togglePinToSpecificSlide = (e, qId, slideIdx) => {
        e.stopPropagation();
        setSlides(prev => prev.map((s, idx) => {
            if (idx === slideIdx) {
                const pinned = s.activeIds || [];
                return { ...s, activeIds: pinned.includes(qId) ? pinned.filter(id => id !== qId) : [...pinned, qId] };
            }
            return s;
        }));
    };

    const createSlideWithQuestion = (e, qId) => {
        e.stopPropagation();
        const newSlide = { id: `slide_${Date.now()}`, elements: [], scrollX: 0, scrollY: 0, title: `Slide ${slides.length + 1}`, activeIds: [qId] };
        setSlides(prev => [...prev, newSlide]);
    };

    const handleDeleteQuestion = (e, targetId) => {
        e.stopPropagation();
        if (!window.confirm(lang === 'sv' ? "Är du säker på att du vill ta bort denna uppgift?" : "Are you sure you want to delete this question?")) return;

        setLivePacket(prev => prev.filter(q => q.id !== targetId));
        setActiveIds(prev => prev.filter(id => id !== targetId));
        setSlides(prev => prev.map(s => ({
            ...s,
            activeIds: (s.activeIds || []).filter(id => id !== targetId)
        })));

        setPresentationIndex(prev => {
            if (prev >= livePacket.length - 1) return Math.max(0, livePacket.length - 2);
            return prev;
        });
        
        setIsSaving(false);
    };

    const handleAutoDistribute = () => {
        if (!window.confirm(lang === 'sv' ? "Detta raderar dina nuvarande slides och skapar 1 ny slide per uppgift. Fortsätt?" : "This will replace current slides and create 1 slide per question. Continue?")) return;
        
        const newSlides = livePacket.map((q, idx) => ({
            id: `slide_${Date.now()}_${idx}`,
            elements: [], scrollX: 0, scrollY: 0,
            title: `Slide ${idx + 1}`,
            activeIds: [q.id]
        }));
        
        setSlides(newSlides);
        setActiveSlideIndex(0);
        setSidebarTab('slides');
    };

    const pushDynamicCluesToCanvas = (qId) => {
        syncProgress('whiteboard_clue_pushed', { app_mode: 'presentation_builder', tool_used: 'dynamic_box', has_latex: true, has_text: true });
        updateCurrentSlideElements(prev => [...prev, {
            id: Date.now().toString(), type: 'dynamicClues', x: 50, y: 150, width: 450, height: 400,
            questionId: qId, stroke: '#0f172a', rotation: 0, opacity: 1
        }]);
    };

    const handleGoLive = () => {
        const trimmedTitle = localTitle.trim();
        if (!boardId || !trimmedTitle || trimmedTitle === "Min Presentation" || trimmedTitle === "My Presentation") {
            setTempTitleInput(trimmedTitle && trimmedTitle !== "Min Presentation" && trimmedTitle !== "My Presentation" ? trimmedTitle : "");
            setShowNamingModal(true);
            return;
        }
        setShowLiveModal(true);
    };
    
    const handleAddCustomPrompt = () => {
        if (!customPromptText.trim()) return;
        
        syncProgress('custom_prompt_added', { app_mode: 'presentation_builder', prompt_length: customPromptText.trim().length });
        
        const newItem = {
            id: `prompt_${Date.now()}`, type: 'custom_prompt', answerType: 'free_text',
            text: customPromptText.trim(), align: 'center', scale: 1.0, columnSpan: 6, showLatex: false, showVisual: false  
        };
        
        setLivePacket([...livePacket, newItem]);
        setActiveIds([newItem.id]);
        setClueProgress({ ...clueProgress, [newItem.id]: 0 });
        setPresentationIndex(livePacket.length);
        setSidebarTab('questions');
        setIsPromptBuilderOpen(false);
        setCustomPromptText('');
        setIsSaving(false);
    };

    const pushClueToCanvas = (clue, mode = 'both') => {
        const text = typeof clue === 'object' ? clue[lang] || clue.text : clue;
        const latex = typeof clue === 'object' ? clue.latex : null;
        
        syncProgress('whiteboard_clue_pushed', { app_mode: 'presentation_builder', tool_used: mode, has_latex: !!latex, has_text: !!text });
        
        let newElements = [];
        if ((mode === 'both' || mode === 'text') && text && text.trim() !== '') {
            newElements.push({
                id: Date.now().toString(), type: 'richText', x: 50, y: 150, width: 400, height: 100,
                content: `<p style="font-size:32px; font-weight:bold; font-family: sans-serif; line-height: normal;">${text}</p>`, stroke: '#0f172a', rotation: 0, opacity: 1
            });
        }
        if ((mode === 'both' || mode === 'math') && latex) {
            newElements.push({
                id: (Date.now() + 1).toString(), type: 'math', x: 50, y: (mode === 'both' && text) ? 280 : 150, width: 400, height: 80,
                label: latex, fontSize: 48, stroke: '#0f172a', rotation: 0, opacity: 1
            });
        }
        updateCurrentSlideElements(prev => [...prev, ...newElements]);
    };

    // --- SAVE & EXPORT STATES ---
    const executeSave = async ({ forceNewCopy = false, silent = false } = {}) => {
        setIsSaving(true);
        syncBatchProgress('presentation_saved', livePacket, { app_mode: 'presentation_builder' });

        try {
            let activeTeacherId = teacherId;
            if (!activeTeacherId) {
                const { data: authData } = await supabase.auth.getUser();
                activeTeacherId = authData?.user?.id;
                if (activeTeacherId) setTeacherId(activeTeacherId);
            }
            if (!activeTeacherId) throw new Error("Not authenticated");

            let targetTitle = localTitle.trim() || (lang === 'sv' ? "Namnlös Presentation" : "Untitled Presentation");
            if (forceNewCopy && !targetTitle.includes(lang === 'sv' ? '(Kopia)' : '(Copy)')) {
                targetTitle = `${targetTitle} (${lang === 'sv' ? 'Kopia' : 'Copy'})`;
                setLocalTitle(targetTitle);
            }

            const payload = {
                title: targetTitle,
                type: 'board',
                user_id: activeTeacherId,
                packet: { slides, livePacket, settings: { bgType, viewMode, globalZoom, theme: presentationTheme } }
            };

            let res;
            if (boardId && !forceNewCopy) {
                res = await supabase.from('saved_sheets').update(payload).eq('id', boardId).select().single();
            } else {
                res = await supabase.from('saved_sheets').insert([payload]).select().single();
            }

            if (res.error) throw res.error;

            setBoardId(res.data.id);
            setIsDirty(false);

            if (!silent) {
                alert(
                    forceNewCopy || !boardId
                        ? (lang === 'sv' ? "En ny kopia har sparats i molnet!" : "Saved as a new copy to cloud!")
                        : (lang === 'sv' ? "Ändringarna har sparats!" : "Changes saved!")
                );
            }

            return res.data.id;
        } catch (err) {
            console.error("Save Error:", err);
            if (!silent) alert(lang === 'sv' ? "Kunde inte spara presentationen." : "Failed to save presentation.");
            return null;
        } finally {
            setIsSaving(false);
        }
    };

    const handleSave = async (silent = false) => {
        if (boardId && !silent) {
            setShowSaveChoiceModal(true);
            return boardId;
        }
        return await executeSave({ forceNewCopy: false, silent });
    };

    const handleSaveAsCopy = async () => {
        setIsFileMenuOpen(false);
        await executeSave({ forceNewCopy: true, silent: false });
    };

    const handleOpenSaveToUnit = async () => {
        setIsFileMenuOpen(false);
        const currentBoardId = await handleSave(true);
        if (currentBoardId) {
            setShowSaveToUnitModal(true);
        } else {
            alert(lang === 'sv' 
                ? "Kunde inte spara presentationen innan den lades till i modulen. Kontrollera din anslutning eller inloggning." 
                : "Could not save presentation before adding to unit. Please check your connection or login.");
        }
    };

    const handleConfirmSaveToUnit = async ({ unitId, partId, insertIndex, title }) => {
        try {
            let targetBoardId = boardId;
            if (!targetBoardId) {
                targetBoardId = await handleSave(true);
            }
            if (!targetBoardId) {
                throw new Error("Missing presentation ID");
            }

            const { data: bucket, error } = await supabase.from('teacher_buckets').select('payload').eq('id', unitId).single();
            if (error) throw error;
            
            const currentPayload = bucket.payload || [];
            const partIndex = currentPayload.findIndex(p => p.id === partId);
            if (partIndex === -1) throw new Error("Part not found");
            
            const finalTitle = (title && title.trim() && title !== "Min Presentation" && title !== "My Presentation")
                ? title.trim()
                : (localTitle.trim() || (lang === 'sv' ? "Namnlös Presentation" : "Untitled Presentation"));

            const newStep = {
                id: `step_inst_${targetBoardId}_${Date.now()}`,
                type: 'instruction',
                sheetId: targetBoardId,
                sheetTitle: finalTitle
            };

            const steps = currentPayload[partIndex].steps || [];
            steps.splice(insertIndex, 0, newStep);
            currentPayload[partIndex].steps = steps;

            const { error: updateErr } = await supabase.from('teacher_buckets').update({ payload: currentPayload }).eq('id', unitId);
            if (updateErr) throw updateErr;

            alert(lang === 'sv' ? "Presentationen har lagts till i modulen!" : "Presentation added to module!");
            setShowSaveToUnitModal(false);
        } catch(e) {
            console.error("Failed to save to unit:", e);
            alert(lang === 'sv' ? "Ett fel uppstod vid sparandet." : "An error occurred during save.");
        }
    };

    const handleSaveAndLaunch = async () => {
        const finalTitle = tempTitleInput.trim() || (lang === 'sv' ? "Namnlös Presentation" : "Untitled Presentation");
        setLocalTitle(finalTitle);
        setShowNamingModal(false);

        setIsSaving(true);
        
        syncBatchProgress('presentation_saved', livePacket, {
            app_mode: 'presentation_builder',
            save_type: 'save_and_launch'
        });

        try {
            if (!teacherId) throw new Error("Not authenticated");

            const payload = {
                title: finalTitle,
                type: 'board', 
                user_id: teacherId,
                packet: { slides, livePacket, settings: { bgType, viewMode, globalZoom, theme: presentationTheme } }
            };

            const { data: savedSheet, error } = await supabase.from('saved_sheets').insert([payload]).select().single();
            if (error) throw error;
            setBoardId(savedSheet.id);
            setShowLiveModal(true);
        } catch (err) {
            console.error("Save failed during Go Live:", err);
            alert(lang === 'sv' ? "Kunde inte spara presentationen." : "Failed to save presentation.");
        } finally {
            setIsSaving(false);
        }
    };
    

    const handleLaunchWithoutSaving = () => {
        const finalTitle = tempTitleInput.trim() || (lang === 'sv' ? "Tillfällig Presentation" : "Temporary Presentation");
        setLocalTitle(finalTitle);
        setShowNamingModal(false);
        setShowLiveModal(true); 
    };

    const confirmLaunchLive = async (configuredSettings) => {
        setShowLiveModal(false);

        syncBatchProgress('presentation_live_started', livePacket, { app_mode: 'teacher_live', ...configuredSettings });

        try {
            if (!teacherId) throw new Error("Not authenticated");
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();
            const sessionPayload = {
                mode: 'presentation',
                packet: livePacket,
                slides: slides,
                settings: { bgType, viewMode, globalZoom, theme: presentationTheme, ...configuredSettings }
            };

            const { data: roomData, error } = await supabase
                .from('rooms')
                .insert([{
                    teacher_id: teacherId,
                    class_code: code,
                    status: 'active',
                    current_slide_index: activeSlideIndex || 0,
                    active_question_data: sessionPayload,
                    active_worksheet_id: boardId || null, 
                    title: localTitle || (lang === 'sv' ? "Live Presentation" : "Live Presentation")
                }]).select().single();

            if (error) throw error;
            if (onLaunchLive) onLaunchLive(roomData);
        } catch (err) {
            console.error("Failed to start live session:", err);
            alert(lang === 'sv' ? "Kunde inte starta live-lektionen." : "Failed to start live session.");
        }
    };

    const exportToCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
        csvContent += (lang === 'sv' ? "Slide,Titel,Textinnehåll\n" : "Slide,Title,Text Content\n");

        const parser = new DOMParser();

        slides.forEach((slide, idx) => {
            const textElements = slide.elements.filter(el => el.type === 'richText');
            textElements.forEach(el => {
                const doc = parser.parseFromString(el.content || "", 'text/html');
                let rawText = doc.body.textContent || "";
                rawText = rawText.replace(/"/g, '""');
                if (/^[=+\-@\t\r]/.test(rawText.trim())) rawText = "'" + rawText.trim();
                csvContent += `${idx + 1},"${slide.title}","${rawText}"\n`;
            });
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${sheetTitle || 'presentation'}_export.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsFileMenuOpen(false);
    };

    const updateCurrentSlideElements = (action) => {
        setSlides(prevSlides => {
            const newSlides = [...prevSlides];
            const currentElements = newSlides[activeSlideIndex].elements;
            const nextElements = typeof action === 'function' ? action(currentElements) : action;
            newSlides[activeSlideIndex] = { ...newSlides[activeSlideIndex], elements: nextElements };
            return newSlides;
        });
    };

    const toggleQuestion = (id) => {
        if (activeIds.includes(id)) {
            setActiveIds(activeIds.filter(qId => qId !== id));
        } else if (activeIds.length < 3) {
            setActiveIds([...activeIds, id]);
            if (clueProgress[id] === undefined) setClueProgress({ ...clueProgress, [id]: 0 });
            if (activeIds.length === 0) {
                const newIdx = livePacket.findIndex(p => p.id === id);
                if (newIdx !== -1) setPresentationIndex(newIdx);
            }
        }
    };

    const focusSingleQuestionOnWorksheet = (id) => {
        setActiveIds([id]);
        if (clueProgress[id] === undefined) setClueProgress({ ...clueProgress, [id]: 0 });
        const masterIdx = livePacket.findIndex(p => p.id === id);
        if (masterIdx !== -1) setPresentationIndex(masterIdx);
    };

    const handleCanvasPrev = () => {
        if (sidebarTab === 'slides') {
            if (activeSlideIndex > 0) setActiveSlideIndex(activeSlideIndex - 1);
        } else {
            if (livePacket.length === 0) return; 
            let targetIdx = presentationIndex;
            if (activeIds.length > 0) targetIdx -= 1; 
            if (targetIdx < 0) return;
            setPresentationIndex(targetIdx);
            setActiveIds([livePacket[targetIdx].id]); 
            if (clueProgress[livePacket[targetIdx].id] === undefined) {
                setClueProgress(prev => ({ ...prev, [livePacket[targetIdx].id]: 0 }));
            }
        }
    };

    const handleCanvasNext = () => {
        if (sidebarTab === 'slides') {
            if (activeSlideIndex < slides.length - 1) setActiveSlideIndex(activeSlideIndex + 1);
        } else {
            if (livePacket.length === 0) return; 
            let targetIdx = presentationIndex;
            if (activeIds.length > 0) targetIdx += 1;
            if (targetIdx >= livePacket.length) return;
            setPresentationIndex(targetIdx);
            setActiveIds([livePacket[targetIdx].id]); 
            if (clueProgress[livePacket[targetIdx].id] === undefined) {
                setClueProgress(prev => ({ ...prev, [livePacket[targetIdx].id]: 0 }));
            }
        }
    };

    const [isPresenting, setIsPresenting] = useState(false);

    const togglePresentMode = async () => {
        if (!isPresenting) {
            try {
                if (document.documentElement.requestFullscreen) {
                    await document.documentElement.requestFullscreen();
                }
            } catch {
                // Fullscreen blocked, proceed anyway
            }
            setIsPresenting(true);
        } else {
            if (document.fullscreenElement && document.exitFullscreen) {
                await document.exitFullscreen();
            }
            setIsPresenting(false);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

            if (e.key === 'F11' || e.key === 'F11') {
                togglePresentMode();
            } else if (e.key === 'Escape' && isPresenting) {
                setIsPresenting(false);
            } else if (isPresenting) {
                if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
                    if (activeSlideIndex < slides.length - 1) setActiveSlideIndex(prev => prev + 1);
                } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
                    if (activeSlideIndex > 0) setActiveSlideIndex(prev => prev - 1);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPresenting, activeSlideIndex, slides.length]);

    const sizeClasses = { desc: 'text-sm', latex: 'text-lg', clue: 'text-sm', headerText: 'text-base', visualClass: 'scale-100 max-h-[180px] mb-2' };
    const getColSpanClass = (span) => ({ 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4', 6: 'col-span-6' }[span] || 'col-span-6');

    const currentTheme = PRESENTATION_THEMES[presentationTheme] || PRESENTATION_THEMES.clean;

    return (
        <div 
            className={`presentation-container fixed inset-0 z-[100] flex flex-col font-sans overflow-hidden animate-in fade-in bg-[var(--bg-canvas)] text-[var(--text-main)] ${currentTheme.wrapperClass}`}
            style={currentTheme.cssVars}
        >
            {/* CONDENSED RESPONSIVE HEADER */}
            <header className="bg-[var(--bg-card)] border-b border-[var(--border-main)] text-[var(--text-main)] px-4 sm:px-6 py-2.5 flex justify-between items-center shadow-2xs z-50 select-none gap-4">
                
                {/* 1. LEFT SIDE: Title & File Menu */}
                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    <div data-tour="pres-file-menu" className="relative">
                        <button 
                            type="button"
                            onClick={() => setIsFileMenuOpen(!isFileMenuOpen)} 
                            className={`p-2 rounded-xl flex items-center gap-2 transition-colors border cursor-pointer ${isFileMenuOpen ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' : 'bg-[var(--bg-surface)] text-[var(--text-main)] border-[var(--border-strong)] hover:bg-[var(--bg-surface-hover)]'}`}
                        >
                            <Menu size={18} />
                            <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
                                {lang === 'sv' ? "Arkiv" : "File"}
                            </span>
                        </button>

                        {/* File Dropdown Menu */}
                        {isFileMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsFileMenuOpen(false)} />
                                <div className="absolute top-full left-0 mt-2 w-56 bg-[var(--bg-card)] rounded-2xl shadow-xl border border-[var(--border-strong)] py-2 z-50 text-[var(--text-main)] flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
                                    <button 
                                        type="button"
                                        onClick={() => { setShowLibraryModal(true); setIsFileMenuOpen(false); }} 
                                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--bg-surface)] transition-colors text-left text-xs font-bold cursor-pointer"
                                    >
                                        <FolderOpen size={16} className="text-[var(--text-muted)]" />
                                        {lang === 'sv' ? "Öppna från arkiv..." : "Open from library..."}
                                    </button>
                                    <div className="w-full h-px bg-[var(--border-main)] my-1" />
                                    <button 
                                        type="button"
                                        onClick={() => { handleSave(); setIsFileMenuOpen(false); }} 
                                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--bg-surface)] transition-colors text-left text-xs font-bold cursor-pointer"
                                    >
                                        <UploadCloud size={16} className="text-emerald-600 dark:text-emerald-400" />
                                        {lang === 'sv' ? "Spara till molnet" : "Save to cloud"}
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={handleSaveAsCopy} 
                                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--bg-surface)] transition-colors text-left text-xs font-bold cursor-pointer"
                                    >
                                        <Copy size={16} className="text-sky-600 dark:text-sky-400" />
                                        {lang === 'sv' ? "Spara som ny kopia..." : "Save as new copy..."}
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={handleOpenSaveToUnit} 
                                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--bg-surface)] transition-colors text-left text-xs font-bold cursor-pointer"
                                    >
                                        <BookmarkPlus size={16} className="text-amber-500" />
                                        {lang === 'sv' ? "Spara till planering/modul" : "Save to curriculum unit"}
                                    </button>
                                    <div className="w-full h-px bg-[var(--border-main)] my-1" />
                                    <button 
                                        type="button"
                                        onClick={exportToCSV} 
                                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--bg-surface)] transition-colors text-left text-xs font-bold cursor-pointer"
                                    >
                                        <Download size={16} className="text-emerald-600 dark:text-emerald-400" />
                                        {lang === 'sv' ? "Exportera text (CSV)" : "Export text (CSV)"}
                                    </button>
                                    <div className="px-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const keys = Object.keys(PRESENTATION_THEMES);
                                                const nextIdx = (keys.indexOf(presentationTheme) + 1) % keys.length;
                                                setPresentationTheme(keys[nextIdx]);
                                                setIsSaving(false);
                                            }}
                                            className="w-full py-1.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider text-[var(--text-main)] bg-[var(--bg-surface)] border border-[var(--border-strong)] hover:border-emerald-600 cursor-pointer transition-all"
                                        >
                                            {PRESENTATION_THEMES[presentationTheme]?.name[lang] || 'Tema'}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    
                    <input 
                        type="text"
                        value={localTitle}
                        onChange={(e) => setLocalTitle(e.target.value)}
                        placeholder={lang === 'sv' ? "Namnge presentationen..." : "Name presentation..."}
                        className="bg-[var(--bg-surface)] text-[var(--text-main)] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold outline-none border border-[var(--border-strong)] focus:border-emerald-600 transition-all w-32 sm:w-64 lg:w-80 shadow-inner placeholder:text-[var(--text-muted)]"
                    />
                </div>
                
                {/* 2. CENTER SIDE: View & Zoom Controls */}
                <div className="hidden md:flex flex-1 items-center justify-center gap-3">
                    <div className="flex items-center bg-[var(--bg-surface)] p-1 rounded-xl border border-[var(--border-main)] gap-1 shadow-inner">
                        <button type="button" onClick={() => setViewMode('list')} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === 'list' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>
                            <List size={14} /> <span>{lang === 'sv' ? "List" : "List"}</span>
                        </button>
                        <button type="button" onClick={() => setViewMode('sheet')} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === 'sheet' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>
                            <FileText size={14} /> <span>{lang === 'sv' ? "Blad" : "Sheet"}</span>
                        </button>
                    </div>

                    <div className="w-px h-5 bg-[var(--border-main)]" />

                    <button
                        type="button"
                        onClick={() => setGlobalZoom(prev => Math.max(0.8, Number((prev - 0.2).toFixed(2))))}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] cursor-pointer transition-colors"
                        title="Zoom Out"
                    >
                        <ZoomOut size={14} />
                    </button>
                        <span className="text-xs font-bold font-mono tracking-wider text-[var(--text-main)] px-2 min-w-[45px] text-center select-none">
                        {Math.round(globalZoom * 100)}%
                        </span>
                    <button
                        type="button"
                        onClick={() => setGlobalZoom(prev => Math.min(4.0, Number((prev + 0.2).toFixed(2))))}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] cursor-pointer transition-colors"
                        title="Zoom In"
                    >
                        <ZoomIn size={14} />
                    </button>
                </div>

                {/* 3. RIGHT SIDE: Core Actions */}
                <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                    <button
                        type="button"
                        onClick={() => {
                            if (window.confirm(lang === 'sv' ? "Rensa alla valda uppgifter?" : "Clear all selected questions?")) {
                                setActiveIds([]);
                            }
                        }}
                        className="p-2 bg-[var(--bg-surface)] hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-[var(--border-strong)] text-[var(--text-muted)] hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-all cursor-pointer hidden lg:block shadow-2xs"
                        title={lang === 'sv' ? "Nollställ" : "Reset Canvas"}
                    >
                        <RefreshCw size={15} />
                    </button>
                    
                    <button 
                        type="button"
                        onClick={() => setShowTutorial(true)}
                        className="p-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-amber-500 border border-[var(--border-strong)] rounded-xl transition-all cursor-pointer shadow-2xs hidden sm:block"
                        title={lang === 'sv' ? "Snabbguide & Hjälp" : "Quick Guide & Help"}
                    >
                        <HelpCircle size={15} />
                    </button>
                    
                    <div className="hidden sm:block">
                        <PreferencesToggle />
                    </div>

                    <div className="w-px h-5 bg-[var(--border-main)] mx-0.5 hidden sm:block" />

                    <button 
                        type="button"
                        onClick={() => setShowActivityHub(true)} 
                        className="p-2 bg-[var(--bg-surface)] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-amber-500 rounded-xl border border-[var(--border-strong)] cursor-pointer shadow-2xs"
                        title="Spela Poängjakten"
                    >
                        <Gamepad2 size={15} />
                    </button>
                    
                    <div data-tour="pres-launch-actions" className="flex items-center gap-2">
                        <button 
                            type="button"
                            onClick={togglePresentMode}
                            className="px-3 py-2 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-[0.98] font-bold text-xs uppercase tracking-wider"
                            title={lang === 'sv' ? "Starta helskärmspresentation (Tangent: P)" : "Present Fullscreen (Key: P)"}
                        >
                            <Presentation size={15} />
                            <span className="hidden sm:inline">{lang === 'sv' ? "Presentera" : "Present"}</span>
                        </button>

                        <button 
                            type="button"
                            onClick={handleGoLive}
                            className="px-3 py-2 rounded-xl text-white bg-rose-600 hover:bg-rose-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-[0.98] font-bold text-xs uppercase tracking-wider"
                        >
                            <Monitor size={14} />
                            <span className="hidden sm:inline">
                                {lang === 'sv' ? "Gå Live" : "Go Live"}
                            </span>
                        </button>
                    </div>

                    <button 
                        type="button"
                        onClick={handleAppClose} 
                        className="p-2 sm:px-3 sm:py-2 bg-[var(--bg-surface)] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[var(--text-muted)] hover:text-rose-600 dark:hover:text-rose-400 border border-[var(--border-strong)] rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-2xs"
                    >
                        <X size={16} className="sm:hidden" />
                        <span className="hidden sm:inline">{lang === 'sv' ? "Stäng" : "Close"}</span>
                    </button>
                </div>
            </header>

            <div 
                className="flex-1 grid overflow-hidden relative transition-all duration-300"
                style={{ gridTemplateColumns: `${isLeftCollapsed ? '72px' : '288px'} 1fr ${isRightCollapsed ? '64px' : '320px'}` }}
            >
                {/* COLUMN 1: COLLAPSIBLE WORKSPACE SELECTION PICKER */}
                <div
                    data-tour="pres-sidebar"
                    className={`whiteboard-protect bg-[var(--bg-card)] border-r border-[var(--border-main)] text-[var(--text-main)] overflow-y-auto custom-scrollbar flex flex-col transition-all duration-300 select-none shrink-0 z-10 min-w-0 ${isLeftCollapsed ? 'w-[72px] items-center' : 'w-[288px]'}`}
                >
                    
                    <div className={`flex items-center justify-between p-3 border-b border-[var(--border-main)] w-full mb-3 ${isLeftCollapsed ? 'flex-col gap-2' : ''}`}>
                        {!isLeftCollapsed && <span className="font-bold text-xs text-[var(--text-muted)] uppercase tracking-wider pl-2">Verktyg</span>}
                        <button 
                            type="button"
                            onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
                            className="p-1.5 hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-xl transition-colors cursor-pointer"
                        >
                            {isLeftCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
                        </button>
                    </div>

                    <div className="w-full px-4 mb-4 shrink-0 flex flex-col gap-2">
                        {isLeftCollapsed ? (
                            <>
                                <button type="button" onClick={handleAddSlide} className="w-12 h-12 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl flex items-center justify-center transition-all shadow-2xs active:scale-[0.98] cursor-pointer mx-auto" title={lang === 'sv' ? "Lägg till Slide" : "Add Slide"}>
                                    <Presentation size={18} strokeWidth={2.5} />
                                </button>
                                <button type="button" onClick={() => setIsSummonerOpen(true)} className="w-12 h-12 bg-sky-600 text-white hover:bg-sky-700 rounded-xl flex items-center justify-center transition-all shadow-2xs active:scale-[0.98] cursor-pointer mx-auto" title={lang === 'sv' ? "Välj ny uppgift" : "Select Question"}>
                                    <FileQuestion size={18} strokeWidth={2.5} />
                                </button>
                            </>
                        ) : (
                            <div className="flex gap-2">
                                <button type="button" onClick={handleAddSlide} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-[0.98] cursor-pointer">
                                    <Presentation size={16} strokeWidth={2.5} />
                                    {lang === 'sv' ? "Ny Slide" : "New Slide"}
                                </button>
                                <div className="flex-1 flex flex-col gap-2">
                                    <button type="button" onClick={() => setIsSummonerOpen(true)} className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-[0.98] cursor-pointer">
                                        <FileQuestion size={13} strokeWidth={2.5} />
                                        {lang === 'sv' ? "Uppgift" : "Math"}
                                    </button>
                                    <button type="button" onClick={() => setIsPromptBuilderOpen(true)} className="flex-1 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] border border-[var(--border-strong)] rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-[0.98] cursor-pointer">
                                        <MessageSquare size={13} strokeWidth={2.5} />
                                        {lang === 'sv' ? "Textfråga" : "Prompt"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={`flex bg-[var(--bg-surface)] p-1 rounded-xl mb-3 shadow-inner border border-[var(--border-main)] ${isLeftCollapsed ? 'flex-col gap-1 mx-2' : 'flex-row gap-1 mx-4'}`}>
                        <button 
                            type="button"
                            onClick={() => setSidebarTab('slides')} 
                            className={`flex-1 py-2 flex items-center justify-center rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${sidebarTab === 'slides' ? 'bg-[var(--bg-card)] text-emerald-600 dark:text-emerald-400 shadow-2xs' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                            title={lang === 'sv' ? "Slides" : "Slides"}
                        >
                            {isLeftCollapsed ? <Presentation size={15} /> : "Slides"}
                        </button>
                        <button 
                            type="button"
                            onClick={() => setSidebarTab('questions')} 
                            className={`flex-1 py-2 flex items-center justify-center rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${sidebarTab === 'questions' ? 'bg-[var(--bg-card)] text-sky-600 dark:text-sky-400 shadow-2xs' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                            title={lang === 'sv' ? "Uppgifter" : "Questions"}
                        >
                            {isLeftCollapsed ? <FileQuestion size={15} /> : (lang === 'sv' ? 'Uppgifter' : 'Questions')}
                        </button>
                    </div>

                    {!isLeftCollapsed && sidebarTab === 'questions' && livePacket.length > 0 && (
                        <div className="px-4 mb-3">
                            <button 
                                type="button"
                                onClick={handleAutoDistribute} 
                                className="w-full py-2.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] border border-[var(--border-strong)] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
                            >
                                <FileQuestion size={14}/> {lang === 'sv' ? "Fördela 1 uppgift per slide" : "1 question per slide"}
                            </button>
                        </div>
                    )}
                    
                    {!isLeftCollapsed && (
                        <div className="px-5 mb-2">
                            <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider truncate">
                                {sidebarTab === 'slides' 
                                    ? `${lang === 'sv' ? 'Slides' : 'Slides'} (${slides.length})` 
                                    : `${lang === 'sv' ? 'Uppgifter' : 'Questions'} (${livePacket.length})`
                                }
                            </h2>
                        </div>
                    )}

                    <div className="flex-1 flex flex-col gap-2.5 w-full min-w-0 pb-12 px-4">
                        {sidebarTab === 'slides' ? (
                            slides.map((slide, idx) => {
                                const isActive = activeSlideIndex === idx;
                                
                                if (isLeftCollapsed) {
                                    return (
                                        <button 
                                            type="button"
                                            key={slide.id} onClick={() => setActiveSlideIndex(idx)}
                                            className={`w-12 h-10 rounded-xl font-bold font-mono text-xs uppercase border flex items-center justify-center transition-all cursor-pointer shadow-2xs shrink-0 ${
                                                isActive ? 'bg-emerald-600 text-white border-emerald-600 scale-105' : 'bg-[var(--bg-card)] border-[var(--border-main)] text-[var(--text-muted)] hover:border-[var(--border-strong)]'
                                            }`}
                                        >
                                            S{idx + 1}
                                        </button>
                                    );
                                }
                                
                                return (
                                    <div 
                                        key={slide.id} 
                                        draggable
                                        onDragStart={(e) => handleSlideDragStart(e, idx)}
                                        onDragOver={(e) => handleSlideDragOver(e, idx)}
                                        onDragEnd={handleSlideDragEnd}
                                        onClick={() => setActiveSlideIndex(idx)}
                                        className={`group p-3 rounded-xl border cursor-pointer transition-all shrink-0 min-w-0 flex items-center justify-between shadow-2xs ${
                                            isActive ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40' : 'border-[var(--border-main)] hover:border-[var(--border-strong)] bg-[var(--bg-card)]'
                                        } ${draggedSlideIndex === idx ? 'opacity-40 border-dashed border-emerald-500' : ''}`}
                                    >
                                        <div className="flex items-center gap-2.5 overflow-hidden w-full">
                                            <GripVertical size={14} className="text-[var(--text-muted)] shrink-0 cursor-grab group-hover:text-[var(--text-main)]" />
                                            
                                            <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-bold font-mono text-xs ${
                                                isActive ? 'bg-emerald-600 text-white' : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-main)]'
                                            }`}>
                                                {idx + 1}
                                            </div>
                                            
                                            {editingSlideIndex === idx ? (
                                                <input 
                                                    autoFocus
                                                    type="text"
                                                    className="w-full text-xs font-bold uppercase tracking-wider bg-transparent outline-none border-b border-emerald-500 text-[var(--text-main)]"
                                                    defaultValue={slide.title}
                                                    onBlur={(e) => {
                                                        handleRenameSlide(idx, e.target.value);
                                                        setEditingSlideIndex(null);
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleRenameSlide(idx, e.target.value);
                                                            setEditingSlideIndex(null);
                                                        }
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            ) : (
                                                <span 
                                                    onDoubleClick={(e) => { e.stopPropagation(); setEditingSlideIndex(idx); }}
                                                    className={`text-xs font-bold uppercase tracking-wider truncate flex-1 ${isActive ? 'text-emerald-700 dark:text-emerald-300' : 'text-[var(--text-main)]'}`}
                                                    title={lang === 'sv' ? "Dubbelklicka för att byta namn" : "Double-click to rename"}
                                                >
                                                    {slide.title}
                                                </span>
                                            )}
                                        </div>

                                        <div className={`flex gap-1 shrink-0 ml-2 transition-all opacity-0 group-hover:opacity-100 ${isActive ? 'opacity-100' : ''}`}>
                                            <button
                                                type="button"
                                                onClick={(e) => handleDuplicateSlide(e, idx)}
                                                className="p-1.5 rounded-lg transition-colors text-[var(--text-muted)] hover:text-emerald-600 hover:bg-[var(--bg-surface)] cursor-pointer"
                                                title={lang === 'sv' ? "Duplicera slide" : "Duplicate slide"}
                                            >
                                                <Copy size={13} />
                                            </button>
                                            
                                            {slides.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleDeleteSlide(e, idx)}
                                                    className="p-1.5 rounded-lg transition-colors text-[var(--text-muted)] hover:text-rose-600 hover:bg-[var(--bg-surface)] cursor-pointer"
                                                    title={lang === 'sv' ? "Ta bort slide" : "Delete slide"}
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <>
                                {livePacket.map((q, idx) => {
                                    const isActive = activeIds.includes(q.id);
                                    if (isLeftCollapsed) {
                                        return (
                                            <button 
                                                type="button"
                                                key={q.id} onClick={() => toggleQuestion(q.id)}
                                                className={`w-12 h-10 rounded-xl font-bold font-mono text-xs uppercase border flex items-center justify-center transition-all cursor-pointer shadow-2xs shrink-0 ${
                                                    isActive ? 'bg-sky-600 border-sky-600 text-white scale-105' : 'bg-[var(--bg-card)] border-[var(--border-main)] text-[var(--text-muted)] hover:border-[var(--border-strong)]'
                                                }`}
                                            >
                                                Q{idx + 1}
                                            </button>
                                        );
                                    }
                                    return (
                                        <div 
                                            key={q.id} onClick={() => toggleQuestion(q.id)}
                                            className={`p-3.5 rounded-xl border cursor-pointer transition-all shrink-0 min-w-0 shadow-2xs ${
                                                isActive ? 'border-sky-500 bg-sky-50/60 dark:bg-sky-950/40' : 'border-[var(--border-main)] hover:border-[var(--border-strong)] bg-[var(--bg-card)]'
                                            }`}
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider font-mono">
                                                    {lang === 'sv' ? 'Uppgift' : 'Question'} {idx + 1}
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    <button 
                                                        type="button"
                                                        onClick={(e) => togglePinToSpecificSlide(e, q.id, activeSlideIndex)}
                                                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                                            (slides[activeSlideIndex]?.activeIds || []).includes(q.id) 
                                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs scale-105' 
                                                                : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-emerald-600 border-[var(--border-main)]'
                                                        }`}
                                                        title={lang === 'sv' ? "Fäst på aktuell slide" : "Pin to active slide"}
                                                    >
                                                        <Monitor size={13}/>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleDeleteQuestion(e, q.id)}
                                                        className="p-1.5 rounded-lg border bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-rose-600 border-[var(--border-main)] transition-colors cursor-pointer"
                                                        title={lang === 'sv' ? "Ta bort uppgift" : "Delete question"}
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                    {isActive && <span className="w-2 h-2 rounded-full bg-sky-600 shadow-2xs ml-0.5" />}
                                                </div>
                                            </div>
                                            
                                            <div className="text-xs font-semibold line-clamp-2 text-[var(--text-muted)] truncate mb-2.5">
                                                <MathDisplay content={compileAnchoredStory(q, lang)} />
                                            </div>

                                            <div className="flex flex-col gap-1 mt-auto pt-2 border-t border-[var(--border-main)]" onPointerDown={e => e.stopPropagation()}>
                                                <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                                                    {lang === 'sv' ? "Fäst på Slide:" : "Pin to Slide:"}
                                                </span>
                                                <div className="flex flex-wrap gap-1">
                                                    {slides.map((s, sIdx) => {
                                                        const isPinned = (s.activeIds || []).includes(q.id);
                                                        return (
                                                            <button
                                                                type="button"
                                                                key={s.id}
                                                                onClick={(e) => togglePinToSpecificSlide(e, q.id, sIdx)}
                                                                className={`w-6 h-6 rounded-md border text-[9px] font-bold font-mono transition-all cursor-pointer ${
                                                                    isPinned 
                                                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' 
                                                                        : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-main)] hover:border-emerald-600 hover:text-emerald-600'
                                                                }`}
                                                                title={s.title}
                                                            >
                                                                {sIdx + 1}
                                                            </button>
                                                        );
                                                    })}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => createSlideWithQuestion(e, q.id)}
                                                        className="w-6 h-6 rounded-md border border-dashed border-[var(--border-strong)] text-[var(--text-muted)] hover:text-emerald-600 hover:border-emerald-600 flex items-center justify-center transition-all cursor-pointer"
                                                        title={lang === 'sv' ? "Skapa ny slide med denna uppgift" : "Create new slide with this question"}
                                                    >
                                                        <Plus size={10} strokeWidth={3} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>
                </div>

                {/* COLUMN 2: WORKSPACE CANVAS INTERACTION SHELF */}
                <main
                    data-tour="pres-stage"
                    className="relative overflow-hidden h-full w-full flex flex-col items-center justify-center bg-[var(--bg-canvas)] transition-colors duration-300 p-6"
                >
                    
                    {/* Floating Navigation Header */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-40 pointer-events-none select-none">
                        <button 
                            type="button"
                            onClick={handleCanvasPrev}
                            disabled={sidebarTab === 'slides' ? activeSlideIndex === 0 : (livePacket.length === 0 || (activeIds.length > 0 && presentationIndex === 0))}
                            className="w-11 h-11 bg-[var(--bg-card)] text-[var(--text-main)] rounded-xl flex items-center justify-center shadow-lg hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-0 disabled:pointer-events-none cursor-pointer border border-[var(--border-strong)] pointer-events-auto animate-in fade-in"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        <div className="bg-[var(--bg-card)] text-[var(--text-main)] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider backdrop-blur-xs shadow-lg border border-[var(--border-strong)] pointer-events-auto flex items-center gap-2.5 transition-all">
                            {sidebarTab === 'slides' ? (
                                <>
                                    <Presentation size={15} className="text-emerald-600 dark:text-emerald-400"/>
                                    <span className="truncate max-w-[150px]">{slides[activeSlideIndex]?.title}</span>
                                    <span className="text-[var(--text-muted)] px-1 border-l border-[var(--border-main)] font-mono">{activeSlideIndex + 1} / {slides.length}</span>
                                    <span className="text-emerald-700 dark:text-emerald-400 text-[10px] bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 font-mono">16:9</span>
                                    
                                    <div className="flex bg-[var(--bg-surface)] p-0.5 rounded-lg border border-[var(--border-main)] ml-2">
                                        <button
                                            type="button"
                                            onClick={() => handleToggleSlideLayout(activeSlideIndex, 'canvas')}
                                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                                slides[activeSlideIndex]?.layout !== 'instruction_template'
                                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                            }`}
                                        >
                                            Canvas
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleToggleSlideLayout(activeSlideIndex, 'instruction_template')}
                                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                                slides[activeSlideIndex]?.layout === 'instruction_template'
                                                    ? 'bg-sky-600 text-white shadow-2xs'
                                                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                            }`}
                                        >
                                            {lang === 'sv' ? "Instruktion" : "Instruction"}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <FileQuestion size={15} className="text-sky-600 dark:text-sky-400"/>
                                    {activeIds.length > 0 ? (lang === 'sv' ? `Uppgift ${presentationIndex + 1} av ${livePacket.length}` : `Question ${presentationIndex + 1} of ${livePacket.length}`) : (lang === 'sv' ? 'Ingen uppgift vald' : 'No Question Selected')}
                                </>
                            )}
                        </div>

                        <button 
                            type="button"
                            onClick={handleCanvasNext}
                            disabled={sidebarTab === 'slides' ? activeSlideIndex >= slides.length - 1 : (livePacket.length === 0 || (activeIds.length > 0 && presentationIndex >= livePacket.length - 1))}
                            className="w-11 h-11 bg-[var(--bg-card)] text-[var(--text-main)] rounded-xl flex items-center justify-center shadow-lg hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-0 disabled:pointer-events-none cursor-pointer border border-[var(--border-strong)] pointer-events-auto animate-in fade-in"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    {/* The 16:9 Slide Canvas Wrapper */}
                    <div className="relative w-full h-full max-w-[1600px] max-h-[900px] flex items-center justify-center">
                        {viewMode === 'sheet' ? (
                            <div 
                                className={`relative w-full flex flex-col items-center shadow-2xl rounded-2xl border border-[var(--border-strong)] transition-colors duration-300 overflow-hidden ${bgType === 'grid' ? 'bg-[var(--bg-card)]' : 'bg-[var(--bg-card)]'}`}
                                style={{
                                    aspectRatio: '16/9',
                                    height: '100%',
                                    maxHeight: '100%'
                                }}
                            >
                                <div className="absolute inset-0 overflow-y-auto custom-scrollbar pt-16 pb-32 flex flex-col justify-start items-center z-10 pointer-events-auto">
                                    <div className="bg-[var(--bg-card)] shadow-2xl w-[210mm] h-auto min-h-[297mm] p-[15mm] pb-[40mm] flex flex-col rounded-xl border border-[var(--border-strong)] animate-in fade-in zoom-in-95 duration-150 select-none mb-8 mt-2 relative z-20 text-[var(--text-main)]">
                                        <header className="border-b-2 border-[var(--border-strong)] pb-2 mb-6 flex items-end justify-between">
                                            <h1 className="text-sm font-extrabold uppercase tracking-tight w-1/3 truncate leading-none">{sheetTitle || "Matematik"}</h1>
                                            <div className="flex gap-6 w-2/3 justify-end text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] font-mono">
                                                <div className="border-b border-[var(--border-strong)] pb-0.5 flex gap-2 flex-1 max-w-[160px]"><span>{lang === 'sv' ? "Namn:" : "Name:"}</span></div>
                                                <div className="border-b border-[var(--border-strong)] pb-0.5 flex gap-2 w-[100px]"><span>{lang === 'sv' ? "Datum:" : "Date:"}</span></div>
                                            </div>
                                        </header>

                                        <div className="grid grid-cols-6 gap-x-8 gap-y-6 items-start content-start relative">
                                            {livePacket.map((item, idx) => {
                                                const isFocused = activeIds.includes(item.id);
                                                const hasAnyFocus = activeIds.length > 0;
                                                const displayStory = item.showText !== false;
                                                const rd = item.resolvedData?.renderData;
                                                const displayLatex = item.showLatex !== false && !rd?.geometry;
                                                const displayVisual = item.showVisual !== false;

                                                return (
                                                    <React.Fragment key={item.id}>
                                                        {displayStory && (item.instructionMode === 'header' || !item.instructionMode) && (
                                                            <div className={`col-span-6 border-l-4 border-emerald-600 pl-4 bg-[var(--bg-surface)] rounded-r-xl py-2.5 transition-all duration-300 ${hasAnyFocus && !isFocused ? 'opacity-25' : 'opacity-100'}`}>
                                                                <div className={`font-bold text-[var(--text-main)] tracking-tight ${sizeClasses.headerText}`}>
                                                                    <MathDisplay content={compileAnchoredStory(item, lang)} />
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div 
                                                            onClick={() => focusSingleQuestionOnWorksheet(item.id)}
                                                            className={`relative transition-all duration-300 rounded-xl flex flex-col p-3 cursor-pointer group ${getColSpanClass(item.columnSpan || 6)} ${
                                                                isFocused ? 'bg-emerald-50/60 dark:bg-emerald-950/40 ring-2 ring-emerald-600 opacity-100 scale-[1.01]' : hasAnyFocus ? 'opacity-25' : 'hover:bg-[var(--bg-surface)]'
                                                            }`}
                                                        >
                                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-50 flex gap-1 bg-[var(--bg-card)] p-1 rounded-xl shadow-lg border border-[var(--border-strong)]" onPointerDown={(e) => e.stopPropagation()}>
                                                                <div className="flex bg-[var(--bg-surface)] rounded-lg p-0.5 border border-[var(--border-main)]">
                                                                    {['start', 'center', 'end'].map(align => (
                                                                        <button type="button" key={align} onClick={() => {
                                                                            setLivePacket(prev => prev.map(p => p.id === item.id ? { ...p, align } : p));
                                                                            setIsSaving(false);
                                                                        }} className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer ${item.align === align ? 'bg-emerald-600 text-white shadow-2xs' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>
                                                                            {align}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                                <div className="flex bg-[var(--bg-surface)] rounded-lg p-0.5 border border-[var(--border-main)]">
                                                                    {[2, 3, 4, 6].map(span => (
                                                                        <button type="button" key={span} onClick={() => {
                                                                            setLivePacket(prev => prev.map(p => p.id === item.id ? { ...p, columnSpan: span } : p));
                                                                            setIsSaving(false);
                                                                        }} className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer ${item.columnSpan === span ? 'bg-amber-600 text-white shadow-2xs' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>
                                                                            W{span}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className={`text-xs flex flex-col h-full justify-between items-${item.align || 'center'} text-${item.align === 'start' ? 'left' : item.align === 'end' ? 'right' : 'center'}`}>
                                                                <div>
                                                                    <div className="font-bold font-mono mb-1 text-[var(--text-muted)] text-[10px]">{idx + 1}.</div>
                                                                    {displayStory && item.instructionMode === 'inline' && (
                                                                        <div className={`font-bold text-[var(--text-main)] mb-2 leading-tight border-b border-[var(--border-main)] pb-2 ${sizeClasses.desc}`}>
                                                                            <MathDisplay content={compileAnchoredStory(item, lang)} />
                                                                        </div>
                                                                    )}
                                                                    {displayLatex && rd?.latex && (
                                                                        <div className={`py-3 text-center font-serif text-[var(--text-main)] ${sizeClasses.latex}`}>
                                                                            <MathDisplay content={`$$${rd.latex}$$`} />
                                                                        </div>
                                                                    )}
                                                                    {rd?.options && rd.options.length > 0 && (
                                                                        <div className="mt-2 grid grid-cols-2 gap-1.5 w-full">
                                                                            {rd.options.map((opt, oIdx) => (
                                                                                <div key={oIdx} className="flex items-center gap-1.5 text-xs bg-[var(--bg-surface)] p-2 rounded-xl border border-[var(--border-main)]">
                                                                                    <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400">{['A','B','C','D','E','F'][oIdx]}</span>
                                                                                    <MathDisplay content={opt} />
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                    {displayVisual && rd && (
                                                                        <div 
                                                                            onClick={(e) => { e.stopPropagation(); setSpotlightVisual(rd); }}
                                                                            className={`flex justify-center origin-top transition-all duration-300 cursor-zoom-in hover:opacity-80 relative z-30 ${sizeClasses.visualClass}`}
                                                                        >
                                                                            <VisualRenderer 
                                                                                data={rd} 
                                                                                isWordProblem={item.selectedStoryIndex !== null && item.selectedStoryIndex !== undefined} 
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </React.Fragment>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <SlideViewerCore
                                slide={{
                                    ...slides[activeSlideIndex],
                                    activeIds: sidebarTab === 'slides' ? (slides[activeSlideIndex]?.activeIds || []) : activeIds
                                }}
                                theme={presentationTheme}
                                currentTheme={currentTheme}
                                style={currentTheme.cssVars}
                                livePacket={livePacket}
                                lang={lang}
                                bgType={bgType}
                                globalZoom={globalZoom}
                                authorMode={true}
                                slideRendererProps={{
                                    setLivePacket: setLivePacket,
                                    clueViewMode: clueViewMode,
                                    currentFocusedQuestion: currentFocusedQuestion,
                                    coachProps: coachProps,
                                    onSpotlight: setSpotlightVisual,
                                    onRegenerate: handleRegenerateQuestion,
                                    setIsSaving: setIsSaving
                                }}
                                interactiveCanvasProps={{
                                    key: `presenter_canvas_${slides[activeSlideIndex]?.id}`,
                                    forceActive: true,
                                    isOverlay: true,
                                    setElements: updateCurrentSlideElements,
                                    onToggleBg: () => setBgType(prev => prev === 'blank' ? 'grid' : 'blank'),
                                    clueProgress,
                                    activeDrawer,
                                    onToggleDrawer: handleToggleDrawer,
                                    renderDrawer: false,
                                    toolbarMode: "teacher"
                                }}
                            />
                        )}
                    </div>

                    <WhiteboardDrawer
                        activeDrawer={activeDrawer}
                        onClose={() => setActiveDrawer(null)}
                        onSpawn={handleUniversalSpawn}
                        lang={lang}
                        showDividingLine={true}
                        elements={slides[activeSlideIndex]?.elements || []}
                        setElements={updateCurrentSlideElements}
                    />
                </main>

                {/* COLUMN 3: SOLUTIONS & COMPACT ANSWER KEY DRAWER PANEL */}
                <div 
                    data-tour="pres-clues-panel"
                    className={`whiteboard-protect bg-[var(--bg-card)] border-l border-[var(--border-main)] text-[var(--text-main)] flex flex-col shrink-0 select-none h-full transition-all duration-300 relative min-h-0 overflow-hidden ${
                        isRightCollapsed ? 'w-16 p-2 items-center justify-start pt-4' : 'w-80 p-6 gap-6'
                    }`}
                >
                    {isRightCollapsed ? (
                        <button
                            type="button"
                            onClick={() => setIsRightCollapsed(false)}
                            className="w-12 flex-1 flex flex-col items-center justify-start py-6 bg-[var(--bg-surface)] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-[var(--border-main)] rounded-2xl cursor-pointer group transition-all text-[var(--text-muted)] hover:text-emerald-600 gap-4"
                            title={lang === 'sv' ? "Expandera panel" : "Expand Panel"}
                        >
                            <Layers size={16} className="shrink-0 transition-transform group-hover:scale-110" />
                            <span 
                                className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap mt-4 select-none"
                                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                            >
                                {clueViewMode === 'steps' ? (lang === 'sv' ? "Ledtråd" : "Clues") : (lang === 'sv' ? "Facit" : "Answer Key")}
                            </span>
                        </button>
                    ) : (
                        <>
                            <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-3">
                                <div className="flex items-center gap-2">
                                    <button 
                                        type="button"
                                        onClick={() => setIsRightCollapsed(true)}
                                        className="p-1.5 hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-xl transition-colors cursor-pointer mr-0.5"
                                        title={lang === 'sv' ? "Minimera panel" : "Minimize Panel"}
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                    <Layers size={14} className="text-[var(--text-muted)]" />
                                    <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                        {clueViewMode === 'steps' ? (lang === 'sv' ? "Steg-för-steg" : "Solution Steps") : (lang === 'sv' ? "Facit" : "Answer Key")}
                                    </h2>
                                </div>
                                
                                <div className="flex bg-[var(--bg-surface)] p-0.5 rounded-xl border border-[var(--border-main)] shadow-inner gap-0.5">
                                    <button type="button" onClick={() => setClueViewMode('steps')} className={`px-2 py-1 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer ${clueViewMode === 'steps' ? 'bg-[var(--bg-card)] text-emerald-600 dark:text-emerald-400 shadow-2xs' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>
                                        {lang === 'sv' ? "Steg" : "Steps"}
                                    </button>
                                    <button type="button" onClick={() => setClueViewMode('coach')} className={`px-2 py-1 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer ${clueViewMode === 'coach' ? 'bg-purple-600 text-white shadow-2xs' : 'text-purple-600 dark:text-purple-400 hover:text-purple-700'}`}>
                                        Coach
                                    </button>
                                    <button type="button" onClick={() => setClueViewMode('answers')} className={`px-2 py-1 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer ${clueViewMode === 'answers' ? 'bg-[var(--bg-card)] text-emerald-600 dark:text-emerald-400 shadow-2xs' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>
                                        {lang === 'sv' ? "Svar" : "Answers"}
                                    </button>
                                </div>
                            </div>
                            {clueViewMode === 'coach' ? (
                                <div className="flex-1 flex flex-col min-h-0 justify-center items-center bg-[var(--bg-surface)] p-6 rounded-2xl border border-dashed border-[var(--border-strong)] text-center animate-in fade-in duration-150">
                                    <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3 animate-pulse shadow-2xs">
                                        <Layers size={20} />
                                    </div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] mb-1">
                                        {lang === 'sv' ? "Coach Aktiv i Mitten" : "Coach View Active"}
                                    </h4>
                                    <p className="text-xs font-semibold text-[var(--text-muted)] max-w-[200px] leading-relaxed">
                                        {lang === 'sv' ? "Hela genomgången med tavelkontroller och förklaringar visas nu på stora skärmen." : "The complete walkthrough dashboard is now displayed on the main center board."}
                                    </p>
                                </div>
                            ) : clueViewMode === 'answers' ? (
                                <div className="flex-1 flex flex-col min-h-0 animate-in fade-in duration-150 overflow-y-auto custom-scrollbar">
                                    {livePacket.length === 0 ? (
                                        <div className="text-center text-[var(--text-muted)] italic text-xs mt-12">Tomt arbetsblad</div>
                                    ) : (
                                        <div className="space-y-2">
                                            {livePacket.map((q, idx) => {
                                                const rd = q.resolvedData?.renderData;
                                                const clues = q?.clues || q?.resolvedData?.clues || [];
                                                let finalPayload = rd?.answer || q.answer;

                                                if (!finalPayload && clues.length > 0) {
                                                    const lastClue = clues[clues.length - 1];
                                                    finalPayload = typeof lastClue === 'object' ? (lastClue.latex || lastClue[lang] || lastClue.text) : lastClue;
                                                }

                                                if (!finalPayload) finalPayload = "-";
                                                const inlineMathAnswer = `$${String(finalPayload).replace(/\$/g, '')}$`;

                                                return (
                                                    <div key={`key-ans-${q.id}`} className="w-full py-2 px-3 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl flex items-center justify-between gap-2">
                                                        <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-xs shrink-0">{idx + 1}:</span>
                                                        <div className="flex-1 min-w-0 truncate text-right">
                                                            <MathDisplay content={inlineMathAnswer} className="font-bold text-[var(--text-main)]" />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col min-h-0 gap-4 overflow-y-auto custom-scrollbar pr-1">
                                    {activeIds.length === 0 && (
                                        <div className="text-center text-[var(--text-muted)] italic text-xs mt-12 px-4">
                                            {lang === 'sv' ? "Klicka på en uppgift i arbetsbladet för att visa tillhörande lösningssteg." : "Click any question inside the worksheet page to load its clues."}
                                        </div>
                                    )}

                                    {activeIds.map(id => {
                                        const q = livePacket.find(p => p.id === id);
                                        const clues = q?.clues || q?.resolvedData?.clues || [];
                                        const progress = clueProgress[id] || 0;
                                        const masterIndex = livePacket.findIndex(p => p.id === id) + 1;

                                        if (!q || clues.length === 0) return null;

                                        return (
                                            <div key={`clues-${id}`} className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-main)] animate-in slide-in-from-right-4 duration-150 mb-2 shrink-0">
                                                <div className="flex items-center justify-between mb-3 bg-[var(--bg-card)] p-2 rounded-xl border border-[var(--border-main)] shadow-2xs gap-2 overflow-hidden">
                                                    <div className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-400 tracking-wider font-mono">
                                                        Q{masterIndex}
                                                    </div>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <button
                                                            type="button"
                                                            onClick={() => pushDynamicCluesToCanvas(id)}
                                                            className="px-2 py-1 text-amber-600 dark:text-amber-400 hover:text-white rounded-lg bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-600 border border-amber-200 dark:border-amber-800 transition-colors cursor-pointer text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-2xs"
                                                            title={lang === 'sv' ? "Lägg till dynamisk lösningsbox" : "Add dynamic solution box"}
                                                        >
                                                            <Plus size={12}/> Box
                                                        </button>
                                                        {progress > 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setClueProgress({ ...clueProgress, [id]: 0 })}
                                                                className="p-1 text-[var(--text-muted)] hover:text-rose-600 rounded-lg bg-[var(--bg-card)] border border-[var(--border-main)] transition-colors cursor-pointer"
                                                                title={lang === 'sv' ? "Dölj" : "Reset"}
                                                            >
                                                                <RefreshCw size={13}/>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-2.5">
                                                    {clues.slice(0, progress).map((clue, idx) => {
                                                        const text = typeof clue === 'object' ? clue[lang] || clue.text : clue;
                                                        const latex = typeof clue === 'object' ? clue.latex : null;
                                                        return (
                                                            <div key={idx} className="group relative bg-[var(--bg-card)] p-3 rounded-xl shadow-2xs border border-[var(--border-main)] border-l-4 border-l-amber-500 animate-in slide-in-from-top-2 duration-150">
                                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-1 bg-[var(--bg-card)] backdrop-blur-xs p-1 rounded-lg shadow-2xs border border-[var(--border-strong)]">
                                                                    {text && (
                                                                        <button type="button" onClick={() => pushClueToCanvas(clue, 'text')} className="px-2 py-1 bg-[var(--bg-surface)] text-amber-700 dark:text-amber-300 hover:bg-amber-600 hover:text-white rounded text-[9px] font-bold uppercase transition-all cursor-pointer" title="Lägg till som Text">T</button>
                                                                    )}
                                                                    {latex && (
                                                                        <button type="button" onClick={() => pushClueToCanvas(clue, 'math')} className="px-2 py-1 bg-[var(--bg-surface)] text-amber-700 dark:text-amber-300 hover:bg-amber-600 hover:text-white rounded text-[9px] font-bold uppercase transition-all cursor-pointer" title="Lägg till som Math/LaTeX">∑</button>
                                                                    )}
                                                                    {text && latex && (
                                                                        <button type="button" onClick={() => pushClueToCanvas(clue, 'both')} className="px-2 py-1 bg-[var(--bg-surface)] text-amber-700 dark:text-amber-300 hover:bg-amber-600 hover:text-white rounded text-[9px] font-bold uppercase transition-all cursor-pointer" title="Lägg till båda">+</button>
                                                                    )}
                                                                </div>
                                                                <div className="font-bold text-xs text-[var(--text-main)] leading-snug pr-12">
                                                                    <MathDisplay content={text}/>
                                                                </div>
                                                                {latex && (
                                                                    <div className="mt-2 text-center text-indigo-600 dark:text-indigo-400 font-serif bg-[var(--bg-surface)] py-1.5 rounded-xl border border-[var(--border-main)] text-xs">
                                                                        <MathDisplay content={`$$${latex}$$`}/>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* CLASSROOM SPOTLIGHT VISUAL LIGHTBOX MODAL */}
            {spotlightVisual && (
                <div 
                    onClick={() => setSpotlightVisual(null)} 
                    className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center p-12 cursor-zoom-out animate-in fade-in duration-150 select-none font-sans"
                >
                    <div className="absolute top-6 text-[var(--text-main)] text-xs font-bold uppercase tracking-wider bg-[var(--bg-card)] border border-[var(--border-strong)] px-4 py-1.5 rounded-xl shadow-lg">
                        {lang === 'sv' ? "Klicka var som helst för att gå tillbaka" : "Click anywhere to close spotlight"}
                    </div>
                    <div 
                        onClick={(e) => e.stopPropagation()} 
                        className="bg-[var(--bg-card)] p-12 rounded-2xl shadow-2xl flex items-center justify-center border border-[var(--border-strong)] max-w-4xl max-h-[75vh] min-w-[450px] min-h-[350px] transform scale-[1.4] origin-center text-[var(--text-main)]"
                    >
                        <VisualRenderer data={spotlightVisual} isWordProblem={false} />
                    </div>
                </div>
            )}

            {/* THE SUMMONER MODAL */}
            {isSummonerOpen && (
                <QuestionSummoner 
                    lang={lang} 
                    onClose={() => setIsSummonerOpen(false)} 
                    onSummon={(newItems) => {
                        if (!newItems || newItems.length === 0) return;
                        const updatedPacket = [...livePacket, ...newItems];
                        setLivePacket(updatedPacket);
                        const generatedSlides = newItems.map((item, i) => ({
                            id: `slide_${Date.now()}_${i}`,
                            title: item.targetLayout === 'instruction_template' 
                                ? `${lang === 'sv' ? 'Genomgång' : 'Instruction'} ${slides.length + i + 1}` 
                                : `Slide ${slides.length + i + 1}`,
                            layout: item.targetLayout || 'canvas',
                            boundQuestionId: item.id,
                            activeIds: [item.id],
                            elements: []
                        }));

                        setSlides(prev => [...prev, ...generatedSlides]);
                        setActiveSlideIndex(slides.length); 
                        setSidebarTab('slides');
                        setIsSummonerOpen(false);
                    }} 
                />
            )}
            
            {/* SECURITY-HARDENED CUSTOM PROMPT MODAL */}
            {isPromptBuilderOpen && (
                <div className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none font-sans">
                    <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-2xl p-6 w-full max-w-lg text-[var(--text-main)]">
                        <h3 className="text-sm font-extrabold uppercase tracking-wider mb-3">
                            {lang === 'sv' ? "Skapa Diskussionsfråga" : "Create Discussion Prompt"}
                        </h3>
                        <textarea 
                            value={customPromptText}
                            onChange={(e) => setCustomPromptText(e.target.value)}
                            maxLength={1500}
                            className="w-full h-32 p-3 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl focus:border-emerald-600 outline-none resize-none mb-2 font-medium text-xs text-[var(--text-main)] shadow-inner"
                            placeholder={lang === 'sv' ? "Skriv din fråga här (t.ex. 'Förklara hur du tänkte...')" : "Type your prompt here..."}
                        />
                        <div className="flex justify-between items-center mb-5">
                            <span className="text-xs font-bold font-mono text-[var(--text-muted)]">{customPromptText.length}/1500</span>
                            {customPromptText.length > 1400 && <span className="text-xs font-bold text-rose-600 dark:text-rose-400 animate-pulse">{lang === 'sv' ? "Närmar sig maxgränsen" : "Approaching limit"}</span>}
                        </div>
                        <div className="flex justify-end gap-2.5">
                            <button type="button" onClick={() => { setIsPromptBuilderOpen(false); setCustomPromptText(''); }} className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] rounded-xl transition-colors cursor-pointer">{lang === 'sv' ? "Avbryt" : "Cancel"}</button>
                            <button type="button" onClick={handleAddCustomPrompt} disabled={!customPromptText.trim()} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer shadow-2xs">{lang === 'sv' ? "Lägg till fråga" : "Add Prompt"}</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* LIVE SESSION PRE-FLIGHT MODAL */}
            <LiveLaunchModal
                isOpen={showLiveModal}
                onClose={() => setShowLiveModal(false)}
                onConfirm={confirmLaunchLive}
                packetCount={livePacket.length}
                hasDrawings={slides.some(s => (s.elements || []).length > 0)}
                lang={lang}
                initialSettings={{
                    pacing: 'open', order: 'original', summary: true, allowScratchpad: true,
                    allowCanvas: slides.some(s => (s.elements || []).length > 0)
                }}
            />
            
            {/* INTERACTIVE SPOTLIGHT WALKTHROUGH TOUR */}
            <SpotlightTour
                steps={presentationTourSteps}
                isOpen={showTutorial}
                onClose={handleCloseTutorial}
                lang={lang}
            />
            
            {/* NAMING & SAVE CHOICE MODAL */}
            {showNamingModal && (
                <div className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none font-sans">
                    <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-2xl p-6 w-full max-w-md text-[var(--text-main)]">
                        <h3 className="text-sm font-extrabold uppercase tracking-wider mb-2">
                            {lang === 'sv' ? "Namnge din presentation" : "Name Your Presentation"}
                        </h3>
                        <p className="text-xs font-medium text-[var(--text-muted)] mb-5 leading-relaxed">
                            {lang === 'sv' 
                                ? "Välj hur du vill fortsätta med denna session innan den startar live." 
                                : "Choose how you'd like to proceed with this session before going live."}
                        </p>
                        
                        <input 
                            autoFocus type="text" value={tempTitleInput} onChange={(e) => setTempTitleInput(e.target.value)} maxLength={100}
                            placeholder={lang === 'sv' ? "T.ex. Genomgång Ekvationer v. 12" : "E.g. Equations Review"}
                            className="w-full px-3.5 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl focus:border-emerald-600 outline-none mb-5 font-semibold text-xs text-[var(--text-main)] shadow-inner"
                            onKeyDown={(e) => { if (e.key === 'Enter' && tempTitleInput.trim()) handleSaveAndLaunch(); }}
                        />

                        <div className="flex flex-col gap-2.5">
                            <button 
                                type="button"
                                onClick={handleSaveAndLaunch} disabled={!tempTitleInput.trim() || isSaving}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-2xs disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
                            >
                                <Save size={15} /> {lang === 'sv' ? "Spara i arkivet & Gå Live" : "Save to Archive & Go Live"}
                            </button>
                            
                            <button 
                                type="button"
                                onClick={handleLaunchWithoutSaving} disabled={!tempTitleInput.trim()}
                                className="w-full py-3 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] border border-[var(--border-strong)] font-bold text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                            >
                                <Monitor size={15} /> {lang === 'sv' ? "Gå Live utan att spara" : "Go Live Without Saving"}
                            </button>

                            <button type="button" onClick={() => setShowNamingModal(false)} className="w-full py-2 text-[var(--text-muted)] hover:text-[var(--text-main)] font-bold text-xs uppercase transition-colors cursor-pointer mt-1">
                                {lang === 'sv' ? "Avbryt" : "Cancel"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <SheetLibraryModal
                isOpen={showLibraryModal}
                onClose={() => setShowLibraryModal(false)}
                filterType="board"
                lang={lang}
                onSelectSheet={(sheet) => {
                    if (sheet.packet?.slides) {
                        setSlides(sheet.packet.slides);
                        setActiveSlideIndex(0);
                        setSidebarTab('slides');
                        setActiveIds(sheet.packet.slides[0]?.activeIds || []);
                    }
                    if (sheet.packet?.livePacket) setLivePacket(sheet.packet.livePacket);
                    if (sheet.title) setLocalTitle(sheet.title);
                    if (sheet.id) setBoardId(sheet.id);
                    if (sheet.packet?.settings?.theme || sheet.theme) {
                        setPresentationTheme(sheet.packet?.settings?.theme || sheet.theme);
                    }
                    setShowLibraryModal(false);
                }}
            />
            {showSaveChoiceModal && (
                <div className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none font-sans">
                    <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-2xl p-6 w-full max-w-md text-[var(--text-main)]">
                        <h3 className="text-sm font-extrabold uppercase tracking-wider mb-2">
                            {lang === 'sv' ? "Hur vill du spara?" : "How would you like to save?"}
                        </h3>
                        <p className="text-xs font-medium text-[var(--text-muted)] mb-5 leading-relaxed">
                            {lang === 'sv' 
                                ? "Denna presentation finns redan sparad. Vill du skriva över originalet eller spara dina ändringar som en ny presentation?"
                                : "This presentation already exists. Would you like to overwrite the original or save as a new copy?"}
                        </p>

                        <div className="flex flex-col gap-2.5">
                            <button
                                type="button"
                                onClick={async () => {
                                    setShowSaveChoiceModal(false);
                                    await executeSave({ forceNewCopy: false, silent: false });
                                }}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                            >
                                <Save size={15} />
                                <span>{lang === 'sv' ? "Skriv över originalet" : "Overwrite original"}</span>
                            </button>

                            <button
                                type="button"
                                onClick={async () => {
                                    setShowSaveChoiceModal(false);
                                    await executeSave({ forceNewCopy: true, silent: false });
                                }}
                                className="w-full py-3 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] border border-[var(--border-strong)] font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                            >
                                <Copy size={15} />
                                <span>{lang === 'sv' ? "Spara som ny kopia" : "Save as new copy"}</span>
                            </button>

                            <button 
                                type="button"
                                onClick={() => setShowSaveChoiceModal(false)}
                                className="w-full py-2 text-[var(--text-muted)] hover:text-[var(--text-main)] font-bold text-xs uppercase transition-colors cursor-pointer"
                            >
                                {lang === 'sv' ? "Avbryt" : "Cancel"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showUnsavedChangesModal && (
                <div className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none font-sans">
                    <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-2xl p-6 w-full max-w-md text-[var(--text-main)]">
                        <h3 className="text-sm font-extrabold uppercase tracking-wider mb-2">
                            {lang === 'sv' ? "Osparade ändringar" : "Unsaved Changes"}
                        </h3>
                        <p className="text-xs font-medium text-[var(--text-muted)] mb-5 leading-relaxed">
                            {lang === 'sv'
                                ? "Du har osparade ändringar i presentationen. Vill du spara innan du stänger?"
                                : "You have unsaved changes in your presentation. Would you like to save before closing?"}
                        </p>

                        <div className="flex flex-col gap-2.5">
                            <button
                                type="button"
                                onClick={async () => {
                                    setShowUnsavedChangesModal(false);
                                    const savedId = await executeSave({ forceNewCopy: false, silent: true });
                                    if (savedId) onClose();
                                }}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                            >
                                <Save size={15} />
                                <span>{lang === 'sv' ? "Spara och stäng" : "Save and exit"}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowUnsavedChangesModal(false);
                                    onClose();
                                }}
                                className="w-full py-2.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-2xs"
                            >
                                {lang === 'sv' ? "Stäng utan att spara" : "Exit without saving"}
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowUnsavedChangesModal(false)}
                                className="w-full py-2 text-[var(--text-muted)] hover:text-[var(--text-main)] font-bold text-xs uppercase transition-colors cursor-pointer"
                            >
                                {lang === 'sv' ? "Fortsätt redigera" : "Keep editing"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SAVE TO CUSTOM UNIT MODAL */}
            <SaveToUnitModal 
                key={showSaveToUnitModal ? `unit_modal_${boardId || 'new'}_${localTitle}` : 'modal_closed'}
                isOpen={showSaveToUnitModal}
                onClose={() => setShowSaveToUnitModal(false)}
                onConfirmSave={handleConfirmSaveToUnit}
                title={localTitle}
                sheetTitle={localTitle}
                initialTitle={localTitle}
                testTitle={localTitle}
                teacherId={teacherId}
                lang={lang}
            />

            {/* FULLSCREEN TEACHER PRESENTATION STAGE */}
            {isPresenting && (
                <div className="fixed inset-0 z-[600] bg-black flex flex-col items-center justify-center overflow-hidden select-none p-3 sm:p-6 animate-in fade-in duration-150">
                    
                    <div className="w-full h-full max-w-[177.78vh] max-h-[56.25vw] flex items-center justify-center relative">
                        <SlideViewerCore
                            slide={slides[activeSlideIndex]}
                            theme={presentationTheme}
                            currentTheme={currentTheme}
                            style={currentTheme.cssVars}
                            livePacket={livePacket}
                            lang={lang}
                            bgType={bgType}
                            globalZoom={globalZoom}
                            authorMode={true}
                            slideRendererProps={{
                                setLivePacket,
                                clueViewMode,
                                currentFocusedQuestion,
                                coachProps,
                                onSpotlight: setSpotlightVisual,
                                onRegenerate: handleRegenerateQuestion,
                                setIsSaving
                            }}
                            interactiveCanvasProps={{
                                key: `presenter_canvas_${slides[activeSlideIndex]?.id}`,
                                forceActive: true,
                                isOverlay: slides[activeSlideIndex]?.layout === 'instruction_template',
                                setElements: updateCurrentSlideElements,
                                onToggleBg: () => setBgType(prev => prev === 'blank' ? 'grid' : 'blank'),
                                clueProgress,
                                activeDrawer,
                                onToggleDrawer: handleToggleDrawer,
                                renderDrawer: false,
                                toolbarMode: "teacher"
                            }}
                        />
                    </div>

                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[650] flex items-center gap-2 bg-[var(--bg-card)]/95 backdrop-blur-xs px-4 py-2 rounded-2xl border border-[var(--border-strong)] shadow-2xl text-[var(--text-main)]">
                        <button
                            type="button"
                            onClick={() => setActiveSlideIndex(prev => Math.max(0, prev - 1))}
                            disabled={activeSlideIndex === 0}
                            className="p-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <div className="flex items-center gap-2 px-2">
                            <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                                {activeSlideIndex + 1} / {slides.length}
                            </span>
                            <span className="text-xs font-bold text-[var(--text-muted)] max-w-[140px] truncate hidden md:inline">
                                • {slides[activeSlideIndex]?.title}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={() => setActiveSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
                            disabled={activeSlideIndex === slides.length - 1}
                            className="p-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                        >
                            <ChevronRight size={18} />
                        </button>

                        <button
                            type="button"
                            onClick={() => setGlobalZoom(prev => Math.max(0.8, Number((prev - 0.2).toFixed(2))))}
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] cursor-pointer transition-colors"
                            title="Zoom Out"
                            >
                                <ZoomOut size={14} />
                            </button>
                            <span className="text-xs font-bold font-mono tracking-wider text-[var(--text-main)] px-2 min-w-[45px] text-center select-none">
                                {Math.round(globalZoom * 100)}%
                            </span>
                            <button
                            type="button"
                            onClick={() => setGlobalZoom(prev => Math.min(4.0, Number((prev + 0.2).toFixed(2))))}
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] cursor-pointer transition-colors"
                            title="Zoom In"
                            >
                                <ZoomIn size={14} />
                        </button>

                        <div className="w-px h-5 bg-[var(--border-strong)] mx-1" />

                        {slides[activeSlideIndex]?.layout === 'instruction_template' && (
                            <button
                                type="button"
                                onClick={() => {
                                    const targetId = slides[activeSlideIndex]?.boundQuestionId || slides[activeSlideIndex]?.activeIds?.[0];
                                    if (targetId) handleRegenerateQuestion(targetId);
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 border border-amber-500/40 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <RefreshCw size={13} />
                                <span className="hidden sm:inline">{lang === 'sv' ? "Nytt exempel" : "New"}</span>
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={togglePresentMode}
                            className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer ml-1"
                        >
                            <X size={16} />
                        </button>
                    </div>

                </div>
            )}

            <ActivityHubModal
                isOpen={showActivityHub}
                onClose={() => setShowActivityHub(false)}
                sourcePacket={livePacket}
                lang={lang}
                onLaunchCategoryClash={(config) => setActiveGameConfig(config)}
            />

            {activeGameConfig && (
                <CategoryClashEngine
                    initialConfig={activeGameConfig}
                    sourcePacket={livePacket}
                    onClose={() => setActiveGameConfig(null)}
                    lang={lang}
                />
            )}
        </div>
    );
}