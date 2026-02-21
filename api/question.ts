import { IncomingMessage, ServerResponse } from 'http';

// IMPORTS
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
  'probability': ProbabilityGen
};

export default function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const body = req.body || {};
    const query = (req as any).query || {}; 

    // 1. Extract Parameters
    const rawTopic = query.topic || body.topic || query.category || body.category;
    const level = query.level || body.level;
    const variation = query.variation || body.variation; 
    const lang = query.lang || body.lang || 'sv';

    // NEW: Extract adaptive filtering parameters
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
        let question;

        // 3. GENERATION LOGIC
        if (variation && typeof generator.generateByVariation === 'function') {
            question = generator.generateByVariation(String(variation), String(lang));
        } else {
            const safeLevel = Number(level) || 1;
            
            // Prepare Adaptive Options Object
            const options = {
                exclude: String(exclude).split(',').filter(Boolean),
                hideConcept: hideConcept
            };

            if (typeof generator.generate === 'function') {
                // Pass options as the 3rd argument
                question = generator.generate(safeLevel, String(lang), options);
            } else {
                question = generator.generate(1, String(lang), options);
            }
        }

        res.status(200).json(question);

    } catch (error: any) {
        console.error(`API Generation Error [${rawTopic}]:`, error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}