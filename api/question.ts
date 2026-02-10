import { IncomingMessage, ServerResponse } from 'http';

// IMPORTS
import { BasicArithmeticGen } from '../src/core/generators/BasicArithmeticGen.js';
import { NegativeNumbersGen } from '../src/core/generators/NegativeNumbersGen.js';
import { TenPowersGen } from '../src/core/generators/TenPowersGen.js';
import { ExponentsGen } from '../src/core/generators/ExponentsGen.js';
import { PercentGen } from '../src/core/generators/PercentGen.js';
import { ExpressionSimplificationGen } from '../src/core/generators/ExpressionSimplificationGen.js';
import { LinearEquationGen } from '../src/core/generators/LinearEquationGen.js';
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

interface VercelRequest extends IncomingMessage {
    query: Record<string, string | string[]>;
    body: any;
}

type VercelResponse = ServerResponse & {
    status: (statusCode: number) => VercelResponse;
    json: (data: any) => VercelResponse;
};

// --- ADAPTER: LEGACY FRACTIONS GENERATOR ---
// Combines Basics (L1-5) and Arithmetic (L6-10) into one unified topic for Practice Mode.
class LegacyFractionsGen {
    public generate(level: number, lang: string = 'sv'): any {
        // Levels 1-5: Basics (Visuals, parts, mixed numbers)
        if (level <= 5) {
            return new FractionBasicsGen().generate(level, lang);
        } 
        // Levels 6+: Arithmetic (Add, Sub, Mult, Div)
        // We map Level 6 -> Arith Level 1, Level 7 -> Arith Level 2, etc.
        else {
            const arithLevel = level - 5;
            return new FractionArithGen().generate(arithLevel, lang);
        }
    }

    // Required by interface, though mostly unused by legacy views
    public generateByVariation(key: string, lang: string): any {
         // Fallback: Check Basics first, then Arith
         try {
             return new FractionBasicsGen().generateByVariation(key, lang);
         } catch {
             return new FractionArithGen().generateByVariation(key, lang);
         }
    }
}

// --- UNIFIED TOPIC MAP ---
const TopicMap: Record<string, any> = {
  // === STUDIO SPECIFIC KEYS (From skillBuckets.js) ===
  'equations': LinearEquationGen,
  'equations_word': LinearEquationGen,
  'expressions': ExpressionSimplificationGen,
  'patterns': PatternsGen,
  'graphs': LinearGraphGenerator,
  'basic_arithmetic': BasicArithmeticGen,
  'negatives': NegativeNumbersGen,
  'fractions_basics': FractionBasicsGen,
  'fractions_arith': FractionArithGen,
  'percent': PercentGen,
  'change_factor': ChangeFactorGen,
  'exponents': ExponentsGen,
  'ten_powers': TenPowersGen,
  'geometry': GeometryGenerator,
  'angles': AnglesGen,
  'pythagoras': PythagorasGen,
  'scale': ScaleGen,
  'similarity': SimilarityGen,
  'volume': VolumeGen,
  'statistics': StatisticsGen,
  'probability': ProbabilityGen,

  // === LEGACY / PRACTICE VIEW ALIASES ===
  'algebra': LinearEquationGen,           
  'linear-equations': LinearEquationGen,
  
  'arithmetic': BasicArithmeticGen,
  
  // FIX: Map 'fractions' to the composite class
  'fractions': LegacyFractionsGen,          
  
  'percentages': PercentGen,
  'data': StatisticsGen,
  'geometry_cat': GeometryGenerator
};

export default function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

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

    if (!rawTopic) {
        return res.status(400).json({ error: "Missing 'topic' parameter" });
    }

    // 2. Resolve Generator
    const GeneratorClass = TopicMap[String(rawTopic)];

    if (!GeneratorClass) {
        console.warn(`[API] Generator not found for topic: ${rawTopic}`);
        return res.status(400).json({ 
            error: `Generator not found for topic: ${rawTopic}`,
            details: "Please check the TopicMap in api/question.ts"
        });
    }

    try {
        const generator = new GeneratorClass();
        let question;

        // 3. GENERATION LOGIC
        // Priority 1: Studio Mode (Specific Variation)
        if (variation && typeof generator.generateByVariation === 'function') {
            question = generator.generateByVariation(String(variation), String(lang));
        } 
        // Priority 2: Practice Mode (Level based)
        else {
            const safeLevel = Number(level) || 1;
            // Ensure the generator supports level-based generation
            if (typeof generator.generate === 'function') {
                question = generator.generate(safeLevel, String(lang));
            } else {
                throw new Error(`Generator for ${rawTopic} does not support level-based generation.`);
            }
        }

        // 4. Send Response
        res.status(200).json(question);

    } catch (error: any) {
        console.error("API Generation Error:", error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}