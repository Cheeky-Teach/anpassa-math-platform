import type { VercelRequest, VercelResponse } from '@vercel/node';

// --- Generators ---
import { BasicArithmeticGen } from '../src/core/generators/BasicArithmeticGen';
import { NegativeNumbersGen } from '../src/core/generators/NegativeNumbersGen';
import { TenPowersGenerator } from '../src/core/generators/TenPowersGen';
import { ExpressionSimplificationGen } from '../src/core/generators/ExpressionSimplificationGen';
import { LinearEquationGenerator } from '../src/core/generators/LinearEquationGen';
import { LinearEquationProblemGen } from '../src/core/generators/LinearEquationProblemGen';
import { GeometryGenerator } from '../src/core/generators/GeometryGenerator';
import { ScaleGenerator } from '../src/core/generators/ScaleGenerator';
import { VolumeGenerator } from '../src/core/generators/VolumeGenerator';
import { SimilarityGenerator } from '../src/core/generators/SimilarityGenerator';
import { LinearGraphGenerator } from '../src/core/generators/LinearGraphGenerator';

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
    
    const lvl = parseInt(Array.isArray(level) ? level[0] : level) || 1;
    const language = (Array.isArray(lang) ? lang[0] : lang) || 'sv';
    const topicKey = Array.isArray(topic) ? topic[0] : topic;

    if (!topicKey) {
      return res.status(400).json({ error: "Missing 'topic' parameter" });
    }

    let question: any; 
    const seed = Math.random().toString(36).substring(7);

    // --- Static Router ---
    // Calls static methods directly: Generator.generate(...)
    switch (topicKey) {
      // Arithmetic
      case 'arithmetic': 
        question = BasicArithmeticGen.generate(lvl, seed, language); 
        break;
      case 'negative': 
        question = NegativeNumbersGen.generate(lvl, seed, language); 
        break;
      case 'ten_powers': 
        question = TenPowersGenerator.generate(lvl, seed, language); 
        break;
      
      // Algebra
      case 'simplify': 
        question = ExpressionSimplificationGen.generate(lvl, seed, language); 
        break;
      case 'equation': 
        // Route Word Problems (Lvl 5 & 6) to Problem Gen
        if (lvl === 5 || lvl === 6) {
            question = LinearEquationProblemGen.generate(lvl, seed, language);
        } else {
            question = LinearEquationGenerator.generate(lvl, seed, language);
        }
        break;

      // Geometry
      case 'geometry': 
        question = GeometryGenerator.generate(lvl, seed, language); 
        break;
      case 'scale': 
        question = ScaleGenerator.generate(lvl, seed, language); 
        break;
      case 'volume': 
        question = VolumeGenerator.generate(lvl, seed, language); 
        break;
      case 'similarity': 
        question = SimilarityGenerator.generate(lvl, seed, language); 
        break;

      // Functions
      case 'graph': 
        question = LinearGraphGenerator.generate(lvl, seed, language); 
        break;

      default:
        return res.status(404).json({ error: `Generator not found for topic: ${topicKey}` });
    }

    if (!question) {
        throw new Error("Generator returned null");
    }

    // Create Token (Base64)
    const tokenPayload = JSON.stringify({
      a: question.serverData ? question.serverData.answer : question.answer,
      t: Date.now()
    });
    const token = Buffer.from(tokenPayload).toString('base64');

    const response: QuestionResponse = {
      text: question.text,
      visual: question.visual,
      renderData: question.renderData,
      clues: question.serverData ? question.serverData.solutionSteps : question.clues,
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