import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ScaleGenerator } from '../src/core/generators/ScaleGenerator';
import { generateToken } from '../src/core/utils/security';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // 1. CORS Headers (Allow all for simplicity in dev, restrict in prod)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 2. Determine Topic/Level from Query Params
    const { topic = 'scale', level = '1', lang = 'sv' } = req.query;
    
    // 3. Select Generator (Expand this switch case for other generators)
    let questionData;
    
    switch(topic) {
      case 'scale':
        const gen = new ScaleGenerator();
        questionData = gen.generate(Number(level), lang as 'sv' | 'en');
        break;
      default:
        // Fallback for testing
        const fallbackGen = new ScaleGenerator();
        questionData = fallbackGen.generate(1, 'sv');
        break;
    }

    // 4. Sign the Token
    // We strip the actual answer from the response sent to the client
    const token = generateToken(questionData.id, questionData.answer);
    
    const clientResponse = {
      questionId: questionData.id,
      renderData: questionData.renderData,
      clue: questionData.clue,
      token: token // This contains the signed answer hash
    };

    // 5. Return JSON
    return res.status(200).json(clientResponse);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}