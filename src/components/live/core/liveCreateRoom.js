// src/components/live/core/liveCreateRoom.js
import { supabase } from '../../../lib/supabaseClient';

export function generateRoomCode() {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export async function liveCreateRoom({
    teacherId,
    profile = null,
    title = "Live Lektion",
    mode = 'worksheet',
    packet = [],
    slides = null,
    settings = {},
    activeSheetId = null
}) {
    // 1. Resolve User
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    const resolvedTeacherId = teacherId || user?.id;

    if (!resolvedTeacherId || !user) {
        throw new Error("Endast inloggade lärare kan starta live-sessioner.");
    }

    // 2. Strict Role Authorization ('teacher' & 'super_admin' only)
    let role = profile?.role || user.user_metadata?.role;

    if (!role) {
        const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', resolvedTeacherId)
            .maybeSingle();
        role = profileData?.role;
    }

    const isTeacher = ['teacher', 'super_admin'].includes(String(role).toLowerCase());

    if (!isTeacher) {
        throw new Error("Behörighet saknas. Endast lärare kan skapa live-rum.");
    }

    // 3. Assemble Room Settings & Data
    const classCode = generateRoomCode();

    const effectiveSettings = {
        pacing: settings.pacing || 'open',
        order: settings.order || 'original',
        summary: settings.summary !== false,
        allowScratchpad: settings.allowScratchpad !== undefined 
            ? Boolean(settings.allowScratchpad) 
            : (settings.scratchpad !== undefined ? Boolean(settings.scratchpad) : true),
        allowCanvas: Boolean(settings.allowCanvas || settings.enableCanvas),
        responseStyle: settings.responseStyle || 'flexible',
        ...settings
    };

    const activeQuestionData = {
        mode,
        packet: Array.isArray(packet) ? packet : (packet?.tiles || packet?.livePacket || []),
        ...(slides ? { slides } : {}),
        settings: effectiveSettings
    };

    const roomPayload = {
        teacher_id: resolvedTeacherId,
        class_code: classCode,
        status: 'active',
        title: title || "Live Session",
        active_worksheet_id: activeSheetId || null,
        current_slide_index: 0,
        current_question_index: 0,
        active_question_data: activeQuestionData
    };

    const { data, error } = await supabase
        .from('rooms')
        .insert([roomPayload])
        .select()
        .single();

    if (error) {
        console.error("[liveCreateRoom] Error creating room:", error);
        throw error;
    }

    return data;
}