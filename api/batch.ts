import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ScaleGenerator } from '../src/core/generators/ScaleGenerator';
import { GeometryGenerator } from '../src/core/generators/GeometryGenerator';
import { LinearGraphGenerator } from '../src/core/generators/LinearGraphGenerator';
import { LinearEquationGenerator } from '../src/core/generators/LinearEquationGen';
import { LinearEquationProblemGen } from '../src/core/generators/LinearEquationProblemGen';
import { ExpressionSimplificationGen } from '../src/core/generators/ExpressionSimplificationGen';
import { VolumeGenerator } from '../src/core/generators/VolumeGenerator';
import { BasicArithmeticGen } from '../src/core/generators/BasicArithmeticGen';
import { NegativeNumbersGen } from '../src/core/generators/NegativeNumbersGen';

// Helper to format answers for display
function formatAnswer(answer: any): string {
    if (typeof answer === 'object' && answer !== null) {
        if ('k' in answer && 'm' in answer) {
            const { k, m } = answer;
            const mStr = m >= 0 ? `+ ${m}` : `- ${Math.abs(m)}`;
            return `y = ${k}x ${mStr}`; 
        }
        if ('left' in answer && 'right' in answer) {
            return `${answer.left}:${answer.right}`; 
        }
        return JSON.stringify(answer);
    }
    return answer.toString();
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
      // Parse query params
      const { config, lang = 'sv' } = req.query as { config: string, lang: string };
      
      if (!config) {
          return res.status(400).json({ error: "Missing config" });
      }

      const requests = JSON.parse(config); // Array of { topic, level, count }
      const generatedQuestions: any[] = [];

      for (const reqItem of requests) {
          const { topic, level, count } = reqItem;
          const lvl = Number(level);
          
          for (let i = 0; i < count; i++) {
              const seed = `${topic}-${lvl}-${Date.now()}-${i}-${Math.random()}`;
              let qData = null;

              switch (topic) {
                  case 'arithmetic': qData = BasicArithmeticGen.generate(lvl, seed, lang as any); break;
                  case 'negative': qData = NegativeNumbersGen.generate(lvl, seed, lang as any); break;
                  case 'equation':
                        // Correctly route Word Problems (Level 5 & 6) to the Problem Generator
                        if (lvl === 5 || lvl === 6) {
                            qData = LinearEquationProblemGen.generate(lvl, seed, lang as any);
                        } else {
                            // Standard equations (Level 1-4, 7)
                            qData = LinearEquationGenerator.generate(lvl, seed, lang as any);
                        }
                        break;
                  case 'geometry': qData = GeometryGenerator.generate(lvl, seed, lang as any); break;
                  case 'volume': qData = VolumeGenerator.generate(lvl, seed, lang as any); break;
                  case 'graph': qData = LinearGraphGenerator.generate(lvl, seed, lang as any); break;
                  case 'simplify': qData = ExpressionSimplificationGen.generate(lvl, seed, lang as any); break;
                  default: qData = ScaleGenerator.generate(lvl, seed, lang as any); break;
              }

              if (qData) {
                  generatedQuestions.push({
                      renderData: qData.renderData,
                      displayAnswer: formatAnswer(qData.serverData.answer),
                      topic: topic,
                      level: lvl
                  });
              }
          }
      }

      return res.status(200).json({ questions: generatedQuestions });

  } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Generation failed" });
  }
}