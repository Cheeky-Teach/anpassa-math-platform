import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ScaleGenerator } from '../src/core/generators/ScaleGenerator';
import { GeometryGenerator } from '../src/core/generators/GeometryGenerator';
import { LinearGraphGenerator } from '../src/core/generators/LinearGraphGenerator';
import { LinearEquationGenerator } from '../src/core/generators/LinearEquationGen';
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
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { configs } = req.body; 
  // configs expected format: [{ topic: 'arithmetic', level: 1 }, { topic: 'geometry', level: 2 }]

  if (!configs || !Array.isArray(configs) || configs.length === 0) {
      return res.status(400).json({ error: "Invalid config" });
  }

  const generatedQuestions = [];
  
  // Logic: 
  // 1 config -> 6 questions
  // 2 configs -> 3 questions each
  // 3 configs -> 2 questions each
  const totalSlots = 6;
  const countPerConfig = Math.floor(totalSlots / configs.length);

  try {
      for (const config of configs) {
          for (let i = 0; i < countPerConfig; i++) {
              const seed = `${Date.now()}-${Math.random()}`;
              const lang = 'sv'; // Default for Do Now
              const lvl = config.level;
              const topic = config.topic;
              
              let qData;

              switch (topic) {
                  case 'arithmetic': qData = BasicArithmeticGen.generate(lvl, seed, lang); break;
                  case 'negative': qData = NegativeNumbersGen.generate(lvl, seed, lang); break;
                  case 'equation':
                        if (lvl === 5) qData = LinearEquationGenerator.generate(5, seed, lang); // Using standard generator for simplicity in batch
                        else qData = LinearEquationGenerator.generate(lvl, seed, lang);
                        break;
                  case 'geometry': qData = GeometryGenerator.generate(lvl, seed, lang); break;
                  case 'volume': qData = VolumeGenerator.generate(lvl, seed, lang); break;
                  case 'graph': qData = LinearGraphGenerator.generate(lvl, seed, lang); break;
                  case 'simplify': qData = ExpressionSimplificationGen.generate(lvl, seed, lang); break;
                  default: qData = ScaleGenerator.generate(lvl, seed, lang); break;
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