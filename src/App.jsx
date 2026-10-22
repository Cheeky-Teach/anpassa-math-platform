import React, { useState, useEffect, useRef, createContext, Suspense } from 'react';
import { supabase } from './lib/supabaseClient';
import { BarChart3, AlertCircle, ChevronLeft, Lock, Mail } from 'lucide-react';

// Views
import LandingView from './components/views/LandingView';
import Dashboard from './components/views/Dashboard';
import PracticeView from './components/views/PracticeView';
import AuthView from './components/views/AuthView';
import QuestionStudio from './components/views/QuestionStudio'; 
import PrintView from './components/views/PrintView';
import StudentLiveView from './components/views/StudentLiveView';
import TeacherLiveView from './components/views/TeacherLiveView'; 
import DoNowGrid from './components/views/DoNowGrid'; 
import LandscapeReport from './components/reports/LandscapeReport';
import ProfileView from './components/views/ProfileView';
import TimesTable from './components/views/TimesTable';
import TestLabView from './components/views/TestLabView';
import PresentationView from './components/views/PresentationView';
import ManipulativeSandboxView from './components/views/ManipulativeSandboxView';

// Modals
import AboutModal from './components/modals/AboutModal';
import LgrModal from './components/modals/LgrModal';
import StatsModal from './components/modals/StatsModal';
import StreakModal from './components/modals/StreakModal'; 
import ContentModal from './components/modals/ContentModal'; 
import DetourModal from './components/modals/DetourModal'; 

// Data & Constants
import { UI_TEXT, LEVEL_DESCRIPTIONS, CATEGORIES } from './constants/localization';

import { useSessionSync } from './hooks/useSessionSync';

// Dynamically load the Analytics component. If blocked, return an empty ghost component.
const IsolatedTracker = React.lazy(() => 
    import('@vercel/analytics/react')
        .then((mod) => ({ default: mod.Analytics }))
        .catch(() => ({ default: () => null }))
);

// Dynamically load the custom event tracker. If blocked, fail silently.
const safeTrack = (eventName, data) => {
    setTimeout(() => {
        import('@vercel/analytics')
            .then((mod) => {
                if (mod && mod.track) mod.track(eventName, data);
            })
            .catch(() => {});
    }, 100);
};
import PreferencesToggle from './components/ui/PreferencesToggle';
import SessionManager from './components/SessionManager';

//user counter/gatekeeper and student gateway
import StudentGateway from './components/views/StudentGateway';
import GhostRadioGatekeeper from './components/GhostRadioGatekeeper';

// Data, Constants & Rules
import { CONTENT_MAP } from './constants/content_map';
import { checkDetourTrigger, checkDetourCompletion } from './core/rules/ProgressionEngine';


export const PreferencesContext = createContext();

// --- RESPONSIVE FLEX WRAPPER ---
// Relies on CSS REM scaling in theme.css for sizing, while using flexbox 
// min-h-0 to ensure child elements can shrink safely without causing vertical overflow.
const ResponsiveWrapper = ({ children, forceConstrain = false }) => {
    return (
        <div className={`w-full flex flex-col flex-1 ${forceConstrain ? 'overflow-hidden min-h-0 h-full' : ''}`}>
            {children}
        </div>
    );
};

