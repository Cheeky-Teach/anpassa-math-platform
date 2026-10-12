import { create } from 'zustand';

export const useSessionSync = create((set, get) => ({
    sessionData: {
        app_mode: 'landing',
        device_type: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
        progress: {} 
    },

    setAppMode: (mode) => {
        const state = get();
        if (state.sessionData.app_mode !== mode) {
            state.syncNow(); 
            set({ sessionData: { ...state.sessionData, app_mode: mode, progress: {} } });
        }
    },

    savePracticeEntry: (topic, level, isCorrect, cluesUsed, timeSpentSec) => set((state) => {
        const key = `${topic}_L${level}`;
        const current = state.sessionData.progress[key] || { 
            attempts: 0, correct: 0, clues: 0, time_spent: 0 
        };
        
        return {
            sessionData: {
                ...state.sessionData,
                progress: {
                    ...state.sessionData.progress,
                    [key]: {
                        attempts: current.attempts + 1,
                        correct: current.correct + (isCorrect ? 1 : 0),
                        clues: current.clues + cluesUsed,
                        time_spent: current.time_spent + timeSpentSec
                    }
                }
            }
        };
    }),


    saveFeatureState: (key, data) => set((state) => ({
        sessionData: {
            ...state.sessionData,
            progress: {
                ...state.sessionData.progress,
                [key]: { ...(state.sessionData.progress[key] || {}), ...data }
            }
        }
    })),


    syncNow: () => {
        const payload = get().sessionData;
        
        if (Object.keys(payload.progress).length === 0) {
            console.log("🟡 [SYNC] Bucket empty, nothing to send.");
            return;
        }

        console.log("🟢 [SYNC] Sending to backend:", payload); // <-- ADD THIS

        try {
            fetch('/api/save-progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                keepalive: true
            }).catch((err) => {
                console.error("🔴 [SYNC] Fetch failed:", err); // <-- ADD THIS
            }); 
        } catch (e) {
            console.warn("Save intercepted.");
        }
        
        set({ sessionData: { ...payload, progress: {} } });
    }
}));