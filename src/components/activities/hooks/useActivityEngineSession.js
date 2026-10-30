// src/components/activities/hooks/useActivityEngineSession.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { broadcastRoomQuestionState, closeActiveRoom } from '../../live/core/activityQuestionUtils';
import { liveCreateRoom } from '../../live/core/liveCreateRoom';

/**
 * Standardized session lifecycle hook for activity engines (Four Corners, Category Clash, etc.).
 * Manages room state, live escalation, Supabase realtime responses, and teardown.
 */
export function useActivityEngineSession({
    session = null,
    initialConfig = null,
    isLiveHost = false,
    profile = null,
    onClose = null,
    mode,
    gameKey,
    title = '',
    lang = 'sv',
    getPacket = () => [],
    getSettings = () => ({}),
    getInitialBroadcastData = () => null
}) {
    // 1. Role Authorization
    const resolvedRole = String(profile?.role || initialConfig?.profile?.role || '').toLowerCase();
    const canHostLiveRoom = resolvedRole === 'teacher' || resolvedRole === 'super_admin' || !profile;

    // 2. Session Identifiers Resolution
    const effectiveSession = session || initialConfig?.session || initialConfig?.room || null;
    const initialRoomId = effectiveSession?.id || initialConfig?.roomId || null;
    const initialClassCode = effectiveSession?.class_code || effectiveSession?.room_code || initialConfig?.room_code || '';

    // 3. Reactive State
    const [activeRoomId, setActiveRoomId] = useState(initialRoomId);
    const [activeClassCode, setActiveClassCode] = useState(initialClassCode);
    const [isGoingLive, setIsGoingLive] = useState(false);
    const [liveResponses, setLiveResponses] = useState([]);

    // 4. Derived Live Status
    const isLive = Boolean(isLiveHost || effectiveSession?.id || activeRoomId);
    const classCode = activeClassCode || initialClassCode;
    const roomId = activeRoomId || initialRoomId;

    // Synchronize if incoming props update
    useEffect(() => {
        if (initialRoomId && initialRoomId !== activeRoomId) {
            setActiveRoomId(initialRoomId);
        }
        if (initialClassCode && initialClassCode !== activeClassCode) {
            setActiveClassCode(initialClassCode);
        }
    }, [initialRoomId, initialClassCode]);

    // Keep synchronous ref of roomId for teardown callbacks
    const roomIdRef = useRef(roomId);
    useEffect(() => {
        roomIdRef.current = roomId;
    }, [roomId]);

    // 5. Realtime Responses Channel
    useEffect(() => {
        if (!isLive || !roomId) return;

        const fetchExisting = async () => {
            const { data, error } = await supabase
                .from('responses')
                .select('*')
                .eq('room_id', roomId);

            if (!error && data) {
                setLiveResponses(data);
            }
        };
        fetchExisting();

        const channel = supabase.channel(`activity_live_${roomId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'responses',
                filter: `room_id=eq.${roomId}`
            }, (payload) => {
                setLiveResponses(prev => [...prev, payload.new]);
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'responses',
                filter: `room_id=eq.${roomId}`
            }, (payload) => {
                setLiveResponses(prev => prev.map(r => r.id === payload.new.id ? payload.new : r));
            })
            .on('postgres_changes', {
                event: 'DELETE',
                schema: 'public',
                table: 'responses',
                filter: `room_id=eq.${roomId}`
            }, (payload) => {
                setLiveResponses(prev => prev.filter(r => r.id !== payload.old?.id));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isLive, roomId]);

    // 6. Broadcast Active Question / Board State
    const broadcastState = useCallback(async (activeQuestionData) => {
        const targetRoomId = roomIdRef.current;
        if (!isLive || !targetRoomId) return;

        await broadcastRoomQuestionState({
            roomId: targetRoomId,
            activeQuestionData
        });
    }, [isLive]);

    // 7. On-The-Fly Live Escalation
    const handleGoLive = useCallback(async () => {
        if (!canHostLiveRoom || isGoingLive) return;
        setIsGoingLive(true);
        try {
            const packet = getPacket();
            const settings = getSettings();
            const initialBroadcastData = getInitialBroadcastData();

            const newRoom = await liveCreateRoom({
                teacherId: profile?.id || initialConfig?.profile?.id,
                profile: profile || initialConfig?.profile,
                title: title || "Live Session",
                mode,
                packet: Array.isArray(packet) ? packet : (packet?.tiles || packet?.livePacket || []),
                settings: {
                    ...settings,
                    deliveryMode: 'digital'
                }
            });

            if (!newRoom) {
                throw new Error(lang === 'sv' ? "Kunde inte initiera live-rummet." : "Could not initialize live room.");
            }

            // Immediately broadcast initial lobby/waiting state
            if (initialBroadcastData) {
                await broadcastRoomQuestionState({
                    roomId: newRoom.id,
                    activeQuestionData: {
                        mode,
                        gameKey: gameKey || mode.replace('activity_', ''),
                        ...initialBroadcastData,
                        updated_at: new Date().toISOString()
                    }
                });
            }

            if (initialConfig) {
                initialConfig.session = newRoom;
            }

            setActiveRoomId(newRoom.id);
            setActiveClassCode(newRoom.class_code || newRoom.room_code);
        } catch (err) {
            console.error(`[useActivityEngineSession] Error escalating ${mode} to live:`, err);
            alert(lang === 'sv' ? "Kunde inte starta live-session: " + err.message : "Failed to start live session: " + err.message);
        } finally {
            setIsGoingLive(false);
        }
    }, [canHostLiveRoom, isGoingLive, getPacket, getSettings, getInitialBroadcastData, profile, initialConfig, title, mode, gameKey, lang]);

    // 8. Safe Teardown & Room Closure
    const handleCloseEngine = useCallback(async () => {
        const targetRoomId = roomIdRef.current;
        if (isLive && targetRoomId) {
            const shouldClose = window.confirm(
                lang === 'sv'
                    ? "Vill du avsluta live-rummet för eleverna?"
                    : "Do you want to close the live room for students?"
            );
            if (shouldClose) {
                await closeActiveRoom(targetRoomId);
                setActiveRoomId(null);
                setActiveClassCode('');
            }
        }
        if (onClose) onClose();
    }, [isLive, lang, onClose]);

    return {
        session: effectiveSession,
        roomId,
        classCode,
        isLive,
        canHostLiveRoom,
        isGoingLive,
        liveResponses,
        setLiveResponses,
        handleGoLive,
        handleCloseEngine,
        broadcastState
    };
}