function App() {
    // --- 1. AUTH & PROFILE STATE ---
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [view, setView] = useState('landing'); 
    const currentUserRef = useRef(null);

    const [showExpired, setShowExpired] = useState(false);

    //  GLOBAL PREFERENCES STATE (Defaults to Dark & Swedish)
    const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'sv');
    const [theme, setTheme] = useState(() => localStorage.getItem('app_theme') || 'dark');
    const [sandboxLab, setSandboxLab] = useState('fractions');

    // Teacher buckets / groups
    const [studentBuckets, setStudentBuckets] = useState([]);
    const [loadingBuckets, setLoadingBuckets] = useState(false);

    const [isDetourModalOpen, setIsDetourModalOpen] = useState(false);
    const [pendingDetour, setPendingDetour] = useState(null);

    const [activeBucket, setActiveBucket] = useState(null);



    // React to theme changes
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('app_theme', theme);
    }, [theme]);

    // React to lang changes
    useEffect(() => {
        localStorage.setItem('app_lang', lang);
    }, [lang]);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    const toggleLang = () => setLang(prev => prev === 'sv' ? 'en' : 'sv');

    // --- 2. STUDENT & LIVE SESSION STATE ---
    const [studentMode, setStudentMode] = useState(null); 
    const [activeClass, setActiveClass] = useState(null); 
    const [activeRoom, setActiveRoom] = useState(null);
    const [studentAlias, setStudentAlias] = useState(localStorage.getItem('anpassa_alias') || '');
    const [reportData, setReportData] = useState(null);
    const [prefilledCode, setPrefilledCode] = useState(''); 

    // --- 3. GAMEPLAY STATE ---
    const [topic, setTopic] = useState('');
    const [level, setLevel] = useState(0);
    const [question, setQuestion] = useState(null);
    const [input, setInput] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);
    const [streak, setStreak] = useState(0);
    const [totalCorrect, setTotalCorrect] = useState(0);
    const [revealedClues, setRevealedClues] = useState([]);
    const [isSolutionRevealed, setIsSolutionRevealed] = useState(false);
    const [usedHelp, setUsedHelp] = useState(false);
    const [useWordProblems, setUseWordProblems] = useState(false);

    const [activeUnitStepId, setActiveUnitStepId] = useState(null);

    // ---  DETOUR / PREREQUISITE STATE ---
    const [isDetourActive, setIsDetourActive] = useState(false);
    const [originalTask, setOriginalTask] = useState(null);

    // --- 4. SESSION STATS & HISTORY ---
    const [sessionStats, setSessionStats] = useState({ attempted: 0, correctNoHelp: 0, correctHelp: 0, incorrect: 0, skipped: 0, maxStreak: 0 });
    const [granularStats, setGranularStats] = useState({});
    const [history, setHistory] = useState([]);
    const [levelUpAvailable, setLevelUpAvailable] = useState(false);
    
    // --- 5. MODALS & UI STATE ---
    const [aboutOpen, setAboutOpen] = useState(false);
    const [statsOpen, setStatsOpen] = useState(false);
    const [lgrOpen, setLgrOpen] = useState(false);
    const [contentOpen, setContentOpen] = useState(false); 
    const [showStreakModal, setShowStreakModal] = useState(false);

    // --- 6. TOAST SYSTEM STATE ---
    const [toast, setToast] = useState(null);

    // --- 7. STUDIO & PRINT STATE ---
    const [savedPacket, setSavedPacket] = useState([]); 
    const [sheetTitle, setSheetTitle] = useState("");
    const [studioMode, setStudioMode] = useState(null);
    const [includeAnswerKey, setIncludeAnswerKey] = useState(true);
    const [answerKeyStyle, setAnswerKeyStyle] = useState('compact');
    const [timerSettings, setTimerSettings] = useState({ duration: 0, remaining: 0, isActive: false });

    // --- 8. BROWSER & FOCUS CONTEXT ---
    const [isFocused, setIsFocused] = useState(true);

    // --- 9. PRACTICE LAB PRE CONFIGS ---
    const [pendingLabConfig, setPendingLabConfig] = useState(null);
    const [labConfig, setLabConfig] = useState(null); // The active "Source of Truth"

    const ui = UI_TEXT[lang];

    // --- 10. SESSION MANAGER --- 
    const { setAppMode, syncNow, savePracticeEntry, saveFeatureState } = useSessionSync();
    const [questionStartTime, setQuestionStartTime] = useState(Date.now());

    // Flush on tab close
    useEffect(() => {
        const handleBeforeUnload = () => syncNow();
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [syncNow]);

    // Track mode switches automatically
    useEffect(() => {
        setAppMode(view);
    }, [view, setAppMode]);

    // Reset interaction timer when a new question loads
    useEffect(() => {
        if (question) setQuestionStartTime(Date.now());
    }, [question]);

    // --- HELPERS ---
    const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

    const updateStats = (type) => {
        setSessionStats(prev => ({
            ...prev,
            attempted: type !== 'skipped' ? prev.attempted + 1 : prev.attempted,
            [type]: prev[type] + 1
        }));
        if (topic && level) {
            setGranularStats(prev => {
                const topicData = prev[topic] || {};
                const levelData = topicData[level] || { skipped: 0, incorrect: 0, correctHelp: 0, correctNoHelp: 0 };
                return { ...prev, [topic]: { ...topicData, [level]: { ...levelData, [type]: (levelData[type] || 0) + 1 } } };
            });
        }
    };

    // --- KICK LOGIC HANDLER ---
    const handleKick = async (alias) => {
        if (!activeRoom?.id) return;
        try {
            // 1. Delete their existing responses from the database
            await supabase.from('responses').delete().eq('room_id', activeRoom.id).eq('student_alias', alias);
            
            // 2. Add them to the room's blacklist array
            // Note: Ensure you have a 'kicked_students' column (type: text[]) in your 'rooms' table
            const currentKicked = activeRoom.kicked_students || [];
            const { error } = await supabase
                .from('rooms')
                .update({ kicked_students: [...currentKicked, alias] })
                .eq('id', activeRoom.id);
            
            if (error) throw error;

            // Update local state so the teacher's UI knows who is kicked
            setActiveRoom(prev => ({ ...prev, kicked_students: [...currentKicked, alias] }));
        } catch (err) {
            console.error("Error kicking student:", err);
        }
    };

    const handleEndSession = async () => {
        if (!activeRoom?.id) return;
        
        try {
            const { error } = await supabase
                .from('rooms')
                .update({ status: 'closed' })
                .eq('id', activeRoom.id);

            if (error) throw error;
            setActiveRoom(prev => ({ ...prev, status: 'closed' }));
            setView('dashboard');
            
        } catch (err) {
            console.error("Error ending session:", err);
            alert(lang === 'sv' ? "Kunde inte avsluta sessionen." : "Could not end session.");
        }
    };
    
    // --- WORD PROBLEM TOGGLE ---
    useEffect(() => {
        if (view === 'practice' && topic && level && question) {
            // Re-fetch with force=true to reload the active item instantly
            fetchQuestion(topic, level, lang, true);
        }
    }, [useWordProblems]);

    // --- REFINED STUDENT REAL-TIME KICK LISTENER ---
    useEffect(() => {
        // We only need this if we are currently a student in a live session
        if (view === 'live_session' && activeRoom?.id && studentAlias) {
            const channel = supabase.channel(`room_kick_global`)
                .on('postgres_changes', { 
                    event: 'DELETE', 
                    schema: 'public', 
                    table: 'responses'
                }, (payload) => {
                    // Because of how some DBs handle DELETE, we check the 'old' record
                    // handleKick in App.jsx targets room_id and student_alias
                    if (
                        payload.old && 
                        payload.old.student_alias === studentAlias && 
                        payload.old.room_id === activeRoom.id
                    ) {
                        alert(lang === 'sv' ? "Sessionen avslutad för din del." : "Session ended for you.");
                        handleStudentExitLive();
                    }
                })
                .subscribe();

            return () => { supabase.removeChannel(channel); };
        }
    }, [view, activeRoom?.id, studentAlias, lang]);

    // --- SMART NAVIGATION ENGINE (URL Deep-linking and NP-Lab config) ---
    useEffect(() => {
        const handleUrlNavigation = () => {
            const path = window.location.pathname.replace('/', '');
            const params = new URLSearchParams(window.location.search);
            
            // 1. Capture Practice Lab Configs (Buffered)
            if (params.has('config')) {
                setPendingLabConfig(params.get('config'));
            }

            // 2. Standard deep-linking logic
            // FIX: Map the short URL path 'lab' to the internal view 'practice_lab'
            if (path === 'lab') {
                setView('practice_lab');
            } else if (path) {
                setView(path);
            }
            
            if (params.has('topic')) setTopic(params.get('topic'));
            if (params.has('level')) setLevel(parseInt(params.get('level')));
        };

        window.addEventListener('popstate', handleUrlNavigation);
        handleUrlNavigation(); 
        
        return () => window.removeEventListener('popstate', handleUrlNavigation);
    }, []);

    useEffect(() => {
        const baseUrl = `/${view === 'landing' ? '' : view}`;
        const queryParams = (view === 'practice' && topic) 
            ? `?topic=${topic}&level=${level}` 
            : "";
        
        if (window.location.pathname + window.location.search !== baseUrl + queryParams) {
            window.history.pushState({ view, topic, level }, "", baseUrl + queryParams);
        }
    }, [view, topic, level]);

    // --- WINDOW FOCUS ENGINE ---
    useEffect(() => {
        const handleFocus = () => setIsFocused(true);
        const handleBlur = () => setIsFocused(false);
        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);
        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
        };
    }, []);

    // --- REFRESH HANDLERS ---
    const handleRefreshAllDoNow = async () => {
        if (!savedPacket.length) return;
        try {
            const requests = savedPacket.map(item => ({
                topic: item.topicId,
                variation: item.variationKey,
                lang: lang,
                level: item.resolvedData?.level || 1
            }));

            const res = await fetch('/api/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requests })
            });

            if (!res.ok) throw new Error("Batch refresh failed");
            const newResults = await res.json();
            
            const updatedPacket = savedPacket.map((item, idx) => ({
                ...item,
                id: `dn-batch-${Date.now()}-${idx}`, 
                resolvedData: newResults[idx].resolvedData 
            }));
            
            setSavedPacket(updatedPacket);
        } catch (e) {
            console.error("Batch refresh error:", e);
            alert(lang === 'sv' ? "Kunde inte ladda nya uppgifter." : "Failed to load new questions.");
        }
    };

    const handleRefreshOneDoNow = async (idx) => {
        const item = savedPacket[idx];
        if (!item) return;
        try {
            const res = await fetch(`/api/question?topic=${item.topicId}&variation=${item.variationKey}&lang=${lang}`);
            const newData = await res.json();
            
            const updatedPacket = [...savedPacket];
            updatedPacket[idx] = { 
                ...item, 
                id: `dn-single-${Date.now()}-${idx}`,
                resolvedData: newData 
            };
            setSavedPacket(updatedPacket);
        } catch (e) {
            console.error("Single refresh failed:", e);
        }
    };

    // --- AUTH EFFECTS ---
    useEffect(() => {
        // Initial Session Check
        supabase.auth.getSession().then(({ data: { session: s } }) => {
            setSession(s);
            if (s) {
                currentUserRef.current = s.user.id; // Set initial ref
                fetchProfile(s.user.id);
            }
            else setLoadingProfile(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
            setSession(s);

            if (s) {
                //  FIXED: Use the Ref to check if it's the same user, bypassing the stale closure!
                const isSameUser = currentUserRef.current === s.user.id;
                currentUserRef.current = s.user.id; 
                
                if (event === 'PASSWORD_RECOVERY') {
                    setView('profile');
                    fetchProfile(s.user.id); // Not silent for recovery
                } else {
                    fetchProfile(s.user.id, isSameUser); 
                }
            } else {
                currentUserRef.current = null;
                setProfile(null);
                setView('landing');
                setLoadingProfile(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // --- PROFILE GATEKEEPER ---
    const fetchProfile = async (uid, isSilent = false) => {
        if (!isSilent) setLoadingProfile(true);
        
        try {
            const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).single();
            if (error) throw error;
            
            setProfile(data);
            
            const isSetupIncomplete = !data || !data.subscription_status || !data.class_code;
            const isExpired = data?.subscription_status === 'expired' || 
                             (data?.subscription_end_date && new Date(data.subscription_end_date) < new Date());

            //  TRAP EXPIRED USERS
            if (isExpired && data?.role === 'teacher') {
                setShowExpired(true);
                return;
            }

            setView(currentView => {
                if (currentView === 'profile') return 'profile';
                if (isSetupIncomplete) return 'auth';
                if (pendingLabConfig) return 'practice_lab';
                
                // If they logged in on a guest page, respect their deep link!
                if (currentView === 'landing' || currentView === 'auth') {
                    if (topic && level) return 'practice';
                    return 'dashboard';
                }
                
                return currentView;
            });
        } catch (err) {
            console.error("Profile fetch error:", err);
        } finally {
            if (!isSilent) setLoadingProfile(false);
        }
    };

    // --- FETCH STUDENT BUCKETS ---
    useEffect(() => {
        const fetchStudentBuckets = async () => {
            if (view === 'dashboard' && profile?.role === 'student' && activeClass?.id) {
                setLoadingBuckets(true);
                try {
                    const now = new Date().toISOString();
                    const { data, error } = await supabase
                        .from('teacher_buckets')
                        .select('*')
                        .eq('teacher_id', activeClass.id)
                        // Only fetch buckets that haven't expired
                        .gt('expires_at', now) 
                        // Note: is_visible = true is automatically enforced by the RLS policy we wrote
                        .order('created_at', { ascending: false });
                    
                    if (error) throw error;
                    setStudentBuckets(data || []);
                } catch (err) {
                    console.error("Error fetching buckets:", err);
                } finally {
                    setLoadingBuckets(false);
                }
            }
        };

        fetchStudentBuckets();
    }, [view, profile?.role, activeClass?.id]);

    const handleStudentExitLive = () => {
        setActiveRoom(null);
        setStudentAlias('');
        localStorage.removeItem('anpassa_alias');
        setView('landing'); 
    };

    const handleStartUnitCheckpoint = (configCode, stepId) => {
        setActiveUnitStepId(stepId);
        setPendingLabConfig(configCode);
        setView('practice_lab');
    };

    const goHome = () => { 
        setStreak(0); 
        setView('dashboard'); 
        setQuestion(null); 
        setTimerSettings(prev => ({ ...prev, isActive: false })); 
        setActiveBucket(null); 
        setIsDetourActive(false); 
        setOriginalTask(null);
        setSandboxLab('fractions');
        setActiveUnitStepId(null); // 🟢 Reset
        setPendingLabConfig(null);  // 🟢 Reset
    };

    const quitPractice = () => { 
        setStreak(0); 
        setView('dashboard'); 
        setQuestion(null); 
        setTimerSettings(prev => ({ ...prev, isActive: false })); 
        setIsDetourActive(false); 
        setOriginalTask(null);
        setActiveUnitStepId(null); // 🟢 Reset
    };

    // 🟢 Mark a step complete in the student's active unit progress store
    const markUnitStepComplete = (stepIdentifier) => {
        if (!activeBucket || activeBucket === 'FREE_PLAY') return;
        const studentId = profile?.id || 'guest_student';
        const bucketId = activeBucket?.id || 'default_bucket';
        const storageKeyProgress = `progress_${studentId}_${bucketId}`;

        try {
            const raw = localStorage.getItem(storageKeyProgress);
            const current = raw ? JSON.parse(raw) : [];
            if (!current.includes(stepIdentifier)) {
                const updated = [...current, stepIdentifier];
                localStorage.setItem(storageKeyProgress, JSON.stringify(updated));
            }
        } catch (err) {
            console.error("Failed to sync unit progression:", err);
        }
    };

    // --- SUBMIT LOGIC W/ PROGRESSION ENGINE ---
    const handleSubmit = async (e, directInput) => {
        if (e) e.preventDefault();
        if (feedback === 'correct') return;
        let finalInput = directInput !== undefined ? directInput : input;
        if (!question || !finalInput) return;
        const helpUsed = revealedClues.length > 0 || isSolutionRevealed;

        try {
            const res = await fetch('/api/answer', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ 
                    answer: finalInput, token: question.token, streak, level, topic, 
                    usedHelp: helpUsed, solutionUsed: isSolutionRevealed, attempts: (question.attempts || 0)
                }) 
            });
            const result = await res.json();

            // Save to local accumulator
            const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
            savePracticeEntry(topic, level, result.correct, revealedClues.length, timeSpent);
            
            if (result.correct) {
                safeTrack('Answer_Correct', { topic: topic, level: level.toString(), mode: view });
                if (!isSolutionRevealed) {
                    setHistory(prev => [{ topic, level, correct: true, text: question.renderData.latex || question.renderData.description, clueUsed: helpUsed, time: Date.now() }, ...prev]);
                    setStreak(result.newStreak); setTotalCorrect(prev => prev + 1);
                    updateStats(helpUsed ? 'correctHelp' : 'correctNoHelp');

                    // --- DETOUR COMPLETION CHECK ---
                    if (isDetourActive && checkDetourCompletion(result.newStreak)) {
                        setFeedback('correct');
                        setTimeout(() => {
                            alert(lang === 'sv' ? "Snyggt jobbat! Nu är du redo för den ursprungliga uppgiften igen." : "Great job! You're ready for the original task again.");
                            setIsDetourActive(false);
                            setTopic(originalTask.topic);
                            setLevel(originalTask.level);
                            setStreak(0);
                            fetchQuestion(originalTask.topic, originalTask.level, lang);
                            setOriginalTask(null);
                        }, 1500);
                        return;
                    }

                    // Show the Choice Modal / Unit Progression
                    if (result.levelUp) {
                        setFeedback('correct');
                        
                        // 🟢 Record practice level step completion for active units
                        if (activeBucket && activeBucket !== 'FREE_PLAY') {
                            const stepId = `step_prac_${topic}_${level}`;
                            markUnitStepComplete(stepId);
                        }

                        setTimeout(() => setLevelUpAvailable(true), 1000);
                        return;
                    }
                    if ([15, 25, 50].includes(result.newStreak)) setShowStreakModal(true);
                    else setTimeout(() => fetchQuestion(topic, level, lang), 1500);
                }
                setFeedback('correct');
            } else {
                // Track history immediately for engine evaluation
                const newHistoryEntry = { topic, level, correct: false, text: question.renderData.latex || question.renderData.description, clueUsed: helpUsed, time: Date.now() };
                const updatedHistory = [newHistoryEntry, ...history];
                setHistory(updatedHistory);

                setQuestion({...question, attempts: (question.attempts || 0) + 1});
                updateStats('incorrect');
                if ((question.attempts || 0) + 1 >= 2) { 
                    setRevealedClues(question.clues || []); setIsSolutionRevealed(true); setStreak(0);
                }
                setFeedback('incorrect'); setStreak(0);

                // --- DETOUR TRIGGER CHECK ---
                if (!isDetourActive) {
                    const detourCheck = checkDetourTrigger(updatedHistory, topic, level, CONTENT_MAP);
                    if (detourCheck.shouldDetour) {
                        setTimeout(() => {
                            // 1. Save the recommendation to state, but DON'T execute it yet
                            setPendingDetour({
                                topic: detourCheck.detourTopic,
                                level: detourCheck.detourLevel
                            });
                            // 2. Just open the choice modal
                            setIsDetourModalOpen(true);
                        }, 1500);
                    }
                }
            }
        } catch (e) { console.error(e); }
    };

    const handleHint = () => {
        if (question?.clues && revealedClues.length < question.clues.length) {
            setRevealedClues(prev => [...prev, question.clues[prev.length]]);
            setUsedHelp(true);
        }
    };

    const handleSolution = () => {
        if (question?.clues) {
            setRevealedClues(question.clues);
            setIsSolutionRevealed(true);
            setUsedHelp(true);
        }
    };

    const handleSkip = () => {
        setHistory(prev => [{ topic, level, correct: false, skipped: true, text: question.renderData.latex || question.renderData.description, time: Date.now() }, ...prev]);
        updateStats('skipped');
        fetchQuestion(topic, level, lang, true);
    };

    const handleChangeLevel = (delta) => {
        // Dynamically check the maximum level available for the current topic
        const maxLevel = Object.keys(LEVEL_DESCRIPTIONS[topic] || {}).length || 9;
        const newLvl = Math.max(1, Math.min(level + delta, maxLevel));
        
        if (newLvl !== level) {
            setLevel(newLvl);
            fetchQuestion(topic, newLvl, lang);
        }
    };

    const fetchQuestion = async (t, l, lg, force = false) => {
        if (!force && (showStreakModal || levelUpAvailable)) return;
        setLoading(true); setFeedback(null); setInput(''); setRevealedClues([]); setUsedHelp(false); setIsSolutionRevealed(false); setLevelUpAvailable(false);
        try {
            const res = await fetch(`/api/question?topic=${t}&level=${l}&lang=${lg}&wordProblem=${useWordProblems}${force ? `&force=true&t=${Date.now()}` : ''}`);
            
            // ADD THIS GUARD TO DETECT BACKEND CRASHES IMMEDIATELY
            if (!res.ok) {
                console.error(`Backend returned status ${res.status}`);
                const text = await res.text();
                console.error("Server Error Payload:", text);
                setQuestion(null);
                return;
            }

            const data = await res.json();
            setQuestion(data);
        } catch (e) { 
            console.error("CRITICAL CLIENT FETCH ERROR:", e); // <-- Uncover the swallowed error
            setQuestion(null); 
        } finally { setLoading(false); }
    };

    const startPractice = () => {
        if (topic && level) {
            setStreak(0); setView('practice');
            if (timerSettings.duration > 0) setTimerSettings(prev => ({ ...prev, isActive: true, remaining: timerSettings.duration }));
            fetchQuestion(topic, level, lang); 
        }
    };

    const handleRelaunchSession = async (roomData) => {
        setLoadingProfile(true);
        try {
            if (roomData.status === 'active') {
                setSavedPacket(roomData.active_question_data.packet);
                setSheetTitle(roomData.title);
                setActiveRoom(roomData);
                setView('teacher_live');
            } else {
                const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                const { data, error } = await supabase.from('rooms').insert([{
                    teacher_id: profile.id,
                    class_code: newCode,
                    status: 'active',
                    title: roomData.title,
                    active_question_data: roomData.active_question_data
                }]).select().single();
                if (error) throw error;
                setSavedPacket(roomData.active_question_data.packet);
                setSheetTitle(roomData.title);
                setActiveRoom(data);
                setView('teacher_live');
            }
        } catch (err) {
            alert("Kunde inte hantera sessionen: " + err.message);
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleViewArchiveReport = async (archivedRoom) => {
        setLoadingProfile(true);
        try {
            const { data: responses, error } = await supabase.from('responses').select('*').eq('room_id', archivedRoom.id);
            if (error) throw error;
            setActiveRoom(archivedRoom);
            setSavedPacket(archivedRoom.active_question_data.packet);
            setReportData(responses);
            setView('live_report');
        } catch (e) { 
            alert("Kunde inte hämta rapporten.");
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleEditArchivedPacket = (archivedRoom) => {
        if (!archivedRoom?.active_question_data?.packet) return;
        setSavedPacket(archivedRoom.active_question_data.packet);
        setSheetTitle(archivedRoom.title || "Kopia av " + archivedRoom.class_code);
        const mode = archivedRoom.active_question_data.mode || 'worksheet';
        setStudioMode(mode); 
        setView('question_studio');
    };

    // --- TIMER ENGINE ---
    useEffect(() => {
        let interval;
        if (view === 'practice' && isFocused && timerSettings.isActive && timerSettings.remaining > 0) {
            interval = setInterval(() => {
                setTimerSettings(prev => ({ ...prev, remaining: prev.remaining - 1 }));
            }, 1000);
        } else if (timerSettings.remaining === 0 && timerSettings.isActive) {
            setTimerSettings(prev => ({ ...prev, isActive: false }));
            alert(lang === 'sv' ? "Tiden är slut!" : "Time is up!");
        }
        return () => clearInterval(interval);
    }, [timerSettings.isActive, timerSettings.remaining, view, isFocused]);

    // ---  DEEP LINK AUTO-FETCHER ---
    // If the user lands directly on a practice URL (or is routed here after auth), automatically load the question.
    useEffect(() => {
        if (view === 'practice' && topic && level && !question && !loading) {
            fetchQuestion(topic, level, lang);
        }
    }, [view, topic, level, lang]);

    // --- VIEW ORCHESTRATION ---
    if (loadingProfile) return <div className="h-screen flex items-center justify-center bg-[#f9fbf7]"><div className="animate-spin h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full" /></div>;

    // ---  EXPIRED GATEWAY UI ---
    if (showExpired) {
        return (
            <div className="min-h-screen bg-[#f9fbf7] flex flex-col items-center justify-center p-6 font-sans text-center">
                <div className="w-full max-w-md bg-white rounded-[3.5rem] shadow-2xl p-12 border border-rose-50 animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-3xl font-bold uppercase italic tracking-tighter text-slate-800 mb-4">
                        {lang === 'sv' ? "Prenumeration Utgången" : "Subscription Expired"}
                    </h2>
                    <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
                        {lang === 'sv' 
                            ? "Din tillgång till plattformen har löpt ut. Vänligen kontakta support för att förnya din licens och återfå åtkomst till dina klassrum." 
                            : "Your access to the platform has expired. Please contact support to renew your license and regain access to your classrooms."}
                    </p>
                    <a href="mailto:support@anpassa.se" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 mb-6 shadow-lg">
                        <Mail size={18} /> {lang === 'sv' ? "Kontakta Support" : "Contact Support"}
                    </a>
                    <button onClick={() => { supabase.auth.signOut(); setShowExpired(false); setView('landing'); }} className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors">
                        {lang === 'sv' ? "Logga ut och gå tillbaka" : "Sign out & go back"}
                    </button>
                </div>
            </div>
        );
    }

    if (view === 'landing' && !session) return (
        <LandingView 
            lang={lang} 
            onTeacherLogin={() => setView('auth')} 
            onStudentJoin={(m, code) => { 
                setStudentMode(m); 
                setPrefilledCode(code); 
                setView('auth'); 
            }} 
        />
    );

    if (view === 'auth') {
        return (
            <AuthView 
                lang={lang} 
                studentMode={studentMode} 
                initialCode={prefilledCode} 
                onBack={() => setView('landing')} 
                onSuccess={(data) => {
                    if (data.role === 'student') {
                        setActiveClass(data.class);
                        setProfile({ role: 'student', subscription_status: 'active' }); 
                        
                        //  ROUTING PRIORITY: Lab Config -> Deep Link -> Dashboard
                        if (pendingLabConfig) {
                            setView('practice_lab');
                        } else if (topic && level) {
                            setView('practice');
                        } else {
                            setView('dashboard');
                        }
                    } else if (data.role === 'live') {
                        setActiveRoom(data.room);
                        setStudentAlias(data.student_name);
                        localStorage.setItem('anpassa_alias', data.student_name);
                        setView('live_session');
                    } else if (data.role === 'teacher') {
                        fetchProfile(data.user.id);
                    }
                }}
            />
        );
    }

    // --- DYNAMIC HEADER CONTEXT (For Practice View) ---
    let activeCategoryLabel = '';
    let activeTopicLabel = '';
    let activeThemeColor = 'emerald'; 
    
    if (view === 'practice' && topic) {
        if (isDetourActive) {
            activeCategoryLabel = lang === 'sv' ? 'Uppvärmning' : 'Warm-up';
            activeThemeColor = 'amber';
            const tData = CONTENT_MAP.flatMap(c => c.topics).find(t => t.id === topic);
            activeTopicLabel = tData?.label[lang] || topic;
        } else {
            const catKey = Object.keys(CATEGORIES).find(key => 
                CATEGORIES[key]?.topics?.some(t => t.id === topic)
            );
            if (catKey) {
                activeCategoryLabel = CATEGORIES[catKey].label[lang];
                activeThemeColor = CATEGORIES[catKey].color || 'emerald';
                const tData = CATEGORIES[catKey].topics.find(t => t.id === topic);
                activeTopicLabel = tData?.label[lang] || topic;
            }
        }
    }

    // --- EVALUATE ACTIVE STUDENT SESSION ---
    // If they are a standard student, track using activeClass code. 
    // If they are a live-room student, track using activeRoom code.
    const activeStudentCode = (profile?.role === 'student' && activeClass?.class_code) 
        ? activeClass.class_code 
        : (view === 'live_session' && studentAlias && activeRoom?.class_code) 
            ? activeRoom.class_code 
            : null;
        

    return (
        //  WRAP IN CONTEXT PROVIDER
        <PreferencesContext.Provider value={{ theme, toggleTheme, lang, toggleLang }}>
            {/*  ADDED .layout-app TO APPLY THEME BG */}
            <div className="layout-app min-h-screen flex flex-col font-sans transition-colors duration-500">
                
                {/*  PHASE 4: GLOBAL SESSION MANAGER */}
                {activeStudentCode && (
                    <SessionManager teacherCode={activeStudentCode} lang={lang} />
                )}

                <AboutModal visible={aboutOpen} onClose={() => setAboutOpen(false)} ui={ui} />
                <LgrModal visible={lgrOpen} onClose={() => setLgrOpen(false)} ui={ui} />
                <ContentModal visible={contentOpen} onClose={() => setContentOpen(false)} /> 
                <StatsModal visible={statsOpen} stats={sessionStats} granularStats={granularStats} lang={lang} ui={ui} onClose={() => setStatsOpen(false)} title={ui.stats_title} />
                <StreakModal 
                    visible={showStreakModal} 
                    onClose={() => { 
                        setShowStreakModal(false); 
                        fetchQuestion(topic, level, lang); 
                    }} 
                    streak={streak} 
                    ui={ui} 
                />            
                {(view === 'dashboard' || view === 'practice' || view === 'times_table') && (
                <header className="sticky top-0 z-10 w-full border-b border-[var(--border-main)] header-glass transition-colors duration-500">
                    {/*  Reduced y-axis padding to py-1 to slim down the global header */}
                    <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-8 py-1 flex flex-row items-center justify-between relative">
                        {/* 1. LEFT SIDE: Logo or Back Button */}
                        <div className="flex-1 flex justify-start">
                            {view === 'practice' || view === 'times_table' ? (
                                <button onClick={goHome} className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-main)] font-bold text-xs uppercase tracking-widest transition-all group shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-[var(--bg-card)] flex items-center justify-center shadow-sm border border-[var(--border-main)] group-hover:shadow-md">
                                        <ChevronLeft size={16}/>
                                    </div>
                                    <span className="hidden sm:inline-block">{lang === 'sv' ? "Tillbaka" : "Back"}</span>
                                </button>
                            ) : (
                                <h1 className="text-2xl font-extrabold text-[#10b981] tracking-tighter cursor-pointer uppercase italic shrink-0" onClick={goHome}>
                                    ANPASSA
                                </h1> 
                            )}
                        </div>

                        {/* 2. CENTER SIDE: Active Context (Only in Practice Mode) */}
                        {view === 'practice' && (
                            <div className={`theme-${activeThemeColor} absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none text-center w-full max-w-[200px] sm:max-w-[300px]`}>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--brand-text)] opacity-80 truncate w-full">
                                    {activeCategoryLabel}
                                </span>
                                <h2 className="text-sm sm:text-base font-black uppercase tracking-tighter text-[var(--text-main)] italic leading-none mt-0.5 truncate w-full">
                                    {activeTopicLabel}
                                </h2>
                            </div>
                        )}
                        
                        {/* 3. RIGHT SIDE: Tools & Stats */}
                        <div className="flex-1 flex flex-row items-center gap-2 sm:gap-4 justify-end flex-wrap sm:flex-nowrap">
                            <PreferencesToggle />
                            
                            {session && (
                                <button onClick={() => supabase.auth.signOut()} className="text-[10px] font-bold text-[var(--text-muted)] uppercase hover:text-[var(--theme-rose-text)] transition-colors ml-1 sm:ml-2">
                                    Logga ut
                                </button>
                            )}
                        </div>
                    </div>
                </header>
            )}

            <div className="flex-1 flex flex-col relative overflow-x-hidden">
                {view === 'dashboard' ? (
                    <ResponsiveWrapper>
                        {/* Show Gateway ONLY if student hasn't selected a bucket yet */}
                        {profile?.role === 'student' && !activeBucket ? (
                            <GhostRadioGatekeeper 
                                classCode={activeClass?.class_code} 
                                lang={lang}
                                onDisconnect={handleStudentExitLive}
                            >
                                {loadingBuckets ? (
                                    <div className="min-h-screen flex items-center justify-center bg-slate-50">
                                        <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
                                    </div>
                                ) : (
                                    <StudentGateway 
                                        classCode={activeClass?.class_code}
                                        buckets={studentBuckets}
                                        onSelectFreePlay={() => {
                                            setActiveBucket('FREE_PLAY'); // Bypass gateway for full curriculum
                                        }}
                                        onSelectBucket={(bucket) => {
                                            setActiveBucket(bucket); // Lock dashboard to this bucket
                                        }}
                                        onLeave={handleStudentExitLive}
                                        lang={lang}
                                    />
                                )}
                            </GhostRadioGatekeeper>
                        ) : (
                            <Dashboard 
                                profile={profile} 
                                lang={lang} 
                                selectedTopic={topic} 
                                selectedLevel={level} 
                                userRole={profile?.role || 'student'} 
                                activeBucket={activeBucket} 
                                onBackToGateway={() => setActiveBucket(null)} 
                                onSelect={(t, l) => { setTopic(t); setLevel(l); }} 
                                onStart={startPractice}
                                onStartCheckpoint={handleStartUnitCheckpoint}
                                ui={ui} 
                                onStudioOpen={() => setView('question_studio')} 
                                onLabOpen={() => setView('practice_lab')}
                                onProfileOpen={() => setView('profile')} 
                                onTimesTableOpen={() => setView('times_table')}
                                onFractionLabOpen={() => {
                                    setSandboxLab('fractions');
                                    setView('sandbox');
                                }}
                                
                                onWhiteboardOpen={() => {
                                    setSavedPacket([]); 
                                    setSheetTitle(lang === 'sv' ? 'Presentationstavla' : 'Presentation Board');
                                    setView('presentation');
                                }}

                                onRelaunch={handleRelaunchSession} 
                                onViewReport={handleViewArchiveReport} 
                                onEdit={handleEditArchivedPacket}
                                onStatsOpen={() => setStatsOpen(true)}
                                onLgrOpen={() => setLgrOpen(true)}
                                onAboutOpen={() => setAboutOpen(true)}
                                onContentOpen={() => setContentOpen(true)}
                                timerSettings={timerSettings} 
                                toggleTimer={(m) => setTimerSettings({duration: m*60, remaining: m*60, isActive: m > 0})} 
                                resetTimer={() => setTimerSettings({duration:0, remaining:0, isActive:false})} 
                            />
                        )}
                    </ResponsiveWrapper>
                ) : view === 'profile' ? (
                    <ProfileView profile={profile} onBack={() => { fetchProfile(session.user.id); setView('dashboard'); }} lang={lang} />
                ) : view === 'presentation' ? ( 
                    <PresentationView 
                        packet={savedPacket} 
                        sheetTitle={sheetTitle} 
                        lang={lang} 
                        onClose={() => setView('dashboard')} 
                    />
                ) : view === 'sandbox' ? (
                    <ManipulativeSandboxView 
                        labType={sandboxLab}
                        lang={lang}
                        onBack={() => setView('dashboard')}
                    />
                ) : view === 'times_table' ? (
                    <TimesTable 
                        lang={lang} 
                        onBack={() => setView('dashboard')} 
                    />
                ) : view === 'practice' ? (
                        <ResponsiveWrapper>
                        <PracticeView
                            lang={lang} ui={ui} question={question} loading={loading} feedback={feedback} streak={streak} input={input} setInput={setInput} 
                            handleSubmit={handleSubmit} handleHint={handleHint} handleSolution={handleSolution} handleSkip={handleSkip}
                            handleChangeLevel={handleChangeLevel}
                            revealedClues={revealedClues} uiState={{ history, topic, level }} 
                            actions={{ retry: (f) => fetchQuestion(topic, level, lang, f), goBack: quitPractice }} 
                            isSolutionRevealed={isSolutionRevealed} timerSettings={timerSettings} formatTime={formatTime}
                            toast={toast}
                            useWordProblems={useWordProblems}
                            setUseWordProblems={setUseWordProblems}
                            levelUpAvailable={levelUpAvailable}
                            setLevelUpAvailable={setLevelUpAvailable}
                            activeBucket={activeBucket}
                            isDetourActive={isDetourActive}
                            onAdvanceUnitStep={quitPractice}
                        />
                        </ResponsiveWrapper>
                ) : view === 'question_studio' ? (
                    <ResponsiveWrapper forceConstrain={true}>
                    <QuestionStudio profile={profile} ui={ui} lang={lang} initialPacket={savedPacket} setInitialPacket={setSavedPacket} sheetTitle={sheetTitle} setSheetTitle={setSheetTitle} studioMode={studioMode} setStudioMode={setStudioMode} includeAnswerKey={includeAnswerKey} setIncludeAnswerKey={setIncludeAnswerKey} answerKeyStyle={answerKeyStyle} setAnswerKeyStyle={setAnswerKeyStyle} onClose={() => setView('dashboard')} 
                        onWorksheetGenerate={(p) => { 
                            setSavedPacket(p); 
                            setView('print');
                            
                            safeTrack('Worksheet_Generated', { size: p.length.toString() });
                            saveFeatureState('worksheet_export', { count: 1, avg_size: p.length });
                        }}
                        onDoNowGenerate={(conf, pack, liveData) => { 
                            if (liveData?.room) { 
                                setActiveRoom(liveData.room); 
                                setSavedPacket(liveData.packet); 
                                setView('teacher_live'); 
                            } else if (pack) { 
                                setSavedPacket(pack); 
                                if (conf?.title) setSheetTitle(conf.title); 
                                setView('do_now'); 
                                
                                safeTrack('DoNow_Generated', { size: pack.length.toString() });
                                saveFeatureState('donow_generation', { count: 1, size: pack.length });
                            } 
                        }} />
                    </ResponsiveWrapper>
                ) : view === 'print' ? (
                    <PrintView packet={savedPacket} title={sheetTitle} lang={lang} onBack={() => setView('question_studio')} includeAnswerKey={includeAnswerKey} answerKeyStyle={answerKeyStyle} />
                ) : view === 'do_now' ? (
                    <DoNowGrid questions={savedPacket} ui={ui} lang={lang} onBack={() => setView('question_studio')} onClose={() => setView('dashboard')} onRefreshAll={handleRefreshAllDoNow} onRefreshOne={handleRefreshOneDoNow} />
                ) : view === 'practice_lab' ? (
                    <ResponsiveWrapper>
                        <TestLabView 
                            configCode={pendingLabConfig} 
                            profile={profile}
                            lang={lang}
                            activeBucket={activeBucket} // Pass active bucket
                            activeUnitStepId={activeUnitStepId} // Pass active step id
                            onBack={() => {
                                setPendingLabConfig(null);
                                setActiveUnitStepId(null);
                                setView('dashboard');
                            }}
                        />
                    </ResponsiveWrapper>
                ) : view === 'live_session' && activeRoom ? (
                    <ResponsiveWrapper>
                        <GhostRadioGatekeeper 
                            classCode={activeRoom.class_code} 
                            lang={lang}
                            onDisconnect={handleStudentExitLive}
                        >
                            <StudentLiveView 
                                session={activeRoom} 
                                packet={activeRoom.active_question_data?.packet || []} 
                                lang={lang} 
                                studentAlias={studentAlias} 
                                onBack={handleStudentExitLive} 
                            />
                        </GhostRadioGatekeeper>
                    </ResponsiveWrapper>
                ) : view === 'teacher_live' && activeRoom ? (
                    <TeacherLiveView 
                        session={activeRoom} 
                        packet={savedPacket} 
                        lang={lang} 
                        onEnd={handleEndSession} 
                        onKick={handleKick} 
                        onCreateReport={(res) => { setReportData(res); setView('live_report'); }} 
                        teacherClassCode={profile?.class_code}
                    />
                ) : view === 'live_report' && activeRoom && reportData ? (
                    <LandscapeReport 
                        session={activeRoom} 
                        packet={savedPacket} 
                        responses={reportData} 
                        onClose={() => { 
                            if (activeRoom.status === 'closed') { 
                                setView('dashboard'); 
                                setActiveRoom(null); 
                                setReportData(null); 
                            } else { 
                                setView('teacher_live'); 
                            } 
                        }} 
                        lang={lang} 
                    />
                ) : null}
            </div>
            <DetourModal 
                isOpen={isDetourModalOpen} 
                lang={lang}
                onAskCoach={() => {
                    setIsDetourModalOpen(false);
                    setPendingDetour(null); // Clear the pending drop
                    
                    // Reset history so the engine doesn't instantly re-trigger the detour on the next mistake
                    setHistory([]); 
                    
                    // Open your coach modal (ensure you have this state/component defined in App.jsx)
                    // setIsCoachModalOpen(true); 
                }}
                onAcceptDetour={() => {
                    setIsDetourModalOpen(false);
                    
                    if (pendingDetour) {
                        // NOW we actually execute the drop!
                        setOriginalTask({ topic, level });
                        setIsDetourActive(true);
                        setTopic(pendingDetour.topic);
                        setLevel(pendingDetour.level);
                        setStreak(0);
                        
                        // Clear their history so they get a fresh start on the lower level
                        setHistory([]); 
                        
                        // Fetch the new, easier question
                        fetchQuestion(pendingDetour.topic, pendingDetour.level, lang);
                        setPendingDetour(null);
                    }
                }} 
            />
            {/* Safely render Vercel Analytics in the background */}
            <Suspense fallback={null}>
                <IsolatedTracker />
            </Suspense>
        </div>
        </PreferencesContext.Provider>
    );
}

export default App;