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
    // Added solutionUsed to the destructured body
    const { answer, token, streak, level, topic, usedHelp, solutionUsed } = req.body;

    if (answer === undefined || !token) {
      return res.status(400).json({ error: 'Missing answer or token' });
    }

    // Verify using AES Decryption + Tolerance Check
    const isCorrect = verifyAnswer(answer, token);
    
    let levelUpAvailable = false;
    let newStreak = Number(streak || 0);

    if (isCorrect) {
        if (solutionUsed) {
            // STRICT RESET: If solution was viewed, streak resets to 0 even if answer is correct
            newStreak = 0;
        } else if (!usedHelp) {
            // Standard Increment: No hints, no solution -> Streak +1
            newStreak += 1;
            if (level && topic) {
                levelUpAvailable = ProgressionRules.checkLevelUp(newStreak, Number(level), String(topic));
            }
        }
        // If usedHelp is true but solutionUsed is false (hints only), streak remains the same.
    } else {
        // Incorrect answer always resets streak
        newStreak = 0;
    }

    return res.status(200).json({
      correct: isCorrect,
      newStreak: newStreak,
      levelUp: levelUpAvailable
    });
    
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}