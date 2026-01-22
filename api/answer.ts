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
    // added attempts to body
    const { answer, token, streak, level, topic, usedHelp, solutionUsed, attempts } = req.body;

    if (answer === undefined || !token) {
      return res.status(400).json({ error: 'Missing answer or token' });
    }

    // Verify using AES Decryption + Tolerance Check
    const isCorrect = verifyAnswer(answer, token);
    
    let levelUpAvailable = false;
    let newStreak = Number(streak || 0);
    const currentAttempts = Number(attempts || 0) + 1; // Increment attempt count

    // Determine actions based on correctness and attempt count
    let action = 'none'; // 'none', 'next_clue', 'show_solution'

    if (isCorrect) {
        if (solutionUsed || currentAttempts >= 3) {
             // If solution was used OR they got it right on the 3rd attempt (which forces solution view anyway), streak resets
             // Actually, if they get it right on 3rd attempt, it counts as "incorrect" for streak purposes in the request logic,
             // but here we just handle the streak value.
             newStreak = 0;
        } else if (!usedHelp && currentAttempts === 1) {
            // Only increment streak on FIRST try without help
            newStreak += 1;
            if (level && topic) {
                levelUpAvailable = ProgressionRules.checkLevelUp(newStreak, Number(level), String(topic));
            }
        }
        // If correct on 2nd try (currentAttempts == 2), streak stays same (no reset, no increment)
    } else {
        // Incorrect
        if (currentAttempts === 2) {
            action = 'next_clue';
        } else if (currentAttempts >= 3) {
            action = 'show_solution';
            newStreak = 0; // Reset streak on 3rd fail
        }
        // If currentAttempts === 1, just incorrect feedback, no streak reset yet?
        // Requirement: "If the student answers incorrectly three times... question gets logged as incorrect"
        // Implicitly, streak shouldn't reset until failure condition is met or solution used.
        // However, standard logic usually resets streak on ANY error.
        // Let's stick to standard: Wrong answer = streak 0.
        // BUT, the prompt implies a "soft fail" system.
        // "Streaks should only be increased by 1 if the student answers a question correctly without clicking on either button."
        // It doesn't explicitly say "don't reset on first wrong try", but usually streaks imply consecutive *first-try* correct answers.
        // I will reset streak on ANY wrong answer to maintain strict "streak" definition, unless requested otherwise.
        // Re-reading: "If the student answers incorrectly three times... question gets logged as incorrect... history pane"
        // This implies 1st and 2nd wrong tries might NOT be fully "incorrect" yet in terms of logging, but for a *streak* (perfect run), it usually breaks it.
        // I will reset streak on first error to be safe, as is standard.
        newStreak = 0; 
    }

    return res.status(200).json({
      correct: isCorrect,
      newStreak: newStreak,
      levelUp: levelUpAvailable,
      action: action,
      attempts: currentAttempts
    });
    
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}