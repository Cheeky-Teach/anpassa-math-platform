import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAnswer } from '../src/core/utils/security';

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
    const { answer, token } = req.body;

    if (answer === undefined || !token) {
      return res.status(400).json({ error: 'Missing answer or token' });
    }

    // Security check: verification happens in utils/security.ts
    // This compares the HASH of 'answer' with the HASH inside 'token'
    const isCorrect = verifyAnswer(answer, token);

    return res.status(200).json({
      correct: isCorrect,
      feedback: isCorrect ? "Rätt!" : "Försök igen",
    });

  } catch (error) {
    console.error("API Error in /api/answer:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}