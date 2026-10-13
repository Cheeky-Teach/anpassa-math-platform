import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Strict Least-Privilege Setup
const getSupabase = () => {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.warn("Supabase credentials missing. Telemetry sync skipped.");
        return null;
    }
    return createClient(url, key);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Standard CORS & Methods (Matching answer.ts)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    console.log("🟢 [BACKEND] Received save-progress ping");

    try {
        let payload = req.body;
        if (typeof payload === 'string') {
            payload = JSON.parse(payload);
        }

        const { app_mode, device_type, progress } = payload;

        if (!progress || Object.keys(progress).length === 0) {
            console.log("🟡 [BACKEND] Progress was empty. Skipping write.");
            return res.status(200).send('OK');
        }

        const supabase = getSupabase();
        
        if (supabase) {
            console.log("🟢 [BACKEND] Attempting Supabase insert for mode:", app_mode);
            
            const { data, error } = await supabase
                .from('telemetry_events')
                .insert([{
                    app_mode,
                    device_type,
                    metrics: progress
                }])
                .select();

            if (error) {
                console.error("🔴 [BACKEND] SUPABASE ERROR:", error);
                throw error;
            }
            console.log("🟢 [BACKEND] Supabase write successful");
        }

        res.status(200).send('OK');
    } catch (err) {
        console.error('🔴 [BACKEND] Fatal error in endpoint:', err);
        // Fail silently for adblockers
        res.status(200).send('OK'); 
    }
}