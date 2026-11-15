import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ChevronLeft, Plus, Trash2, Send, Layers, Search, Zap, 
  FileText, Grid3X3, RefreshCcw, Loader2, Sparkles,
  Minus, Settings2, Printer, Square, Type, Shuffle, Save, Eraser,
  PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, X, Building2, Lock,
  AlignLeft, LayoutGrid, GripVertical, Brain, Calculator, Target, 
  Image as ImageIcon, FileText as TextIcon, Monitor, ChevronDown, HelpCircle, Gamepad2
} from 'lucide-react';
import { SKILL_BUCKETS, isTopicWordProblemReady } from '../../constants/skillBuckets.js';
import VisualRenderer from '../visuals/VisualRenderer.jsx';
import PresentationView from '../views/PresentationView.jsx';
import { syncBatchProgress } from '../../lib/progressSync';
import LiveLaunchModal from '../modals/LiveLaunchModal';
import StudioTutorialModal from '../modals/StudioTutorialModal.jsx';
import SheetLibraryModal from '../modals/SheetLibraryModal';
import { liveCreateRoom } from '../live/core/liveCreateRoom.js';

import ActivityHubModal from '../activities/modals/ActivityHubModal';
import { getActivityDefinition } from '../activities/registry/activityRegistry.js';
import WorkedExampleCard from '../shared/WorkedExampleCard.jsx';

import { useSheetSaver } from '../../hooks/useSheetSaver';
import SaveChoiceModal from '../modals/SaveChoiceModal';

import '../../styles/theme.css'; 
import PreferencesToggle from '../ui/PreferencesToggle';

const MathDisplay = ({ content, className = "", style = {} }) => {
    const containerRef = useRef(null);
    useEffect(() => {
        if (!content || !containerRef.current) return;
        const renderMath = () => {
            containerRef.current.innerText = content;
            if (window.renderMathInElement) {
                window.renderMathInElement(containerRef.current, {
                    delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '$', right: '$', display: false },
                        { left: '\\(', right: '\\)', display: false },
                        { left: '\\[', right: '\\]', display: true }
                    ],
                    throwOnError: false, trust: true
                });
            }
        };
        const timer = setTimeout(renderMath, 30);
        return () => clearTimeout(timer);
    }, [content]);
    return (
        <div 
            ref={containerRef} 
            style={style} 
            className={`math-content leading-relaxed whitespace-pre-wrap text-inherit ${className}`} 
        />
    );
};

const compileAnchoredStory = (item, lang = 'sv', includeLatex = false) => {
    const rd = item.resolvedData?.renderData || item.resolvedData;
    
    if (item.selectedStoryIndex === undefined || item.selectedStoryIndex === null || !rd?.availableStories) {
        const desc = rd?.description;
        const finalDesc = typeof desc === 'object' && desc !== null ? desc[lang] : desc;
        
        if (includeLatex && rd?.latex) {
            return finalDesc ? `${finalDesc} $${rd.latex}$` : `$${rd.latex}$`;
        }
        
        return finalDesc || item.name;
    }

    const storyPackage = rd.availableStories[item.selectedStoryIndex];
    if (!storyPackage) return rd?.description || item.name;
    
    let template = storyPackage[lang === 'en' ? 'en' : 'sv'];
    let params = rd.extractedParams;

    if (!params) {
        const category = Object.values(SKILL_BUCKETS).find(cat => cat.topics[item.topicId]);
        const variation = category?.topics[item.topicId]?.variations?.find(v => v.key === item.variationKey);
        
        const sourceToken = rd.latex || rd.interceptorToken;
        if (variation?.extractorPattern && sourceToken) {
            const match = sourceToken.match(variation.extractorPattern);
            if (match && match.groups) {
                params = match.groups;
            }
        }
    }

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            const cleanValue = String(value).replace(/[()]/g, '');
            template = template.replace(new RegExp(`\\{${key}\\}`, 'g'), cleanValue);
        });
    }

    if (item.variationKey === 'apply_factor_inc' || item.variationKey === 'apply_factor_dec') {
        template += lang === 'en' ? " Calculate the new value." : " Beräkna det nya värdet.";
    } else if (item.variationKey === 'find_original_inc' || item.variationKey === 'find_original_dec') {
        template += lang === 'en' ? " Calculate the original value." : " Beräkna det ursprungliga värdet.";
    } else if (item.variationKey === 'sequential_factors' || item.variationKey === 'factor_compound') {
        template += lang === 'en' ? " Calculate the total combined change factor." : " Beräkna den totala förändringsfaktorn.";
    } else if (item.variationKey === 'sequential_total_pct') {
        template += lang === 'en' ? " Calculate the total change in percent." : " Beräkna den totala förändringen i procent.";
    } else if (item.variationKey === 'repeated_change_years') {
        template += lang === 'en' ? " Calculate the value at the end of the period." : " Beräkna värdet efter periodens slut.";
    } else if (item.topicId === 'equations' || item.topicId === 'equations_word') {
        if (item.resolvedData?.metadata?.difficulty === 5) {
            template += lang === 'en' ? " Write the equation that describes this situation." : " Teckna ekvationen som beskriver situationen.";
        } else {
            template += lang === 'en' ? " Calculate the value of x." : " Beräkna värdet på x.";
        }
    } else if (item.topicId === 'expressions') {
        template += lang === 'en' ? " Write and simplify the algebraic expression." : " Skriv och förenkla uttrycket.";
    }

    return template;
};

