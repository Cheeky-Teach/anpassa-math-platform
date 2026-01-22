import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateToken } from '../src/core/utils/security';

// IMPORTS
import { ScaleGenerator } from '../src/core/generators/ScaleGenerator';
import { GeometryGenerator } from '../src/core/generators/GeometryGenerator';
import { LinearGraphGenerator } from '../src/core/generators/LinearGraphGenerator';
import { LinearEquationGenerator } from '../src/core/generators/LinearEquationGen';
import { ExpressionSimplificationGen } from '../src/core/generators/ExpressionSimplificationGen';
import { LinearEquationProblemGen } from '../src/core/generators/LinearEquationProblemGen';
import { VolumeGenerator } from '../src/core/generators/VolumeGenerator'; // Added

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { topic = 'scale', level = '1', lang = 'sv' } = req.query;
    const seed = Math.random().toString(36).substring(7);
    const lvl = Number(level) || 1;
    const lg = (lang === 'en' ? 'en' : 'sv');
    const multiplier = 1;

    let qData;

    switch(topic) {
      case 'equation':
        if (lvl === 5) {
            qData = LinearEquationProblemGen.generate(lvl, seed, lg);
        } else if (lvl === 6) {
             qData = LinearEquationGenerator.generate(6, seed, lg, multiplier);
        } else {
            qData = LinearEquationGenerator.generate(lvl, seed, lg, multiplier);
        }
        break;
        
      case 'geometry':
        qData = GeometryGenerator.generate(lvl, seed, lg, multiplier);
        break;
      case 'volume': // Added
        qData = VolumeGenerator.generate(lvl, seed, lg, multiplier);
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
    const token = generateToken(qData.questionId, tokenAnswer);
    
    return res.status(200).json({
      questionId: qData.questionId,
      renderData: qData.renderData,
      clues: qData.serverData.solutionSteps,
      token: token
    });

  } catch (error: any) {
    console.error("API Error in /api/question:", error);
    return res.status(500).json({ 
        error: 'Failed to generate question', 
        details: error.message 
    });
  }
}