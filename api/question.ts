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
// Fallback if the generic 'fractions' key is used (e.g. from old links or history)
class LegacyFractionsGen {
    public generate(level: number, lang: string = 'sv'): any {
        if (level <= 5) return new FractionBasicsGen().generate(level, lang);
        return new FractionArithGen().generate(level - 5, lang);
    }
    public generateByVariation(key: string, lang: string): any {
         try { return new FractionBasicsGen().generateByVariation(key, lang); } 
         catch { return new FractionArithGen().generateByVariation(key, lang); }
    }
}

// --- UNIFIED TOPIC MAP ---
// Maps ALL keys (Dashboard, Studio, and Legacy) to the correct Generator Class
const TopicMap: Record<string, any> = {
  // 1. ARITHMETIC
  'basic_arithmetic': BasicArithmeticGen, // Studio Key
  'arithmetic': BasicArithmeticGen,       // Dashboard Key
  
  'negatives': NegativeNumbersGen,        // Studio Key
  'negative': NegativeNumbersGen,         // Dashboard Key
  
  'fraction_basics': FractionBasicsGen,   // Shared Key
  'fraction_arith': FractionArithGen,     // Shared Key
  'fractions': LegacyFractionsGen,        // Legacy Fallback
  
  'percent': PercentGen,                  // Shared Key
  'percentages': PercentGen,              // Common Alias
  'ten_powers': TenPowersGen,             // Shared Key
  'exponents': ExponentsGen,              // Shared Key

  // 2. ALGEBRA
  'expressions': ExpressionSimplificationGen, // Studio Key
  'simplify': ExpressionSimplificationGen,    // Dashboard Key
  
  'equations': LinearEquationGen,             // Shared Key
  'linear-equations': LinearEquationGen,      // Legacy Alias
  'equations_word': LinearEquationGen,        // Studio Internal
  'algebra': LinearEquationGen,               // Dashboard "Algebra" Fallback
  
  'patterns': PatternsGen,                    // Shared Key
  'graphs': LinearGraphGenerator,             // Shared Key
  'change_factor': ChangeFactorGen,           // Studio Key

  // 3. GEOMETRY
  'geometry': GeometryGenerator,          // Shared Key
  'geometry_cat': GeometryGenerator,      // Studio Category Fallback
  
  'angles': AnglesGen,                    // Shared Key
  'volume': VolumeGen,                    // Shared Key
  'similarity': SimilarityGen,            // Shared Key
  'pythagoras': PythagorasGen,            // Shared Key
  'scale': ScaleGen,                      // Studio Key

  // 4. DATA
  'statistics': StatisticsGen,            // Shared Key
  'data': StatisticsGen,                  // Dashboard "Data" Fallback
  'probability': ProbabilityGen           // Shared Key
};

export default function handler(req: VercelRequest, res: VercelResponse) {
    // Standard CORS headers
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

    if (!rawTopic) {
        return res.status(400).json({ error: "Missing 'topic' parameter" });
    }

    // 2. Resolve Generator
    // Now works for both 'arithmetic' (Dashboard) and 'basic_arithmetic' (Studio)
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
        // Priority 1: Studio Mode (Specific Variation)
        if (variation && typeof generator.generateByVariation === 'function') {
            question = generator.generateByVariation(String(variation), String(lang));
        } 
        // Priority 2: Practice Mode (Level based)
        else {
            const safeLevel = Number(level) || 1;
            // Check if generator supports level generation
            if (typeof generator.generate === 'function') {
                question = generator.generate(safeLevel, String(lang));
            } else {
                // Fallback for any generator that might lack standard levels
                question = generator.generate(1, String(lang));
            }
        }

        // 4. Send Response
        res.status(200).json(question);

    } catch (error: any) {
        console.error(`API Generation Error [${rawTopic}]:`, error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}