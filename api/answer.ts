import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAnswer } from '../src/core/utils/security'; 
import { getCorrectAnswer } from '../src/core/utils/security'; 
import { ProgressionRules } from '../src/core/rules/ProgressionRules';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { answer, token, streak, level, topic, usedHelp, solutionUsed, attempts } = req.body;

  if (!answer || !token) {
    return res.status(400).json({ error: 'Missing answer or token' });
  }

  const isCorrect = verifyAnswer(answer, token);
  
  let levelUpAvailable = false;
  let newStreak = Number(streak || 0);
  const currentAttempts = Number(attempts || 0) + 1; 

  let action = 'none'; 
  let correctAnswer = null; 

  if (isCorrect) {
      if (solutionUsed || currentAttempts >= 2) { // Changed 3 to 2
           newStreak = 0;
      } else if (!usedHelp && currentAttempts === 1) {
          newStreak += 1;
          if (level && topic) {
              levelUpAvailable = ProgressionRules.checkLevelUp(newStreak, Number(level), String(topic));
          }
      }
  } else {
      if (currentAttempts === 1) { // Changed 2 to 1 for first clue
          action = 'next_clue';
      } else if (currentAttempts >= 2) { // Changed 3 to 2 for show solution
          action = 'show_solution';
          newStreak = 0; 
          correctAnswer = getCorrectAnswer(token);
      }
      newStreak = 0; 
  }

  return res.status(200).json({
    correct: isCorrect,
    newStreak: newStreak,
    levelUp: levelUpAvailable,
    action: action,
    correctAnswer: correctAnswer
  });
}