import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateToken } from '../src/core/utils/security';

// IMPORTS
import { ScaleGenerator } from '../src/core/generators/ScaleGenerator';
import { GeometryGenerator } from '../src/core/generators/GeometryGenerator';
import { LinearGraphGenerator } from '../src/core/generators/LinearGraphGenerator';
import { LinearEquationGenerator } from '../src/core/generators/LinearEquationGen';
import { ExpressionSimplificationGen } from '../src/core/generators/ExpressionSimplificationGen';
import { LinearEquationProblemGen } from '../src/core/generators/LinearEquationProblemGen';
import { VolumeGenerator } from '../src/core/generators/VolumeGenerator';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { topic, level, lang = 'sv' } = req.query;

    if (!topic || !level) {
      return res.status(400).json({ error: 'Missing topic or level' });
    }

    const seed = `${topic}-${level}-${Date.now()}`;
    const lvl = Number(level);
    const lg = lang as 'sv' | 'en';
    const multiplier = 1;

    let qData;
    let tolerance = 0; // Default: Exact match required

    // Select Generator
    switch (topic) {
      case 'volume':
        qData = VolumeGenerator.generate(lvl, seed, lg, multiplier);
        tolerance = 1.0; // Allow +/- 1.0 for rounding differences in PI
        break;
        
      case 'equation':
      case 'problem':
        if (lvl === 5 && topic === 'equation') {
             qData = LinearEquationProblemGen.generate(5, seed, lg);
        } else if (lvl === 6) {
             qData = LinearEquationGenerator.generate(6, seed, lg, multiplier);
        } else {
             qData = LinearEquationGenerator.generate(lvl, seed, lg, multiplier);
        }
        break;
        
      case 'geometry':
        qData = GeometryGenerator.generate(lvl, seed, lg, multiplier);
        break;
        
      case 'graph':
        qData = LinearGraphGenerator.generate(lvl, seed, lg);
        break;
        
      case 'simplify':
        qData = ExpressionSimplificationGen.generate(lvl, seed, lg, multiplier);
        break;
        
      case 'scale':
      default:
        qData = ScaleGenerator.generate(lvl, seed, lg, multiplier);
        break;
    }

    if (!qData || !qData.serverData) {
      throw new Error(`Generator for topic '${topic}' failed to return data.`);
    }

    // Token Generation (Encryption)
    // pass the raw answer (string or number) and the tolerance
    const token = generateToken(qData.questionId, qData.serverData.answer, tolerance);
    
    return res.status(200).json({
      questionId: qData.questionId,
      renderData: qData.renderData,
      clues: qData.serverData.solutionSteps,
      token: token
    });

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}