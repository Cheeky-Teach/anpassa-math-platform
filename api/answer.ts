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
    // 1. Standard Security & CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle Preflight OPTIONS request
    if (req.method === 'OPTIONS') return res.status(200).end();
    
    // Strict Method Enforcement: Rejects any non-POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Metod tillåts ej. Använd POST." });
    }

    try {
        const { 
            answer, 
            token, 
            topic,
            streak = 0, 
            roomId, 
            studentAlias, 
            questionIndex 
        } = req.body;

        // --- SECURITY UPDATES: INPUT VALIDATION & LENGTH SHIELD ---
        
        // 1. Validate Answer: Must be string and max 20 chars
        if (typeof answer !== 'string' || answer.length > 20) {
            return res.status(400).json({ 
                error: "Ogiltigt svar-format eller för långt svar (max 20 tecken)." 
            });
        }

        // 2. Validate Student Alias: Must be string and max 50 chars
        if (studentAlias && (typeof studentAlias !== 'string' || studentAlias.length > 50)) {
            return res.status(400).json({ error: "Ogiltigt namn-format." });
        }

        // 3. Validate Token: Must exist and be string for Base64 decoding
        if (!token || typeof token !== 'string') {
            return res.status(400).json({ error: "Säkerhetstoken saknas." });
        }

        /// 2. Decode & Validate (Base64 Mode)
        const correctAnswer = Buffer.from(token, 'base64').toString('utf-8');
        const normalize = (str: any) => {
            return String(str)
                .toLowerCase()
                .replace(/^0+\s+/, '')     // 🟢 NEW: Instantly converts "0 11/5" into "11/5"
                .replace(/[\s_]+/g, '')    // Remove spaces and underscores
                .replace(',', '.')         // Swedish comma to dot
                .replace(/\\/g, '')        // Strip rogue LaTeX backslashes
                .replace(/^[a-z]=/, '')    // Strip "x="
                .replace(/^svar:/, '')     // Strip "svar:"
                .replace(/·/g, '*');       // Normalize dot operators
        };

        const normUserAns = normalize(answer);
        const normCorrectAns = normalize(correctAnswer);

        // Standard strict string comparison (Required for Algebra, MCQ, and exact Arithmetic)
        let isCorrect = normUserAns === normCorrectAns;

        // NEW: Mathematical Equivalence Fallback for Fractions
        if (!isCorrect && (answer.includes('/') || correctAnswer.includes('/'))) {
            const getDecimalValue = (fracString: string) => {
                try {
                    let w = 0, n = 0, d = 1;
                    const str = String(fracString).trim();
                    
                    if (str.includes(' ')) {
                        const parts = str.split(' ');
                        w = parseInt(parts[0], 10) || 0;
                        if (parts[1] && parts[1].includes('/')) {
                            const fParts = parts[1].split('/');
                            n = parseInt(fParts[0], 10) || 0;
                            d = parseInt(fParts[1], 10) || 1;
                        }
                    } else if (str.includes('/')) {
                        const fParts = str.split('/');
                        n = parseInt(fParts[0], 10) || 0;
                        d = parseInt(fParts[1], 10) || 1;
                    } else {
                        w = parseInt(str, 10) || 0;
                    }
                    
                    if (d === 0) return null; // Prevent divide by zero
                    const sign = (w < 0 || str.startsWith('-')) ? -1 : 1;
                    return sign * (Math.abs(w) + (n / d));
                } catch (e) {
                    return null;
                }
            };

            const userDecimal = getDecimalValue(answer);
            const correctDecimal = getDecimalValue(correctAnswer);

            // If both parsed successfully and represent the exact same mathematical value
            if (userDecimal !== null && correctDecimal !== null && Math.abs(userDecimal - correctDecimal) < 0.0001) {
                isCorrect = true;
            }
        }

        // --- NEW: SMART NUMERIC TOLERANCE LOGIC ---
        const userNum = parseFloat(normUserAns);
        const correctNum = parseFloat(normCorrectAns);

        // Only apply numeric tolerance if strict string match failed
        if (!isCorrect && !isNaN(userNum) && !isNaN(correctNum)) {
            
            // Define which topics allow for rounding errors
            const fuzzyKeywords = ['geometry', 'volume', 'circle', 'area', 'prism', 'sphere', 'cylinder','cone','pyramid', 'omkrets','perimeter'];
            const isFuzzyTopic = fuzzyKeywords.some(kw => topic?.toLowerCase().includes(kw));

            // Only apply the 0.99 tolerance if it's a fuzzy topic
            if (isFuzzyTopic && Math.abs(userNum - correctNum) < 0.09) {
                isCorrect = true;
            }
            // If it's basic arithmetic, isCorrect stays false because it missed the exact string match
        }
        
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