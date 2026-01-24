import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ScaleGenerator } from '../src/core/generators/ScaleGenerator';
import { GeometryGenerator } from '../src/core/generators/GeometryGenerator';
import { LinearGraphGenerator } from '../src/core/generators/LinearGraphGenerator';
import { LinearEquationGenerator } from '../src/core/generators/LinearEquationGen';
// Remove static import that might cause crash if file is missing/broken
// import { LinearEquationProblemGen } from '../src/core/generators/LinearEquationProblemGen';
import { ExpressionSimplificationGen } from '../src/core/generators/ExpressionSimplificationGen';
import { VolumeGenerator } from '../src/core/generators/VolumeGenerator';
import { BasicArithmeticGen } from '../src/core/generators/BasicArithmeticGen';
import { NegativeNumbersGen } from '../src/core/generators/NegativeNumbersGen';

// Helper to format answers for display
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
        return answer !== undefined && answer !== null ? answer.toString() : "?";
    } catch (e) {
        return "?";
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

      let requests;
      try {
        requests = JSON.parse(config); // Array of { topic, level, count }
      } catch (e) {
        return res.status(400).json({ error: "Invalid config JSON" });
      }

      const generatedQuestions: any[] = [];

      for (const reqItem of requests) {
          const { topic, level, count } = reqItem;
          const lvl = Number(level);
          
          for (let i = 0; i < count; i++) {
              const seed = `${topic}-${lvl}-${Date.now()}-${i}-${Math.random()}`;
              let qData = null;

              try {
                  switch (topic) {
                      case 'arithmetic': qData = BasicArithmeticGen.generate(lvl, seed, lang as any); break;
                      case 'negative': qData = NegativeNumbersGen.generate(lvl, seed, lang as any); break;
                      case 'equation':
                            // Correctly route Word Problems (Level 5 & 6) to the Problem Generator
                            if (lvl === 5 || lvl === 6) {
                                try {
                                    // Dynamic import to prevent top-level crashes if file is missing/broken
                                    const module = await import('../src/core/generators/LinearEquationProblemGen');
                                    if (module && module.LinearEquationProblemGen) {
                                        qData = module.LinearEquationProblemGen.generate(lvl, seed, lang as any);
                                    } else {
                                        throw new Error("Module loaded but LinearEquationProblemGen export missing");
                                    }
                                } catch (err) {
                                    console.error("Failed to load LinearEquationProblemGen:", err);
                                    // Fallback to standard generator so the user sees SOMETHING
                                    qData = LinearEquationGenerator.generate(lvl, seed, lang as any);
                                }
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