import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAnswer } from '../src/core/utils/security';
import { ProgressionRules } from '../src/core/rules/ProgressionRules';
import { ServerAuth } from '../src/core/utils/server-auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Added Authorization

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Extract payload
    const { answer, token, streak, level, topic, questionId } = req.body;

    // 1. STATELESS VALIDATION (Guest & Auth Mode)
    if (answer === undefined || !token) {
      return res.status(400).json({ error: 'Missing answer or token' });
    }

    const isCorrect = verifyAnswer(answer, token);
    let levelUpAvailable = false;
    let newStreak = Number(streak || 0);

    // 2. PROGRESSION LOGIC
    if (isCorrect && level) {
        newStreak += 1;
        const currentLevel = Number(level);
        const currentTopic = String(topic || 'scale');

        levelUpAvailable = ProgressionRules.checkLevelUp(newStreak, currentLevel, currentTopic);
        
        console.log(`[Logic] Streak: ${newStreak}, Lvl: ${currentLevel}, Topic: ${currentTopic} -> LevelUp: ${levelUpAvailable}`);
    } else {
        newStreak = 0; // Reset streak on failure
    }

    // 3. PERSISTENCE LAYER (Auth Mode Only)
    // Check if request has Auth header
    if (req.headers.authorization) {
        const userId = await ServerAuth.validateUser(req);
        
        if (userId) {
             // Fire and forget - don't block the UI response for DB writes
            ServerAuth.logProgress({
                userId,
                topic: String(topic || 'unknown'),
                level: Number(level || 1),
                isCorrect,
                questionId: String(questionId || 'unknown'),
                answer: String(answer),
                currentStreak: Number(streak || 0) // Pass incoming streak for delta calc
            }).catch(err => console.error("Async DB Log Error:", err));
        }
    }

    // 4. RESPONSE
    return res.status(200).json({
      correct: isCorrect,
      levelUp: levelUpAvailable,
      streak: newStreak
    });

  } catch (error) {
    console.error("Answer API Error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}