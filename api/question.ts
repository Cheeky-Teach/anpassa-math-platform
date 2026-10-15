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
import { AlgebraicGeometryGenerator } from '../src/core/generators/AlgebraicGeometryGenerator.js';
import { PlaceValueGen } from '../src/core/generators/PlaceValueGen.js';

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
export const TopicMap: Record<string, any> = {
  'basic_arithmetic': BasicArithmeticGen,
  'arithmetic': BasicArithmeticGen,
  'place_value': PlaceValueGen,
  'algebraic_geometry': AlgebraicGeometryGenerator,
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

/**
 * Fast taxonomy helper to locate a variation's full metadata config
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

    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const body = req.body || {};
    const query = (req as any).query || {}; 

    // Parameters
    const rawTopic = query.topic || body.topic || query.category || body.category;
    const level = query.level || body.level;
    const variation = query.variation || body.variation; 
    const lang = String(query.lang || body.lang || 'sv');

    // Adaptive filtering parameters
    const exclude = query.exclude || body.exclude || "";
    const hideConcept = (query.hideConcept === 'true' || body.hideConcept === true);
    const activateWordProblem = (query.wordProblem === 'true' || body.wordProblem === true);

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
        const safeLevel = Number(level) || 1;
        const options = {
            exclude: String(exclude).split(',').filter(Boolean),
            hideConcept: hideConcept
        };

        // Check if the topic has ANY word problems enabled
        let topicSupportsWordProblems = false;
        const category = Object.values(SKILL_BUCKETS).find((cat: any) => cat.topics && cat.topics[String(rawTopic)]);
        if (category) {
            const topicObj = (category.topics as any)[String(rawTopic)];
            if (topicObj && topicObj.variations) {
                topicSupportsWordProblems = topicObj.variations.some((v: any) => v.tags?.includes('word_problem_ready'));
            }
        }

        let questionData: any = null;

        // 🟢 STEP 3.1: IN-MEMORY SYNCHRONOUS RETRY LOOP
        if (activateWordProblem) {
            const MAX_ATTEMPTS = 5;

            for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
                let candidate: any = null;

                if (variation && typeof generator.generateByVariation === 'function') {
                    candidate = generator.generateByVariation(String(variation), lang);
                } else if (typeof generator.generate === 'function') {
                    candidate = generator.generate(safeLevel, lang, options);
                }

                if (!candidate) continue;

                const activeKey = variation || candidate.variationKey;
                const config = findVariationConfig(activeKey);

                if (config && config.tags?.includes('word_problem_ready')) {
                    const transformed = WordProblemInterceptor.process(candidate, config, lang);
                    if (transformed?.metadata?.isWordProblemApplied === true) {
                        questionData = transformed;
                        break; // ✅ Successful transformation with story rules satisfied
                    }
                }
            }

            // Fallback: If 5 attempts could not satisfy story rules, log and generate pure math cleanly
            if (!questionData) {
                console.warn(`[WordProblem fallback to pure math for ${rawTopic} level ${safeLevel}]`);
            }
        }

        // Standard generation (if word problems are disabled OR if the retry loop fell back)
        if (!questionData) {
            if (variation && typeof generator.generateByVariation === 'function') {
                questionData = generator.generateByVariation(String(variation), lang);
            } else if (typeof generator.generate === 'function') {
                questionData = generator.generate(safeLevel, lang, options);
            }
        }

        // Payload Scrubbing & Client Contract
        const scrubbedQuestion = {
            renderData: {
                ...questionData.renderData,
                isWordProblemApplied: questionData.metadata?.isWordProblemApplied || false
            },
            token: questionData.token,
            clues: questionData.clues,
            level: questionData.level || level,
            metadata: {
                ...(questionData.metadata || {}),
                levelSupportsWordProblems: topicSupportsWordProblems || questionData.metadata?.levelSupportsWordProblems || false
            }
        };

        res.status(200).json(scrubbedQuestion);

    } catch (error: any) {
        console.error(`API Generation Error [${rawTopic}]:`, error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}