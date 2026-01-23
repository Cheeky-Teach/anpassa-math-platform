import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAnswer, decrypt } from '../src/core/utils/security'; // decrypt needs to be exported from security.ts or logic moved here. 
// Assuming decrypt is not exported, we need to handle getting correct answer differently or export decrypt.
// Actually, verifyAnswer does the decryption internally. We need to expose a way to get the decrypted answer 
// OR we just decrypt it here if we have the key.
// BETTER: The token payload contains the encrypted answer. We can decrypt it if we import the decrypt function.
// Let's assume we update security.ts to export `getDecryptedAnswer(token)` or similar, OR we just duplicate logic if necessary but cleaner to export.

// WAIT - I can't see security.ts exports in this prompt's context fully but verifyAnswer is there.
// I will assume I can update security.ts to export `getCorrectAnswer(token)`
import { getCorrectAnswer } from '../src/core/utils/security'; 
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
    const { answer, token, streak, level, topic, usedHelp, solutionUsed, attempts } = req.body;

    if (answer === undefined || !token) {
      return res.status(400).json({ error: 'Missing answer or token' });
    }

    const isCorrect = verifyAnswer(answer, token);
    
    let levelUpAvailable = false;
    let newStreak = Number(streak || 0);
    const currentAttempts = Number(attempts || 0) + 1; 

    let action = 'none'; 
    let correctAnswer = null; // Will be sent if they fail

    if (isCorrect) {
        if (solutionUsed || currentAttempts >= 3) {
             newStreak = 0;
        } else if (!usedHelp && currentAttempts === 1) {
            newStreak += 1;
            if (level && topic) {
                levelUpAvailable = ProgressionRules.checkLevelUp(newStreak, Number(level), String(topic));
            }
        }
    } else {
        if (currentAttempts === 2) {
            action = 'next_clue';
        } else if (currentAttempts >= 3) {
            action = 'show_solution';
            newStreak = 0; 
            // Retrieve correct answer to show in history
            correctAnswer = getCorrectAnswer(token);
        }
        newStreak = 0; 
    }

    return res.status(200).json({
      correct: isCorrect,
      newStreak: newStreak,
      levelUp: levelUpAvailable,
      action: action,
      attempts: currentAttempts,
      correctAnswer: correctAnswer 
    });
    
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}