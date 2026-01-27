import type { VercelRequest, VercelResponse } from '@vercel/node';
import { BasicArithmeticGen } from '../src/core/generators/BasicArithmeticGen';
import { LinearEquationGen } from '../src/core/generators/LinearEquationGen';
import { LinearEquationProblemGen } from '../src/core/generators/LinearEquationProblemGen';
import { GeometryGenerator } from '../src/core/generators/GeometryGenerator';
import { SimilarityGenerator } from '../src/core/generators/SimilarityGenerator';
import { ExpressionSimplificationGen } from '../src/core/generators/ExpressionSimplificationGen';
import { TenPowersGen } from '../src/core/generators/TenPowersGen';
import { NegativeNumbersGen } from '../src/core/generators/NegativeNumbersGen';
import { LinearGraphGenerator } from '../src/core/generators/LinearGraphGenerator';
// Ensure these exist in the file system before importing, 
// otherwise this file will fail to build. 
// Assuming ScaleGenerator and VolumeGenerator exist based on project context.
import { ScaleGenerator } from '../src/core/generators/ScaleGenerator';
import { VolumeGenerator } from '../src/core/generators/VolumeGenerator';

// --- Generator Registry ---
// Maps topic IDs (from dashboard) to their respective classes.
// These keys MUST match the 'topics' object in src/core/utils/i18n.ts
const GENERATORS: Record<string, any> = {
  'arithmetic': BasicArithmeticGen,
  'linear_eq': LinearEquationGen,
  'linear_eq_prob': LinearEquationProblemGen,
  'geometry': GeometryGenerator,
  'similarity': SimilarityGenerator,
  'simplification': ExpressionSimplificationGen,
  'ten_powers': TenPowersGen,
  'negative': NegativeNumbersGen,
  'linear_graph': LinearGraphGenerator,
  'scale': ScaleGenerator,
  'volume': VolumeGenerator
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  // --- CORS Configuration ---
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // --- Request Validation ---
  const { topic, difficulty } = req.query;

  if (!topic) {
    return res.status(400).json({ error: 'Missing required parameter: topic' });
  }

  const topicKey = topic as string;

  if (!GENERATORS[topicKey]) {
    // Return available topics to help with debugging frontend configuration
    return res.status(404).json({ 
      error: `Topic '${topicKey}' not found.`,
      availableTopics: Object.keys(GENERATORS) 
    });
  }

  // --- Question Generation ---
  try {
    // Default to difficulty 1 if not provided or invalid
    const diffLevel = difficulty ? Math.max(1, Math.min(3, parseInt(difficulty as string))) : 1;
    
    const GeneratorClass = GENERATORS[topicKey];
    
    // Support both static methods (preferred) and class instances (legacy)
    let question;
    
    if (typeof GeneratorClass.getQuestion === 'function') {
        question = GeneratorClass.getQuestion(diffLevel);
    } else {
        const instance = new GeneratorClass();
        question = instance.getQuestion(diffLevel);
    }

    // --- Response ---
    return res.status(200).json(question);

  } catch (error: any) {
    console.error(`[API Error] Failed to generate question for topic: ${topicKey}`, error);
    
    return res.status(500).json({ 
        error: 'Internal Server Error during question generation.', 
        message: error.message,
        topic: topicKey
    });
  }
}