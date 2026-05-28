import { IncomingMessage, ServerResponse } from 'http';

import { WordProblemInterceptor } from '../src/core/utils/WordProblemInterceptor.js';
import { SKILL_BUCKETS } from '../src/constants/skillBuckets.js';

import { BasicArithmeticGen } from '../src/core/generators/BasicArithmeticGen.js';
import { NegativeNumbersGen } from '../src/core/generators/NegativeNumbersGen.js';
import { TenPowersGen } from '../src/core/generators/TenPowersGen.js';
import { ExponentsGen } from '../src/core/generators/ExponentsGen.js';
import { PercentGen } from '../src/core/generators/PercentGen.js';
import { ExpressionSimplificationGen } from '../src/core/generators/ExpressionSimplificationGen.js';
import { LinearEquationGen } from '../src/core/generators/LinearEquationGen.js';
import { LinearEquationProblemGen } from '../src/core/generators/LinearEquationProblemGen.js';
import { LinearGraphGenerator } from '../src/core/generators/LinearGraphGenerator.js';
import { GeometryGenerator } from '../src/core/generators/GeometryGenerator.js';
import { ScaleGen } from '../src/core/generators/ScaleGen.js';
import { VolumeGen } from '../src/core/generators/VolumeGen.js';
import { SimilarityGen } from '../src/core/generators/SimilarityGen.js';
import { PythagorasGen } from '../src/core/generators/PythagorasGen.js';
import { ProbabilityGen } from '../src/core/generators/ProbabilityGen.js';
import { StatisticsGen } from '../src/core/generators/StatisticsGen.js';
import { FractionBasicsGen } from '../src/core/generators/FractionBasicsGen.js';
import { FractionArithGen } from '../src/core/generators/FractionArithGen.js';
import { ChangeFactorGen } from '../src/core/generators/ChangeFactorGen.js';
import { AnglesGen } from '../src/core/generators/AnglesGen.js';
import { PatternsGen } from '../src/core/generators/PatternsGen.js';
import { OrderOperationsGen } from '../src/core/generators/OrderOperationsGen.js';
import { UnitConversionGen } from '../src/core/generators/UnitConversionGen.js';

interface VercelRequest extends IncomingMessage {
    query: Record<string, string | string[]>;
    body: any;
}

type VercelResponse = ServerResponse & {
    status: (statusCode: number) => VercelResponse;
    json: (data: any) => VercelResponse;
};

// --- ADAPTER: LEGACY FRACTIONS GENERATOR ---
class LegacyFractionsGen {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        if (level <= 5) return new FractionBasicsGen().generate(level, lang, options);
        return new FractionArithGen().generate(level - 5, lang, options);
    }
    public generateByVariation(key: string, lang: string): any {
         try { return new FractionBasicsGen().generateByVariation(key, lang); } 
         catch { return new FractionArithGen().generateByVariation(key, lang); }
    }
}

// --- UNIFIED TOPIC MAP ---
const TopicMap: Record<string, any> = {
  'basic_arithmetic': BasicArithmeticGen,
  'arithmetic': BasicArithmeticGen,
  'negatives': NegativeNumbersGen,
  'negative': NegativeNumbersGen,
  'fractions_basics': FractionBasicsGen,
  'fraction_basics': FractionBasicsGen,
  'fraction_arith': FractionArithGen,
  'fractions': LegacyFractionsGen,
  'percent': PercentGen,
  'percentages': PercentGen,
  'ten_powers': TenPowersGen,
  'exponents': ExponentsGen,
  'order_of_operations': OrderOperationsGen,
  'expressions': ExpressionSimplificationGen,
  'simplify': ExpressionSimplificationGen,
  'expression_simplification': ExpressionSimplificationGen,
  'equation': LinearEquationGen,
  'equations': LinearEquationGen,
  'linear-equations': LinearEquationGen,
  'algebra': LinearEquationGen,
  'equations_word': LinearEquationProblemGen,
  'patterns': PatternsGen,
  'pattern': PatternsGen,
  'graphs': LinearGraphGenerator,
  'graph': LinearGraphGenerator,
  'linear_graph': LinearGraphGenerator,
  'change_factor': ChangeFactorGen,
  'geometry': GeometryGenerator,
  'geometry_cat': GeometryGenerator,
  'geom': GeometryGenerator,
  'angles': AnglesGen,
  'angle': AnglesGen,
  'volume': VolumeGen,
  'similarity': SimilarityGen,
  'pythagoras': PythagorasGen,
  'scale': ScaleGen,
  'statistics': StatisticsGen,
  'stats': StatisticsGen,
  'data': StatisticsGen,
  'probability': ProbabilityGen,
  'unit_conversion': UnitConversionGen
};

