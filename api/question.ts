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

// Helper to handle object answers (like coordinates or ratios)
function formatAnswerForToken(answer: any): string | number {
    if (typeof answer === 'object' && answer !== null) {
        if ('k' in answer && 'm' in answer) {
            const { k, m } = answer;
            const mStr = m >= 0 ? `+ ${m}` : `- ${Math.abs(m)}`;
            return `${k}x ${mStr}`; 
        }
        if ('left' in answer && 'right' in answer) {
            return `${answer.left}:${answer.right}`; 
        }
        return JSON.stringify(answer);
    }
    return answer;
}

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
    const lvl = Number(level);
    const seed = Math.random().toString(36).substring(7);
    const lg = lang as 'sv' | 'en';
    const multiplier = 1; // Future difficulty scaling

    let qData: any;
    // Set tolerance for float comparisons (geometry/volume)
    let tolerance = 0;

    switch (topic) {
      case 'equation':
        if (lvl >= 5 && topic === 'equation') {
             qData = LinearEquationProblemGen.generate(5, seed, lg);
        } else if (lvl === 6) {
             qData = LinearEquationGenerator.generate(6, seed, lg, multiplier);
        } else {
             qData = LinearEquationGenerator.generate(lvl, seed, lg, multiplier);
        }
        break;
        
      case 'geometry':
        qData = GeometryGenerator.generate(lvl, seed, lg, multiplier);
        tolerance = 0.5; // Allow 0.5 error margin
        break;
        
      case 'graph':
        qData = LinearGraphGenerator.generate(lvl, seed, lg);
        break;
        
      case 'simplify':
        qData = ExpressionSimplificationGen.generate(lvl, seed, lg, multiplier);
        break;
        
      case 'volume':
        qData = VolumeGenerator.generate(lvl, seed, lg, multiplier);
        tolerance = 0.5;
        break;

      case 'scale':
      default:
        qData = ScaleGenerator.generate(lvl, seed, lg, multiplier);
        break;
    }

    if (!qData || !qData.serverData) {
      throw new Error(`Generator for topic '${topic}' failed to return data.`);
    }

    // Prepare answer for token generation (stringify complex objects)
    const tokenAnswer = formatAnswerForToken(qData.serverData.answer);
    
    // Token Generation (Encryption)
    // Now robust against non-string inputs due to fixes in security.ts and above helper
    const token = generateToken(qData.questionId, tokenAnswer, tolerance);
    
    return res.status(200).json({
      questionId: qData.questionId,
      renderData: qData.renderData,
      clues: qData.serverData.solutionSteps,
      token: token
    });
    
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}