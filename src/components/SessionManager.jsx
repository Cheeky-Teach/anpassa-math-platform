import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function SessionManager({ teacherCode, lang }) {
    const [showWarning, setShowWarning] = useState(false);
    const [countdown, setCountdown] = useState(60);

    const SESSION_TIMEOUT_MS = 14 * 60 * 1000; // 14 minutes silent state
    const SYNC_INTERVAL_MS = 60 * 1000; // 60 seconds

    // Localization texts
    const t = {
        sv: {
            title: "Är du kvar?",
            desc: "Du verkar vara inaktiv. Din session stängs automatiskt om:",
            btn: "Jag är kvar!"
        },
        en: {
            title: "Are you still there?",
            desc: "You seem to be inactive. Your session will close automatically in:",
            btn: "I'm still here!"
        }
    }[lang || 'sv'];

    useEffect(() => {
        if (!teacherCode) return;

        let sessionTimer;
        let countdownInterval;
        let syncInterval;
        let isTabActive = true;

        const studentId = localStorage.getItem('guest_student_id');
        if (!studentId) return;

        // 1. The Session Sync (Keepalive)
        syncInterval = setInterval(async () => {
            if (isTabActive && !showWarning) {
                await supabase.rpc('sync_student_session', {
                    p_teacher_code: teacherCode,
                    p_student_id: studentId
                });
                isTabActive = false; 
            }
        }, SYNC_INTERVAL_MS);

        // 2. The Activity Monitor
        const registerActivity = () => {
            isTabActive = true; 
            if (showWarning) return; 

            clearTimeout(sessionTimer);
            sessionTimer = setTimeout(() => {
                setShowWarning(true);
                setCountdown(60);
            }, SESSION_TIMEOUT_MS);
        };

        window.addEventListener('mousemove', registerActivity);
        window.addEventListener('keydown', registerActivity);
        window.addEventListener('click', registerActivity);
        registerActivity();

        // 3. The Countdown Kicker
        if (showWarning) {
            countdownInterval = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(countdownInterval);
                        executeKick(studentId);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        // 4. Tab Close Cleanup (Adblocker-Safe)
        const handleUnload = () => {
            // Using POST to trigger the RPC via REST API on exit
            const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/end_student_session`;
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({
                    p_teacher_code: teacherCode,
                    p_student_id: studentId
                }),
                keepalive: true 
            }).catch(() => {});
        };
        window.addEventListener('beforeunload', handleUnload);

        return () => {
            clearTimeout(sessionTimer);
            clearInterval(countdownInterval);
            clearInterval(syncInterval);
            window.removeEventListener('mousemove', registerActivity);
            window.removeEventListener('keydown', registerActivity);
            window.removeEventListener('click', registerActivity);
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, [showWarning, teacherCode]);

    const handleImStillHere = () => {
        setShowWarning(false);
        const studentId = localStorage.getItem('guest_student_id');
        supabase.rpc('sync_student_session', {
            p_teacher_code: teacherCode,
            p_student_id: studentId
        });
    };

    const executeKick = async (studentId) => {
        await supabase.rpc('end_student_session', {
            p_teacher_code: teacherCode,
            p_student_id: studentId
        });
        localStorage.removeItem('guest_student_id');
        window.location.href = '/?reason=timeout'; 
    };

    if (!showWarning) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[999] flex items-center justify-center">
            <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm border-2 border-emerald-50 animate-in fade-in zoom-in-95">
                <h2 className="text-2xl font-black text-slate-800 mb-2">{t.title}</h2>
                <p className="text-slate-500 mb-6 font-medium leading-relaxed">
                    {t.desc}
                </p>
                <div className="text-5xl font-black text-rose-500 mb-8">{countdown}s</div>
                <button onClick={handleImStillHere} className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold uppercase tracking-widest transition-all active:scale-95">
                    {t.btn}
                </button>
            </div>
        </div>
    );
}