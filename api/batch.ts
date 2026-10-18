import type { VercelRequest, VercelResponse } from '@vercel/node';

// IMPORTS
import { BasicArithmeticGen } from './lib/core/generators/BasicArithmeticGen.js';
import { NegativeNumbersGen } from './lib/core/generators/NegativeNumbersGen.js';
import { TenPowersGen } from './lib/core/generators/TenPowersGen.js';
import { ExponentsGen } from './lib/core/generators/ExponentsGen.js';
import { PercentGen } from './lib/core/generators/PercentGen.js';
import { ExpressionSimplificationGen } from './lib/core/generators/ExpressionSimplificationGen.js';
import { LinearEquationGen } from './lib/core/generators/LinearEquationGen.js';
import { LinearEquationProblemGen } from './lib/core/generators/LinearEquationProblemGen.js';
import { LinearGraphGenerator } from './lib/core/generators/LinearGraphGenerator.js';
import { GeometryGenerator } from './lib/core/generators/GeometryGenerator.js';
import { ScaleGen } from './lib/core/generators/ScaleGen.js';
import { VolumeGen } from './lib/core/generators/VolumeGen.js';
import { SimilarityGen } from './lib/core/generators/SimilarityGen.js';
import { PythagorasGen } from './lib/core/generators/PythagorasGen.js';
import { ProbabilityGen } from './lib/core/generators/ProbabilityGen.js';
import { StatisticsGen } from './lib/core/generators/StatisticsGen.js';
import { FractionBasicsGen } from './lib/core/generators/FractionBasicsGen.js';
import { FractionArithGen } from './lib/core/generators/FractionArithGen.js';
import { ChangeFactorGen } from './lib/core/generators/ChangeFactorGen.js';
import { AnglesGen } from './lib/core/generators/AnglesGen.js';
import { PatternsGen } from './lib/core/generators/PatternsGen.js';
import { OrderOperationsGen } from './lib/core/generators/OrderOperationsGen.js';
import { UnitConversionGen } from './lib/core/generators/UnitConversionGen.js';
import { AlgebraicGeometryGenerator } from './lib/core/generators/AlgebraicGeometryGenerator.js';
import { PlaceValueGen } from './lib/core/generators/PlaceValueGen.js';
import { WordProblemInterceptor } from './lib/core/utils/WordProblemInterceptor.js';
import { SKILL_BUCKETS } from '../src/constants/skillBuckets.js';

// COMPLETE TOPIC MAP (Aligned with skillBuckets.js)
const TopicMap: Record<string, any> = {
  // Algebra & Patterns
  'equation': LinearEquationGen,
  'equations': LinearEquationGen,
  'equations_word': LinearEquationGen, // Delegated internally
  'algebra': LinearEquationGen,
  'expressions': ExpressionSimplificationGen,
  'simplify': ExpressionSimplificationGen,
  'expression_simplification': ExpressionSimplificationGen,
  'patterns': PatternsGen,
  'graphs': LinearGraphGenerator,
  'algebraic_geometry': AlgebraicGeometryGenerator,

  // Arithmetic
  'basic_arithmetic': BasicArithmeticGen,
  'place_value': PlaceValueGen,
  'arithmetic': BasicArithmeticGen,
  'negatives': NegativeNumbersGen,
  'negative': NegativeNumbersGen,
  'fractions_basics': FractionBasicsGen,
  'fraction_basics': FractionBasicsGen,
  'fraction_arith': FractionArithGen,
  'percent': PercentGen,
  'change_factor': ChangeFactorGen,
  'exponents': ExponentsGen,
  'ten_powers': TenPowersGen,
  'order_of_operations': OrderOperationsGen,

  // Geometry
  'geometry': GeometryGenerator,
  'angles': AnglesGen,
  'pythagoras': PythagorasGen,
  'scale': ScaleGen,
  'similarity': SimilarityGen,
  'volume': VolumeGen,
  'unit_conversion': UnitConversionGen,

  // Data
  'statistics': StatisticsGen,
  'probability': ProbabilityGen
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. CORS & Preflight
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // SECURITY: Strict Method Enforcement
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
    }

    const { requests } = body; 

    if (!requests || !Array.isArray(requests)) {
      return res.status(400).json({ error: 'Missing or invalid "requests" array in payload' });
    }

    const questions: any[] = [];
    let globalIndex = 1;

    // 3. Generation Loop
    for (const item of requests) {
      const { topic, variation, level, lang, wordProblem } = item;
      
      const GeneratorClass = TopicMap[topic];

      if (!GeneratorClass) {
        questions.push({
          id: `err-${globalIndex}`,
          text: `Error: Generator for topic '${topic}' not found.`,
          type: "error"
        });
        globalIndex++;
        continue;
      }

      const generator = new GeneratorClass();

      try {
        let questionData;
        
        if (variation && typeof generator.generateByVariation === 'function') {
          questionData = generator.generateByVariation(variation, lang);
        } else {
          questionData = generator.generate(level || 1, lang);
        }

        // WORD PROBLEM INTERCEPTOR
        const activateWordProblem = (wordProblem === true || wordProblem === 'true');
        const activeVariation = variation || questionData?.variationKey;

        if (activateWordProblem && activeVariation) {
            let foundVariationConfig = null;

            for (const catKey in SKILL_BUCKETS) {
                const category = (SKILL_BUCKETS as any)[catKey];
                if (category && typeof category === 'object' && category.topics) {
                    for (const topicKey in category.topics) {
                        const topicObj = category.topics[topicKey];
                        if (topicObj && topicObj.variations && Array.isArray(topicObj.variations)) {
                            const matchedVariant = topicObj.variations.find((v: any) => v && v.key === String(activeVariation));
                            if (matchedVariant) {
                                foundVariationConfig = matchedVariant;
                                break;
                            }
                        }
                    }
                }
                if (foundVariationConfig) break;
            }

            if (foundVariationConfig) {
                questionData = WordProblemInterceptor.process(questionData, foundVariationConfig, String(lang || 'sv'));
            }
        }


        // SECURITY: Payload Scrubbing
        // We explicitly whitelists the properties to return.
        // By NOT spreading (...questionData), we ensure the raw 'answer' property 
        // is never exposed to the student's browser/Network Tab.
        // Locate your questions.push configuration block inside api/batch.ts
        questions.push({
          id: `q-${globalIndex}-${Date.now()}`,
          number: globalIndex,
          topic_id: topic,
          variation_key: activeVariation || 'generic',
          is_generated: true,
          resolvedData: {
            renderData: {
                ...questionData.renderData,
                
                // 🟢 FIX: Read from questionData.metadata or questionData.metadata (handles both paths!)
                isWordProblemApplied: questionData.metadata?.isWordProblemApplied || 
                                      questionData.renderData?.isWordProblemApplied || 
                                      false
            },
            token: questionData.token,           
            clues: questionData.clues,           
            level: questionData.level || level   
          }
        });
        
        globalIndex++;

      } catch (genError) {
        console.error(`Generation error for ${topic}/${variation}:`, genError);
        questions.push({
          id: `err-${globalIndex}`,
          text: `Error generating question for ${topic}.`,
          meta: { error: true }
        });
        globalIndex++;
      }
    }

    return res.status(200).json(questions);

  } catch (error: any) {
    console.error("Critical Batch API Error:", error);
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      details: error.message 
    });
  }
}