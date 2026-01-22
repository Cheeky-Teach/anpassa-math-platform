import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAnswer } from '../src/core/utils/security';
import { ProgressionRules } from '../src/core/rules/ProgressionRules';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
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

    // Verify using AES Decryption + Tolerance Check
    const isCorrect = verifyAnswer(answer, token);
    
    let levelUpAvailable = false;
    let newStreak = Number(streak || 0);

    if (isCorrect) {
        newStreak += 1;
        // Check for level up if valid data is present
        if (level && topic) {
            levelUpAvailable = ProgressionRules.checkLevelUp(newStreak, Number(level), String(topic));
        }
    } else {
        newStreak = 0;
    }

    return res.status(200).json({
      correct: isCorrect,
      levelUp: levelUpAvailable,
      streak: newStreak
    });

  } catch (error) {
    console.error("Answer Handler Error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}