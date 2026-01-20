import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAnswer } from '../src/core/utils/security';
import { ProgressionRules } from '../src/core/rules/ProgressionRules';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { answer, token, streak, level, topic } = req.body;

    if (answer === undefined || !token) {
      return res.status(400).json({ error: 'Missing answer or token' });
    }

    const isCorrect = verifyAnswer(answer, token);
    let levelUpAvailable = false;

    // Only check level up if the answer was correct
    if (isCorrect && streak !== undefined && level) {
        // Calculate new streak (Current + 1)
        const newStreak = Number(streak) + 1;
        const currentLevel = Number(level);
        const currentTopic = String(topic || 'scale'); // Default fallback

        levelUpAvailable = ProgressionRules.checkLevelUp(newStreak, currentLevel, currentTopic);
        
        // Debug log (server-side only, visible in Vercel logs)
        console.log(`Check LevelUp: Streak ${newStreak}, Lvl ${currentLevel}, Topic ${currentTopic} -> ${levelUpAvailable}`);
    }

    return res.status(200).json({
      correct: isCorrect,
      feedback: isCorrect ? "Rätt!" : "Försök igen",
      levelUp: levelUpAvailable
    });

  } catch (error) {
    console.error("API Error in /api/answer:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}