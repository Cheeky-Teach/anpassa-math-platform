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
  'equations': LinearEquationGen,
  'linearEquations': LinearEquationGen,
  'linear_equations': LinearEquationGen,
  'linear-equations': LinearEquationGen,
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

/**
 * Fast taxonomy helper to locate a variation's metadata config
 */
function findVariationConfig(variationKey: string): any {
  if (!variationKey) return null;
  for (const catKey in SKILL_BUCKETS) {
    const cat = (SKILL_BUCKETS as any)[catKey];
    if (cat && typeof cat === 'object' && cat.topics) {
      for (const topicKey in cat.topics) {
        const topicObj = cat.topics[topicKey];
        if (topicObj && Array.isArray(topicObj.variations)) {
          const matched = topicObj.variations.find((v: any) => v && v.key === String(variationKey));
          if (matched) return matched;
        }
      }
    }
  }
  return null;
}

/**
 * Extracts all variations registered under a topic key
 */
function getTopicVariations(topicKey: string): any[] {
  for (const catKey in SKILL_BUCKETS) {
    const cat = (SKILL_BUCKETS as any)[catKey];
    if (cat && typeof cat === 'object' && cat.topics && cat.topics[topicKey]) {
      return cat.topics[topicKey].variations || [];
    }
  }
  return [];
}

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

    // 2. Generation Loop
    for (const item of requests) {
      const { topic, variation, level, lang, wordProblem } = item;
      const safeLevel = Number(level) || 1;
      const safeLang = String(lang || 'sv');
      
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
        let questionData: any = null;
        const activateWordProblem = (wordProblem === true || wordProblem === 'true');

        // Locate topic variations to pre-filter word-problem-ready candidates
        const allTopicVariations = getTopicVariations(topic);
        const wpEligibleVariations = allTopicVariations.filter(
          (v: any) => v.tags?.includes('word_problem_ready') && (v.level === undefined || Number(v.level) === safeLevel)
        );

        // 🟢 1. SYNCHRONOUS RETRY LOOP FOR WORD PROBLEMS
        if (activateWordProblem) {
          const MAX_ATTEMPTS = 8;

          for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            let candidate: any = null;

            // Prefer an eligible variation at this level if no explicit variation was passed
            let targetVariation = variation;
            if (!targetVariation && wpEligibleVariations.length > 0) {
              const picked = wpEligibleVariations[attempt % wpEligibleVariations.length];
              targetVariation = picked.key;
            }

            if (targetVariation && typeof generator.generateByVariation === 'function') {
              candidate = generator.generateByVariation(String(targetVariation), safeLang);
            } else if (typeof generator.generate === 'function') {
              candidate = generator.generate(safeLevel, safeLang);
            }

            if (!candidate) continue;

            const activeKey = targetVariation || candidate.variationKey;
            const config = findVariationConfig(activeKey);

            if (config && config.tags?.includes('word_problem_ready')) {
              const transformed = WordProblemInterceptor.process(candidate, config, safeLang);
              
              // Validate that a non-empty story description was actually formed
              const desc = transformed?.renderData?.description;
              const hasValidText = typeof desc === 'string' 
                ? desc.trim().length > 0 
                : Boolean(desc && (desc.sv || desc.en));

              if (transformed?.metadata?.isWordProblemApplied === true && hasValidText) {
                questionData = transformed;
                break;
              }
            }
          }

          if (!questionData) {
            console.warn(`[Batch WordProblem fallback to pure math for ${topic} level ${safeLevel}]`);
          }
        }

        // 🟢 2. STANDARD FALLBACK GENERATION
        if (!questionData) {
          if (variation && typeof generator.generateByVariation === 'function') {
            questionData = generator.generateByVariation(String(variation), safeLang);
          } else if (typeof generator.generate === 'function') {
            questionData = generator.generate(safeLevel, safeLang);
          }
        }

        if (!questionData) {
          throw new Error(`Generator returned null for topic ${topic}`);
        }

        const rawRenderData = questionData.renderData || {};
        const isWP = Boolean(
          questionData.metadata?.isWordProblemApplied || 
          rawRenderData.isWordProblemApplied
        );

        // 🟢 3. PREVENT EMPTY BOX: Ensure valid description text exists
        let finalDescription = rawRenderData.description;
        if (!finalDescription || (typeof finalDescription === 'string' && !finalDescription.trim())) {
          finalDescription = isWP
            ? (safeLang === 'en' ? "Solve the following problem:" : "Lös följande uppgift:")
            : (safeLang === 'en' ? "Calculate:" : "Beräkna:");
        }

        const activeVariation = variation || questionData?.variationKey;
        const answerVal = questionData.answer || rawRenderData.answer || null;

        // 🟢 4. FORMATTED RESPONSE OBJECT
        questions.push({
          id: `q-${globalIndex}-${Date.now()}`,
          number: globalIndex,
          topic_id: topic,
          variation_key: activeVariation || 'generic',
          is_generated: true,
          answer: answerVal,
          resolvedData: {
            renderData: {
              ...rawRenderData,
              description: finalDescription,
              latex: rawRenderData.latex || '',
              answer: answerVal,
              isWordProblemApplied: isWP
            },
            token: questionData.token || null,
            clues: Array.isArray(questionData.clues) ? questionData.clues : [],
            level: questionData.level || safeLevel,
            answer: answerVal
          }
        });
        
        globalIndex++;

      } catch (genError: any) {
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