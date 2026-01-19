import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateToken } from '../src/core/utils/security';

// IMPORTS: Must match the exact filenames provided in the upload list
import { ScaleGenerator } from '../src/core/generators/ScaleGenerator';
import { GeometryGenerator } from '../src/core/generators/GeometryGenerator';
import { LinearGraphGenerator } from '../src/core/generators/LinearGraphGenerator';

// Note: Filename is 'LinearEquationGen.ts', Class is 'LinearEquationGenerator'
import { LinearEquationGenerator } from '../src/core/generators/LinearEquationGen';

// Note: Filename is 'ExpressionSimplificationGen.ts', Class is 'ExpressionSimplificationGen'
import { ExpressionSimplificationGen } from '../src/core/generators/ExpressionSimplificationGen';

/**
 * Normalizes complex answer objects (like {k,m} or {left,right}) into a string
 * that can be hashed for the security token.
 */
function formatAnswerForToken(answer: any): string | number {
    if (typeof answer === 'object' && answer !== null) {
        // 1. Handle Linear Functions { k, m } (Graphing & Simplification)
        if ('k' in answer && 'm' in answer) {
            const { k, m } = answer;
            // Normalize "1x" to "x" and handle zero/negatives for consistent strings
            // This format must match what the client sends or what verifyAnswer expects
            // For simplicity, we stick to the generator's standard representation
            const mStr = m >= 0 ? `+ ${m}` : `- ${Math.abs(m)}`;
            return `${k}x ${mStr}`; 
        }
        
        // 2. Handle Scale Ratios { left, right } (Scale Generator Level 3)
        if ('left' in answer && 'right' in answer) {
            return `${answer.left}:${answer.right}`; 
        }
        
        // Fallback for other objects
        return JSON.stringify(answer);
    }
    return answer;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 1. Parse Query Parameters
    const { topic = 'scale', level = '1', lang = 'sv' } = req.query;
    
    // 2. Setup Generator Arguments
    const seed = Math.random().toString(36).substring(7);
    const lvl = Number(level) || 1;
    const lg = (lang === 'en' ? 'en' : 'sv');
    const multiplier = 1; // Default multiplier for scaling values

    let qData;

    // 3. Dispatch to Correct Generator
    switch(topic) {
      case 'equation':
        qData = LinearEquationGenerator.generate(lvl, seed, lg, multiplier);
        break;
      case 'geometry':
        qData = GeometryGenerator.generate(lvl, seed, lg, multiplier);
        break;
      case 'graph':
        // LinearGraphGenerator might not expect 'multiplier' in all versions, 
        // but passing it as an extra argument is safe in JS/TS if ignored.
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

    // 4. Prepare Security Token
    // We must convert objects (like {k:2, m:3}) into a verifiable string/number
    const tokenAnswer = formatAnswerForToken(qData.serverData.answer);
    const token = generateToken(qData.questionId, tokenAnswer);
    
    // 5. Send Response
    return res.status(200).json({
      questionId: qData.questionId,
      renderData: qData.renderData,
      clues: qData.serverData.solutionSteps,
      token: token
    });

  } catch (error: any) {
    console.error("API Error in /api/question:", error);
    // Return 500 so frontend catches it and shows "Could not load"
    return res.status(500).json({ 
        error: 'Failed to generate question', 
        details: error.message 
    });
  }
}