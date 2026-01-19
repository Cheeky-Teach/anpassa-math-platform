import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAnswer, normalizeAnswer } from '../src/core/utils/security';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { answer, token } = req.body;

    if (!answer || !token) {
      return res.status(400).json({ error: 'Missing answer or token' });
    }

    // 1. Verify the answer using the shared security logic
    const isCorrect = verifyAnswer(answer, token);

    // 2. Future: Insert into Supabase here
    // if (isCorrect) { await supabase.from('progress').insert(...) }

    return res.status(200).json({
      correct: isCorrect,
      feedback: isCorrect ? "Rätt svar! Bra jobbat." : "Inte riktigt. Försök igen.",
      // In a real app, you might return the correct answer here only if they give up
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}