export default function QuestionStudio({ 
    profile,
    onDoNowGenerate, 
    onWorksheetGenerate, 
    onClose, 
    ui, 
    lang = 'sv', 
    initialPacket, 
    setInitialPacket, 
    sheetTitle, 
    setSheetTitle, 
    studioMode, 
    setStudioMode,
    includeAnswerKey, 
    setIncludeAnswerKey, 
    answerKeyStyle, 
    setAnswerKeyStyle
}) {
  const t = {
    sv: {
      studio: "Question Studio", donow_title: "Do Now Grid", worksheet_title: "Arbetsblad",
      change_mode: "Byt läge", search_placeholder: "Sök område...", board_label: "Förhandsvisning", new_example: "Nytt exempel",
      select_hint: "Välj en variant till vänster för att förhandsgranska", selected_questions: "Valda frågor", clear_all: "Rensa",
      create_donow: "Grid", publish: "Skriv ut", title_placeholder: "Namnge ditt arbete...",
      unsaved_warning: "Du har osparade ändringar. Fortsätt ändå?",
      regenerate_all: "Slumpa alla",
      answer_key_toggle: "Inkludera facit", answer_style_label: "Facitstil",
      style_compact: "Bara svar", style_detailed: "Steg",
      delete_task: "Radera", name_label: "Namn:", date_label: "Datum:",
      save_btn: "Spara", live_btn: "Live",
      hide_extra: "Dölj Begrepp & Flerval", type_calc: "Räkna", type_concept: "Begrepp", type_logic: "Felsök", type_visual: "Bild", type_text: "Text",
      present: "Presentera",
      add_qty: "Lägg till", rows_label: "Rader:", toggle_grid: "Växla Rutnät / Blank",
      toggle_work_area: "Växla rutnät/tom yta",
      preset_compact: "Tät (Prov)", preset_standard: "Standard", preset_spacious: "Rymlig",
      style_open: "Öppen", style_framed: "Inramad",
      density_and_style: "Täthet & Stil", presets_heading: "Snabbmallar",
      font_size_heading: "Textstorlek", framing_heading: "Inramning",
      sheet_default_title: "Matematik"
    },
    en: {
      studio: "Question Studio", donow_title: "Do Now Grid", worksheet_title: "Worksheet",
      change_mode: "Change mode", search_placeholder: "Search topics...", board_label: "Preview", new_example: "New Example",
      select_hint: "Select a variation on the left to preview", selected_questions: "Questions", clear_all: "Clear",
      create_donow: "Grid", publish: "Print", title_placeholder: "Enter title...",
      unsaved_warning: "Unsaved work! Proceed anyway?",
      regenerate_all: "Randomize all",
      answer_key_toggle: "Include answer key", answer_style_label: "Style",
      style_compact: "Answers", style_detailed: "Steps",
      delete_task: "Delete task", name_label: "Name:", date_label: "Date:",
      save_btn: "Save", live_btn: "Live",
      hide_extra: "Hide Concepts & MCQ", type_calc: "Calculate", type_concept: "Concept", type_logic: "Logic", type_visual: "Image", type_text: "Text",
      present: "Present",
      add_qty: "Add", rows_label: "Rows:", toggle_grid: "Toggle Grid / Blank",
      toggle_work_area: "Toggle grid / blank space",
      preset_compact: "Compact (Exam)", preset_standard: "Standard", preset_spacious: "Spacious",
      style_open: "Open", style_framed: "Framed",
      density_and_style: "Density & Style", presets_heading: "Presets",
      font_size_heading: "Font Size", framing_heading: "Borders",
      sheet_default_title: "Mathematics"
    }
  }[lang];

  // --- STATE ---
  const [isPane1Collapsed, setIsPane1Collapsed] = useState(false); 
  const [isPane4Collapsed, setIsPane4Collapsed] = useState(false);
  const [setupMode, setSetupMode] = useState(studioMode); 
  const [activeSheetId, setActiveSheetId] = useState(null); 
  const [activeBoardSheet, setActiveBoardSheet] = useState(null);

  const [canvasMode, setCanvasMode] = useState('studio'); 
  const [globalLatexSize, setGlobalLatexSize] = useState('md');
  const [workspaceHeight, setWorkspaceHeight] = useState(0);
  const [workspaceStyle, setWorkspaceStyle] = useState('blank');
  const [layoutStyle, setLayoutStyle] = useState('open');
  const [isLayoutMenuOpen, setIsLayoutMenuOpen] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState('basic_arithmetic');
  const [packet, setPacket] = useState(initialPacket || []);
  const [isSaved, setIsSaved] = useState(true);
  const [previewData, setPreviewData] = useState(null);
  const [activePreviewKey, setActivePreviewKey] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [pendingQuantity, setPendingQuantity] = useState(1);
  const [chosenVisibility, setChosenVisibility] = useState('private');
  const [draggedIdx, setDraggedIdx] = useState(null);

  const [isRegeneratingAll, setIsRegeneratingAll] = useState(false);
  const [hideExtra, setHideExtra] = useState(false);
  const [useWordProblems, setUseWordProblems] = useState(false);
  
  const [isGlobalShuffleOpen, setIsGlobalShuffleOpen] = useState(false);
  const [showPresentation, setShowPresentation] = useState(false); 

  // Live Session Pre-Flight States
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [liveSettings, setLiveSettings] = useState({ pacing: 'open', order: 'original', summary: true });
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);

  const [showActivityHub, setShowActivityHub] = useState(false);
  const [activeActivity, setActiveActivity] = useState(null);
  const [activeSetupModal, setActiveSetupModal] = useState(null);

  const {
      isSaving,
      showSaveChoiceModal,
      setShowSaveChoiceModal,
      executeSave,
      triggerSave
  } = useSheetSaver({
      sheetId: activeSheetId,
      setSheetId: setActiveSheetId,
      title: sheetTitle,
      setTitle: setSheetTitle,
      lang,
      buildPayload: ({ userId, finalTitle }) => ({
          title: finalTitle,
          type: setupMode || 'worksheet',
          user_id: userId,
          visibility: chosenVisibility,
          school_name: profile?.school_name?.trim() || null,
          packet,
          config: {
              includeAnswerKey,
              answerKeyStyle,
              globalLatexSize,
              layoutStyle,
              workspaceStyle,
              workspaceHeight
          },
          auto_topics: [...new Set(packet.map(p => p.topicId))]
      }),
      onSaveSuccess: async () => {
          syncBatchProgress('studio_sheet_saved', packet, {
              app_mode: 'question_studio',
              sheet_type: setupMode || 'worksheet',
              visibility: chosenVisibility,
              include_answer_key: includeAnswerKey,
              answer_style: answerKeyStyle,
              layout_style: layoutStyle
          });
          setIsSaved(true);
      }
  });

  // Universal Launch Handler
  const handleLaunchActivity = async (gameKey, config) => {
      const actDef = getActivityDefinition(gameKey);
      if (!actDef) return;

      const isLiveLaunch = config.launchTarget === 'live' || 
                           config.settings?.deliveryMode === 'digital' ||
                           config.deliveryMode === 'digital';

      if (isLiveLaunch) {
          try {
              const initialSettings = actDef.createInitialSettings 
                  ? actDef.createInitialSettings(config) 
                  : (config.settings || config);

              const rawCandidates = config.initialQuestions || 
                                    config.tiles || 
                                    config.sourcePacket || 
                                    config.savedBoard?.packet?.tiles || 
                                    config.savedBoard?.packet || [];

              const questions = Array.isArray(rawCandidates) 
                  ? rawCandidates 
                  : (typeof rawCandidates === 'object' ? Object.values(rawCandidates) : []);

              const roomData = await liveCreateRoom({
                  teacherId: profile?.id,
                  profile,
                  title: config.title || config.savedBoard?.title || `${actDef.title[lang] || actDef.title.sv} Live`,
                  mode: actDef.modePrefix || config.type,
                  packet: questions,
                  settings: {
                      ...initialSettings,
                      deliveryMode: 'digital'
                  }
              });

              setActiveActivity({
                  key: gameKey,
                  config: { ...config, session: roomData },
                  savedBoard: config.savedBoard,
                  sourcePacket: questions,
                  session: roomData,
                  isLiveHost: true
              });
          } catch (err) {
              alert((lang === 'sv' ? "Kunde inte starta live-aktivitet: " : "Failed to start live activity: ") + err.message);
          }
      } else {
          setActiveActivity({
              key: gameKey,
              config: { ...config, session: null },
              savedBoard: config.savedBoard,
              sourcePacket: config.initialQuestions || config.tiles || config.sourcePacket || config.savedBoard?.packet || [],
              session: null,
              isLiveHost: false
          });
      }
  };

  const [showTutorial, setShowTutorial] = useState(() => !localStorage.getItem('has_seen_studio_guide'));
  const handleCloseTutorial = () => {
      localStorage.setItem('has_seen_studio_guide', 'true');
      setShowTutorial(false);
  }; 

  const handleDragStartUnified = (e, index) => {
    setDraggedIdx(index);
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragOverUnified = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = draggedIdx !== null ? draggedIdx : draggedItemIndex;
    if (sourceIndex === null || sourceIndex === targetIndex) return;
    const updatedPacket = [...packet];
    const [movedItem] = updatedPacket.splice(sourceIndex, 1);
    updatedPacket.splice(targetIndex, 0, movedItem);
    if (draggedIdx !== null) setDraggedIdx(targetIndex);
    if (draggedItemIndex !== null) setDraggedItemIndex(targetIndex);
    setPacket(updatedPacket);
    setIsSaved(false);
  };

  const handleDragEndUnified = () => {
    setDraggedIdx(null);
    setDraggedItemIndex(null);
  };

  const topicSupportsWordProblems = isTopicWordProblemReady(selectedTopicId);

  const allTopics = Object.values(SKILL_BUCKETS).flatMap(cat => Object.entries(cat.topics).map(([id, data]) => ({ id, categoryName: cat.name[lang] || cat.name.en || cat.name.sv, categoryId: cat.id, ...data })));
  const currentTopic = allTopics.find(tp => tp.id === selectedTopicId) || allTopics[0];
  const getColSpanClass = (span) => ({ 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4', 6: 'col-span-6' }[span] || 'col-span-6');

  const getDifficultyScore = (key) => {
    const k = key.toLowerCase();
    if (k.includes('basic') || k.includes('foundations') || k.includes('onestep') || k.includes('intro')) return 1;
    if (k.includes('complex') || k.includes('twostep') || k.includes('twoterm')) return 3;
    if (k.includes('powers') || k.includes('chain') || k.includes('advanced')) return 4;
    return 2; 
  };

  const visibleVariations = (currentTopic?.variations || [])
    .filter(v => {
      if (useWordProblems && !v.tags?.includes('word_problem_ready')) return false;
      if (!hideExtra) return true;
      const k = v.key.toLowerCase();
      const isMCQ = ['lie', 'spot', 'choice', 'mcq', 'check', 'select', 'which', 'error', 'inverse'].some(kw => k.includes(kw));
      const isConcept = ['concept', 'theory', 'foundations', 'id', 'begrepp'].some(kw => k.includes(kw));
      return !isMCQ && !isConcept;
    })
    .sort((a, b) => getDifficultyScore(a.key) - getDifficultyScore(b.key));

  useEffect(() => {
    if (!topicSupportsWordProblems && useWordProblems) {
      setUseWordProblems(false);
    }
  }, [selectedTopicId, topicSupportsWordProblems, useWordProblems]);

  useEffect(() => {
    const stillVisible = visibleVariations.some(v => v.key === activePreviewKey);
    if (!stillVisible && visibleVariations.length > 0) {
        triggerPreview(visibleVariations[0].key);
    } else if (activePreviewKey) {
        triggerPreview(activePreviewKey);
    }
  }, [useWordProblems]);

  useEffect(() => { if (currentTopic?.variations?.[0]) triggerPreview(currentTopic.variations[0].key); }, [selectedTopicId]);
  useEffect(() => { setInitialPacket(packet); }, [packet]);
  useEffect(() => { setStudioMode(setupMode); }, [setupMode]);

  useEffect(() => {
      if (Array.isArray(initialPacket) && initialPacket.length > 0) {
          const first = initialPacket[0];
          if (first._workspaceHeight !== undefined) setWorkspaceHeight(first._workspaceHeight);
          if (first._workspaceStyle !== undefined) setWorkspaceStyle(first._workspaceStyle);
          if (first._layoutStyle !== undefined) setLayoutStyle(first._layoutStyle);
          if (first._globalLatexSize !== undefined) setGlobalLatexSize(first._globalLatexSize);
      }
  }, [initialPacket]);

  const renderOptions = (options, inline = false) => {
    if (!options || options.length === 0) return null;
    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
    return (
        <div className={`mt-4 grid grid-cols-2 gap-2 w-full max-w-md mx-auto ${inline ? 'px-4' : ''}`}>
            {options.map((opt, i) => {
                const choiceLabel = typeof opt === 'object' ? opt.label : opt;
                return (
                    <div key={i} className="flex items-center gap-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-main)] p-2 rounded-xl">
                        <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">{labels[i]}</span>
                        <MathDisplay content={choiceLabel} />
                    </div>
                );
            })}
        </div>
    );
  };

  const getVariationCategory = (key) => {
    const k = key.toLowerCase();
    if (['graph', 'plot', 'geom', 'volume', 'shape', 'area', 'perimeter', 'angle', 'pattern', 'table', 'marbles', 'spinner', 'tree'].some(kw => k.includes(kw))) return 'visual';
    if (['calc', 'std', 'solve'].some(kw => k.includes(kw))) return 'calculate';
    if (['concept', 'theory', 'foundations', 'id', 'inverse'].some(kw => k.includes(kw))) return 'conceptual';
    if (['lie', 'spot', 'error', 'check'].some(kw => k.includes(kw))) return 'logic';
    return 'default';
  };

  const getCategoryStyles = (type) => {
    const styles = {
        visual: { border: 'border-sky-200 dark:border-sky-800/60', bg: 'bg-sky-50 dark:bg-sky-950/40', stripe: 'bg-sky-600', text: 'text-sky-700 dark:text-sky-300', icon: <ImageIcon size={10} />, label: t.type_visual },
        calculate: { border: 'border-emerald-200 dark:border-emerald-800/60', bg: 'bg-emerald-50 dark:bg-emerald-950/40', stripe: 'bg-emerald-600', text: 'text-emerald-700 dark:text-emerald-300', icon: <Calculator size={10} />, label: t.type_calc },
        conceptual: { border: 'border-amber-200 dark:border-amber-800/60', bg: 'bg-amber-50 dark:bg-amber-950/40', stripe: 'bg-amber-600', text: 'text-amber-700 dark:text-amber-300', icon: <Brain size={10} />, label: t.type_concept },
        logic: { border: 'border-rose-200 dark:border-rose-800/60', bg: 'bg-rose-50 dark:bg-rose-950/40', stripe: 'bg-rose-600', text: 'text-rose-700 dark:text-rose-300', icon: <Target size={10} />, label: t.type_logic },
        default: { border: 'border-[var(--border-main)]', bg: 'bg-[var(--bg-surface)]', stripe: 'bg-stone-400', text: 'text-[var(--text-muted)]', icon: <TextIcon size={10} />, label: t.type_text }
    };
    return styles[type] || styles.default;
  };

  const loadBoard = (sheet) => {
      setActiveBoardSheet(sheet);
      setShowPresentation(true);
  };

  const loadSheet = (sheet) => {
      if (sheet.type?.startsWith('activity')) {
          const actDef = getActivityDefinition(sheet.type);
          if (actDef) {
              setActiveActivity({
                  key: actDef.key,
                  savedBoard: sheet
              });
          }
          return;
      }

      if (sheet.type === 'board') {
          loadBoard(sheet);
          return;
      }
      
      setActiveBoardSheet(null); 

      const safePacket = Array.isArray(sheet.packet) 
          ? sheet.packet 
          : Array.isArray(sheet.packet?.tiles) 
              ? sheet.packet.tiles 
              : [];

      setPacket(safePacket); 
      setSheetTitle(sheet.title); 
      setSetupMode(sheet.type); 
      setActiveSheetId(sheet.id); 
      setChosenVisibility(sheet.visibility || 'private'); 
      setIsSaved(true);
      if (sheet.config?.includeAnswerKey !== undefined) setIncludeAnswerKey(sheet.config.includeAnswerKey);
      if (sheet.config?.answerKeyStyle !== undefined) setAnswerKeyStyle(sheet.config.answerKeyStyle);
      if (sheet.config?.globalLatexSize !== undefined) setGlobalLatexSize(sheet.config.globalLatexSize);
      if (sheet.config?.layoutStyle !== undefined) setLayoutStyle(sheet.config.layoutStyle);
      if (sheet.config?.workspaceStyle !== undefined) setWorkspaceStyle(sheet.config.workspaceStyle);
      if (sheet.config?.workspaceHeight !== undefined) setWorkspaceHeight(sheet.config.workspaceHeight);
      else if (sheet.config?.showWorkArea !== undefined) setWorkspaceHeight(sheet.config.showWorkArea ? 3 : 0);
      else setWorkspaceHeight(0);
  };

  const handleLaunchGrid = () => { 
      if (!isSaved && !window.confirm(t.unsaved_warning)) return; 
      syncBatchProgress('donow_generated', packet, { 
          app_mode: 'question_studio',
          include_answer_key: includeAnswerKey 
      });
      const gridPacket = packet.map(item => ({ ...item, _globalLatexSize: globalLatexSize }));
      onDoNowGenerate({ title: sheetTitle, globalLatexSize, includeAnswerKey, answerKeyStyle }, gridPacket); 
  };

  const handleLaunchPrint = () => { 
      if (!isSaved && !window.confirm(t.unsaved_warning)) return; 
      syncBatchProgress('worksheet_printed', packet, { 
          app_mode: 'question_studio',
          include_answer_key: includeAnswerKey,
          answer_style: answerKeyStyle,
          layout_style: layoutStyle,
          workspace_height: workspaceHeight
      });
      const printPacket = packet.map(item => ({
          ...item,
          _globalLatexSize: item.localLatexSize || globalLatexSize,
          _workspaceHeight: item.localWorkspaceHeight !== undefined ? item.localWorkspaceHeight : workspaceHeight,
          _workspaceStyle: item.localWorkspaceStyle !== undefined ? item.localWorkspaceStyle : workspaceStyle,
          _layoutStyle: layoutStyle
      }));
      onWorksheetGenerate(printPacket, { 
          title: sheetTitle, 
          globalLatexSize, 
          workspaceHeight, 
          workspaceStyle, 
          layoutStyle, 
          includeAnswerKey, 
          answerKeyStyle 
      }); 
  };
  
  const handleLaunchLive = () => {
    if (!isSaved && !window.confirm(t.unsaved_warning)) return;
    setShowLiveModal(true);
  };

  const confirmLaunchLive = async (settingsToUse) => {
        setShowLiveModal(false);
        const finalSettings = settingsToUse || liveSettings;
        
        syncBatchProgress('live_session_started', packet, {
            app_mode: 'teacher_live',
            pacing: finalSettings.pacing,
            order: finalSettings.order,
            scratchpad: true
        });

        try {
            const roomData = await liveCreateRoom({
                teacherId: profile?.id,
                profile,
                title: sheetTitle || (setupMode === 'donow' ? "Do Now Grid" : (lang === 'sv' ? "Arbetsblad Live" : "Worksheet Live")),
                mode: setupMode || 'worksheet',
                packet: packet,
                settings: {
                    ...finalSettings,
                    scratchpad: true,
                    allowScratchpad: true,
                    allowCanvas: false,
                    responseStyle: 'flexible'
                },
                activeSheetId
            });

            onDoNowGenerate(null, null, { room: roomData, packet: roomData.active_question_data.packet });
        } catch (err) {
            alert((lang === 'sv' ? "Kunde inte starta live-lektion: " : "Failed to launch live session: ") + err.message);
        }
  };

  const triggerPreview = async (variationKey) => {
    setIsPreviewLoading(true); setActivePreviewKey(variationKey);
    try {
        const res = await fetch(`/api/question?topic=${selectedTopicId}&variation=${variationKey}&lang=${lang}&wordProblem=${useWordProblems}`);
        const data = await res.json(); setPreviewData(data);
    } catch (err) { console.error(err); } finally { setIsPreviewLoading(false); }
  };

  const addToPacket = async (variation, qty) => {
    setIsPreviewLoading(true); setIsSaved(false);
    try {
        const newItems = [];
        for (let i = 0; i < qty; i++) {
            const res = await fetch(`/api/question?topic=${selectedTopicId}&variation=${variation.key}&lang=${lang}&wordProblem=${useWordProblems}`);
            const data = await res.json();
            const isFirstInBatch = i === 0;
            newItems.push({ 
                id: crypto.randomUUID(), topicId: selectedTopicId, variationKey: variation.key, name: variation.name[lang] || variation.name.en || variation.name.sv, 
                columnSpan: useWordProblems ? 6 : (isFirstInBatch ? 6 : 2), resolvedData: data, instructionMode: useWordProblems ? 'inline' : (isFirstInBatch ? 'header' : 'hidden'),
                showLatex: !useWordProblems, showVisual: !useWordProblems, selectedStoryIndex: useWordProblems ? 0 : null
            });
        }
        if (setupMode === 'donow' && packet.length + newItems.length > 6) { alert(lang === 'sv' ? "Do Now max 6." : "Do Now max 6 questions."); return; }
        setPacket(prev => [...prev, ...newItems]); setPendingQuantity(1);
    } catch (err) { alert(err.message); } finally { setIsPreviewLoading(false); }
  };

  const batchShuffle = async (mode) => {
        if (packet.length === 0 || isRegeneratingAll) return;
        setIsRegeneratingAll(true);
        try {
            syncBatchProgress(setupMode === 'donow' ? 'donow_grid_shuffled' : 'worksheet_grid_shuffled', packet, {
                app_mode: 'question_studio',
                shuffle_mode: mode
            });

            const updatedPacket = await Promise.all(packet.map(async (item) => {
                if (!item.topicId || !item.variationKey) return item;
                const isItemWP = item.selectedStoryIndex !== null && item.selectedStoryIndex !== undefined;
                if (mode === 'stories') {
                    const rd = item.resolvedData?.renderData;
                    if (!rd?.availableStories || rd.availableStories.length <= 1) return item;
                    const newIndex = Math.floor(Math.random() * rd.availableStories.length);
                    return { ...item, selectedStoryIndex: newIndex };
                }
                const res = await fetch(`/api/question?topic=${item.topicId}&variation=${item.variationKey}&lang=${lang}&wordProblem=${isItemWP}`);            
                const data = await res.json();
                let nextStoryIdx = null;
                if (isItemWP) {
                    if (mode === 'both' && data.renderData?.availableStories) {
                        nextStoryIdx = Math.floor(Math.random() * data.renderData.availableStories.length);
                    } else {
                        nextStoryIdx = item.selectedStoryIndex; 
                    }
                }
                return { ...item, id: mode === 'both' ? crypto.randomUUID() : item.id, selectedStoryIndex: nextStoryIdx, resolvedData: data };
            }));
            setPacket(updatedPacket); setIsSaved(false);
        } catch (err) { console.error(err); } finally { setIsRegeneratingAll(false); }
  };

  const updatePacketItem = (id, key, val) => { setPacket(packet.map(p => p.id === id ? { ...p, [key]: val } : p)); setIsSaved(false); };

  const filteredSkillBuckets = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return Object.values(SKILL_BUCKETS);

    return Object.values(SKILL_BUCKETS).map(cat => {
      const catName = (cat.name[lang] || cat.name.en || cat.name.sv || '').toLowerCase();
      const matchesCat = catName.includes(query);

      const matchingTopics = Object.entries(cat.topics || {}).filter(([topicId, topicData]) => {
        if (matchesCat) return true;

        const topicName = (topicData.name[lang] || topicData.name.en || topicData.name.sv || '').toLowerCase();
        if (topicName.includes(query)) return true;

        return (topicData.variations || []).some(v => {
          const varName = (v.name[lang] || v.name.en || v.name.sv || '').toLowerCase();
          const varDesc = (v.desc?.[lang] || v.desc?.en || v.desc?.sv || '').toLowerCase();
          return varName.includes(query) || varDesc.includes(query);
        });
      });

      return {
        ...cat,
        filteredTopicEntries: matchingTopics
      };
    }).filter(cat => cat.filteredTopicEntries.length > 0);
  }, [searchTerm, lang]);

  // =========================================================================
  // SETUP / LIBRARY GATEWAY
  // =========================================================================
  if (showPresentation) {
      return (
          <PresentationView 
              packet={activeBoardSheet ? (activeBoardSheet.packet?.livePacket || activeBoardSheet.packet) : packet}
              initialSlides={activeBoardSheet?.packet?.slides}
              initialSettings={activeBoardSheet?.packet?.settings}
              boardId={activeBoardSheet?.id || activeSheetId}
              sheetTitle={activeBoardSheet?.title || sheetTitle} 
              lang={lang} 
              onClose={() => { 
                  setShowPresentation(false);
                  setActiveBoardSheet(null);
                  setSetupMode(null);
              }}
              onLaunchLive={(roomData) => {
                  setShowPresentation(false);
                  onDoNowGenerate(null, null, { room: roomData, packet: roomData.active_question_data.packet });
              }}
          />
      );
  }

  if (activeActivity) {
      const def = getActivityDefinition(activeActivity.key);
      if (def?.TeacherEngine) {
          const Engine = def.TeacherEngine;
          return (
              <Engine
                  initialConfig={activeActivity.config}
                  savedBoard={activeActivity.savedBoard}
                  sourcePacket={activeActivity.sourcePacket || []}
                  session={activeActivity.session || activeActivity.config?.session || null}
                  isLiveHost={Boolean(activeActivity.isLiveHost || activeActivity.session)}
                  profile={profile}
                  onClose={() => setActiveActivity(null)}
                  lang={lang}
              />
          );
      }
  }

  if (!setupMode) {
      return (
          <>
              <SheetLibraryModal
                  isOpen={!activeActivity && !activeSetupModal}
                  profile={profile}
                  lang={lang}
                  onClose={onClose}
                  showCreationActions={true}
                  onCreateActivity={() => setShowActivityHub(true)}
                  onCreateNew={(type) => {
                      if (type === 'board') {
                          setActiveBoardSheet(null);
                          setPacket([]);
                          setSheetTitle("");
                          setShowPresentation(true);
                      } else {
                          setSetupMode(type);
                          setPacket([]);
                          setSheetTitle("");
                          setActiveSheetId(null);
                          setChosenVisibility('private');
                      }
                  }}
                  onSelectSheet={(sheet) => {
                      if (sheet.type?.startsWith('activity')) {
                          const actDef = getActivityDefinition(sheet.type);
                          if (actDef) {
                              const questions = Array.isArray(sheet.packet)
                                  ? sheet.packet
                                  : (sheet.packet?.tiles || sheet.packet?.livePacket || []);
                              
                              setActiveSetupModal({
                                  key: actDef.key,
                                  savedBoard: sheet,
                                  sourcePacket: questions
                              });
                          }
                          return;
                      }
                      if (sheet.type === 'board') {
                          setActiveBoardSheet(sheet);
                          setShowPresentation(true);
                      } else {
                          loadSheet(sheet);
                      }
                  }}
              />

              <ActivityHubModal
                    isOpen={showActivityHub}
                    onClose={() => setShowActivityHub(false)}
                    sourcePacket={setupMode ? packet : []}
                    profile={profile}
                    lang={lang}
                    onLaunchActivity={handleLaunchActivity}
              />

              {activeSetupModal && (() => {
                  const def = getActivityDefinition(activeSetupModal.key);
                  if (!def?.SetupModal) return null;
                  const WizardModal = def.SetupModal;
                  return (
                      <WizardModal
                          isOpen={true}
                          onClose={() => setActiveSetupModal(null)}
                          sourcePacket={activeSetupModal.sourcePacket || []}
                          savedBoard={activeSetupModal.savedBoard || null}
                          profile={profile}
                          lang={lang}
                          onLaunch={(config) => {
                              setActiveSetupModal(null);
                              handleLaunchActivity(activeSetupModal.key, {
                                  ...config,
                                  savedBoard: activeSetupModal.savedBoard,
                                  title: activeSetupModal.savedBoard?.title || config.title,
                                  sheetId: activeSetupModal.savedBoard?.id
                              });
                          }}
                      />
                  );
              })()}
          </>
      );
  }

  // =========================================================================
  // ACTIVE DRAFTING-TABLE EDITOR (STUDIO MODE)
  // =========================================================================
  const isDoNowMode = setupMode === 'donow';

  return (
    <div className="layout-wrapper flex flex-col h-screen max-h-screen font-sans overflow-hidden relative">
        {/* Top Drafting-Table Header Bar */}
        <header className="relative flex items-center justify-between px-4 sm:px-6 py-2 bg-[var(--bg-card)] border-b border-[var(--border-main)] z-50 gap-3">
            {/* Left Cluster: Back + Mode Badge + Document Title + Visibility + Save */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <button 
                    type="button"
                    onClick={() => { if(!isSaved && !window.confirm(t.unsaved_warning)) return; setSetupMode(null); }} 
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-main)] text-xs font-bold text-[var(--text-main)] transition-colors shrink-0 cursor-pointer"
                >
                    <ChevronLeft size={14}/> <span>{t.change_mode}</span>
                </button>

                <span className={`hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border shrink-0 ${
                    isDoNowMode 
                        ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800' 
                        : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                }`}>
                    {isDoNowMode ? <Grid3X3 size={12} /> : <FileText size={12} />}
                    {isDoNowMode ? t.donow_title : t.worksheet_title}
                </span>
                
                <div className="relative flex-1 max-w-xs min-w-[140px]">
                    <input 
                        type="text" 
                        className="w-full bg-[var(--bg-surface)] px-3 py-1.5 rounded-xl text-sm font-bold tracking-tight outline-none focus:border-emerald-600 transition-colors border border-[var(--border-main)] text-[var(--text-main)] placeholder-[var(--text-muted)]" 
                        placeholder={t.title_placeholder} 
                        value={sheetTitle}
                        maxLength={100}
                        onChange={(e) => { setSheetTitle(e.target.value); setIsSaved(false); }} 
                    />
                </div>

                {/* Visibility Toggle */}
                <div className="hidden sm:flex items-center gap-0.5 bg-[var(--bg-surface)] p-0.5 rounded-xl border border-[var(--border-main)] shrink-0">
                    <button 
                        type="button"
                        onClick={() => setChosenVisibility('private')} 
                        title={lang === 'sv' ? 'Privat' : 'Private'}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${chosenVisibility === 'private' ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-2xs border border-[var(--border-main)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                    >
                        <Lock size={12}/>
                    </button>
                    <button 
                        type="button"
                        onClick={() => setChosenVisibility('school')} 
                        title={lang === 'sv' ? 'Dela med skolan' : 'Share with school'}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${chosenVisibility === 'school' ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-2xs border border-[var(--border-main)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                    >
                        <Building2 size={12}/>
                    </button>
                </div>

                <button 
                    type="button"
                    onClick={() => triggerSave()} 
                    disabled={packet.length === 0 || isSaving} 
                    className="px-3 py-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-strong)] rounded-xl text-xs font-bold flex items-center gap-1.5 text-[var(--text-main)] transition-colors disabled:opacity-40 cursor-pointer shrink-0"
                >
                    <Save size={13} className="text-emerald-600 dark:text-emerald-400" />
                    <span>{t.save_btn}</span>
                </button>
            </div>

            {/* Right Cluster: Quiet Utility Controls + Primary Output Actions */}
            <div className="flex items-center gap-2 shrink-0 justify-end">
                <button
                    type="button"
                    onClick={() => setShowTutorial(true)}
                    className="px-2.5 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-main)] text-[var(--text-main)] hover:border-[var(--border-strong)] rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                    title={lang === 'sv' ? "Snabbguide & Hjälp" : "Quick Guide & Help"}
                >
                    <HelpCircle size={14} className="text-amber-600 dark:text-amber-400" />
                    <span className="hidden md:inline text-xs font-bold">
                        {lang === 'sv' ? "Guide" : "Help"}
                    </span>
                </button>
                
                <PreferencesToggle />

                <button
                    type="button"
                    onClick={() => setShowActivityHub(true)}
                    className="p-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] border border-[var(--border-main)] rounded-xl transition-colors cursor-pointer"
                    title={lang === 'sv' ? "Aktiviteter & Spel" : "Activities & Games"}
                >
                    <Gamepad2 size={15} className="text-sky-600 dark:text-sky-400" />
                </button>

                <div className="h-5 w-px bg-[var(--border-main)] mx-0.5" />

                <button 
                    type="button"
                    onClick={handleLaunchLive} 
                    disabled={packet.length === 0} 
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-35 cursor-pointer"
                >
                    <Send size={13}/> <span>{t.live_btn}</span>
                </button>

                <button 
                    type="button"
                    onClick={() => setShowPresentation(true)} 
                    disabled={packet.length === 0} 
                    className="px-3.5 py-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-strong)] text-[var(--text-main)] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-35 cursor-pointer"
                >
                    <Monitor size={13} className="text-amber-600 dark:text-amber-400" /> <span>{t.present}</span>
                </button>

                {isDoNowMode ? (
                    <button 
                        type="button"
                        onClick={handleLaunchGrid} 
                        disabled={packet.length === 0} 
                        className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-35 cursor-pointer shadow-2xs"
                    >
                        <Grid3X3 size={13}/> <span>{t.create_donow}</span>
                    </button>
                ) : (
                    <button 
                        type="button"
                        onClick={handleLaunchPrint} 
                        disabled={packet.length === 0} 
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-35 cursor-pointer shadow-2xs"
                    >
                        <Printer size={13}/> <span>{t.publish}</span>
                    </button>
                )}

                <button 
                    type="button"
                    onClick={onClose} 
                    className="p-1.5 text-[var(--text-muted)] hover:bg-rose-600 hover:text-white rounded-xl transition-colors cursor-pointer ml-0.5"
                    title={lang === 'sv' ? "Stäng Studio" : "Close Studio"}
                >
                    <X size={16}/>
                </button>
            </div>
        </header>

      <div className="flex flex-1 overflow-hidden relative z-10 min-h-0">
        {/* PANE 1: Curriculum Topics */}
        <div className={`bg-[var(--bg-card)] border-r border-[var(--border-main)] flex flex-col shrink-0 transition-all duration-200 ${isPane1Collapsed ? 'w-14' : 'w-56'}`}>
          <div className={`px-3 py-2.5 border-b border-[var(--border-main)] flex items-center ${isPane1Collapsed ? 'justify-center' : 'justify-between'}`}>
              {!isPane1Collapsed && (
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] pl-1">
                      {lang === 'sv' ? "Ämnesområden" : "Topics"}
                  </span>
              )}
              <button 
                  type="button"
                  onClick={() => setIsPane1Collapsed(!isPane1Collapsed)} 
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
              >
                  {isPane1Collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
              </button>
          </div>
          <div className={`flex-1 overflow-y-auto custom-scrollbar transition-opacity duration-150 ${isPane1Collapsed ? 'opacity-0 invisible' : 'opacity-100 p-3 space-y-4'}`}>
            {!isPane1Collapsed && (
                <>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-[var(--text-muted)]" size={14} />
                        <input 
                            type="text" 
                            placeholder={t.search_placeholder} 
                            className="w-full pl-9 pr-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-main)] text-[var(--text-main)] rounded-xl text-xs font-semibold outline-none focus:border-emerald-600 transition-colors" 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                    </div>
                    {filteredSkillBuckets.map(cat => (
                        <div key={cat.id}>
                            <h3 className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1.5 px-2">
                                {cat.name[lang] || cat.name.en || cat.name.sv}
                            </h3>
                            <div className="space-y-0.5">
                                {(cat.filteredTopicEntries || Object.entries(cat.topics)).map(([id, data]) => {
                                    const isSelected = selectedTopicId === id;
                                    return (
                                        <button 
                                            key={id} 
                                            type="button"
                                            onClick={() => setSelectedTopicId(id)} 
                                            className={`w-full text-left px-3 py-1.5 text-xs rounded-xl transition-colors cursor-pointer ${
                                                isSelected 
                                                    ? (isDoNowMode ? 'bg-sky-600 text-white font-bold' : 'bg-emerald-600 text-white font-bold')
                                                    : 'text-[var(--text-main)] font-medium hover:bg-[var(--bg-surface)]'
                                            }`}
                                        >
                                            {data.name[lang] || data.name.en || data.name.sv}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {filteredSkillBuckets.length === 0 && (
                        <div className="py-8 text-center text-xs font-medium text-[var(--text-muted)]">
                            {lang === 'sv' ? `Inga områden matchade "${searchTerm}"` : `No topics matched "${searchTerm}"`}
                        </div>
                    )}
                </>
            )}
          </div>
        </div>

        {/* PANE 2: Variations */}
        <div className="w-[296px] bg-[var(--bg-surface)]/60 border-r border-[var(--border-main)] flex flex-col shrink-0 min-h-0 h-full">
            <div className="p-3 border-b border-[var(--border-main)] bg-[var(--bg-card)] shrink-0 space-y-2">
                <h1 className="text-sm font-extrabold text-[var(--text-main)] truncate leading-snug">
                    {currentTopic?.name[lang] || currentTopic?.name.en || currentTopic?.name.sv}
                </h1>
                
                <div className="flex items-center justify-between bg-[var(--bg-surface)] px-2.5 py-1.5 rounded-xl border border-[var(--border-main)]">
                    <span className="text-[11px] font-semibold text-[var(--text-main)]">{t.hide_extra}</span>
                    <button 
                        type="button"
                        onClick={() => setHideExtra(!hideExtra)} 
                        className={`w-8 h-4 rounded-full transition-colors relative p-0.5 cursor-pointer ${hideExtra ? 'bg-emerald-600' : 'bg-[var(--border-strong)]'}`}
                    >
                        <div className={`w-3 h-3 bg-white rounded-full transition-transform ${hideExtra ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                </div>

                <div className={`flex items-center justify-between bg-[var(--bg-surface)] px-2.5 py-1.5 rounded-xl border transition-opacity ${topicSupportsWordProblems ? 'border-[var(--border-main)]' : 'border-[var(--border-subtle)] opacity-50'}`}>
                    <span className="text-[11px] font-semibold text-[var(--text-main)]">
                        {lang === 'sv' ? 'Problemlösning' : 'Word Problems'}
                    </span>
                    <button 
                        type="button"
                        disabled={!topicSupportsWordProblems}
                        onClick={() => setUseWordProblems(!useWordProblems)} 
                        className={`w-8 h-4 rounded-full transition-colors relative p-0.5 ${!topicSupportsWordProblems ? 'cursor-not-allowed bg-[var(--border-main)]' : useWordProblems ? 'cursor-pointer bg-emerald-600' : 'cursor-pointer bg-[var(--border-strong)]'}`}
                        title={!topicSupportsWordProblems ? (lang === 'sv' ? "Inga textuppgifter finns för detta område" : "No word problems available for this topic") : ""}
                    >
                        <div className={`w-3 h-3 bg-white rounded-full transition-transform ${useWordProblems ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar min-h-0">
                {Object.entries(
                    visibleVariations.reduce((acc, v) => {
                        const lvl = v.level || 1; 
                        if (!acc[lvl]) acc[lvl] = [];
                        acc[lvl].push(v);
                        return acc;
                    }, {})
                ).sort(([lvlA], [lvlB]) => Number(lvlA) - Number(lvlB)).map(([lvl, variations]) => (
                    <div key={lvl} className="space-y-2">
                        <div className="sticky top-0 bg-[var(--bg-surface)]/95 backdrop-blur-xs pt-2 pb-1.5 flex items-center z-10">
                            <span className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                {lang === 'sv' ? `Nivå ${lvl}` : `Level ${lvl}`}
                            </span>
                            <div className="flex-1 h-px bg-[var(--border-strong)] ml-2.5"></div>
                        </div>

                        {variations.map(v => {
                            const cat = getVariationCategory(v.key);
                            const styles = getCategoryStyles(cat);
                            const isPreviewed = activePreviewKey === v.key;
                            
                            return (
                                <div 
                                    key={v.key} 
                                    onClick={() => triggerPreview(v.key)} 
                                    className={`p-3 rounded-xl border transition-all bg-[var(--bg-card)] relative overflow-hidden cursor-pointer ${
                                        isPreviewed 
                                            ? (isDoNowMode ? 'border-sky-600 ring-2 ring-sky-600/15' : 'border-emerald-600 ring-2 ring-emerald-600/15')
                                            : 'border-[var(--border-main)] hover:border-[var(--border-strong)]'
                                    }`}
                                >
                                    <div className={`absolute top-0 left-0 bottom-0 w-1 ${styles.stripe}`} />
                                    <div className="flex justify-between items-start gap-2 mb-1 pl-1">
                                        <h4 className="font-bold text-xs text-[var(--text-main)] leading-snug">
                                            {v.name[lang] || v.name.en || v.name.sv}
                                        </h4>
                                        <span className={`shrink-0 px-1.5 py-0.5 rounded border ${styles.border} ${styles.bg} ${styles.text} text-[10px] font-bold flex items-center gap-1`}>
                                            {styles.icon} {styles.label}
                                        </span>
                                    </div>
                                    
                                    <p className="text-xs font-medium text-[var(--text-muted)] line-clamp-1 mb-2.5 pl-1">
                                        {v.desc[lang] || v.desc.en || v.desc.sv}
                                    </p>
                                    
                                    <div className="flex items-center gap-1.5 pl-1">
                                        <div className="flex items-center bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg p-0.5">
                                            <button 
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setPendingQuantity(Math.max(1, pendingQuantity - 1)); }} 
                                                className="w-6 h-6 flex items-center justify-center hover:bg-[var(--bg-card)] rounded text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                                            >
                                                <Minus size={11}/>
                                            </button>
                                            <span className="w-5 text-center text-xs font-bold font-mono text-[var(--text-main)]">{pendingQuantity}</span>
                                            <button 
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setPendingQuantity(pendingQuantity + 1); }} 
                                                className="w-6 h-6 flex items-center justify-center hover:bg-[var(--bg-card)] rounded text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                                            >
                                                <Plus size={11}/>
                                            </button>
                                        </div>
                                        <button 
                                            type="button"
                                            disabled={isPreviewLoading} 
                                            onClick={(e) => { e.stopPropagation(); addToPacket(v, pendingQuantity); }} 
                                            className={`flex-1 py-1.5 text-white rounded-lg text-xs font-bold transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer ${
                                                isDoNowMode ? 'bg-sky-600 hover:bg-sky-700' : 'bg-emerald-600 hover:bg-emerald-700'
                                            }`}
                                        >
                                            {isPreviewLoading && isPreviewed ? '...' : `${t.add_qty} ${pendingQuantity}`}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>

        {/* PANE 3: Drafting-Table Workspace */}
        <div className="flex-1 flex flex-col overflow-hidden relative drafting-desk-bg min-h-0 h-full">
            {/* Pane 3 Subheader */}
            <div className="bg-[var(--bg-card)] border-b border-[var(--border-main)] px-5 py-2 flex items-center justify-between shrink-0 z-40 min-h-[52px]">
                <div className="inline-flex bg-[var(--bg-surface)] p-1 rounded-xl border border-[var(--border-main)] gap-1">
                    <button 
                        type="button"
                        onClick={() => setCanvasMode('studio')} 
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                            canvasMode === 'studio' 
                                ? 'bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-main)] shadow-2xs' 
                                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                        }`}
                    >
                        <Zap size={13} className={canvasMode === 'studio' ? 'text-emerald-600 dark:text-emerald-400' : ''} />
                        <span>Studio</span>
                    </button>
                    {setupMode && (
                        <button 
                            type="button"
                            onClick={() => setCanvasMode('layout')} 
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                                canvasMode === 'layout' 
                                    ? 'bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-main)] shadow-2xs' 
                                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                            }`}
                        >
                            <LayoutGrid size={13} className={canvasMode === 'layout' ? 'text-sky-600 dark:text-sky-400' : ''} />
                            <span>{isDoNowMode ? 'Grid' : 'Layout'}</span>
                        </button>
                    )}
                </div>

                {canvasMode === 'layout' && (
                    <div className="flex items-center gap-2.5">
                        {/* Global Shuffle Dropdown */}
                        <div className="relative">
                            <button 
                                type="button"
                                disabled={isRegeneratingAll || packet.length === 0}
                                onClick={() => setIsGlobalShuffleOpen(!isGlobalShuffleOpen)} 
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-card)] text-[var(--text-main)] text-xs font-bold hover:border-emerald-600 disabled:opacity-40 transition-colors cursor-pointer"
                            >
                                {isRegeneratingAll ? <Loader2 size={13} className="animate-spin text-emerald-600" /> : <Shuffle size={13} className="text-emerald-600 dark:text-emerald-400" />} 
                                <span>{t.regenerate_all}</span>
                            </button>

                            {isGlobalShuffleOpen && (
                                <div className="absolute top-10 right-0 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-xl p-1.5 w-48 z-50 flex flex-col gap-1 animate-in fade-in slide-in-from-top-1 duration-150">
                                    <button type="button" onClick={async () => { setIsGlobalShuffleOpen(false); await batchShuffle('numbers'); }} className="w-full text-left px-3 py-2 hover:bg-[var(--bg-surface)] rounded-xl flex items-center gap-2 text-xs font-bold text-[var(--text-main)] cursor-pointer">
                                        <Calculator size={13} className="text-emerald-600" /> {lang === 'sv' ? "Bara tal" : "Numbers Only"}
                                    </button>
                                    <button type="button" onClick={async () => { setIsGlobalShuffleOpen(false); await batchShuffle('stories'); }} className="w-full text-left px-3 py-2 hover:bg-[var(--bg-surface)] rounded-xl flex items-center gap-2 text-xs font-bold text-[var(--text-main)] cursor-pointer">
                                        <Type size={13} className="text-amber-600" /> {lang === 'sv' ? "Bara text" : "Stories Only"}
                                    </button>
                                    <div className="h-px bg-[var(--border-main)] my-0.5" />
                                    <button type="button" onClick={async () => { setIsGlobalShuffleOpen(false); await batchShuffle('both'); }} className="w-full text-left px-3 py-2 hover:bg-[var(--bg-surface)] rounded-xl flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 cursor-pointer">
                                        <RefreshCcw size={13} /> {lang === 'sv' ? "Slumpa allt" : "Reshuffle Both"}
                                    </button>
                                </div>
                            )}
                        </div>

                        {setupMode === 'worksheet' && (
                            <>
                                <div className="h-5 w-px bg-[var(--border-main)]" />

                                {/* Work Area Rows & Grid Toggle */}
                                <div className="flex items-center gap-1.5 bg-[var(--bg-surface)] border border-[var(--border-main)] p-1 rounded-xl">
                                    <span className="text-[11px] font-bold text-[var(--text-muted)] px-1.5">{t.rows_label}</span>
                                    <div className="flex items-center bg-[var(--bg-card)] rounded-lg border border-[var(--border-main)]">
                                        <button 
                                            type="button"
                                            onClick={() => { 
                                                const nextGlobal = Math.max(0, workspaceHeight - 1);
                                                setWorkspaceHeight(nextGlobal); 
                                                setPacket(prev => prev.map(p => {
                                                    const current = p.localWorkspaceHeight !== undefined ? p.localWorkspaceHeight : workspaceHeight;
                                                    return { ...p, localWorkspaceHeight: Math.max(0, current - 1), _workspaceHeight: nextGlobal };
                                                }));
                                                setIsSaved(false); 
                                            }} 
                                            className="px-2 py-1 text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                                        >
                                            <Minus size={11} />
                                        </button>
                                        <span className="text-xs font-bold font-mono w-7 text-center text-[var(--text-main)]">
                                            {(() => {
                                                const practiceItems = packet.filter(p => !p.isWorkedExample);
                                                if (practiceItems.length === 0) return workspaceHeight;
                                                const heights = practiceItems.map(p => p.localWorkspaceHeight !== undefined ? p.localWorkspaceHeight : workspaceHeight);
                                                const allSame = heights.every(h => h === heights[0]);
                                                return allSame ? heights[0] : `${Math.min(...heights)}–${Math.max(...heights)}`;
                                            })()}
                                        </span>
                                        <button 
                                            type="button"
                                            onClick={() => { 
                                                const nextGlobal = Math.min(15, workspaceHeight + 1);
                                                setWorkspaceHeight(nextGlobal); 
                                                setPacket(prev => prev.map(p => {
                                                    const current = p.localWorkspaceHeight !== undefined ? p.localWorkspaceHeight : workspaceHeight;
                                                    return { ...p, localWorkspaceHeight: Math.min(15, current + 1), _workspaceHeight: nextGlobal };
                                                }));
                                                setIsSaved(false); 
                                            }} 
                                            className="px-2 py-1 text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                                        >
                                            <Plus size={11} />
                                        </button>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => { 
                                            const nextStyle = workspaceStyle === 'grid' ? 'blank' : 'grid';
                                            setWorkspaceStyle(nextStyle); 
                                            setPacket(prev => prev.map(p => ({ ...p, localWorkspaceStyle: nextStyle })));
                                            setIsSaved(false); 
                                        }} 
                                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${workspaceStyle === 'grid' ? 'bg-[var(--bg-card)] text-emerald-600 dark:text-emerald-400 border border-[var(--border-main)]' : 'text-[var(--text-muted)]'}`}
                                        title={t.toggle_grid}
                                    >
                                        <Grid3X3 size={13} />
                                    </button>
                                </div>

                                {/* Density & Style Popover */}
                                <div className="relative">
                                    <button 
                                        type="button"
                                        onClick={() => setIsLayoutMenuOpen(prev => !prev)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-card)] text-[var(--text-main)] text-xs font-bold hover:border-emerald-600 transition-colors cursor-pointer"
                                    >
                                        <Settings2 size={13} className="text-emerald-600 dark:text-emerald-400" />
                                        <span>{t.density_and_style}</span>
                                        <ChevronDown size={12} className="opacity-60" />
                                    </button>

                                    {isLayoutMenuOpen && (
                                        <div className="absolute top-10 right-0 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-xl p-4 w-72 z-50 flex flex-col gap-3.5 animate-in fade-in slide-in-from-top-1 duration-150">
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">
                                                    {t.presets_heading}
                                                </span>
                                                <div className="grid grid-cols-3 gap-1 bg-[var(--bg-surface)] p-1 rounded-xl border border-[var(--border-main)]">
                                                    <button 
                                                        type="button"
                                                        onClick={() => {
                                                            setGlobalLatexSize('sm');
                                                            setWorkspaceHeight(0);
                                                            setLayoutStyle('open');
                                                            setPacket(prev => prev.map(p => ({ ...p, localLatexSize: null, localWorkspaceHeight: undefined, columnSpan: 2 })));
                                                            setIsSaved(false);
                                                        }}
                                                        className="py-1.5 text-center text-[11px] font-bold rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-main)] cursor-pointer"
                                                    >
                                                        {t.preset_compact}
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        onClick={() => {
                                                            setGlobalLatexSize('md');
                                                            setWorkspaceHeight(2);
                                                            setLayoutStyle('open');
                                                            setPacket(prev => prev.map(p => ({ ...p, localLatexSize: null, localWorkspaceHeight: undefined, columnSpan: 3 })));
                                                            setIsSaved(false);
                                                        }}
                                                        className="py-1.5 text-center text-[11px] font-bold rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-main)] cursor-pointer"
                                                    >
                                                        {t.preset_standard}
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        onClick={() => {
                                                            setGlobalLatexSize('lg');
                                                            setWorkspaceHeight(4);
                                                            setLayoutStyle('framed');
                                                            setPacket(prev => prev.map(p => ({ ...p, localLatexSize: null, localWorkspaceHeight: undefined, columnSpan: 6 })));
                                                            setIsSaved(false);
                                                        }}
                                                        className="py-1.5 text-center text-[11px] font-bold rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-main)] cursor-pointer"
                                                    >
                                                        {t.preset_spacious}
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">
                                                    {t.font_size_heading}
                                                </span>
                                                <div className="grid grid-cols-4 gap-1 bg-[var(--bg-surface)] p-1 rounded-xl border border-[var(--border-main)]">
                                                    {['sm', 'md', 'lg', 'xl'].map(s => (
                                                        <button 
                                                            key={s} 
                                                            type="button"
                                                            onClick={() => { setGlobalLatexSize(s); setPacket(prev => prev.map(p => ({ ...p, localLatexSize: null }))); setIsSaved(false); }}
                                                            className={`py-1 text-center text-xs font-bold font-mono rounded-lg transition-colors cursor-pointer ${globalLatexSize === s ? 'bg-[var(--bg-card)] text-emerald-600 dark:text-emerald-400 shadow-2xs' : 'text-[var(--text-muted)]'}`}
                                                        >
                                                            {s.toUpperCase()}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">
                                                    {t.framing_heading}
                                                </span>
                                                <div className="grid grid-cols-2 gap-1 bg-[var(--bg-surface)] p-1 rounded-xl border border-[var(--border-main)]">
                                                    <button 
                                                        type="button"
                                                        onClick={() => { setLayoutStyle('open'); setIsSaved(false); }}
                                                        className={`py-1 text-center text-xs font-bold rounded-lg cursor-pointer ${layoutStyle === 'open' ? 'bg-[var(--bg-card)] text-emerald-600 dark:text-emerald-400 shadow-2xs' : 'text-[var(--text-muted)]'}`}
                                                    >
                                                        {t.style_open}
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        onClick={() => { setLayoutStyle('framed'); setIsSaved(false); }}
                                                        className={`py-1 text-center text-xs font-bold rounded-lg cursor-pointer ${layoutStyle === 'framed' ? 'bg-[var(--bg-card)] text-emerald-600 dark:text-emerald-400 shadow-2xs' : 'text-[var(--text-muted)]'}`}
                                                    >
                                                        {t.style_framed}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Canvas Body */}
            <div className="flex-1 flex flex-col overflow-hidden relative min-h-0">
                {canvasMode === 'studio' ? (
                    <div className="whiteboard-protect bg-white flex-1 rounded-2xl shadow-lg border border-stone-200 overflow-hidden flex flex-col mx-auto w-full max-w-2xl animate-in fade-in duration-200 my-5">
                        <div className="px-6 py-3.5 bg-stone-900 text-white flex justify-between items-center">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-300">
                                {t.board_label}
                            </span>
                            {activePreviewKey && (
                                <button 
                                    type="button"
                                    onClick={() => triggerPreview(activePreviewKey)} 
                                    className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                    <RefreshCcw size={12}/> {t.new_example}
                                </button>
                            )}
                        </div>
                        <div className="p-8 sm:p-10 flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center justify-center">
                            {isPreviewLoading ? (
                                <Loader2 className="animate-spin text-emerald-600" size={36} />
                            ) : !previewData ? (
                                <p className="text-stone-400 font-bold text-sm">
                                    {t.select_hint}
                                </p>
                            ) : (
                                <div className="w-full space-y-8 animate-in fade-in duration-200">
                                    <div className="w-full flex justify-center">
                                        <VisualRenderer 
                                            data={previewData?.renderData} 
                                            isWordProblem={useWordProblems} 
                                        />
                                    </div>
                                    <div className="text-xl text-stone-900 font-semibold text-center px-6 leading-relaxed">
                                        <MathDisplay content={previewData.renderData.description} />
                                    </div>
                                    {previewData.renderData.latex && (
                                        <div className="text-3xl sm:text-4xl text-stone-900 bg-stone-50 p-8 rounded-2xl border border-stone-200 text-center font-serif">
                                            <MathDisplay content={`$$${previewData.renderData.latex}$$`} />
                                        </div>
                                    )}
                                    {renderOptions(previewData.renderData?.options)}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-auto custom-scrollbar pb-24 flex justify-center items-start p-5">
                        <div 
                            className={`shadow-xl flex flex-col animate-in fade-in duration-200 origin-top relative ${
                                isDoNowMode 
                                ? 'whiteboard-protect w-full max-w-5xl bg-white border border-stone-200 rounded-2xl p-8' 
                                : 'whiteboard-protect w-[210mm] min-h-[297mm] bg-white border border-stone-300 rounded-sm p-[12mm]'
                            }`}
                            style={setupMode === 'worksheet' ? { transform: 'scale(0.85)', transformOrigin: 'top center' } : {}}
                        >
                            {/* A4 Page Break Guides */}
                            {setupMode === 'worksheet' && [1, 2, 3, 4].map((pageNum) => {
                                const topOffsetMm = pageNum * 273;
                                return (
                                    <div 
                                        key={`pb-${pageNum}`}
                                        className="pointer-events-none absolute left-0 right-0 border-b border-dashed border-rose-400 flex items-center justify-end pr-4 text-[10px] font-bold font-mono text-rose-500 z-30"
                                        style={{ top: `${topOffsetMm}mm` }}
                                    >
                                        <span className="bg-white px-2 py-0.5 rounded border border-rose-200 mb-[-10px]">
                                            {lang === 'sv' ? `Sidbrytning · Sida ${pageNum}` : `Page Break · Page ${pageNum}`}
                                        </span>
                                    </div>
                                );
                            })}

                            {setupMode === 'worksheet' ? (
                                <header className="border-b-2 border-stone-900 pb-2 mb-4 flex items-end justify-between">
                                    <h1 className="text-lg font-extrabold w-1/3 truncate leading-none text-stone-900">{sheetTitle || t.sheet_default_title}</h1>
                                    <div className="flex gap-6 w-2/3 justify-end text-[11px] font-bold uppercase tracking-wider text-stone-700">
                                        <div className="border-b border-stone-300 pb-1 flex gap-2 flex-1 max-w-[200px]"><span>{t.name_label}</span><div className="flex-1" /></div>
                                        <div className="border-b border-stone-300 pb-1 flex gap-2 w-[120px]"><span>{t.date_label}</span><div className="flex-1" /></div>
                                    </div>
                                </header>
                            ) : (
                                <header className="border-b-2 border-stone-900 pb-3 mb-5 flex items-center justify-between">
                                    <h1 className="text-xl font-extrabold text-stone-900 leading-none">{sheetTitle || t.donow_title}</h1>
                                </header>
                            )}

                            <div className="grid grid-cols-6 gap-x-6 gap-y-4 items-start content-start">
                                {Array.isArray(packet) && packet.map((item, idx) => {
                                    const displayStory = item.showText !== false;
                                    const displayLatex = item.showLatex !== false;
                                    const displayVisual = item.showVisual !== false;

                                    const isHeaderMode = displayStory && (item.instructionMode === 'header' || !item.instructionMode);
                                    const isInlineMode = displayStory && item.instructionMode === 'inline';
                                    
                                    const effectiveLatexSize = item.localLatexSize || globalLatexSize;
                                    const fontPixelMap = { sm: '14px', md: '18px', lg: '24px', xl: '32px' };
                                    const currentFontSize = fontPixelMap[effectiveLatexSize] || '18px';

                                    const effectiveWorkArea = item.localWorkspaceHeight !== undefined ? item.localWorkspaceHeight : workspaceHeight;
                                    const effectiveWorkspaceStyle = item.localWorkspaceStyle !== undefined ? item.localWorkspaceStyle : workspaceStyle;

                                    return (
                                        <React.Fragment key={item.id}>
                                            {!item.isWorkedExample && isHeaderMode && (
                                                <div className={`col-span-6 border-l-4 pl-3 py-1.5 rounded-r-lg ${isDoNowMode ? 'bg-sky-50/70 border-sky-600 mb-1 mt-2' : 'bg-stone-50 border-stone-900 mb-1 mt-1'}`}>
                                                    <div className="text-sm font-semibold leading-relaxed text-stone-900">
                                                        <MathDisplay content={compileAnchoredStory(item, lang)} />
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div 
                                                draggable 
                                                onDragStart={(e) => handleDragStartUnified(e, idx)} 
                                                onDragOver={(e) => handleDragOverUnified(e, idx)} 
                                                onDragEnd={handleDragEndUnified} 
                                                className={`whiteboard-protect relative group transition-all flex flex-col cursor-move ${
                                                    item.isWorkedExample ? 'col-span-6 h-auto p-0 border-0' : `${getColSpanClass(item.columnSpan)} h-full`
                                                } ${
                                                    !item.isWorkedExample && (isDoNowMode 
                                                        ? 'p-5 border border-stone-200 hover:border-sky-500 rounded-xl shadow-xs' 
                                                        : (layoutStyle === 'framed' 
                                                            ? 'p-4 border border-stone-300 rounded-xl hover:border-emerald-600' 
                                                            : 'p-2.5 border border-transparent hover:border-stone-300 rounded-xl'))
                                                } ${draggedIdx === idx ? 'opacity-25 border-sky-500 bg-sky-50 scale-[0.98]' : ''}`}
                                            >
                                                <div className="absolute top-2 left-1.5 text-stone-300 opacity-0 group-hover:opacity-100 z-10">
                                                    <GripVertical size={13} />
                                                </div>
                                                
                                                {/* Single-Row Labeled Drafting Toolbar (Zero wrap, never covers math) */}
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex justify-center opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto z-30 transition-opacity duration-150">
                                                    <div className="bg-white shadow-lg rounded-xl px-2 py-1 flex items-center gap-1 border border-stone-300 whitespace-nowrap">
                                                        {setupMode === 'worksheet' && (
                                                            <>
                                                                {/* Workspace Rows */}
                                                                <div className="flex items-center bg-stone-100 rounded-lg px-1" title={lang === 'sv' ? 'Antal rader för uträkning' : 'Answer space rows'}>
                                                                    <button type="button" onClick={(e) => { e.stopPropagation(); updatePacketItem(item.id, 'localWorkspaceHeight', Math.max(0, effectiveWorkArea - 1)); }} className="p-1 text-stone-600 hover:text-emerald-700 cursor-pointer"><Minus size={10}/></button>
                                                                    <span className="text-[10px] font-bold font-mono px-1 text-stone-800">{effectiveWorkArea}r</span>
                                                                    <button type="button" onClick={(e) => { e.stopPropagation(); updatePacketItem(item.id, 'localWorkspaceHeight', Math.min(15, effectiveWorkArea + 1)); }} className="p-1 text-stone-600 hover:text-emerald-700 cursor-pointer"><Plus size={10}/></button>
                                                                </div>
                                                                
                                                                {/* Grid / Blank Toggle */}
                                                                <button 
                                                                    type="button" 
                                                                    onClick={(e) => { e.stopPropagation(); updatePacketItem(item.id, 'localWorkspaceStyle', effectiveWorkspaceStyle === 'grid' ? 'blank' : 'grid'); }} 
                                                                    className={`px-1.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${effectiveWorkspaceStyle === 'grid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`} 
                                                                    title={t.toggle_work_area}
                                                                >
                                                                    {effectiveWorkspaceStyle === 'grid' ? <Grid3X3 size={10} /> : <Square size={10} />}
                                                                    <span>{lang === 'sv' ? 'Rutnät' : 'Grid'}</span>
                                                                </button>

                                                                {/* Font Size Cycle */}
                                                                <button 
                                                                    type="button" 
                                                                    onClick={(e) => { e.stopPropagation(); const sizes = ['sm', 'md', 'lg', 'xl']; updatePacketItem(item.id, 'localLatexSize', sizes[(sizes.indexOf(effectiveLatexSize) + 1) % 4]); }} 
                                                                    className="bg-stone-100 hover:bg-stone-200 text-stone-800 text-[10px] font-mono font-bold px-1.5 py-1 rounded-lg transition-colors cursor-pointer" 
                                                                    title={t.font_size_heading}
                                                                >
                                                                    {effectiveLatexSize.toUpperCase()}
                                                                </button>
                                                            </>
                                                        )}

                                                        {/* Card Width Cycle */}
                                                        <button 
                                                            type="button" 
                                                            onClick={(e) => { e.stopPropagation(); updatePacketItem(item.id, 'columnSpan', item.columnSpan === 2 ? 3 : item.columnSpan === 3 ? 6 : 2); }} 
                                                            className="bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-bold font-mono px-2 py-1 rounded-lg cursor-pointer" 
                                                            title={lang === 'sv' ? 'Ändra bredd (1/3, 1/2, Hel)' : 'Cycle width (1/3, 1/2, Full)'}
                                                        >
                                                            {item.columnSpan === 2 ? '1/3' : item.columnSpan === 3 ? '1/2' : '1/1'}
                                                        </button>

                                                        {/* Instruction Placement */}
                                                        <button 
                                                            type="button" 
                                                            onClick={(e) => { e.stopPropagation(); const modes = ['header', 'inline', 'hidden']; updatePacketItem(item.id, 'instructionMode', modes[(modes.indexOf(item.instructionMode || 'header') + 1) % 3]); }} 
                                                            className={`px-1.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${item.instructionMode === 'inline' ? 'bg-amber-500 text-white' : item.instructionMode === 'hidden' ? 'bg-stone-100 text-stone-400 line-through' : 'bg-stone-100 text-stone-700'}`} 
                                                            title={lang === 'sv' ? 'Instruktion: Rubrik / I kort / Dold' : 'Instruction: Header / Inline / Hidden'}
                                                        >
                                                            <AlignLeft size={10} />
                                                            <span>{lang === 'sv' ? 'Text' : 'Text'}</span>
                                                        </button>

                                                        <div className="h-3.5 w-px bg-stone-200 mx-0.5" />

                                                        {/* Shuffle Numbers */}
                                                        <button
                                                            type="button"
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                try {
                                                                    const isItemWP = item.selectedStoryIndex !== null && item.selectedStoryIndex !== undefined;
                                                                    const res = await fetch(`/api/question?topic=${item.topicId}&variation=${item.variationKey}&lang=${lang}&wordProblem=${isItemWP}`);
                                                                    const data = await res.json();
                                                                    setPacket(packet.map(p => p.id === item.id ? { ...p, resolvedData: data, selectedStoryIndex: p.selectedStoryIndex !== undefined && p.selectedStoryIndex !== null ? p.selectedStoryIndex : null } : p));
                                                                    setIsSaved(false);
                                                                } catch (err) { console.error("Number shuffle failed:", err); }
                                                            }}
                                                            className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-700 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                                            title={lang === 'sv' ? "Slumpa nya tal" : "Shuffle Numbers"}
                                                        >
                                                            <RefreshCcw size={10} />
                                                            <span>{lang === 'sv' ? 'Slumpa' : 'Shuffle'}</span>
                                                        </button>

                                                        {/* Shuffle Story (shown when multiple word-problem stories exist) */}
                                                        {item.resolvedData?.renderData?.availableStories && item.resolvedData.renderData.availableStories.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const totalStories = item.resolvedData.renderData.availableStories.length;
                                                                    const currentStoryIdx = item.selectedStoryIndex !== undefined && item.selectedStoryIndex !== null ? item.selectedStoryIndex : 0;
                                                                    let newIndex = Math.floor(Math.random() * totalStories);
                                                                    if (newIndex === currentStoryIdx) newIndex = (newIndex + 1) % totalStories;
                                                                    updatePacketItem(item.id, 'selectedStoryIndex', newIndex);
                                                                }}
                                                                className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-amber-50 text-stone-700 hover:text-amber-700 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                                                title={lang === 'sv' ? "Byt berättelse" : "Shuffle Story"}
                                                            >
                                                                <Shuffle size={10} />
                                                                <span>{lang === 'sv' ? 'Berättelse' : 'Story'}</span>
                                                            </button>
                                                        )}

                                                        {/* Explicit Labeled "Example" / "Exempel" Toggle */}
                                                        <button 
                                                            type="button"
                                                            onClick={(e) => { 
                                                                e.stopPropagation(); 
                                                                const nextVal = !item.isWorkedExample;
                                                                setPacket(packet.map(p => p.id === item.id ? { 
                                                                    ...p, 
                                                                    isWorkedExample: nextVal,
                                                                    columnSpan: nextVal ? 6 : (p.columnSpan || 6)
                                                                } : p));
                                                                setIsSaved(false);
                                                            }} 
                                                            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                                                                item.isWorkedExample 
                                                                    ? 'bg-amber-500 text-white' 
                                                                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                                                            }`}
                                                            title={lang === 'sv' ? "Gör om till löst exempel" : "Convert to worked example"}
                                                        >
                                                            <Sparkles size={10} />
                                                            <span>{lang === 'sv' ? 'Exempel' : 'Example'}</span>
                                                        </button>

                                                        {/* Delete */}
                                                        <button 
                                                            type="button" 
                                                            onClick={(e) => { e.stopPropagation(); setPacket(packet.filter(p => p.id !== item.id)); }} 
                                                            className="bg-rose-600 text-white p-1.5 rounded-lg hover:bg-rose-700 cursor-pointer ml-0.5" 
                                                            title={t.delete_task}
                                                        >
                                                            <Trash2 size={11} />
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                <div className={`flex items-start flex-1 ${item.isWorkedExample ? 'w-full' : 'gap-3.5'}`}>
                                                    {!item.isWorkedExample && (
                                                        <div className="shrink-0 w-6 h-6 rounded-full border border-stone-900 flex items-center justify-center text-stone-900 font-bold font-mono text-xs mt-1">
                                                            {idx + 1}
                                                        </div>
                                                    )}
                                                    
                                                    <div className={`flex-1 min-w-0 flex flex-col ${item.isWorkedExample ? 'h-auto' : 'h-full'}`}>
                                                        {item.isWorkedExample ? (
                                                            <div className="w-full">
                                                                <WorkedExampleCard item={item} lang={lang} isPrintMode={false} />
                                                            </div>
                                                        ) : (
                                                            <>
                                                                {isInlineMode && (
                                                                    <div className="text-sm font-semibold text-stone-800 mb-1.5 leading-relaxed">
                                                                        <MathDisplay content={compileAnchoredStory(item, lang)} />
                                                                    </div>
                                                                )}
                                                                
                                                                {displayLatex && item.resolvedData?.renderData.latex && (
                                                                    <div className="py-2 text-center font-serif text-stone-900">
                                                                        <MathDisplay 
                                                                            key={`${item.id}-${effectiveLatexSize}`}
                                                                            content={`$$${item.resolvedData.renderData.latex}$$`} 
                                                                            style={{ fontSize: currentFontSize }}
                                                                        />
                                                                    </div>
                                                                )}
                                                                
                                                                {renderOptions(item.resolvedData?.renderData?.options, true)}
                                                                
                                                                {displayVisual && (
                                                                    <div className="flex justify-center scale-90 origin-top my-1">
                                                                        <VisualRenderer data={item.resolvedData?.renderData} isWordProblem={item.selectedStoryIndex !== null && item.selectedStoryIndex !== undefined} />
                                                                    </div>
                                                                )}

                                                                <div className="mt-auto pt-2">
                                                                    {setupMode === 'worksheet' && effectiveWorkArea > 0 && (
                                                                        <div 
                                                                            className={`w-full mt-2 overflow-hidden ${effectiveWorkspaceStyle === 'grid' ? 'border border-stone-300 rounded-lg worksheet-grid-bg' : ''}`}
                                                                            style={{ 
                                                                                height: `${effectiveWorkArea * 30}px`,
                                                                                ...(effectiveWorkspaceStyle !== 'grid' ? { backgroundColor: 'transparent' } : {})
                                                                            }} 
                                                                        />
                                                                    )}
                                                                </div>
                                                            </>
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
                )}
            </div>
        </div>

        {/* PANE 4: Selected Questions Queue */}
        <div className={`bg-[var(--bg-card)] border-l border-[var(--border-main)] flex flex-col shrink-0 transition-all duration-200 min-h-0 h-full ${isPane4Collapsed ? 'w-14' : 'w-72'}`}>
          <div className={`px-3 py-2.5 border-b border-[var(--border-main)] flex items-center ${isPane4Collapsed ? 'justify-center' : 'justify-between'} bg-[var(--bg-surface)]/60`}>
              {!isPane4Collapsed && (
                <div className="flex items-center gap-2 pl-1">
                    <Layers size={14} className="text-[var(--text-muted)]" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">{t.selected_questions}</h2>
                    <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-md text-[11px] font-bold font-mono">{packet.length}</span>
                </div>
              )}
              <button 
                  type="button"
                  onClick={() => setIsPane4Collapsed(!isPane4Collapsed)} 
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
              >
                {isPane4Collapsed ? <PanelRightOpen size={17} /> : <PanelRightClose size={17} />}
              </button>
          </div>

          {!isPane4Collapsed && (
            <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-150 min-h-0">
                <div className="px-3 py-2 border-b border-[var(--border-main)] flex justify-end shrink-0">
                    <button 
                        type="button"
                        onClick={() => { if(window.confirm(t.clear_all + "?")) setPacket([]); }} 
                        className="text-[var(--text-muted)] hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
                    >
                        <Eraser size={13}/> <span>{t.clear_all}</span>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2.5 space-y-2 custom-scrollbar bg-[var(--bg-canvas)]/60 min-h-0">
                    {Array.isArray(packet) && packet.map((item, idx) => (
                        <div 
                            key={item.id}
                            draggable 
                            onDragStart={(e) => handleDragStartUnified(e, idx)}
                            onDragOver={(e) => handleDragOverUnified(e, idx)}
                            onDragEnd={handleDragEndUnified}
                            className={`p-2.5 border rounded-xl flex justify-between items-start gap-2 group transition-all select-none ${
                                draggedItemIndex === idx 
                                    ? 'opacity-30 bg-sky-50 dark:bg-sky-950/30 border-sky-500 border-dashed scale-[0.98]' 
                                    : 'bg-[var(--bg-card)] border-[var(--border-main)] hover:border-emerald-600 cursor-grab active:cursor-grabbing'
                            }`}
                        >
                            <div className="flex items-start gap-2 min-w-0 flex-1">
                                <GripVertical size={13} className="text-[var(--text-muted)] shrink-0 mt-0.5" />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <span className="text-xs font-bold font-mono text-[var(--text-main)]">#{idx + 1}</span>
                                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.instructionMode === 'header' ? 'bg-sky-500' : item.instructionMode === 'inline' ? 'bg-amber-500' : 'bg-[var(--border-strong)]'}`} />
                                        <span className="text-[11px] font-bold text-[var(--text-muted)] truncate">
                                            {item.name}
                                        </span>
                                    </div>
                                    
                                    <div className="text-xs font-medium text-[var(--text-main)] leading-snug pr-1">
                                        <MathDisplay 
                                            content={compileAnchoredStory(item, lang, true)} 
                                            className="!whitespace-normal line-clamp-2" 
                                        />
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setPacket(packet.filter(p => p.id !== item.id)); }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-muted)] hover:text-rose-600 dark:hover:text-rose-400 transition-all rounded-lg shrink-0 cursor-pointer"
                                title={t.delete_task}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
                {setupMode === 'worksheet' && (
                    <div className="p-3.5 border-t border-[var(--border-main)] bg-[var(--bg-card)] space-y-3 shrink-0">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[var(--text-main)]">
                                {t.answer_key_toggle}
                            </span>
                            <button 
                                type="button"
                                onClick={() => setIncludeAnswerKey(!includeAnswerKey)} 
                                className={`w-9 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer ${includeAnswerKey ? 'bg-emerald-600' : 'bg-[var(--border-strong)]'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-2xs ${includeAnswerKey ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                        </div>
                        {includeAnswerKey && (
                            <div className="animate-in fade-in duration-150 space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                                    {t.answer_style_label}
                                </label>
                                <div className="grid grid-cols-2 gap-1 p-1 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-main)]">
                                    <button 
                                        type="button"
                                        onClick={() => setAnswerKeyStyle('compact')} 
                                        className={`py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${answerKeyStyle === 'compact' ? 'bg-[var(--bg-card)] text-emerald-600 dark:text-emerald-400 shadow-2xs' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                                    >
                                        {t.style_compact}
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setAnswerKeyStyle('detailed')} 
                                        className={`py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${answerKeyStyle === 'detailed' ? 'bg-[var(--bg-card)] text-emerald-600 dark:text-emerald-400 shadow-2xs' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                                    >
                                        {t.style_detailed}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
          )}
        </div>
      </div>
      
      {/* MODALS */}
      <LiveLaunchModal
          isOpen={showLiveModal}
          onClose={() => setShowLiveModal(false)}
          onConfirm={(settings) => {
              setLiveSettings(settings);
              confirmLaunchLive(settings);
          }}
          packetCount={packet.length}
          hasDrawings={packet.some(p => p?.canvas_state?.length > 0)}
          lang={lang}
          initialSettings={liveSettings}
      />

      <StudioTutorialModal
          isOpen={showTutorial}
          onClose={handleCloseTutorial}
          lang={lang}
      />

      <ActivityHubModal
          isOpen={showActivityHub}
          onClose={() => setShowActivityHub(false)}
          sourcePacket={packet}
          profile={profile}
          lang={lang}
          onLaunchActivity={handleLaunchActivity}
      />

      {activeSetupModal && (() => {
          const def = getActivityDefinition(activeSetupModal.key);
          if (!def?.SetupModal) return null;
          const WizardModal = def.SetupModal;
          return (
              <WizardModal
                  isOpen={true}
                  onClose={() => setActiveSetupModal(null)}
                  sourcePacket={activeSetupModal.sourcePacket || []}
                  savedBoard={activeSetupModal.savedBoard || null}
                  profile={profile}
                  lang={lang}
                  onLaunch={(config) => {
                      setActiveSetupModal(null);
                      handleLaunchActivity(activeSetupModal.key, {
                          ...config,
                          savedBoard: activeSetupModal.savedBoard,
                          title: activeSetupModal.savedBoard?.title || config.title,
                          sheetId: activeSetupModal.savedBoard?.id
                      });
                  }}
              />
          );
      })()}

      <SaveChoiceModal
          isOpen={showSaveChoiceModal}
          onClose={() => setShowSaveChoiceModal(false)}
          onOverwrite={async () => {
              setShowSaveChoiceModal(false);
              await executeSave({ forceNewCopy: false, silent: false });
          }}
          onSaveAsCopy={async () => {
              setShowSaveChoiceModal(false);
              await executeSave({ forceNewCopy: true, silent: false });
          }}
          lang={lang}
          itemTypeLabel={{
              sv: setupMode === 'donow' ? 'Do Now-rutnät' : 'arbetsblad',
              en: setupMode === 'donow' ? 'Do Now grid' : 'worksheet'
          }}
      />
    </div>
  );
}