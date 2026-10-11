import React, { useEffect, useState, useRef } from 'react';
import { AlertTriangle, MonitorPlay, ArrowRightLeft } from 'lucide-react';

export default function GhostRadioGatekeeper({ 
    classCode, 
    children, 
    onDisconnect,
    lang = 'sv' 
}) {
    const [status, setStatus] = useState('checking'); 
    const channelRef = useRef(null);
    const tabId = useRef(Math.random().toString(36).substring(2, 9));
    
    // Safely store the latest onDisconnect function without triggering effect re-runs
    const onDisconnectRef = useRef(onDisconnect);
    useEffect(() => {
        onDisconnectRef.current = onDisconnect;
    }, [onDisconnect]);

    const TEXT = {
        sv: {
            checking: "Verifierar anslutning...",
            blockedTitle: "Redan öppen",
            blockedDesc: "Klassrummet är redan öppet i en annan flik i denna webbläsare. Du tar upp en onödig plats!",
            stealBtn: "Flytta anslutningen hit",
            stolenTitle: "Anslutning flyttad",
            stolenDesc: "Du öppnade klassrummet i en annan flik. Denna flik är nu pausad för att spara plats.",
            reloadBtn: "Ta tillbaka anslutningen"
        },
        en: {
            checking: "Verifying connection...",
            blockedTitle: "Already open",
            blockedDesc: "The classroom is already open in another tab. You are taking up an extra seat!",
            stealBtn: "Move connection here",
            stolenTitle: "Connection moved",
            stolenDesc: "You opened the classroom in another tab. This tab is paused to save seats.",
            reloadBtn: "Take back connection"
        }
    };

    const t = TEXT[lang] || TEXT.sv;

    useEffect(() => {
        if (!classCode) return;

        const channelName = `ghost_radio_${classCode}`;
        const bc = new BroadcastChannel(channelName);
        channelRef.current = bc;

        const handleMessage = (event) => {
            const { type, sender } = event.data;

            if (type === 'PING') {
                setStatus(currentStatus => {
                    if (currentStatus === 'active') {
                        bc.postMessage({ type: 'PONG', sender: tabId.current });
                    }
                    return currentStatus;
                });
            }

            if (type === 'PONG') {
                setStatus(currentStatus => {
                    if (currentStatus === 'checking') return 'blocked';
                    return currentStatus;
                });
            }

            if (type === 'STEAL' && sender !== tabId.current) {
                setStatus('stolen');
                // ONLY trigger the kick if the tab was explicitly stolen
                if (onDisconnectRef.current) onDisconnectRef.current(); 
            }
        };

        bc.onmessage = handleMessage;
        bc.postMessage({ type: 'PING', sender: tabId.current });

        const timeout = setTimeout(() => {
            setStatus(currentStatus => {
                if (currentStatus === 'checking') return 'active';
                return currentStatus;
            });
        }, 300);

        return () => {
            clearTimeout(timeout);
            bc.close();
            // BUG FIX: Removed the onDisconnect() call from here so navigating 
            // naturally to the practice lab doesn't kick the user out!
        };
    }, [classCode]); // Removed status and onDisconnect from dependencies!

    const handleStealConnection = () => {
        if (channelRef.current) {
            channelRef.current.postMessage({ type: 'STEAL', sender: tabId.current });
            setStatus('active');
        }
    };

    // --- RENDER STATES ---

    if (status === 'checking') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{t.checking}</p>
                </div>
            </div>
        );
    }

    if (status === 'blocked') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl text-center border border-slate-200">
                    <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <MonitorPlay size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight italic mb-3">{t.blockedTitle}</h2>
                    <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                        {t.blockedDesc}
                    </p>
                    <button 
                        onClick={handleStealConnection}
                        className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black uppercase tracking-widest text-[11px] py-4 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <ArrowRightLeft size={16} /> {t.stealBtn}
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'stolen') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl text-center border border-slate-200 opacity-75 grayscale transition-all hover:grayscale-0 hover:opacity-100">
                    <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <AlertTriangle size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight italic mb-3">{t.stolenTitle}</h2>
                    <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                        {t.stolenDesc}
                    </p>
                    <button 
                        onClick={handleStealConnection}
                        className="w-full bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 font-black uppercase tracking-widest text-[11px] py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <ArrowRightLeft size={16} /> {t.reloadBtn}
                    </button>
                </div>
            </div>
        );
    }

    return children;
}