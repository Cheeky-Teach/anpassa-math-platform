import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * LAZY INITIALIZATION HELPER
 * This prevents the script from crashing at the top-level if 
 * environment variables are missing during local practice.
 */
const getSupabase = () => {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.warn("Supabase credentials missing. Database features are inactive.");
        return null;
    }
    return createClient(url, key);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // 1. Standard Security Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: "Use POST" });

    try {
        const { 
            answer, 
            token, 
            streak = 0, 
            roomId, 
            studentAlias, 
            questionIndex 
        } = req.body;

        // 2. Decode & Validate (Anti-Cheat)
        const correctAnswer = Buffer.from(token, 'base64').toString('utf-8');
        const normalize = (str: any) => String(str).toLowerCase().replace(/\s+/g, '').replace(',', '.');
        
        const isCorrect = normalize(answer) === normalize(correctAnswer);

        // 3. Calculate Practice Progress (Required for App.jsx)
        let newStreak = isCorrect ? streak + 1 : 0;
        let levelUp = isCorrect && newStreak > 0 && newStreak % 8 === 0;

        // 4. THE HYBRID LOGIC: Only attempt DB connection if roomId exists
        if (roomId && studentAlias) {
            const supabase = getSupabase();
            
            if (supabase) {
                const { error: dbError } = await supabase
                    .from('responses')
                    .insert([{
                        room_id: roomId,
                        student_alias: studentAlias,
                        question_index: questionIndex || 0,
                        answer: String(answer),
                        is_correct: isCorrect
                    }]);

                // Handle unique constraint (prevents double submissions in live rooms)
                if (dbError && dbError.code === '23505') {
                    return res.status(400).json({ error: "Du har redan svarat på denna fråga." });
                }
            } else {
                console.error("Critical: Room ID provided but Supabase is not configured.");
            }
        }

        // 5. Return everything App.jsx needs to keep the game running
        // This now works even if the database step was skipped!
        return res.status(200).json({
            correct: isCorrect,
            correctAnswer, 
            newStreak,     
            levelUp        
        });

    } catch (error: any) {
        console.error("Answer API Error:", error);
        return res.status(500).json({ error: "Systemfel vid rättning." });
    }
}