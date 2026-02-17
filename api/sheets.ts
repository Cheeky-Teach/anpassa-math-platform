import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || ''
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // 1. Setup CORS and Security Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // 2. IDENTITY CHECK: Verify the user via their JWT token
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Missing authorization header" });

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
        return res.status(401).json({ error: "Invalid or expired session" });
    }

    try {
        // --- METHOD: POST (Save or Update) ---
        if (req.method === 'POST') {
            const { id, title, type, packet, config } = req.body;

            // Sanitize Title: Strip HTML and limit length to prevent injection/bloat
            const cleanTitle = title.replace(/<[^>]*>?/gm, '').substring(0, 100);

            const { data, error } = await supabase
                .from('saved_sheets')
                .upsert({ 
                    ...(id ? { id } : {}), // If ID exists, Supabase updates. If not, it inserts.
                    user_id: user.id,
                    title: cleanTitle, 
                    type, 
                    packet, 
                    config, 
                    updated_at: new Date().toISOString() 
                })
                .select()
                .single();

            if (error) throw error;
            return res.status(200).json(data);
        }

        // --- METHOD: GET (Fetch Library) ---
        if (req.method === 'GET') {
            const { data, error } = await supabase
                .from('saved_sheets')
                .select('id, title, type, packet, config, updated_at')
                .eq('user_id', user.id) // Security: Filter by verified user ID
                .order('updated_at', { ascending: false });

            if (error) throw error;
            return res.status(200).json(data);
        }

        // --- METHOD: DELETE (Remove Sheet) ---
        if (req.method === 'DELETE') {
            const { id } = req.query; // Extract ID from URL (e.g., /api/sheets?id=123)

            if (!id) return res.status(400).json({ error: "Missing sheet ID" });

            const { error } = await supabase
                .from('saved_sheets')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id); // Security: Ensure they can't delete someone else's sheet

            if (error) throw error;
            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: "Method not allowed" });

    } catch (error: any) {
        console.error("Sheets API Error:", error.message);
        return res.status(500).json({ error: "Database operation failed." });
    }
}