export default function handler(req: VercelRequest, res: VercelResponse) {
    // 1. Standard Security Headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // SECURITY: Strict Method Enforcement
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const body = req.body || {};
    const query = (req as any).query || {}; 

    // 1. Extract Parameters
    const rawTopic = query.topic || body.topic || query.category || body.category;
    const level = query.level || body.level;
    const variation = query.variation || body.variation; 
    const lang = query.lang || body.lang || 'sv';

    // Extract adaptive filtering parameters
    const exclude = query.exclude || body.exclude || "";
    const hideConcept = (query.hideConcept === 'true' || body.hideConcept === true);

    if (!rawTopic) {
        return res.status(400).json({ error: "Missing 'topic' parameter" });
    }

    const GeneratorClass = TopicMap[String(rawTopic)];

    if (!GeneratorClass) {
        console.warn(`[API] Generator not found for topic: ${rawTopic}`);
        return res.status(400).json({ 
            error: `Generator not found for topic: ${rawTopic}.`,
            details: "Check api/question.ts TopicMap."
        });
    }

    try {
        const generator = new GeneratorClass();
        let questionData;

        // 3. GENERATION LOGIC
        if (variation && typeof generator.generateByVariation === 'function') {
            questionData = generator.generateByVariation(String(variation), String(lang));
        } else {
            const safeLevel = Number(level) || 1;
            
            const options = {
                exclude: String(exclude).split(',').filter(Boolean),
                hideConcept: hideConcept
            };

            if (typeof generator.generate === 'function') {
                questionData = generator.generate(safeLevel, String(lang), options);
            } else {
                questionData = generator.generate(1, String(lang), options);
            }
        }
        
        // Word Problem Interceptor
        const activateWordProblem = (query.wordProblem === 'true' || body.wordProblem === true);

        // FALLBACK: If the request did not supply an explicit variation parameter (like standard Practice mode),
        // look into the generated math response to read the variation key resolved by the generator engine.
        const activeVariation = variation || questionData?.variationKey;

        // CRITICAL FIX: Only execute this matching block if word problems are explicitly activated
        // AND we have a valid variation identifier string to process!
        if (activateWordProblem && activeVariation) {
            let foundVariationConfig = null;

            // Deep search through SKILL_BUCKETS taxonomy to find our target metadata parameters
            for (const catKey in SKILL_BUCKETS) {
                const category = (SKILL_BUCKETS as any)[catKey];
                
                // Add defensive check for category layout properties
                if (category && typeof category === 'object' && category.topics) {
                    for (const topicKey in category.topics) {
                        const topicObj = category.topics[topicKey];
                        
                        if (topicObj && topicObj.variations && Array.isArray(topicObj.variations)) {
                            // Match against activeVariation instead of the empty variation variable
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

            // If a regex pattern configuration is assigned to this key, execute text transformation pass
            if (foundVariationConfig) {
                questionData = WordProblemInterceptor.process(questionData, foundVariationConfig, String(lang));
            }
        }
        // =================================================================
        
        // SECURITY: Payload Scrubbing
        // Explicitly defining returned properties to ensure raw 'answer' is hidden.
        const scrubbedQuestion = {
            renderData: questionData.renderData,
            token: questionData.token,
            clues: questionData.clues,
            level: questionData.level || level
        };

        res.status(200).json(scrubbedQuestion);

    } catch (error: any) {
        console.error(`API Generation Error [${rawTopic}]:`, error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}