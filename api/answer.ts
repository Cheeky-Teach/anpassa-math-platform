import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed. Use POST." });
    }

    try {
        const { answer, token, streak = 0 } = req.body;

        if (!token) {
            return res.status(400).json({ error: "Missing token" });
        }

        // 1. Decode the correct answer from the Base64 token
        const correctAnswer = Buffer.from(token, 'base64').toString('utf-8');

        // 2. Normalize inputs for comparison
        // We remove spaces and convert to lowercase to be forgiving
        // e.g. "x + 5" should match "x+5"
        const normalize = (str: any) => String(str).toLowerCase().replace(/\s+/g, '').replace(',', '.');
        
        const userClean = normalize(answer);
        const correctClean = normalize(correctAnswer);

        const isCorrect = userClean === correctClean;

        let newStreak = streak;
        let levelUp = false;

        // 3. Update Streak Logic
        if (isCorrect) {
            newStreak++;
            // Propose level up every 8 correct answers
            if (newStreak > 0 && newStreak % 8 === 0) {
                levelUp = true;
            }
        } else {
            newStreak = 0;
        }

        return res.status(200).json({
            correct: isCorrect,
            correctAnswer, // Send back correct answer so UI can display it if wrong
            newStreak,
            levelUp
        });

    } catch (error) {
        console.error("Answer Validation Error:", error);
        return res.status(500).json({ error: "Validation failed." });
    }
}