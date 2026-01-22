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
    const multiplier = 1; // Can be dynamic later

    let qData;
    let tolerance = 0; // Default: Exact match required

    switch (topic) {
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
      
      case 'volume':
        qData = VolumeGenerator.generate(lvl, seed, lg, multiplier);
        tolerance = 1; // +/- 1.0 forgiveness for PI rounding differences
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

    const tokenAnswer = formatAnswerForToken(qData.serverData.answer);
    
    // Pass tolerance to the token generator
    const token = generateToken(qData.questionId, tokenAnswer, tolerance);
    
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