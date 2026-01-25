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
import { SimilarityGenerator } from '../src/core/generators/SimilarityGenerator';
import { BasicArithmeticGen } from '../src/core/generators/BasicArithmeticGen';
import { NegativeNumbersGen } from '../src/core/generators/NegativeNumbersGen';
import { TenPowersGenerator } from '../src/core/generators/TenPowersGen'; // Added

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
    return String(answer);
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { topic, level, lang = 'sv', seed = Date.now().toString() } = req.query;

    if (!topic || !level) {
      return res.status(400).json({ error: 'Missing topic or level' });
    }

    const lvl = parseInt(level as string, 10);
    const lg = lang as 'sv' | 'en';
    
    // Multiplier for difficulty scaling (optional usage in generators)
    const multiplier = Math.max(1, Math.ceil(lvl / 3)); 

    let qData;
    let tolerance = 0; 

    switch (topic) {
      case 'arithmetic':
        qData = BasicArithmeticGen.generate(lvl, seed as string, lg, multiplier);
        break;
        
      case 'negative':
        qData = NegativeNumbersGen.generate(lvl, seed as string, lg, multiplier);
        break;

      case 'ten_powers': // Added Case
        qData = TenPowersGenerator.generate(lvl, seed as string, lg, multiplier);
        break;

      case 'equation':
        if (lvl === 5 || lvl === 6) {
             qData = LinearEquationProblemGen.generate(lvl, seed as string, lg, multiplier);
        } else if (lvl === 7) {
             // Mixed equations including word problems
             if (Math.random() > 0.5) qData = LinearEquationProblemGen.generate(6, seed as string, lg, multiplier);
             else qData = LinearEquationGenerator.generate(7, seed as string, lg, multiplier);
        } else {
             qData = LinearEquationGenerator.generate(lvl, seed as string, lg, multiplier);
        }
        break;
        
      case 'geometry':
        qData = GeometryGenerator.generate(lvl, seed as string, lg, multiplier);
        tolerance = 0.5; 
        break;
        
      case 'graph':
        qData = LinearGraphGenerator.generate(lvl, seed as string, lg);
        break;
        
      case 'simplify':
        qData = ExpressionSimplificationGen.generate(lvl, seed as string, lg, multiplier);
        break;
        
      case 'volume':
        qData = VolumeGenerator.generate(lvl, seed as string, lg, multiplier);
        tolerance = 0.5;
        break;

      case 'similarity':
        qData = SimilarityGenerator.generate(lvl, seed as string, lg, multiplier);
        tolerance = 0.1;
        break;

      case 'scale':
      default:
        qData = ScaleGenerator.generate(lvl, seed as string, lg, multiplier);
        break;
    }

    if (!qData || !qData.serverData) {
      throw new Error(`Generator for topic '${topic}' failed to return data.`);
    }

    const tokenAnswer = formatAnswerForToken(qData.serverData.answer);
    const token = generateToken(qData.questionId, tokenAnswer, tolerance);
    
    return res.status(200).json({
      questionId: qData.questionId,
      renderData: qData.renderData,
      clues: qData.serverData.solutionSteps,
      token: token,
      attempts: 0
    });

  } catch (error) {
    console.error('Generator Error:', error);
    return res.status(500).json({ error: 'Failed to generate question' });
  }
}