import type { VercelRequest, VercelResponse } from '@vercel/node';

// --- Generators (STRICTLY Existing Files Only) ---
import { ScaleGenerator } from '../src/core/generators/ScaleGenerator';
import { GeometryGenerator } from '../src/core/generators/GeometryGenerator';
import { LinearGraphGenerator } from '../src/core/generators/LinearGraphGenerator';
import { LinearEquationGenerator } from '../src/core/generators/LinearEquationGen';
import { ExpressionSimplificationGen } from '../src/core/generators/ExpressionSimplificationGen';
import { LinearEquationProblemGen } from '../src/core/generators/LinearEquationProblemGen';
import { VolumeGenerator } from '../src/core/generators/VolumeGenerator';
import { BasicArithmeticGen } from '../src/core/generators/BasicArithmeticGen';
import { NegativeNumbersGen } from '../src/core/generators/NegativeNumbersGen';
import { SimilarityGenerator } from '../src/core/generators/SimilarityGenerator';
import { TenPowersGenerator } from '../src/core/generators/TenPowersGen';

// --- Interface ---
interface QuestionResponse {
  text?: string;
  visual?: any;
  renderData?: any;
  clues?: string[];
  token: string;
  error?: string;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { topic, level = '1', lang = 'sv' } = req.query;
    
    // Parse Level
    const lvl = parseInt(Array.isArray(level) ? level[0] : level) || 1;
    const language = (Array.isArray(lang) ? lang[0] : lang) || 'sv';
    const topicKey = Array.isArray(topic) ? topic[0] : topic;

    if (!topicKey) {
      return res.status(400).json({ error: "Missing 'topic' parameter" });
    }

    let generator: any; 

    // --- Router (Mapped STRICTLY to src/constants/curriculum.js) ---
    switch (topicKey) {
      // Arithmetic
      case 'arithmetic': generator = new BasicArithmeticGen(); break;
      case 'negative': generator = new NegativeNumbersGen(); break;
      case 'ten_powers': generator = new ScientificNotationGen(); break; // Mapped to ScientificNotationGen
      
      // Algebra
      case 'simplify': generator = new ExpressionSimplificationGen(); break;
      case 'equation': generator = new LinearEquationGen(); break;

      // Geometry
      case 'geometry': generator = new GeometryGenerator(); break;
      case 'scale': generator = new SimilarityGen(); break; // 'Scale' uses Similarity logic
      case 'volume': generator = new VolumeGen(); break;
      case 'similarity': generator = new SimilarityGen(); break;

      // Functions
      case 'graph': generator = new LinearGraphGenerator(); break;

      default:
        return res.status(404).json({ error: `Generator not found for topic: ${topicKey}` });
    }

    // --- Generation ---
    const question = generator.generate(lvl, language);

    // Create Token (Base64)
    const tokenPayload = JSON.stringify({
      a: question.answer,
      t: Date.now()
    });
    const token = Buffer.from(tokenPayload).toString('base64');

    const response: QuestionResponse = {
      text: question.text,
      visual: question.visual,
      renderData: question.renderData,
      clues: question.clues,
      token: token
    };

    return res.status(200).json(response);

  } catch (error: any) {
    console.error("API Error:", error);
    return res.status(500).json({ 
      error: "Internal Server Error", 
      details: error.message 
    });
  }
}