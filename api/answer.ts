import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase for the backend
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("CRITICAL: Supabase environment variables are missing!");
}

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

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

        // 4. THE HYBRID LOGIC: Save to Database ONLY if in a Classroom Room
        if (roomId && studentAlias) {
            const { error: dbError } = await supabase
                .from('responses')
                .insert([{
                    room_id: roomId,
                    student_alias: studentAlias,
                    question_index: questionIndex || 0,
                    answer: String(answer),
                    is_correct: isCorrect
                }]);

            // If the student tries to submit twice, the "Crash-Shield" will trigger error 23505
            if (dbError && dbError.code === '23505') {
                return res.status(400).json({ error: "Du har redan svarat på denna fråga." });
            }
        }

        // 5. Return everything App.jsx needs to keep the game running
        return res.status(200).json({
            correct: isCorrect,
            correctAnswer, // Allows the UI to show the right answer if they fail
            newStreak,     // Updates the flame icon in App.jsx
            levelUp        // Triggers the "Level Up" modal in App.jsx
        });

    } catch (error: any) {
        console.error("Answer API Error:", error);
        return res.status(500).json({ error: "Systemfel vid rättning." });
    }
}