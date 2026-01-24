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

// Helper to format answers for display in the grid
function formatAnswer(answer: any): string {
    try {
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
        return String(answer);
    } catch (e) {
        return String(answer);
    }
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
      const { config, lang = 'sv' } = req.body;

      // Config is an array of { topic, level, count }
      // We generate deterministic questions based on a seed we create here
      
      const generatedQuestions: any[] = [];
      const timestamp = Date.now();

      if (Array.isArray(config)) {
          for (const item of config) {
              const { topic, level } = item;
              // Generate a stable seed for this specific slot in the batch
              // In a real "Do Now", we might want 1-3 questions per config item
              const seed = `batch-${timestamp}-${topic}-${level}`;
              const lvl = Number(level);

              try {
                  let qData: any = null;

                  switch (topic) {
                      case 'arithmetic': qData = BasicArithmeticGen.generate(lvl, seed, lang as any); break;
                      case 'negative': qData = NegativeNumbersGen.generate(lvl, seed, lang as any); break;
                      case 'equation': 
                          // FIXED: Route Level 5 (Word Problems) to the correct generator
                          if (lvl === 5) {
                              qData = LinearEquationProblemGen.generate(lvl, seed, lang as any);
                          } else {
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
              } catch (genError) {
                  console.error(`Error generating question for ${topic} level ${lvl}:`, genError);
                  // Push an error placeholder so the batch doesn't fail completely
                  generatedQuestions.push({
                      renderData: { question: "Error generating question", text: "Please try again." },
                      displayAnswer: "Error",
                      topic: topic,
                      level: lvl
                  });
              }
          }
      }

      return res.status(200).json({ questions: generatedQuestions });

  } catch (e) {
      console.error("Batch generation fatal error:", e);
      return res.status(500).json({ error: "Generation failed" });
  }
}